"""
Configurações do projeto com suporte a variáveis de ambiente (.env e produção).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from dotenv import load_dotenv
import secrets

load_dotenv()

class Settings(BaseSettings):
    """Classe de configuração da aplicação Orbis."""
    # SQLite keeps a fresh local checkout usable without requiring a separate server.
    DATABASE_URL: str = "sqlite:///./orbis.db"
    SECRET_KEY: str = secrets.token_hex(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalizar_url_banco(cls, valor: str) -> str:
        """
        Garante compatibilidade com SQLAlchemy caso a URL comece com 'postgres://',
        formato comum fornecido por provedores como Supabase e Render.
        """
        if isinstance(valor, str) and valor.startswith("postgres://"):
            return valor.replace("postgres://", "postgresql://", 1)
        if isinstance(valor, str) and valor.startswith("postgresql://") and "sslmode" not in valor and any(host in valor for host in ("render.com", "supabase.co", "pooler.supabase.com")):
            return valor + ("&" if "?" in valor else "?") + "sslmode=require"
        return valor

settings = Settings()
