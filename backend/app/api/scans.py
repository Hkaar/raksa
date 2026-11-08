"""Accept short browser-recorded video without persisting the raw media."""

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request

from app.scan_schemas import ReportedEvent, WoundScanResponse
from app.services.gemini_vision import VisionUnavailable, analyze_video

router = APIRouter(tags=['scans'])
MAX_VIDEO_BYTES = 12 * 1024 * 1024  # Base64 request stays below Gemini's 20 MB inline limit.
ALLOWED_TYPES = {'video/mp4', 'video/webm'}


def matches_video_signature(data: bytes, mime_type: str) -> bool:
    if mime_type == 'video/mp4':
        return len(data) >= 12 and data[4:8] == b'ftyp'
    return data.startswith(b'\x1a\x45\xdf\xa3')


@router.post(
    '/scans/wound', response_model=WoundScanResponse,
    openapi_extra={'requestBody': {'required': True, 'content': {
        media_type: {'schema': {'type': 'string', 'format': 'binary'}}
        for media_type in sorted(ALLOWED_TYPES)
    }}},
)
async def scan_wound(request: Request, reported_event: ReportedEvent = 'unknown') -> WoundScanResponse:
    mime_type = request.headers.get('content-type', '').split(';', 1)[0].lower().strip()
    if mime_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail='Gunakan video/mp4 atau video/webm.')

    video = bytearray()
    async for chunk in request.stream():
        if len(video) + len(chunk) > MAX_VIDEO_BYTES:
            raise HTTPException(status_code=413, detail='Video terlalu besar (maksimum 12 MiB).')
        video.extend(chunk)
    if not matches_video_signature(video, mime_type):
        raise HTTPException(status_code=422, detail='Isi video tidak sesuai format.')

    settings = request.app.state.settings
    if not settings.gemini_api_key:
        return WoundScanResponse(mode='manual', suggestion=None, reason='ai_unavailable')
    try:
        suggestion = await asyncio.to_thread(
            analyze_video, bytes(video), mime_type, settings.gemini_api_key,
            settings.gemini_model, settings.gemini_timeout_seconds, reported_event,
        )
    except VisionUnavailable as error:
        cause = error.__cause__
        logging.getLogger(__name__).warning('Gemini scan failed: %s, HTTP status: %s', type(cause).__name__, getattr(cause, 'code', None))
        return WoundScanResponse(mode='manual', suggestion=None, reason='ai_unavailable')
    if suggestion.video_quality == 'poor':
        return WoundScanResponse(mode='manual', suggestion=None, reason='video_unclear')
    return WoundScanResponse(mode='ai', suggestion=suggestion)
