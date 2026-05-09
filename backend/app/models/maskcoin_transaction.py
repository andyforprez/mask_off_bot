from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
)
from datetime import datetime
from app.core.database import Base


class MaskcoinTransaction(Base):
    __tablename__ = "maskcoin_transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(Integer, nullable=False)
    # positive = coins added, negative = coins spent
    # e.g. +500 for referral, -1000 for tournament entry

    transaction_type = Column(String, nullable=False)
    # "referral"       — earned by referring a friend
    # "admin_grant"    — manually given by admin (free entry etc.)
    # "tournament_buy" — spent on tournament entry (1:1 with rubles)
    # "bar_spend"      — spent at the bar (1:0.5 conversion)
    # "refund"         — coins returned after cancellation

    reference_id = Column(Integer, nullable=True)
    # optional: ID of the related tournament or registration

    note = Column(String, nullable=True)
    # optional admin note, e.g. "free entry for winning last season"

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )