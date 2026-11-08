import json
from io import BytesIO
from urllib.error import HTTPError
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from app.config import Settings
from app.main import create_app
from app.api.officer_auth import me
from app.services.persistence import insert_row, PersistenceError


def test_case_is_written_and_response_has_server_id(monkeypatch):
    sent = []
    case_id = str(uuid4())
    def write(settings, table, row):
        sent.append((table, row))
        return row | {'id': case_id, 'created_at': '2026-11-09T10:00:00Z', 'status': 'reported', 'urgency': None}
    monkeypatch.setattr('app.api.cases.insert_row', write)
    with TestClient(create_app(Settings(_env_file=None, cors_origins=['http://localhost:3000']))) as client:
        response = client.post('/api/v1/cases', json={'story': 'Contoh', 'wound': {'body_part': 'tangan'}}, headers={'Origin': 'http://localhost:3000'})
        assert response.status_code == 201
        assert response.json()['id'] == case_id
        assert response.headers['cache-control'] == 'no-store'
        assert response.headers['access-control-allow-origin'] == 'http://localhost:3000'
        assert sent[0][1]['bleeding_reported'] is None
        assert 'urgency' not in response.json()


def test_observation_needs_officer_and_server_sets_source(monkeypatch):
    app = create_app(Settings(_env_file=None))
    payload = {'observed_at': '2026-11-09T10:00:00Z', 'animal_condition': 'healthy'}
    case_id = str(uuid4())
    with TestClient(app) as client:
        assert client.post(f'/api/v1/cases/{case_id}/observations', json=payload).status_code == 401
        app.dependency_overrides[me] = lambda: {'id': 'test', 'role': 'officer'}
        def write(settings, table, row):
            assert row['source'] == 'officer'
            assert row['case_id'] == case_id
            return row | {'id': str(uuid4()), 'created_at': '2026-11-09T10:01:00Z'}
        monkeypatch.setattr('app.api.cases.insert_row', write)
        assert client.post(f'/api/v1/cases/{case_id}/observations', json=payload).status_code == 201
        assert client.post(f'/api/v1/cases/{case_id}/observations', json=payload | {'source': 'owner'}).status_code == 422


@pytest.mark.parametrize('sqlstate,status,code', [('23503',404,'case_not_found'), ('23505',409,'duplicate_observation'), ('42501',503,'persistence_unavailable')])
def test_provider_errors_are_safe(monkeypatch, sqlstate, status, code):
    settings = Settings(_env_file=None, supabase_url='https://test.supabase.co', supabase_secret_key='sb_secret_test')
    def fail(*args, **kwargs):
        raise HTTPError('https://test.supabase.co', 409, 'private content', {}, BytesIO(json.dumps({'code': sqlstate, 'message': 'sensitive story'}).encode()))
    monkeypatch.setattr('app.services.persistence.urlopen', fail)
    with pytest.raises(PersistenceError) as error:
        insert_row(settings, 'observations', {})
    assert (error.value.status, error.value.code) == (status, code)
    assert 'sensitive' not in str(error.value)


def test_secret_header_and_representation(monkeypatch):
    settings = Settings(_env_file=None, supabase_url='https://test.supabase.co', supabase_secret_key='sb_secret_test')
    def send(request, **kwargs):
        assert request.get_header('Apikey') == 'sb_secret_test'
        assert request.get_header('Authorization') is None
        assert request.get_header('Prefer') == 'return=representation'
        return BytesIO(b'[{"id":"test"}]')
    monkeypatch.setattr('app.services.persistence.urlopen', send)
    assert insert_row(settings, 'cases', {'story':'Example'}) == {'id':'test'}
