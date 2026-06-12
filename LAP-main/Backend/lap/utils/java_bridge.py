from __future__ import annotations

import json
import urllib.error
import urllib.request

from django.conf import settings


def _post_json(path: str, payload: dict, timeout: float = 2.5) -> dict:
    base_url = getattr(settings, 'JAVA_AUTH_BASE_URL', '').rstrip('/')
    if not base_url:
        return {}

    data = json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(
        f'{base_url}/{path.lstrip("/")}',
        data=data,
        headers={
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read().decode('utf-8')
    except (urllib.error.URLError, TimeoutError, ValueError):
        return {}

    try:
        parsed = json.loads(body or '{}')
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _request_json(base_url: str, path: str, token: str = '', timeout: float = 2.5):
    base_url = (base_url or '').rstrip('/')
    if not base_url:
        return None

    headers = {'Accept': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'

    request = urllib.request.Request(
        f'{base_url}/{path.lstrip("/")}',
        headers=headers,
        method='GET',
    )

    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read().decode('utf-8')
    except (urllib.error.URLError, TimeoutError, ValueError):
        return None

    try:
        return json.loads(body or '{}')
    except json.JSONDecodeError:
        return None


def _get_json(path: str, token: str, timeout: float = 2.5) -> dict:
    base_url = getattr(settings, 'JAVA_AUTH_BASE_URL', '').rstrip('/')
    if not base_url or not token:
        return {}

    parsed = _request_json(base_url, path, token, timeout)
    return parsed if isinstance(parsed, dict) else {}


def _java_api_base_url() -> str:
    explicit = getattr(settings, 'JAVA_API_BASE_URL', '').rstrip('/')
    if explicit:
        return explicit
    auth_base = getattr(settings, 'JAVA_AUTH_BASE_URL', '').rstrip('/')
    if auth_base.endswith('/api/auth'):
        return auth_base[:-len('/api/auth')]
    if auth_base.endswith('/auth'):
        return auth_base[:-len('/auth')]
    return auth_base


def validate_token(token: str) -> dict:
    if not token:
        return {}
    data = _post_json('validate-token', {'token': token})
    return data if data.get('valid') is True else {}


def current_user(token: str) -> dict:
    return _get_json('me', token)


def list_users(token: str):
    if not token:
        return []

    base_url = _java_api_base_url()
    candidates = getattr(settings, 'JAVA_USERS_PATHS', None) or [
        'api/users',
        'api/auth/users',
        'users',
        'api/user',
    ]

    for path in candidates:
        payload = _request_json(base_url, path, token, timeout=4)
        if isinstance(payload, list):
            return payload
        if isinstance(payload, dict):
            for key in ('users', 'data', 'content', 'items', 'results'):
                value = payload.get(key)
                if isinstance(value, list):
                    return value
                if isinstance(value, dict):
                    nested = value.get('content') or value.get('items') or value.get('results')
                    if isinstance(nested, list):
                        return nested
    return []


def check_permission(token: str, permission: str) -> bool:
    if not token or not permission:
        return False
    data = _post_json('check-permission', {
        'token': token,
        'permission': permission,
    })
    return data.get('valid') is True and data.get('allowed') is True
