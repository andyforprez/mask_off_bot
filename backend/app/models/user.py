from sqlalchemy import Column, Integer, String
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    telegram_id = Column(String, unique=True, nullable=False)
    username = Column(String, nullable=True)
    # their @username on Telegram, may be null if they have none set

    display_name = Column(String, nullable=False)
    # their real Telegram display name

    poker_nickname = Column(String, nullable=True)
    # their nickname in the club, e.g. "Антуан Гризманн"
    # this is what shows on the leaderboard and in tournament player lists

    role = Column(String, default="player")
    # "player" or "admin"

    maskcoin_balance = Column(Integer, default=0)
    # current balance — updated on every MaskcoinTransaction
    # 1 maskcoin = 1 ruble for tournament entry
    # 1 maskcoin = 0.5 rubles at the bar

    referral_code = Column(String, unique=True, nullable=True)
    # auto-generated unique code, used in t.me/mask_msk_bot?start=ref_XXXX
    # when a new user registers with this code, referrer gets +500 maskcoins

    referred_by_id = Column(Integer, nullable=True)
    # user.id of whoever referred this player, null if no referral