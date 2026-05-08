from sqlalchemy.orm import Session

from app.repositories.tournament_repository import (
    create_tournament,
    get_all_tournaments,
    get_tournament_by_id
)

def create_new_tournament(
    db: Session,
    tournament_data
):
    return create_tournament(
        db,
        tournament_data
    )

def list_tournaments(
    db: Session
):
    return get_all_tournaments(db)

def get_tournament(
    db: Session,
    tournament_id: int
):
    return get_tournament_by_id(
        db,
        tournament_id
    )