from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db

from app.schemas.user import (
    UserCreate,
    UserResponse
)

from app.services.user_service import register_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return register_user(
        db,
        user.telegram_id,
        user.username,
        user.display_name
    )