"""
Rotas do dashboard.
"""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.database import get_db
from app.auth import get_current_user
from app.models import User, Transaction, Category
from app.schemas import DashboardSummary, ChartData
from pathlib import Path
from dateutil.relativedelta import relativedelta
from collections import defaultdict
from app.recurrence import materialize_monthly_transactions

router = APIRouter(tags=["dashboard"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request, user: User = Depends(get_current_user)):
    """Renderiza a página principal do dashboard."""
    return templates.TemplateResponse("dashboard.html", {"request": request, "user": user})

@router.get("/api/dashboard/summary", response_model=DashboardSummary)
async def get_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retorna o resumo mensal do dashboard."""
    hoje = date.today()
    inicio_mes = hoje.replace(day=1)
    materialize_monthly_transactions(db, user.id, hoje)
    
    transacoes = db.query(Transaction).filter(
        Transaction.user_id == user.id,
        Transaction.recurrence_skipped.is_(False),
        Transaction.date >= inicio_mes
    ).all()
    
    receitas = sum(t.amount for t in transacoes if t.type == "receita")
    despesas = sum(t.amount for t in transacoes if t.type == "despesa")
    
    saldo = receitas - despesas
    economia = ((receitas - despesas) / receitas * 100) if receitas > 0 else 0.0
    
    return DashboardSummary(
        saldo_total=float(saldo),
        total_receitas=float(receitas),
        total_despesas=float(despesas),
        percentual_economia=float(economia)
    )

@router.get("/api/dashboard/chart", response_model=ChartData)
async def get_chart_data(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retorna os dados para renderizar os gráficos."""
    hoje = date.today()
    seis_meses_atras = hoje - relativedelta(months=5)
    inicio_periodo = seis_meses_atras.replace(day=1)
    
    materialize_monthly_transactions(db, user.id, hoje)
    transacoes = db.query(Transaction).filter(
        Transaction.user_id == user.id,
        Transaction.recurrence_skipped.is_(False),
        Transaction.date >= inicio_periodo
    ).all()
    
    mensal_receitas = defaultdict(float)
    mensal_despesas = defaultdict(float)
    despesas_categoria = defaultdict(float)
    
    for t in transacoes:
        mes_ano = t.date.strftime("%m/%Y")
        if t.type == "receita":
            mensal_receitas[mes_ano] += float(t.amount)
        elif t.type == "despesa":
            mensal_despesas[mes_ano] += float(t.amount)
            if t.category:
                despesas_categoria[t.category.name] += float(t.amount)
                
    labels = [(hoje - relativedelta(months=i)).strftime("%m/%Y") for i in range(5, -1, -1)]
    receitas_lista = [mensal_receitas[l] for l in labels]
    despesas_lista = [mensal_despesas[l] for l in labels]
    
    return ChartData(
        labels=labels,
        receitas=receitas_lista,
        despesas=despesas_lista,
        despesas_por_categoria=dict(despesas_categoria)
    )

@router.get("/api/transactions/recent")
async def get_recent_transactions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retorna as transações mais recentes."""
    materialize_monthly_transactions(db, user.id)
    transacoes = db.query(Transaction).filter(Transaction.user_id == user.id, Transaction.recurrence_skipped.is_(False))\
                   .order_by(Transaction.date.desc()).limit(5).all()
    
    result = []
    for t in transacoes:
        cat_name = t.category.name if t.category else None
        cat_color = t.category.color if t.category else None
        result.append({
            "id": t.id,
            "description": t.description,
            "amount": float(t.amount),
            "type": t.type,
            "date": t.date,
            "category_name": cat_name,
            "category_color": cat_color
        })
    return result
