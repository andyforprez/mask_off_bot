from sqlalchemy.orm import Session

from app.models.tournament import Tournament

def create_tournament(
    db: Session,
    tournament_data
):
    tournament = Tournament(**tournament_data)

    db.add(tournament)

    db.commit()

    db.refresh(tournament)

    return tournament

def get_all_tournaments(
    db: Session
):
    return db.query(Tournament).all()

def get_tournament_by_id(
    db: Session,
    tournament_id: int
):
    return db.query(Tournament).filter(
        Tournament.id == tournament_id
    ).first()