from sqlalchemy.orm import Session
from app.repositories.result_repository import (
    create_result,
    get_results_by_tournament,
    get_results_by_user,
    get_leaderboard_by_season,
    get_global_leaderboard,
    get_user_season_stats,
    get_result_by_user_and_tournament
)
from app.repositories.season_repository import get_active_season
from app.repositories.user_repository import get_user_by_telegram_id
from app.models.user import User
from app.services.points_service import calculate_points


def record_tournament_result(
    db: Session,
    tournament_id: int,
    user_id: int,
    final_position: int,
    total_players: int,
    tournament_type: str,
    knockouts: int = 0
):
    # prevent duplicate results
    existing = get_result_by_user_and_tournament(db, user_id, tournament_id)
    if existing:
        return existing

    points = calculate_points(
        position=final_position,
        total_players=total_players,
        tournament_type=tournament_type,
        knockouts=knockouts
    )

    season = get_active_season(db)
    season_id = season.id if season else None

    return create_result(
        db=db,
        tournament_id=tournament_id,
        user_id=user_id,
        season_id=season_id,
        final_position=final_position,
        total_players=total_players,
        knockouts=knockouts,
        points_earned=points
    )


def get_user_history(db: Session, user_id: int, limit: int = 20):
    return get_results_by_user(db, user_id, limit)


def get_tournament_results(db: Session, tournament_id: int):
    return get_results_by_tournament(db, tournament_id)


def get_season_leaderboard(db: Session, season_id: int):
    rows = get_leaderboard_by_season(db, season_id)
    return _attach_user_info(db, rows)


def get_global_leaderboard_with_users(db: Session):
    rows = get_global_leaderboard(db)
    return _attach_user_info(db, rows)


def get_friends_leaderboard(db: Session, user_id: int, season_id: int):
    from app.repositories.friendship_repository import get_friends
    friend_ids = get_friends(db, user_id)
    friend_ids.append(user_id)  # include self

    from app.repositories.result_repository import get_leaderboard_by_season
    from sqlalchemy import func
    from app.models.tournament_result import TournamentResult

    rows = (
        db.query(
            TournamentResult.user_id,
            func.sum(TournamentResult.points_earned).label("total_points"),
            func.sum(TournamentResult.knockouts).label("total_knockouts"),
            func.count(TournamentResult.id).label("tournaments_played"),
            func.min(TournamentResult.final_position).label("best_finish")
        )
        .filter(
            TournamentResult.season_id == season_id,
            TournamentResult.user_id.in_(friend_ids)
        )
        .group_by(TournamentResult.user_id)
        .order_by(func.sum(TournamentResult.points_earned).desc())
        .all()
    )
    return _attach_user_info(db, rows)


def _attach_user_info(db: Session, rows):
    result = []
    for i, row in enumerate(rows):
        user = db.query(User).filter(User.id == row.user_id).first()
        result.append({
            "rank": i + 1,
            "user_id": row.user_id,
            "poker_nickname": user.poker_nickname if user else "—",
            "display_name": user.display_name if user else "—",
            "username": user.username if user else None,
            "total_points": row.total_points or 0,
            "total_knockouts": row.total_knockouts or 0,
            "tournaments_played": row.tournaments_played or 0,
            "best_finish": row.best_finish,
        })
    return result


def get_player_profile_stats(db: Session, user_id: int, season_id: int):
    stats = get_user_season_stats(db, user_id, season_id)
    history = get_results_by_user(db, user_id, limit=20)
    return {
        "season_points": stats.total_points or 0 if stats else 0,
        "total_knockouts": stats.total_knockouts or 0 if stats else 0,
        "tournaments_played": stats.tournaments_played or 0 if stats else 0,
        "best_finish": stats.best_finish if stats else None,
        "history": [
            {
                "tournament_id": r.tournament_id,
                "final_position": r.final_position,
                "points_earned": r.points_earned,
                "knockouts": r.knockouts,
                "recorded_at": r.recorded_at.isoformat()
            }
            for r in history
        ]
    }