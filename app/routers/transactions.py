"""
Rotas de gerenciamento de transações.
"""
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.auth import get_current_user
from app.models import User, Transaction, Category
from app.schemas import TransactionCreate, TransactionUpdate, TransactionResponse, CategoryCreate, CategoryResponse
from pathlib import Path

router = APIRouter(tags=["transactions"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

@router.get("/transactions", response_class=HTMLResponse)
async def transactions_page(request: Request, user: User = Depends(get_current_user)):
    """Renderiza a página de transações."""
    return templates.TemplateResponse("transactions.html", {"request": request, "user": user})

@router.get("/api/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista as transações com filtros."""
    query = db.query(Transaction).filter(Transaction.user_id == user.id)
    
    if type:
        query = query.filter(Transaction.type == type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
        
    transacoes = query.order_by(Transaction.date.desc()).all()
    
    resultado = []
    for t in transacoes:
        resultado.append(TransactionResponse(
            id=t.id,
            description=t.description,
            amount=float(t.amount),
            type=t.type,
            date=t.date,
            recurring=t.recurring,
            category_id=t.category_id,
            category_name=t.category.name if t.category else None,
            category_color=t.category.color if t.category else None,
            created_at=t.created_at
        ))
    return resultado

@router.post("/api/transactions", response_model=TransactionResponse)
async def create_transaction(
    transacao: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova transação."""
    nova_transacao = Transaction(**transacao.dict(), user_id=user.id)
    db.add(nova_transacao)
    db.commit()
    db.refresh(nova_transacao)
    
    return TransactionResponse(
        id=nova_transacao.id,
        description=nova_transacao.description,
        amount=float(nova_transacao.amount),
        type=nova_transacao.type,
        date=nova_transacao.date,
        recurring=nova_transacao.recurring,
        category_id=nova_transacao.category_id,
        category_name=nova_transacao.category.name if nova_transacao.category else None,
        category_color=nova_transacao.category.color if nova_transacao.category else None,
        created_at=nova_transacao.created_at
    )

@router.put("/api/transactions/{id}")
async def update_transaction(
    id: int,
    transacao_in: TransactionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza uma transação existente."""
    transacao = db.query(Transaction).filter(Transaction.id == id, Transaction.user_id == user.id).first()
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
        
    update_data = transacao_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(transacao, key, value)
        
    db.commit()
    db.refresh(transacao)
    return transacao

@router.delete("/api/transactions/{id}")
async def delete_transaction(id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Exclui uma transação."""
    transacao = db.query(Transaction).filter(Transaction.id == id, Transaction.user_id == user.id).first()
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
        
    db.delete(transacao)
    db.commit()
    return {"message": "Transação excluída com sucesso"}

@router.get("/api/categories", response_model=List[CategoryResponse])
async def list_categories(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista as categorias do usuário."""
    categorias = db.query(Category).filter(Category.user_id == user.id).all()
    return categorias

@router.post("/api/categories", response_model=CategoryResponse)
async def create_category(
    categoria: CategoryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova categoria."""
    nova_categoria = Category(**categoria.dict(), user_id=user.id)
    db.add(nova_categoria)
    db.commit()
    db.refresh(nova_categoria)
    return nova_categoria
