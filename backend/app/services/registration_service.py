from sqlalchemy.orm import Session

from app.repositories.registration_repository import (
    create_registration,
    get_registration_count,
    get_user_registration
)

from app.repositories.tournament_repository import (
    get_tournament_by_id
)

def register_player(db: Session, tournament_id: int, user_id: int):

    tournament = get_tournament_by_id(db, tournament_id)

    if not tournament:
        raise Exception("Tournament not found")

    # prevent double registration
    existing = get_user_registration(db, tournament_id, user_id)

    if existing:
        return existing

    current_count = get_registration_count(db, tournament_id)

    if current_count < tournament.max_players:
        status = "confirmed"
    else:
        status = "waitlist"

    return create_registration(
        db,
        tournament_id,
        user_id,
        status
    )