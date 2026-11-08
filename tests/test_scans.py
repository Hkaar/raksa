"""The scan endpoint keeps visual suggestions separate from reported facts."""

from unittest.mock import patch

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


VIDEO = b'\x00\x00\x00\x18ftypisom' + b'\x00' * 32


def client_for_scan(key=None):
    return TestClient(create_app(Settings(_env_file=None, gemini_api_key=key)))


def test_scan_without_gemini_key_uses_manual_mode():
    with client_for_scan() as client:
        response = client.post('/api/v1/scans/wound', content=VIDEO,
                               headers={'Content-Type': 'video/mp4'})
    assert response.status_code == 200
    assert response.json() == {
        'mode': 'manual', 'suggestion': None, 'needs_confirmation': True,
        'reason': 'ai_unavailable',
    }


def test_scan_result_does_not_claim_no_bleeding_or_calculate_urgency():
    from app.api import scans
    from app.scan_schemas import WoundScanSuggestion

    suggestion = WoundScanSuggestion(video_quality='usable', body_part='jari tangan',
                                     blood_visibility='not_visible', wound_count=None)
    with patch.object(scans, 'analyze_video', return_value=suggestion) as analyze:
        with client_for_scan('test-key') as client:
            response = client.post('/api/v1/scans/wound', content=VIDEO,
                                   headers={'Content-Type': 'video/mp4'})
    assert response.status_code == 200
    assert response.json() == {
        'mode': 'ai', 'suggestion': suggestion.model_dump(),
        'needs_confirmation': True, 'reason': None,
    }
    assert 'bleeding_reported' not in response.json()
    assert 'urgency' not in response.json()
    assert analyze.call_count == 1


def test_scan_unclear_video_asks_for_manual_confirmation():
    from app.api import scans
    from app.scan_schemas import WoundScanSuggestion

    suggestion = WoundScanSuggestion(video_quality='poor', body_part='jari tangan',
                                     blood_visibility='visible', wound_count=2)
    with patch.object(scans, 'analyze_video', return_value=suggestion):
        with client_for_scan('test-key') as client:
            response = client.post('/api/v1/scans/wound', content=VIDEO,
                                   headers={'Content-Type': 'video/mp4'})
    assert response.json() == {
        'mode': 'manual', 'suggestion': None, 'needs_confirmation': True,
        'reason': 'video_unclear',
    }


def test_scan_rejects_invalid_video_before_calling_ai():
    from app.api import scans

    with patch.object(scans, 'analyze_video') as analyze:
        with client_for_scan('test-key') as client:
            wrong_type = client.post('/api/v1/scans/wound', content=VIDEO,
                                     headers={'Content-Type': 'image/png'})
            wrong_signature = client.post('/api/v1/scans/wound', content=b'not a video',
                                          headers={'Content-Type': 'video/mp4'})
    assert wrong_type.status_code == 415
    assert wrong_signature.status_code == 422
    analyze.assert_not_called()


def test_scan_limits_body_size(monkeypatch):
    from app.api import scans

    monkeypatch.setattr(scans, 'MAX_VIDEO_BYTES', 32)
    with client_for_scan('test-key') as client:
        response = client.post('/api/v1/scans/wound', content=VIDEO,
                               headers={'Content-Type': 'video/mp4'})
    assert response.status_code == 413


def test_gemini_failure_falls_back_without_exposing_details():
    from app.api import scans
    from app.services.gemini_vision import VisionUnavailable

    with patch.object(scans, 'analyze_video', side_effect=VisionUnavailable('secret detail')):
        with client_for_scan('test-key') as client:
            response = client.post('/api/v1/scans/wound', content=VIDEO,
                                   headers={'Content-Type': 'video/mp4'})
    assert response.json()['mode'] == 'manual'
    assert response.json()['reason'] == 'ai_unavailable'
    assert 'secret detail' not in response.text


def test_scan_openapi_documents_raw_video_upload():
    with client_for_scan() as client:
        operation = client.get('/openapi.json').json()['paths']['/api/v1/scans/wound']['post']
    assert set(operation['requestBody']['content']) == {'video/mp4', 'video/webm'}


def test_scan_accepts_webm_recording():
    with client_for_scan() as client:
        response = client.post('/api/v1/scans/wound',
                               content=b'\x1a\x45\xdf\xa3' + b'\x00' * 24,
                               headers={'Content-Type': 'video/webm'})
    assert response.status_code == 200
    assert response.json()['mode'] == 'manual'


def test_scan_passes_reported_event_as_context():
    from app.api import scans
    from app.scan_schemas import WoundScanSuggestion
    suggestion = WoundScanSuggestion(video_quality='usable', body_part='tangan',
                                     blood_visibility='unclear', wound_count=None)
    with patch.object(scans, 'analyze_video', return_value=suggestion) as analyze:
        with client_for_scan('test-key') as client:
            response = client.post('/api/v1/scans/wound?reported_event=dog_bite',
                                   content=VIDEO, headers={'Content-Type': 'video/mp4'})
    assert response.status_code == 200
    assert analyze.call_args.args[-1] == 'dog_bite'


def test_scan_rejects_unknown_context_values():
    with client_for_scan() as client:
        response = client.post('/api/v1/scans/wound?reported_event=definitely_safe',
                               content=VIDEO, headers={'Content-Type': 'video/mp4'})
    assert response.status_code == 422
