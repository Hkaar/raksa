"""Server-only Supabase REST writes; never return provider errors or credentials."""
import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import urlparse

class PersistenceError(Exception):
    def __init__(self, code='persistence_unavailable', status=503):
        self.code, self.status = code, status
        super().__init__(code)


def insert_row(settings, table, row):
    base = (settings.supabase_url or '').rstrip('/')
    key = settings.supabase_secret_key
    if not base or not key:
        raise PersistenceError('persistence_not_configured')
    url = urlparse(base)
    if url.scheme != 'https' or not url.hostname or not url.hostname.endswith('.supabase.co') or url.path or url.query or url.fragment:
        raise PersistenceError('persistence_not_configured')
    headers = {'apikey': key, 'Content-Type': 'application/json', 'Prefer': 'return=representation'}
    if key.startswith('eyJ'):
        headers['Authorization'] = f'Bearer {key}'
    request = Request(f'{base}/rest/v1/{table}', data=json.dumps(row).encode('utf-8'), headers=headers, method='POST')
    try:
        with urlopen(request, timeout=15) as response:
            rows = json.load(response)
        if not isinstance(rows, list) or len(rows) != 1 or not isinstance(rows[0], dict):
            raise PersistenceError('persistence_response_invalid', 502)
        return rows[0]
    except HTTPError as exc:
        # Only inspect SQLSTATE, never expose/log provider text or submitted reports.
        code = None
        try:
            code = json.load(exc).get('code')
        except (ValueError, AttributeError):
            pass
        if code == '23503' and table == 'observations':
            raise PersistenceError('case_not_found', 404) from None
        if code == '23505':
            raise PersistenceError('duplicate_observation', 409) from None
        logging.getLogger(__name__).warning('Supabase write failed: HTTP %s', exc.code)
        raise PersistenceError() from None
    except (URLError, OSError, TimeoutError, ValueError, TypeError):
        raise PersistenceError() from None
