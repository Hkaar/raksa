"""The Gemini boundary accepts only its visual-only JSON contract."""

import base64
import io
import json
from unittest.mock import patch

import pytest

from app.services.gemini_vision import VisionUnavailable, analyze_video


def test_gemini_request_uses_inline_video_and_parses_bounded_response():
    captured = {}
    response_data = {
        'candidates': [{'content': {'parts': [{'text': json.dumps({
            'video_quality': 'usable', 'body_part': 'jari tangan',
            'blood_visibility': 'visible', 'wound_count': 1,
        })}]}}],
    }

    def fake_urlopen(request, timeout):
        captured['request'] = request
        captured['timeout'] = timeout
        return io.BytesIO(json.dumps(response_data).encode('utf-8'))

    with patch('app.services.gemini_vision.urlopen', side_effect=fake_urlopen):
        result = analyze_video(b'video-bytes', 'video/mp4', 'private-key',
                               'gemini-3.8-flash', 12)

    payload = json.loads(captured['request'].data)
    assert captured['timeout'] == 12
    assert captured['request'].get_header('X-goog-api-key') == 'private-key'
    assert payload['contents'][0]['parts'][0]['inline_data']['data'] == base64.b64encode(b'video-bytes').decode()
    assert payload['generationConfig']['responseMimeType'] == 'application/json'
    assert result.blood_visibility == 'visible'
    assert 'urgency' not in result.model_dump()


@pytest.mark.parametrize('field,value', [
    ('urgency', 'low'), ('cause', 'dog_bite'), ('severity', 'mild'),
    ('healing_stage', 'healed'),
])
def test_gemini_rejects_unexpected_clinical_fields(field, value):
    response_data = {
        'candidates': [{'content': {'parts': [{'text': json.dumps({
            'video_quality': 'usable', 'body_part': None,
            'blood_visibility': 'not_visible', 'wound_count': None,
            field: value,
        })}]}}],
    }
    with patch('app.services.gemini_vision.urlopen',
               return_value=io.BytesIO(json.dumps(response_data).encode('utf-8'))):
        with pytest.raises(VisionUnavailable):
            analyze_video(b'video-bytes', 'video/mp4', 'private-key',
                          'gemini-3.8-flash', 12)


@pytest.mark.parametrize('event,features', [
    ('dog_bite', ['puncture_like_marks']),
    ('fall', ['abrasion_like_area', 'crust_like_area']),
    ('unknown', []),
])
def test_context_is_separate_from_visible_features(event, features):
    captured = {}
    result = {'video_quality': 'usable', 'body_part': None,
              'blood_visibility': 'unclear', 'wound_count': None,
              'visible_features': features}
    def fake_urlopen(request, timeout):
        captured.update(json.loads(request.data))
        return io.BytesIO(json.dumps({'candidates': [{'content': {'parts': [
            {'text': json.dumps(result)}]}}]}).encode())
    with patch('app.services.gemini_vision.urlopen', side_effect=fake_urlopen):
        output = analyze_video(b'video', 'video/mp4', 'key', 'model', 12, event)
    assert output.visible_features == features
    assert event in captured['contents'][0]['parts'][1]['text']
    assert captured['systemInstruction']['parts'][0]['text']
    assert 'severity' not in output.model_dump()
    assert 'cause' not in output.model_dump()
