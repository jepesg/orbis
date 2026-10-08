"""
Configuração do banco de dados SQLAlchemy.
Otimizado para bancos em nuvem (Supabase, Neon, AWS) com verificação de integridade de conexões.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# pool_pre_ping=True: detecta e descarta conexões inativas antes de cada consulta
# pool_recycle=300: recicla conexões a cada 5 minutos (evita quedas por inatividade do Supabase)
engine_options = {"pool_pre_ping": True}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
else:
    engine_options["pool_recycle"] = 300
engine = create_engine(settings.DATABASE_URL, **engine_options)
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
