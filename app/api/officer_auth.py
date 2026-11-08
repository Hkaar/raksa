"""Officer authentication backed by Supabase Auth."""
import asyncio
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.services.officer_auth import AuthUnavailable, InvalidCredentials, officer_user, request_auth

router = APIRouter(prefix='/officer/auth', tags=['officer auth'])
bearer = HTTPBearer(auto_error=False)
Username = Annotated[str, StringConstraints(strip_whitespace=True, to_lower=True,
    min_length=3, max_length=32, pattern=r'^[a-zA-Z0-9][a-zA-Z0-9._-]*$')]


class LoginInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    username: Username
    password: str = Field(min_length=1, max_length=256, repr=False)


class RefreshInput(BaseModel):
    model_config = ConfigDict(extra='forbid')
    refresh_token: str = Field(min_length=1, max_length=4096, repr=False)


class Officer(BaseModel):
    id: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str
    officer: Officer


async def call_auth(settings, path, data=None, token=None):
    try:
        return await asyncio.to_thread(request_auth, settings, path, data, token)
    except InvalidCredentials:
        raise HTTPException(status_code=401, detail='invalid_credentials') from None
    except AuthUnavailable:
        raise HTTPException(status_code=503, detail='auth_unavailable') from None


def validate_officer(user):
    try:
        return officer_user(user)
    except InvalidCredentials:
        raise HTTPException(status_code=403, detail='officer_access_required') from None
    except AuthUnavailable:
        raise HTTPException(status_code=503, detail='auth_unavailable') from None


@router.post('/login', response_model=LoginResponse)
async def login(body: LoginInput, request: Request, response: Response):
    response.headers['Cache-Control'] = 'no-store'
    settings = request.app.state.settings
    if not settings.officer_email_domain:
        raise HTTPException(status_code=503, detail='auth_unavailable')
    result = await call_auth(settings, 'token?grant_type=password',
        {'email': f'{body.username}@{settings.officer_email_domain}', 'password': body.password})
    return session_response(result)


@router.post('/shortcut', response_model=LoginResponse)
async def shortcut(request: Request, response: Response):
    response.headers['Cache-Control'] = 'no-store'
    settings = request.app.state.settings
    if not (settings.officer_shortcut_enabled and settings.officer_shortcut_email and settings.officer_shortcut_password):
        raise HTTPException(status_code=503, detail='shortcut_unavailable')
    result = await call_auth(settings, 'token?grant_type=password',
        {'email': settings.officer_shortcut_email, 'password': settings.officer_shortcut_password})
    return session_response(result)


def session_response(result):
    if not isinstance(result, dict):
        raise HTTPException(status_code=503, detail='auth_unavailable')
    officer = validate_officer(result.get('user'))
    try:
        return LoginResponse(access_token=result['access_token'], refresh_token=result['refresh_token'],
            expires_in=result['expires_in'], token_type=result['token_type'], officer=officer)
    except (KeyError, ValueError, TypeError):
        raise HTTPException(status_code=503, detail='auth_unavailable') from None


@router.get('/me', response_model=Officer)
async def me(request: Request, credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if credentials is None or credentials.scheme.lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid_credentials', headers={'WWW-Authenticate': 'Bearer'})
    user = await call_auth(request.app.state.settings, 'user', token=credentials.credentials)
    return validate_officer(user)


@router.post('/refresh', response_model=LoginResponse)
async def refresh(body: RefreshInput, request: Request, response: Response):
    response.headers['Cache-Control'] = 'no-store'
    result = await call_auth(request.app.state.settings, 'token?grant_type=refresh_token',
        {'refresh_token': body.refresh_token})
    return session_response(result)


@router.post('/logout', status_code=204)
async def logout(request: Request, credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if credentials is None:
        raise HTTPException(status_code=401, detail='invalid_credentials')
    await call_auth(request.app.state.settings, 'logout', {}, credentials.credentials)
