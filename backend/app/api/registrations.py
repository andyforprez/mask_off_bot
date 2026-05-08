from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.dependencies import get_db

from app.services.registration_service import register_player

router = APIRouter(
    prefix="/registrations",
    tags=["Registrations"]
)

@router.post("/{tournament_id}/register")
def register(
    tournament_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    return register_player(
        db,
        tournament_id,
        user_id
    )