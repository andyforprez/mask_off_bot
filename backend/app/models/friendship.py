from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
)
from datetime import datetime
from app.core.database import Base


class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    # the user who added the friend

    friend_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    # the user who was added

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # note: friendship is one-directional here
    # if player A adds player B, only A sees B in their friends list
    # this matches how the current app works (you add, you see)
    # the "Friends" rating tab filters leaderboard to your friend_ids