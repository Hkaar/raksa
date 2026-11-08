import json
from io import BytesIO
import pytest
from fastapi.testclient import TestClient
from app.config import Settings
from app.main import create_app
from app.services.gemini_story import StoryUnavailable, extract
from app.story_schemas import StorySuggestion, Transcript


def client():
    return TestClient(create_app(Settings(_env_file=None)))


def test_transcript_and_extraction_require_confirmation(monkeypatch):
    monkeypatch.setattr('app.api.stories.transcribe', lambda *args: Transcript(transcript='I was bitten yesterday.', language='en'))
    suggestion = StorySuggestion(time_text='yesterday', place_text=None, animal_species=None,
                                 event_type='bite', body_part=None, bleeding_reported=None)
    seen = []
    def extract_text(settings, story):
        seen.append(story)
        return suggestion
    monkeypatch.setattr('app.api.stories.extract', extract_text)
    with client() as c:
        response = c.post('/api/v1/stories/transcribe', content=b'\x1a\x45\xdf\xa3audio', headers={'Content-Type': 'audio/webm;codecs=opus'})
        assert response.status_code == 200
        assert response.json()['needs_confirmation'] is True
        response = c.post('/api/v1/stories/extract', json={'story': 'I was bitten yesterday. Edited.'})
        assert seen == ['I was bitten yesterday. Edited.']
        assert response.json()['suggestion']['bleeding_reported'] is None
        assert response.json()['needs_confirmation'] is True


def test_fallback_and_unclear_audio(monkeypatch):
    def unavailable(*args):
        raise StoryUnavailable('provider secret must not leak')
    monkeypatch.setattr('app.api.stories.extract', unavailable)
    with client() as c:
        response = c.post('/api/v1/stories/extract', json={'story': 'Cerita'})
        assert response.json()['reason'] == 'ai_unavailable'
        assert 'secret' not in response.text
    monkeypatch.setattr('app.api.stories.transcribe', lambda *args: Transcript(transcript=None, language='unknown'))
    with client() as c:
        response = c.post('/api/v1/stories/transcribe', content=b'OggSaudio', headers={'Content-Type': 'audio/ogg'})
        assert response.json()['reason'] == 'audio_unclear'


def test_audio_and_text_validation(monkeypatch):
    monkeypatch.setattr('app.api.stories.MAX_AUDIO_BYTES', 4)
    with client() as c:
        assert c.post('/api/v1/stories/transcribe', content=b'a', headers={'Content-Type': 'text/plain'}).status_code == 415
        assert c.post('/api/v1/stories/transcribe', content=b'bad', headers={'Content-Type': 'audio/wav'}).status_code == 422
        assert c.post('/api/v1/stories/transcribe', content=b'OggSbig', headers={'Content-Type': 'audio/ogg'}).status_code == 413
        assert c.post('/api/v1/stories/extract', json={'story': '  '}).status_code == 422
        assert c.post('/api/v1/stories/extract', json={'story': 'x' * 10001}).status_code == 422
        assert c.post('/api/v1/stories/extract', json={'story': 'secret', 'urgency': 'low'}).status_code == 422


def test_missing_key_is_manual():
    with client() as c:
        assert c.post('/api/v1/stories/extract', json={'story': 'Digigit anjing.'}).json()['mode'] == 'manual'
        assert c.post('/api/v1/stories/transcribe', content=b'OggSaudio', headers={'Content-Type': 'audio/ogg'}).json()['mode'] == 'manual'


@pytest.mark.parametrize('clinical_field', ['urgency', 'diagnosis'])
def test_provider_rejects_extra_clinical_output(monkeypatch, clinical_field):
    result = dict(time_text=None, place_text=None, animal_species=None, event_type=None,
                  body_part=None, bleeding_reported=None)
    result[clinical_field] = 'low'
    data = {'candidates': [{'content': {'parts': [{'text': json.dumps(result)}]}}]}
    monkeypatch.setattr('app.services.gemini_story.urlopen', lambda *args, **kwargs: BytesIO(json.dumps(data).encode()))
    with pytest.raises(StoryUnavailable):
        extract(Settings(_env_file=None, gemini_api_key='test'), 'Cerita')


def test_provider_payload_and_unknown_fields(monkeypatch):
    sent = []
    result = dict(time_text='kemarin', place_text=None, animal_species='anjing', event_type='bite',
                  body_part=None, bleeding_reported=None)
    def provider(request, **kwargs):
        sent.append(json.loads(request.data))
        return BytesIO(json.dumps({'candidates': [{'content': {'parts': [{'text': json.dumps(result)}]}}]}).encode())
    monkeypatch.setattr('app.services.gemini_story.urlopen', provider)
    suggestion = extract(Settings(_env_file=None, gemini_api_key='test'), 'Kemarin digigit anjing, lukanya kering.')
    assert suggestion.bleeding_reported is None
    assert sent[0]['contents'][0]['parts'][0]['text'].startswith('Kemarin')
    assert 'null' in sent[0]['systemInstruction']['parts'][0]['text']
