from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)

from datetime import datetime

from app.core.database import Base

class TournamentRegistration(Base):
    __tablename__ = "tournament_registrations"

    id = Column(Integer, primary_key=True, index=True)

    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    status = Column(
        String,
        default="waitlist"
    )
    # waitlist | confirmed | seated | eliminated

    seat_number = Column(Integer, nullable=True)

    registered_at = Column(
        DateTime,
        default=datetime.utcnow
    )