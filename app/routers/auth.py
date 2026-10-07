"""
Rotas de autenticação.
"""
from fastapi import APIRouter, Depends, Request, Form, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Category
from app.auth import hash_password, verify_password, create_access_token
from pathlib import Path

router = APIRouter(prefix="/auth", tags=["auth"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Renderiza a página de login."""
    return templates.TemplateResponse("login.html", {"request": request})

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Renderiza a página de registro."""
    return templates.TemplateResponse("register.html", {"request": request})

@router.post("/register")
async def register(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Cria um novo usuário e suas categorias padrão."""
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return RedirectResponse(url="/auth/register", status_code=status.HTTP_303_SEE_OTHER)

    hashed_pw = hash_password(password)
    new_user = User(name=name, email=email, password_hash=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Categorias padrão
    categorias = [
        # Receitas
        {"name": "Salário", "type": "receita", "color": "#8b5cf6", "icon": None},
        {"name": "Freelance", "type": "receita", "color": "#a78bfa", "icon": None},
        {"name": "Investimentos", "type": "receita", "color": "#22c55e", "icon": None},
        {"name": "Outros", "type": "receita", "color": "#6b7280", "icon": None},
        # Despesas
        {"name": "Moradia", "type": "despesa", "color": "#ef4444", "icon": None},
        {"name": "Alimentação", "type": "despesa", "color": "#f97316", "icon": None},
        {"name": "Transporte", "type": "despesa", "color": "#3b82f6", "icon": None},
        {"name": "Saúde", "type": "despesa", "color": "#10b981", "icon": None},
        {"name": "Lazer", "type": "despesa", "color": "#ec4899", "icon": None},
        {"name": "Educação", "type": "despesa", "color": "#8b5cf6", "icon": None},
        {"name": "Outros", "type": "despesa", "color": "#6b7280", "icon": None},
    ]

    for cat in categorias:
        nova_cat = Category(**cat, user_id=new_user.id)
        db.add(nova_cat)
    
    db.commit()

    return RedirectResponse(url="/auth/login", status_code=status.HTTP_303_SEE_OTHER)

@router.post("/login")
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Autentica o usuário e cria o token JWT."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return RedirectResponse(url="/auth/login", status_code=status.HTTP_303_SEE_OTHER)

    access_token = create_access_token(data={"sub": user.email})
    
    response = RedirectResponse(url="/dashboard", status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True)
    
    return response

@router.get("/logout")
async def logout():
    """Realiza o logout do usuário limpando o cookie."""
    response = RedirectResponse(url="/auth/login", status_code=status.HTTP_303_SEE_OTHER)
    response.delete_cookie(key="access_token")
    return response
