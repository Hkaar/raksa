from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix='RAKSA_', env_file=Path(__file__).resolve().parents[1] / '.env', env_file_encoding='utf-8', extra='ignore', populate_by_name=True,
    )

    app_name: str = 'RAKSA API'
    cors_origins: list[str] = []

    gemini_api_key: str | None = None
    gemini_model: str = 'gemini-3.5-flash-lite'
    gemini_timeout_seconds: int = Field(default=45, ge=1, le=120)

    supabase_url: str | None = Field(default=None, validation_alias=AliasChoices('RAKSA_SUPABASE_URL', 'SUPABASE_URL'))
    supabase_secret_key: str | None = Field(default=None, repr=False, validation_alias=AliasChoices('RAKSA_SUPABASE_SECRET_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'))
    supabase_publishable_key: str | None = Field(default=None, repr=False, validation_alias=AliasChoices('RAKSA_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY'))
    officer_email_domain: str | None = None

    officer_shortcut_enabled: bool = False
    officer_shortcut_email: str | None = None
    officer_shortcut_password: str | None = None
