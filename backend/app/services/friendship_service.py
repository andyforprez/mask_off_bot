from sqlalchemy.orm import Session
from app.repositories.friendship_repository import (
    add_friend,
    remove_friend,
    get_friends,
    are_friends
)
from app.models.user import User


def add_friend_by_identifier(
    db: Session,
    user_id: int,
    identifier: str
):
    """
    identifier can be:
    - a poker nickname (e.g. "Антуан Гризманн")
    - a @username (e.g. "@AntGrizm" or "AntGrizm")
    """
    identifier = identifier.lstrip("@").strip()

    friend = (
        db.query(User).filter(
            (User.poker_nickname == identifier) |
            (User.username == identifier)
        ).first()
    )

    if not friend:
        raise Exception(f"Player '{identifier}' not found.")

    if friend.id == user_id:
        raise Exception("You cannot add yourself as a friend.")

    return add_friend(db, user_id, friend.id)


def remove_friend_by_id(db: Session, user_id: int, friend_id: int):
    remove_friend(db, user_id, friend_id)


def get_friends_with_details(db: Session, user_id: int):
    friend_ids = get_friends(db, user_id)
    friends = db.query(User).filter(User.id.in_(friend_ids)).all()
    return [
        {
            "user_id": f.id,
            "poker_nickname": f.poker_nickname,
            "display_name": f.display_name,
            "username": f.username,
        }
        for f in friends
    ]