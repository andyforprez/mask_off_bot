from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime
)

from app.core.database import Base

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    tournament_type = Column(String)

    status = Column(
        String,
        default="registration_open"
    )

    buy_in = Column(Integer)

    max_players = Column(Integer)

    current_players = Column(
        Integer,
        default=0
    )

    is_bounty = Column(
        Boolean,
        default=False
    )

    is_highroller = Column(
        Boolean,
        default=False
    )

    double_points = Column(
        Boolean,
        default=False
    )

    start_time = Column(DateTime)