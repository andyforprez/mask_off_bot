from sqlalchemy.orm import Session
from app.models.user import User

def create_user(
    db: Session,
    telegram_id: str,
    username: str,
    display_name: str
):
    user = User(
        telegram_id=telegram_id,
        username=username,
        display_name=display_name
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_by_telegram_id(
    db: Session,
    telegram_id: str
):
    return db.query(User).filter(
        User.telegram_id == telegram_id
    ).first()