from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    String,
)
from datetime import datetime
from app.core.database import Base


class Elimination(Base):
    __tablename__ = "eliminations"

    id = Column(Integer, primary_key=True, index=True)

    tournament_id = Column(
        Integer,
        ForeignKey("tournaments.id"),
        nullable=False
    )

    eliminated_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    # the player who got knocked out

    eliminated_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )
    # the player who made the knockout
    # null if nobody specific is credited (e.g. admin manually marks out)

    finish_position = Column(Integer, nullable=False)
    # what place they finished (e.g. 45th out of 90)

    players_remaining = Column(Integer, nullable=False)
    # how many players were left at the moment of elimination
    # used for the TV screen: "34 players remaining"

    eliminated_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    recorded_by = Column(String, nullable=True)
    # telegram_id of the admin who recorded this elimination