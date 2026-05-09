from sqlalchemy.orm import Session
from app.repositories.elimination_repository import (
    record_elimination,
    get_eliminations_by_tournament,
    get_players_remaining,
    get_latest_elimination
)
from app.repositories.tournament_repository import get_tournament_by_id
from app.models.user import User


def knock_out_player(
    db: Session,
    tournament_id: int,
    eliminated_user_id: int,
    finish_position: int,
    eliminated_by_user_id: int = None,
    recorded_by: str = None
):
    tournament = get_tournament_by_id(db, tournament_id)
    if not tournament:
        raise Exception("Tournament not found")

    # figure out players remaining
    previous = get_latest_elimination(db, tournament_id)
    if previous:
        players_remaining = previous.players_remaining - 1
    else:
        # first elimination — start from total registered
        players_remaining = tournament.current_players - 1

    elimination = record_elimination(
        db=db,
        tournament_id=tournament_id,
        eliminated_user_id=eliminated_user_id,
        finish_position=finish_position,
        players_remaining=players_remaining,
        eliminated_by_user_id=eliminated_by_user_id,
        recorded_by=recorded_by
    )

    return elimination


def get_live_feed(db: Session, tournament_id: int, limit: int = 20):
    eliminations = get_eliminations_by_tournament(db, tournament_id)[:limit]
    feed = []
    for e in eliminations:
        eliminated = db.query(User).filter(
            User.id == e.eliminated_user_id
        ).first()
        knocked_by = None
        if e.eliminated_by_user_id:
            knocked_by = db.query(User).filter(
                User.id == e.eliminated_by_user_id
            ).first()

        feed.append({
            "id": e.id,
            "eliminated_nick": (
                eliminated.poker_nickname or eliminated.display_name
                if eliminated else "—"
            ),
            "knocked_by_nick": (
                knocked_by.poker_nickname or knocked_by.display_name
                if knocked_by else None
            ),
            "finish_position": e.finish_position,
            "players_remaining": e.players_remaining,
            "eliminated_at": e.eliminated_at.isoformat()
        })
    return feed