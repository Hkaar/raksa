from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def test_health_and_docs_work_without_credentials():
    with TestClient(create_app(Settings(_env_file=None))) as client:
        assert client.get('/api/v1/health').json() == {'status': 'ok'}
        assert client.get('/docs').status_code == 200
        assert '/api/v1/health' in client.get('/openapi.json').json()['paths']


def test_cors_uses_configured_origins():
    with TestClient(create_app(Settings(_env_file=None, cors_origins=['http://localhost:5173']))) as client:
        allowed = client.options('/api/v1/health', headers={
            'Origin': 'http://localhost:5173', 'Access-Control-Request-Method': 'GET',
        })
        assert allowed.headers['access-control-allow-origin'] == 'http://localhost:5173'
        denied = client.options('/api/v1/health', headers={
            'Origin': 'https://untrusted.example', 'Access-Control-Request-Method': 'GET',
        })
        assert 'access-control-allow-origin' not in denied.headers


def test_settings_load_environment(monkeypatch):
    monkeypatch.setenv('RAKSA_APP_NAME', 'RAKSA Test')
    assert Settings(_env_file=None).app_name == 'RAKSA Test'
