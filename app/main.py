"""
Ponto de entrada da aplicação FastAPI - Orbis Finance.
"""
from fastapi import FastAPI
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging

from app.database import engine, Base
from app.routers import auth, dashboard, transactions

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orbis")

app = FastAPI(
    title="Orbis",
    description="Sistema de Gestão Financeira Pessoal",
    version="1.0.0"
)

# Caminho raiz do projeto (um nível acima de /app)
BASE_DIR = Path(__file__).resolve().parent.parent

# Montagem de arquivos estáticos
if (BASE_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(BASE_DIR / "assets")), name="assets")
if (BASE_DIR / "js").exists():
    app.mount("/js", StaticFiles(directory=str(BASE_DIR / "js")), name="js")

# Inclusão das rotas da aplicação
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(transactions.router)

@app.get("/")
async def root():
    """Redireciona para a tela de login inicial."""
    return RedirectResponse(url="/auth/login")

@app.get("/health")
async def health_check():
    """Endpoint de verificação de integridade (Health Check) para monitoramento no Render."""
    return JSONResponse(status_code=200, content={"status": "healthy", "app": "Orbis"})

@app.on_event("startup")
async def startup_event():
    """
    Evento disparado na inicialização da aplicação.
    Cria as tabelas no PostgreSQL/Supabase automaticamente caso não existam.
    """
    logger.info("Iniciando Orbis... Conectando ao banco de dados...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas sincronizadas com sucesso no banco de dados!")
    except Exception as erro:
        logger.error(f"Aviso ao inicializar tabelas: {erro}")
