from datetime import datetime
from pydantic import BaseModel

class TournamentCreate(BaseModel):
    name: str
    tournament_type: str
    buy_in: int
    max_players: int

    is_bounty: bool = False
    is_highroller: bool = False
    double_points: bool = False

    start_time: datetime

class TournamentResponse(BaseModel):
    id: int
    name: str
    tournament_type: str
    status: str

    buy_in: int
    max_players: int
    current_players: int

    is_bounty: bool
    is_highroller: bool
    double_points: bool

    start_time: datetime

    class Config:
        from_attributes = True