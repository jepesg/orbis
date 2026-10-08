"""Idempotently materialize monthly income and expense occurrences."""
from calendar import monthrange
from datetime import date

from sqlalchemy.orm import Session

from app.models import Transaction


def _month_after(year: int, month: int):
    return (year + (month == 12), 1 if month == 12 else month + 1)


def materialize_monthly_transactions(db: Session, user_id: int, through: date | None = None) -> None:
    """Create one saved transaction for each elapsed month of every active series."""
    through = through or date.today()
    sources = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.recurring.is_(True),
        Transaction.recurring_parent_id.is_(None),
    ).order_by(Transaction.id).with_for_update().all()
    changed = False
    for source in sources:
        first_period = source.recurring_period or source.date.strftime("%Y-%m")
        year, month = (int(value) for value in first_period.split("-"))
        while (year, month) < (through.year, through.month):
            period = f"{year:04d}-{month:02d}"
            exists = db.query(Transaction.id).filter(
                Transaction.recurring_parent_id == source.id,
                Transaction.recurring_period == period,
            ).first()
            if not exists:
                day = min(source.date.day, monthrange(year, month)[1])
                db.add(Transaction(
                    description=source.description,
                    amount=source.amount,
                    type=source.type,
                    date=date(year, month, day),
                    recurring=True,
                    recurring_parent_id=source.id,
                    recurring_period=period,
                    category_id=source.category_id,
                    user_id=user_id,
                ))
                changed = True
            year, month = _month_after(year, month)
    if changed:
        db.commit()
