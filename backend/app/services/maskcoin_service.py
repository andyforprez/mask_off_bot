from sqlalchemy.orm import Session
from app.repositories.maskcoin_repository import (
    add_transaction,
    get_transactions_by_user,
    get_balance
)
from app.models.user import User


TOURNAMENT_ENTRY_COST = 1000   # 1000 maskcoins = 1000 rubles
REFERRAL_BONUS = 500           # 500 maskcoins per successful referral
BAR_CONVERSION = 0.5           # 1 maskcoin = 0.5 rubles at bar


def grant_coins(
    db: Session,
    user_id: int,
    amount: int,
    note: str = None
):
    return add_transaction(
        db,
        user_id=user_id,
        amount=amount,
        transaction_type="admin_grant",
        note=note
    )


def spend_on_tournament(db: Session, user_id: int, tournament_id: int):
    balance = get_balance(db, user_id)
    if balance < TOURNAMENT_ENTRY_COST:
        raise Exception(
            f"Insufficient maskcoins. "
            f"Have {balance}, need {TOURNAMENT_ENTRY_COST}."
        )
    return add_transaction(
        db,
        user_id=user_id,
        amount=-TOURNAMENT_ENTRY_COST,
        transaction_type="tournament_buy",
        reference_id=tournament_id,
        note="Tournament entry"
    )


def spend_at_bar(db: Session, user_id: int, maskcoin_amount: int):
    balance = get_balance(db, user_id)
    if balance < maskcoin_amount:
        raise Exception(
            f"Insufficient maskcoins. "
            f"Have {balance}, need {maskcoin_amount}."
        )
    ruble_value = int(maskcoin_amount * BAR_CONVERSION)
    return add_transaction(
        db,
        user_id=user_id,
        amount=-maskcoin_amount,
        transaction_type="bar_spend",
        note=f"Bar spend: {maskcoin_amount} coins = {ruble_value}₽"
    )


def process_referral(db: Session, new_user_id: int, referrer_id: int):
    # new user confirms participation → referrer gets 500 coins
    return add_transaction(
        db,
        user_id=referrer_id,
        amount=REFERRAL_BONUS,
        transaction_type="referral",
        reference_id=new_user_id,
        note=f"Referral bonus for user #{new_user_id}"
    )


def get_user_transactions(db: Session, user_id: int, limit: int = 50):
    return get_transactions_by_user(db, user_id, limit)


def get_user_balance(db: Session, user_id: int):
    return get_balance(db, user_id)