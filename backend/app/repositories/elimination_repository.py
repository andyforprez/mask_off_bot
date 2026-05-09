from sqlalchemy.orm import Session
from app.models.elimination import Elimination


def record_elimination(
    db: Session,
    tournament_id: int,
    eliminated_user_id: int,
    finish_position: int,
    players_remaining: int,
    eliminated_by_user_id: int = None,
    recorded_by: str = None
):
    elimination = Elimination(
        tournament_id=tournament_id,
        eliminated_user_id=eliminated_user_id,
        eliminated_by_user_id=eliminated_by_user_id,
        finish_position=finish_position,
        players_remaining=players_remaining,
        recorded_by=recorded_by
    )
    db.add(elimination)
    db.commit()
    db.refresh(elimination)
    return elimination


def get_eliminations_by_tournament(db: Session, tournament_id: int):
    # most recent first — for the live knockout feed
    return db.query(Elimination).filter(
        Elimination.tournament_id == tournament_id
    ).order_by(Elimination.eliminated_at.desc()).all()


def get_latest_elimination(db: Session, tournament_id: int):
    return db.query(Elimination).filter(
        Elimination.tournament_id == tournament_id
    ).order_by(Elimination.eliminated_at.desc()).first()


def get_players_remaining(db: Session, tournament_id: int):
    latest = get_latest_elimination(db, tournament_id)
    if latest:
        return latest.players_remaining
    return None


def get_knockout_count(db: Session, tournament_id: int, user_id: int):
    # how many knockouts did a specific player get in this tournament
    return db.query(Elimination).filter(
        Elimination.tournament_id == tournament_id,
        Elimination.eliminated_by_user_id == user_id
    ).count()