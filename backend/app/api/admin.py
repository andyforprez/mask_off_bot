from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date

from app.core.dependencies import get_db
from app.services.result_service import record_tournament_result
from app.services.elimination_service import knock_out_player, get_live_feed
from app.services.blind_timer_service import (
    start_timer,
    admin_play,
    admin_pause,
    admin_next_level,
    admin_set_seconds,
    admin_update_players,
    get_timer_state
)
from app.services.maskcoin_service import grant_coins
from app.repositories.season_repository import (
    create_season,
    end_season,
    get_all_seasons
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# ── schemas ──────────────────────────────────────────────────────────────────

class RecordResultRequest(BaseModel):
    tournament_id: int
    user_id: int
    final_position: int
    total_players: int
    tournament_type: str
    # "standard" | "double" | "bounty" | "high_roller"
    knockouts: int = 0


class EliminationRequest(BaseModel):
    tournament_id: int
    eliminated_user_id: int
    finish_position: int
    eliminated_by_user_id: Optional[int] = None
    recorded_by: Optional[str] = None


class TimerStartRequest(BaseModel):
    tournament_id: int
    total_chips: int
    players_remaining: int
    level_duration_seconds: int = 1200
    tournament_date: date


class TimerSecondsRequest(BaseModel):
    seconds: int


class GrantCoinsRequest(BaseModel):
    user_id: int
    amount: int
    note: Optional[str] = None


class SeasonCreateRequest(BaseModel):
    name: str
    start_date: date


# ── results ──────────────────────────────────────────────────────────────────

@router.post("/results/record")
def record_result(
    data: RecordResultRequest,
    db: Session = Depends(get_db)
):
    """
    Admin records a player's final position in a tournament.
    Points are calculated automatically based on tournament_type.
    """
    result = record_tournament_result(
        db=db,
        tournament_id=data.tournament_id,
        user_id=data.user_id,
        final_position=data.final_position,
        total_players=data.total_players,
        tournament_type=data.tournament_type,
        knockouts=data.knockouts
    )
    return result


@router.get("/results/tournament/{tournament_id}")
def tournament_results(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    from app.services.result_service import get_tournament_results
    return get_tournament_results(db, tournament_id)


# ── eliminations ─────────────────────────────────────────────────────────────

@router.post("/eliminations/record")
def record_elimination(
    data: EliminationRequest,
    db: Session = Depends(get_db)
):
    """
    Admin marks a player as eliminated during a live tournament.
    This updates the live feed and the players_remaining count.
    """
    elimination = knock_out_player(
        db=db,
        tournament_id=data.tournament_id,
        eliminated_user_id=data.eliminated_user_id,
        finish_position=data.finish_position,
        eliminated_by_user_id=data.eliminated_by_user_id,
        recorded_by=data.recorded_by
    )
    return elimination


@router.get("/eliminations/feed/{tournament_id}")
def live_feed(
    tournament_id: int,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Live knockout feed for a tournament."""
    return get_live_feed(db, tournament_id, limit)


# ── blind timer ───────────────────────────────────────────────────────────────

@router.post("/timer/start")
def timer_start(
    data: TimerStartRequest,
    db: Session = Depends(get_db)
):
    """Creates and initialises the blind timer for a tournament."""
    return start_timer(
        db=db,
        tournament_id=data.tournament_id,
        total_chips=data.total_chips,
        players_remaining=data.players_remaining,
        level_duration_seconds=data.level_duration_seconds,
        tournament_date=data.tournament_date
    )


@router.get("/timer/{tournament_id}")
def timer_state(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    """Get current timer state (used by TV screen and admin panel)."""
    state = get_timer_state(db, tournament_id)
    if not state:
        raise HTTPException(status_code=404, detail="Timer not found")
    return state


@router.post("/timer/{tournament_id}/play")
def timer_play(tournament_id: int, db: Session = Depends(get_db)):
    admin_play(db, tournament_id)
    return {"status": "running"}


@router.post("/timer/{tournament_id}/pause")
def timer_pause(tournament_id: int, db: Session = Depends(get_db)):
    admin_pause(db, tournament_id)
    return {"status": "paused"}


@router.post("/timer/{tournament_id}/next-level")
def timer_next_level(tournament_id: int, db: Session = Depends(get_db)):
    return admin_next_level(db, tournament_id)


@router.post("/timer/{tournament_id}/set-seconds")
def timer_set_seconds(
    tournament_id: int,
    data: TimerSecondsRequest,
    db: Session = Depends(get_db)
):
    admin_set_seconds(db, tournament_id, data.seconds)
    return {"status": "updated", "seconds_remaining": data.seconds}


# ── maskcoins ────────────────────────────────────────────────────────────────

@router.post("/maskcoins/grant")
def grant_maskcoins(
    data: GrantCoinsRequest,
    db: Session = Depends(get_db)
):
    """Admin manually grants maskcoins to a player (free entry, prize, etc)."""
    return grant_coins(db, data.user_id, data.amount, data.note)


# ── seasons ───────────────────────────────────────────────────────────────────

@router.get("/seasons")
def list_seasons(db: Session = Depends(get_db)):
    return get_all_seasons(db)


@router.post("/seasons/create")
def create_new_season(
    data: SeasonCreateRequest,
    db: Session = Depends(get_db)
):
    return create_season(db, data.name, data.start_date)


@router.post("/seasons/{season_id}/end")
def end_current_season(
    season_id: int,
    db: Session = Depends(get_db)
):
    season = end_season(db, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    return season