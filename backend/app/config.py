from pydantic import AnyUrl
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "MyKeyManager"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "change-this-secret"  # override via env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "mykeymanager"
    POSTGRES_USER: str = "mykeyuser"
    POSTGRES_PASSWORD: str = "mykeypass"
    DATABASE_URL: str | None = None
    REDIS_URL: str = "redis://redis:6379/0"
    RATE_LIMIT: str = "100/hour"
    SMTP_HOST: str = "smtp"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "smtpuser"
    SMTP_PASSWORD: str = "smtppass"
    SMTP_FROM: str = "info@acwild.it"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def sqlalchemy_database_uri(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}" \
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

@lru_cache
def get_settings() -> Settings:
    return Settings()
