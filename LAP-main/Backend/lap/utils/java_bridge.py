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


def _get_json(path: str, token: str, timeout: float = 2.5) -> dict:
    base_url = getattr(settings, 'JAVA_AUTH_BASE_URL', '').rstrip('/')
    if not base_url or not token:
        return {}

    request = urllib.request.Request(
        f'{base_url}/{path.lstrip("/")}',
        headers={
            'Accept': 'application/json',
            'Authorization': f'Bearer {token}',
        },
        method='GET',
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


def validate_token(token: str) -> dict:
    if not token:
        return {}
    data = _post_json('validate-token', {'token': token})
    return data if data.get('valid') is True else {}


def current_user(token: str) -> dict:
    return _get_json('me', token)


def check_permission(token: str, permission: str) -> bool:
    if not token or not permission:
        return False
    data = _post_json('check-permission', {
        'token': token,
        'permission': permission,
    })
    return data.get('valid') is True and data.get('allowed') is True
