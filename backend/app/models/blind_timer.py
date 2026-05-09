from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
)
from datetime import datetime
from app.core.database import Base


class BlindTimer(Base):
    __tablename__ = "blind_timers"

    id = Column(Integer, primary_key=True, index=True)

    tournament_id = Column(
        Integer,
        ForeignKey("tournaments.id"),
        nullable=False,
        unique=True
    )
    # one timer per tournament

    current_level = Column(Integer, default=1)
    # index into the blind structure, e.g. level 1 = 100/200

    small_blind = Column(Integer, nullable=False, default=100)
    big_blind = Column(Integer, nullable=False, default=200)
    ante = Column(Integer, nullable=True)
    # null on Sundays (no ante day)

    level_duration_seconds = Column(Integer, default=1200)
    # default 20 minutes = 1200 seconds

    seconds_remaining = Column(Integer, nullable=False, default=1200)
    # updated by the server every tick via WebSocket broadcast

    is_running = Column(Boolean, default=False)
    # false = paused, true = counting down

    total_chips = Column(Integer, nullable=True)
    # total chips in play — admin sets this at start of tournament
    # displayed on TV screen

    players_remaining = Column(Integer, nullable=True)
    # synced from eliminations table
    # displayed on TV screen alongside average stack

    started_at = Column(DateTime, nullable=True)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )