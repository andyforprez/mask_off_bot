from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.repositories.season_repository import get_active_season, get_season_by_id
from app.services.result_service import (
    get_season_leaderboard,
    get_global_leaderboard_with_users,
    get_friends_leaderboard,
    get_player_profile_stats,
    get_tournament_results,
    record_tournament_result
)

router = APIRouter(
    prefix="/rating",
    tags=["Rating"]
)


@router.get("/season")
def season_leaderboard(
    season_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Returns the leaderboard for a season.
    If season_id is not provided, uses the currently active season.
    """
    if season_id:
        season = get_season_by_id(db, season_id)
    else:
        season = get_active_season(db)

    if not season:
        raise HTTPException(status_code=404, detail="No active season found")

    return {
        "season_id": season.id,
        "season_name": season.name,
        "leaderboard": get_season_leaderboard(db, season.id)
    }


@router.get("/global")
def global_leaderboard(db: Session = Depends(get_db)):
    """All-time leaderboard across all seasons."""
    return get_global_leaderboard_with_users(db)


@router.get("/friends/{user_id}")
def friends_leaderboard(
    user_id: int,
    season_id: int = None,
    db: Session = Depends(get_db)
):
    """Leaderboard filtered to a player's friends list."""
    if not season_id:
        season = get_active_season(db)
        if not season:
            raise HTTPException(status_code=404, detail="No active season found")
        season_id = season.id

    return get_friends_leaderboard(db, user_id, season_id)


@router.get("/profile/{user_id}")
def player_profile(
    user_id: int,
    season_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Full profile stats for a player:
    season points, knockouts, tournaments played, best finish, game history.
    """
    if not season_id:
        season = get_active_season(db)
        if not season:
            raise HTTPException(status_code=404, detail="No active season found")
        season_id = season.id

    return get_player_profile_stats(db, user_id, season_id)