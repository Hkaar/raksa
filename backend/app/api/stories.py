"""Narrative assistance without storing the story or audio."""
import asyncio
from fastapi import APIRouter, HTTPException, Request
from app.story_schemas import ExtractionResponse, StoryInput, TranscriptionResponse
from app.services.gemini_story import StoryUnavailable, extract, transcribe

router = APIRouter(prefix='/stories', tags=['stories'])
MAX_AUDIO_BYTES = 8 * 1024 * 1024
AUDIO_TYPES = {'audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/mp4'}


def audio_signature(data, mime):
    if mime == 'audio/webm':
        return data.startswith(b'\x1a\x45\xdf\xa3')
    if mime == 'audio/ogg':
        return data.startswith(b'OggS')
    if mime == 'audio/wav':
        return data[:4] == b'RIFF' and data[8:12] == b'WAVE'
    if mime in ('audio/mp4', 'audio/m4a'):
        return len(data) >= 12 and data[4:8] == b'ftyp'
    return data.startswith(b'ID3') or (len(data) >= 2 and data[0] == 255 and data[1] & 224 == 224)


@router.post('/transcribe', response_model=TranscriptionResponse,
    openapi_extra={'requestBody': {'required': True, 'content': {
        mime: {'schema': {'type': 'string', 'format': 'binary'}} for mime in sorted(AUDIO_TYPES)}}})
async def transcribe_story(request: Request):
    mime = request.headers.get('content-type', '').split(';', 1)[0].strip().lower()
    if mime not in AUDIO_TYPES:
        raise HTTPException(status_code=415, detail='unsupported_audio_type')
    audio = bytearray()
    async for chunk in request.stream():
        if len(audio) + len(chunk) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=413, detail='audio_too_large')
        audio.extend(chunk)
    if not audio_signature(audio, mime):
        raise HTTPException(status_code=422, detail='invalid_audio_format')
    try:
        result = await asyncio.to_thread(transcribe, request.app.state.settings, bytes(audio),
                                        'audio/m4a' if mime == 'audio/mp4' else mime)
    except StoryUnavailable:
        return TranscriptionResponse(mode='manual', reason='ai_unavailable')
    if result.transcript is None or result.language == 'unknown':
        return TranscriptionResponse(mode='manual', reason='audio_unclear')
    return TranscriptionResponse(mode='ai', transcript=result.transcript, language=result.language)


@router.post('/extract', response_model=ExtractionResponse)
async def extract_story(body: StoryInput, request: Request):
    try:
        result = await asyncio.to_thread(extract, request.app.state.settings, body.story)
    except StoryUnavailable:
        return ExtractionResponse(mode='manual', reason='ai_unavailable')
    return ExtractionResponse(mode='ai', suggestion=result)
