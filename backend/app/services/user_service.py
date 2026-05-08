from sqlalchemy.orm import Session
from app.repositories.user_repository import (
    create_user,
    get_user_by_telegram_id
)

def register_user(
    db: Session,
    telegram_id: str,
    username: str,
    display_name: str
):
    existing_user = get_user_by_telegram_id(
        db,
        telegram_id
    )

    if existing_user:
        return existing_user

    return create_user(
        db,
        telegram_id,
        username,
        display_name
    )