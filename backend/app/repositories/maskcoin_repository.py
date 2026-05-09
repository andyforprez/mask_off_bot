from sqlalchemy.orm import Session
from app.models.maskcoin_transaction import MaskcoinTransaction
from app.models.user import User


def add_transaction(
    db: Session,
    user_id: int,
    amount: int,
    transaction_type: str,
    reference_id: int = None,
    note: str = None
):
    # write the transaction log
    tx = MaskcoinTransaction(
        user_id=user_id,
        amount=amount,
        transaction_type=transaction_type,
        reference_id=reference_id,
        note=note
    )
    db.add(tx)

    # update the user balance directly
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.maskcoin_balance += amount

    db.commit()
    db.refresh(tx)
    return tx


def get_transactions_by_user(db: Session, user_id: int, limit: int = 50):
    return db.query(MaskcoinTransaction).filter(
        MaskcoinTransaction.user_id == user_id
    ).order_by(MaskcoinTransaction.created_at.desc()).limit(limit).all()


def get_balance(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        return user.maskcoin_balance
    return 0