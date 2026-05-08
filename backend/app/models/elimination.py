from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime
)

from datetime import datetime

from app.core.database import Base

class Elimination(Base):
    __tablename__ = "eliminations"

    id = Column(Integer, primary_key=True, index=True)

    tournament_id = Column(
        Integer,
        ForeignKey("tournaments.id")
    )

    eliminated_user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    eliminated_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    place = Column(Integer)

    points_awarded = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )