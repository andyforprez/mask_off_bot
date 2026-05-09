from sqlalchemy.orm import Session
from app.models.blind_timer import BlindTimer


def get_timer_by_tournament(db: Session, tournament_id: int):
    return db.query(BlindTimer).filter(
        BlindTimer.tournament_id == tournament_id
    ).first()


def create_timer(
    db: Session,
    tournament_id: int,
    total_chips: int,
    players_remaining: int,
    level_duration_seconds: int = 1200,
    has_ante: bool = True
):
    timer = BlindTimer(
        tournament_id=tournament_id,
        current_level=1,
        small_blind=100,
        big_blind=200,
        ante=200 if has_ante else None,
        level_duration_seconds=level_duration_seconds,
        seconds_remaining=level_duration_seconds,
        is_running=False,
        total_chips=total_chips,
        players_remaining=players_remaining
    )
    db.add(timer)
    db.commit()
    db.refresh(timer)
    return timer


def update_timer(db: Session, tournament_id: int, **kwargs):
    db.query(BlindTimer).filter(
        BlindTimer.tournament_id == tournament_id
    ).update(kwargs)
    db.commit()
    return get_timer_by_tournament(db, tournament_id)


def advance_level(db: Session, tournament_id: int, blind_levels: list):
    """
    blind_levels is a list of dicts:
    [
      {"small": 100, "big": 200, "ante": 200},
      {"small": 200, "big": 400, "ante": 400},
      ...
    ]
    """
    timer = get_timer_by_tournament(db, tournament_id)
    if not timer:
        return None

    next_level = timer.current_level + 1
    if next_level > len(blind_levels):
        return timer  # already at last level

    level_data = blind_levels[next_level - 1]
    timer.current_level = next_level
    timer.small_blind = level_data["small"]
    timer.big_blind = level_data["big"]
    timer.ante = level_data.get("ante")
    timer.seconds_remaining = timer.level_duration_seconds

    db.commit()
    db.refresh(timer)
    return timer