from sqlalchemy.orm import Session
from app.repositories.blind_timer_repository import (
    get_timer_by_tournament,
    create_timer,
    update_timer,
    advance_level
)
from app.services.points_service import has_ante_for_date

# full blind structure for all tournaments
# Sunday = no ante (has_ante=False removes the ante column)
BLIND_LEVELS = [
    {"small": 100,    "big": 200,    "ante": 200},
    {"small": 200,    "big": 400,    "ante": 400},
    {"small": 300,    "big": 600,    "ante": 600},
    {"small": 400,    "big": 800,    "ante": 800},
    {"small": 500,    "big": 1000,   "ante": 1000},
    {"small": 600,    "big": 1200,   "ante": 1200},
    {"small": 800,    "big": 1600,   "ante": 1600},
    {"small": 1000,   "big": 2000,   "ante": 2000},
    {"small": 1500,   "big": 3000,   "ante": 3000},
    {"small": 2000,   "big": 4000,   "ante": 4000},
    {"small": 3000,   "big": 6000,   "ante": 6000},
    {"small": 5000,   "big": 10000,  "ante": 10000},
    {"small": 7000,   "big": 14000,  "ante": 14000},
    {"small": 10000,  "big": 20000,  "ante": 20000},
    {"small": 15000,  "big": 30000,  "ante": 30000},
    {"small": 20000,  "big": 40000,  "ante": 40000},
    {"small": 30000,  "big": 60000,  "ante": 60000},
    {"small": 40000,  "big": 80000,  "ante": 80000},
    {"small": 50000,  "big": 100000, "ante": 100000},
    {"small": 70000,  "big": 140000, "ante": 140000},
    {"small": 100000, "big": 200000, "ante": 200000},
    {"small": 150000, "big": 300000, "ante": 300000},
    {"small": 200000, "big": 400000, "ante": 400000},
    {"small": 300000, "big": 600000, "ante": 600000},
]


def start_timer(
    db: Session,
    tournament_id: int,
    total_chips: int,
    players_remaining: int,
    level_duration_seconds: int,
    tournament_date
):
    has_ante = has_ante_for_date(tournament_date)

    existing = get_timer_by_tournament(db, tournament_id)
    if existing:
        return existing

    return create_timer(
        db=db,
        tournament_id=tournament_id,
        total_chips=total_chips,
        players_remaining=players_remaining,
        level_duration_seconds=level_duration_seconds,
        has_ante=has_ante
    )


def get_timer_state(db: Session, tournament_id: int):
    timer = get_timer_by_tournament(db, tournament_id)
    if not timer:
        return None

    avg_stack = None
    if timer.total_chips and timer.players_remaining and timer.players_remaining > 0:
        avg_stack = timer.total_chips // timer.players_remaining

    # peek at next level
    next_level_data = None
    if timer.current_level < len(BLIND_LEVELS):
        next_level_data = BLIND_LEVELS[timer.current_level]
        # current_level is 1-indexed, so index = current_level

    return {
        "tournament_id": tournament_id,
        "current_level": timer.current_level,
        "small_blind": timer.small_blind,
        "big_blind": timer.big_blind,
        "ante": timer.ante,
        "seconds_remaining": timer.seconds_remaining,
        "level_duration_seconds": timer.level_duration_seconds,
        "is_running": timer.is_running,
        "total_chips": timer.total_chips,
        "players_remaining": timer.players_remaining,
        "average_stack": avg_stack,
        "next_level": next_level_data,
    }


def admin_play(db: Session, tournament_id: int):
    return update_timer(db, tournament_id, is_running=True)


def admin_pause(db: Session, tournament_id: int):
    return update_timer(db, tournament_id, is_running=False)


def admin_next_level(db: Session, tournament_id: int):
    return advance_level(db, tournament_id, BLIND_LEVELS)


def admin_set_seconds(db: Session, tournament_id: int, seconds: int):
    return update_timer(db, tournament_id, seconds_remaining=seconds)


def admin_update_players(db: Session, tournament_id: int, players_remaining: int):
    return update_timer(db, tournament_id, players_remaining=players_remaining)