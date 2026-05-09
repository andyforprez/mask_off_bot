from sqlalchemy.orm import Session
from app.models.friendship import Friendship


def add_friend(db: Session, user_id: int, friend_id: int):
    # check if already friends
    existing = db.query(Friendship).filter(
        Friendship.user_id == user_id,
        Friendship.friend_id == friend_id
    ).first()
    if existing:
        return existing

    friendship = Friendship(user_id=user_id, friend_id=friend_id)
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    return friendship


def remove_friend(db: Session, user_id: int, friend_id: int):
    db.query(Friendship).filter(
        Friendship.user_id == user_id,
        Friendship.friend_id == friend_id
    ).delete()
    db.commit()


def get_friends(db: Session, user_id: int):
    # returns list of friend user_ids
    rows = db.query(Friendship.friend_id).filter(
        Friendship.user_id == user_id
    ).all()
    return [r.friend_id for r in rows]


def are_friends(db: Session, user_id: int, friend_id: int):
    return db.query(Friendship).filter(
        Friendship.user_id == user_id,
        Friendship.friend_id == friend_id
    ).first() is not None