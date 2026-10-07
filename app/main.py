"""
Ponto de entrada do FastAPI.
"""
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.database import engine, Base
from app.routers import auth, dashboard, transactions

# Cria as tabelas no banco de dados (idealmente usaríamos Alembic em produção)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Orbis", description="Sistema de finanças pessoais")

# Caminhos base
BASE_DIR = Path(__file__).resolve().parent.parent

# Montagem de arquivos estáticos
if (BASE_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(BASE_DIR / "assets")), name="assets")
if (BASE_DIR / "js").exists():
    app.mount("/js", StaticFiles(directory=str(BASE_DIR / "js")), name="js")

# Inclusão das rotas
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(transactions.router)

@app.get("/")
async def root():
    """Redireciona para a tela de login."""
    return RedirectResponse(url="/auth/login")

@app.on_event("startup")
async def startup_event():
    """Evento disparado no início da aplicação."""
    pass
