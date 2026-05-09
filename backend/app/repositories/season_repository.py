from sqlalchemy.orm import Session
from app.models.season import Season


def get_active_season(db: Session):
    return db.query(Season).filter(
        Season.is_active == True
    ).first()


def get_season_by_id(db: Session, season_id: int):
    return db.query(Season).filter(
        Season.id == season_id
    ).first()


def get_all_seasons(db: Session):
    return db.query(Season).order_by(
        Season.start_date.desc()
    ).all()


def create_season(db: Session, name: str, start_date):
    # deactivate all other seasons first
    db.query(Season).update({"is_active": False})

    season = Season(
        name=name,
        start_date=start_date,
        is_active=True
    )
    db.add(season)
    db.commit()
    db.refresh(season)
    return season


def end_season(db: Session, season_id: int):
    from datetime import date
    season = get_season_by_id(db, season_id)
    if season:
        season.is_active = False
        season.end_date = date.today()
        db.commit()
        db.refresh(season)
    return season