"""
Modelos do banco de dados (SQLAlchemy).
"""
from sqlalchemy import Column, Integer, String, Numeric, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    """Modelo de usuário."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    categories = relationship("Category", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")

class Category(Base):
    """Modelo de categoria de transação."""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    type = Column(String(10), nullable=False)  # 'receita' ou 'despesa'
    color = Column(String(7), nullable=False)  # hex color
    icon = Column(String(50), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")

class Transaction(Base):
    """Modelo de transação financeira."""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(200), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    type = Column(String(10), nullable=False)  # 'receita' ou 'despesa'
    date = Column(Date, nullable=False)
    recurring = Column(Boolean, default=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
