from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
)
from datetime import datetime
from app.core.database import Base


class TournamentResult(Base):
    __tablename__ = "tournament_results"

    id = Column(Integer, primary_key=True, index=True)

    tournament_id = Column(
        Integer,
        ForeignKey("tournaments.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    season_id = Column(
        Integer,
        ForeignKey("seasons.id"),
        nullable=True
    )
    # null if no active season at time of tournament

    final_position = Column(Integer, nullable=False)
    # e.g. 1 = winner, 50 = 50th place

    total_players = Column(Integer, nullable=False)
    # total field size — needed to calculate base points
    # formula: (total_players - final_position + 1) * base_multiplier

    knockouts = Column(Integer, default=0)
    # number of players this player eliminated
    # only relevant on bounty days (Saturday), worth 20pts each

    points_earned = Column(Integer, nullable=False)
    # final calculated points for this result
    # stored so we never need to recalculate it

    recorded_at = Column(
        DateTime,
        default=datetime.utcnow
    )