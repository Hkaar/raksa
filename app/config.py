from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix='RAKSA_', env_file='.env', env_file_encoding='utf-8', extra='ignore',
    )

    app_name: str = 'RAKSA API'
    cors_origins: list[str] = []
