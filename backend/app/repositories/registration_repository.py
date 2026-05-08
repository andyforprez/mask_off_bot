from sqlalchemy.orm import Session

from app.models.registration import TournamentRegistration

def get_registration_count(db: Session, tournament_id: int):
    return db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.status.in_(["confirmed", "seated"])
    ).count()


def create_registration(db: Session, tournament_id: int, user_id: int, status: str):

    registration = TournamentRegistration(
        tournament_id=tournament_id,
        user_id=user_id,
        status=status
    )

    db.add(registration)
    db.commit()
    db.refresh(registration)

    return registration


def get_user_registration(db: Session, tournament_id: int, user_id: int):
    return db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.user_id == user_id
    ).first()