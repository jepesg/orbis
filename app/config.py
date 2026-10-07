"""
Configurações do projeto.
"""
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import secrets

load_dotenv()

class Settings(BaseSettings):
    """Classe de configuração da aplicação."""
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/orbis"
    SECRET_KEY: str = secrets.token_hex(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"

settings = Settings()
