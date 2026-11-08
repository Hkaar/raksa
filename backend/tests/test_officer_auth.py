from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.services.officer_auth import InvalidCredentials, AuthUnavailable


def client():
    return TestClient(create_app(Settings(officer_email_domain='officers.example.org', _env_file=None)))


def test_login_and_me(monkeypatch):
    calls = []
    def provider(settings, path, data, token):
        calls.append((path, data, token))
        user = {'id': '123', 'app_metadata': {'role': 'officer'}}
        if path == 'user':
            return user
        return {'user': user, 'access_token': 'access', 'refresh_token': 'refresh', 'expires_in': 3600, 'token_type': 'bearer'}
    monkeypatch.setattr('app.api.officer_auth.request_auth', provider)
    with client() as c:
        response = c.post('/api/v1/officer/auth/login', json={'username': 'Petugas', 'password': 'secret'})
        assert response.status_code == 200
        assert response.headers['cache-control'] == 'no-store'
        assert calls[0][1]['email'] == 'petugas@officers.example.org'
        assert response.json()['officer']['role'] == 'officer'
        assert c.get('/api/v1/officer/auth/me', headers={'Authorization': 'Bearer access'}).status_code == 200
        assert c.post('/api/v1/officer/auth/refresh', json={'refresh_token': 'refresh'}).status_code == 200
        assert c.post('/api/v1/officer/auth/logout', headers={'Authorization': 'Bearer access'}).status_code == 204


def test_non_officer_cannot_obtain_tokens(monkeypatch):
    monkeypatch.setattr('app.api.officer_auth.request_auth', lambda *args: {'user': {'id': '1', 'user_metadata': {'role': 'officer'}}})
    with client() as c:
        response = c.post('/api/v1/officer/auth/login', json={'username': 'user', 'password': 'secret'})
        assert response.status_code == 403
        assert 'token' not in response.json()


def test_invalid_and_unavailable(monkeypatch):
    def fail(*args):
        raise InvalidCredentials()
    monkeypatch.setattr('app.api.officer_auth.request_auth', fail)
    with client() as c:
        assert c.get('/api/v1/officer/auth/me').status_code == 401
        assert c.post('/api/v1/officer/auth/login', json={'username': 'user', 'password': 'wrong'}).status_code == 401
        assert c.post('/api/v1/officer/auth/login', json={'username': 'bad@name', 'password': 'wrong'}).status_code == 422
    def unavailable(*args):
        raise AuthUnavailable()
    monkeypatch.setattr('app.api.officer_auth.request_auth', unavailable)
    with client() as c:
        assert c.post('/api/v1/officer/auth/login', json={'username': 'user', 'password': 'secret'}).status_code == 503


def test_shortcut_disabled_and_configured(monkeypatch):
    with client() as c:
        assert c.post('/api/v1/officer/auth/shortcut').status_code == 503
        assert c.get('/api/v1/officer/demo').status_code == 404

    calls = []
    def provider(settings, path, data, token):
        calls.append((path, data))
        return {'user': {'id': 'demo-id', 'app_metadata': {'role': 'officer'}},
                'access_token': 'access', 'refresh_token': 'refresh',
                'expires_in': 3600, 'token_type': 'bearer'}
    monkeypatch.setattr('app.api.officer_auth.request_auth', provider)
    settings = Settings(_env_file=None, officer_shortcut_enabled=True,
                        officer_shortcut_email='demo@example.org', officer_shortcut_password='secret')
    with TestClient(create_app(settings)) as c:
        response = c.post('/api/v1/officer/auth/shortcut')
        assert response.status_code == 200
        assert response.json()['access_token'] == 'access'
        assert response.headers['cache-control'] == 'no-store'
        assert calls[0] == ('token?grant_type=password', {'email': 'demo@example.org', 'password': 'secret'})


def test_shortcut_rejects_non_officer(monkeypatch):
    monkeypatch.setattr('app.api.officer_auth.request_auth', lambda *args: {'user': {'id': '1', 'app_metadata': {}}})
    settings = Settings(_env_file=None, officer_shortcut_enabled=True,
                        officer_shortcut_email='demo@example.org', officer_shortcut_password='secret')
    with TestClient(create_app(settings)) as c:
        assert c.post('/api/v1/officer/auth/shortcut').status_code == 403
