"""
Configuração do banco de dados SQLAlchemy.
Otimizado para bancos em nuvem (Supabase, Neon, AWS) com verificação de integridade de conexões.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# pool_pre_ping=True: detecta e descarta conexões inativas antes de cada consulta
# pool_recycle=300: recicla conexões a cada 5 minutos (evita quedas por inatividade do Supabase)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependência do FastAPI para obter a sessão do banco de dados.
    Garante que a sessão seja fechada após o uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
