from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.tournament_result import TournamentResult


def create_result(
    db: Session,
    tournament_id: int,
    user_id: int,
    season_id: int,
    final_position: int,
    total_players: int,
    knockouts: int,
    points_earned: int
):
    result = TournamentResult(
        tournament_id=tournament_id,
        user_id=user_id,
        season_id=season_id,
        final_position=final_position,
        total_players=total_players,
        knockouts=knockouts,
        points_earned=points_earned
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


def get_results_by_tournament(db: Session, tournament_id: int):
    return db.query(TournamentResult).filter(
        TournamentResult.tournament_id == tournament_id
    ).order_by(TournamentResult.final_position).all()


def get_results_by_user(db: Session, user_id: int, limit: int = 20):
    return db.query(TournamentResult).filter(
        TournamentResult.user_id == user_id
    ).order_by(TournamentResult.recorded_at.desc()).limit(limit).all()


def get_result_by_user_and_tournament(
    db: Session,
    user_id: int,
    tournament_id: int
):
    return db.query(TournamentResult).filter(
        TournamentResult.user_id == user_id,
        TournamentResult.tournament_id == tournament_id
    ).first()


def get_leaderboard_by_season(db: Session, season_id: int, limit: int = 100):
    # sum all points per user for this season, sorted descending
    rows = (
        db.query(
            TournamentResult.user_id,
            func.sum(TournamentResult.points_earned).label("total_points"),
            func.sum(TournamentResult.knockouts).label("total_knockouts"),
            func.count(TournamentResult.id).label("tournaments_played"),
            func.min(TournamentResult.final_position).label("best_finish")
        )
        .filter(TournamentResult.season_id == season_id)
        .group_by(TournamentResult.user_id)
        .order_by(func.sum(TournamentResult.points_earned).desc())
        .limit(limit)
        .all()
    )
    return rows


def get_global_leaderboard(db: Session, limit: int = 100):
    # all time, across all seasons
    rows = (
        db.query(
            TournamentResult.user_id,
            func.sum(TournamentResult.points_earned).label("total_points"),
            func.sum(TournamentResult.knockouts).label("total_knockouts"),
            func.count(TournamentResult.id).label("tournaments_played"),
            func.min(TournamentResult.final_position).label("best_finish")
        )
        .group_by(TournamentResult.user_id)
        .order_by(func.sum(TournamentResult.points_earned).desc())
        .limit(limit)
        .all()
    )
    return rows


def get_user_season_stats(db: Session, user_id: int, season_id: int):
    return (
        db.query(
            func.sum(TournamentResult.points_earned).label("total_points"),
            func.sum(TournamentResult.knockouts).label("total_knockouts"),
            func.count(TournamentResult.id).label("tournaments_played"),
            func.min(TournamentResult.final_position).label("best_finish")
        )
        .filter(
            TournamentResult.user_id == user_id,
            TournamentResult.season_id == season_id
        )
        .first()
    )