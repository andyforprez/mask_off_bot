from sqlalchemy import Column, Integer, String, Boolean, Date
from app.core.database import Base


class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    # e.g. "MAY POKER SEASON"

    is_active = Column(Boolean, default=True)
    # only one season should be active at a time

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    # null end_date means the season is still running