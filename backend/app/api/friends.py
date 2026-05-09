from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.dependencies import get_db
from app.services.friendship_service import (
    add_friend_by_identifier,
    remove_friend_by_id,
    get_friends_with_details
)

router = APIRouter(
    prefix="/friends",
    tags=["Friends"]
)


class AddFriendRequest(BaseModel):
    identifier: str
    # poker nickname or @username


@router.get("/{user_id}")
def list_friends(user_id: int, db: Session = Depends(get_db)):
    """Get a player's full friends list with their details."""
    return get_friends_with_details(db, user_id)


@router.post("/{user_id}/add")
def add_friend(
    user_id: int,
    data: AddFriendRequest,
    db: Session = Depends(get_db)
):
    try:
        friendship = add_friend_by_identifier(db, user_id, data.identifier)
        return {"status": "added", "friendship_id": friendship.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}/remove/{friend_id}")
def remove_friend(
    user_id: int,
    friend_id: int,
    db: Session = Depends(get_db)
):
    remove_friend_by_id(db, user_id, friend_id)
    return {"status": "removed"}