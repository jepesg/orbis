"""
Esquemas Pydantic para validação de dados.
"""
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List

class UserCreate(BaseModel):
    """Esquema para criação de usuário."""
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """Esquema para resposta de usuário."""
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    """Esquema para requisição de login."""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """Esquema para resposta de token de acesso."""
    access_token: str
    token_type: str

class CategoryCreate(BaseModel):
    """Esquema para criação de categoria."""
    name: str
    type: str
    color: str
    icon: Optional[str] = None

class CategoryResponse(BaseModel):
    """Esquema para resposta de categoria."""
    id: int
    name: str
    type: str
    color: str
    icon: Optional[str] = None

    class Config:
        orm_mode = True

class TransactionCreate(BaseModel):
    """Esquema para criação de transação."""
    description: str
    amount: float
    type: str
    date: date
    recurring: bool = False
    category_id: Optional[int] = None

class TransactionUpdate(BaseModel):
    """Esquema para atualização de transação."""
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    date: Optional[date] = None
    recurring: Optional[bool] = None
    category_id: Optional[int] = None

class TransactionResponse(BaseModel):
    """Esquema para resposta de transação."""
    id: int
    description: str
    amount: float
    type: str
    date: date
    recurring: bool
    category_id: Optional[int]
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

class DashboardSummary(BaseModel):
    """Esquema para resumo do dashboard."""
    saldo_total: float
    total_receitas: float
    total_despesas: float
    percentual_economia: float

class ChartData(BaseModel):
    """Esquema para dados de gráficos."""
    labels: List[str]
    receitas: List[float]
    despesas: List[float]
    despesas_por_categoria: dict
