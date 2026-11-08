from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.config import Settings
from app.api.officer_auth import me
from app.schemas import CaseCreate


def test_unknown_bleeding_and_optional_media():
    case = CaseCreate(story='Digigit anjing di jalan')
    assert case.bleeding_reported is None
    assert case.animal.photo_path is None
    assert case.animal.vaccination_card_path is None
    assert case.model_dump(mode='json')['bleeding_reported'] is None


def test_case_write_reports_unavailable_instead_of_fake_success():
    with TestClient(create_app(Settings(_env_file=None))) as client:
        response = client.post('/api/v1/cases', json={'story': 'Digigit anjing'})
    assert response.status_code == 503
    assert response.json()['detail']['code'] == 'persistence_not_configured'


@pytest.mark.parametrize('payload', [
    {'story': '  '},
    {'story': 'x', 'occurred_at': '2026-11-06T10:00:00'},
    {'story': 'x', 'location': {'latitude': 91, 'longitude': 115}},
    {'story': 'x', 'location': {'latitude': True, 'longitude': False}},
    {'story': 'x', 'bleeding_reported': 'false'},
    {'story': 'x', 'urgency': 'low'},
])
def test_invalid_case_is_rejected(payload):
    with TestClient(create_app(Settings(_env_file=None))) as client:
        response = client.post('/api/v1/cases', json=payload)
    assert response.status_code == 422


def test_validation_errors_omit_sensitive_input():
    with TestClient(create_app(Settings(_env_file=None))) as client:
        response = client.post('/api/v1/cases', json={'story': 'sensitive patient story', 'unexpected': 'private'})
    assert response.status_code == 422
    assert 'sensitive patient story' not in response.text
    assert 'private' not in response.text


def test_observation_validates_case_id_and_aware_time():
    application = create_app(Settings(_env_file=None))
    application.dependency_overrides[me] = lambda: {'id': 'test', 'role': 'officer'}
    with TestClient(application) as client:
        payload = {'notes': 'Hewan masih terlihat', 'observed_at': '2026-11-06T10:00:00+08:00'}
        assert client.post('/api/v1/cases/invalid/observations', json=payload).status_code == 422
        response = client.post(f'/api/v1/cases/{uuid4()}/observations', json=payload)
        assert response.status_code == 503
        payload['observed_at'] = '2026-11-06T10:00:00'
        assert client.post(f'/api/v1/cases/{uuid4()}/observations', json=payload).status_code == 422


def test_contracts_appear_in_openapi():
    with TestClient(create_app(Settings(_env_file=None))) as client:
        spec = client.get('/openapi.json').json()
    assert spec['paths']['/api/v1/cases']['post']['responses']['201']
    assert 'CaseCreate' in spec['components']['schemas']
    assert 'ObservationCreate' in spec['components']['schemas']
