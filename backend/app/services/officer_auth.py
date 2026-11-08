"""Supabase Auth requests; the officer role is checked server-side."""
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class AuthUnavailable(Exception):
    pass


class InvalidCredentials(Exception):
    pass


def request_auth(settings, path, data=None, token=None):
    if not settings.supabase_url or not settings.supabase_publishable_key:
        raise AuthUnavailable()
    headers = {'apikey': settings.supabase_publishable_key, 'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    request = Request(settings.supabase_url.rstrip('/') + '/auth/v1/' + path,
                      data=json.dumps(data).encode() if data is not None else None,
                      headers=headers, method='POST' if data is not None else 'GET')
    try:
        with urlopen(request, timeout=10) as response:
            payload = response.read()
            return json.loads(payload) if payload else {}
    except HTTPError as exc:
        if exc.code in (400, 401, 403):
            raise InvalidCredentials() from exc
        raise AuthUnavailable() from exc
    except (URLError, OSError, TimeoutError, ValueError) as exc:
        raise AuthUnavailable() from exc


def officer_user(user):
    metadata = user.get('app_metadata') if isinstance(user, dict) else None
    if not isinstance(metadata, dict) or metadata.get('role') != 'officer':
        raise InvalidCredentials()
    if not isinstance(user.get('id'), str):
        raise AuthUnavailable()
    return {'id': user['id'], 'role': 'officer'}
