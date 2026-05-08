from pydantic import BaseModel

class RegisterRequest(BaseModel):
    user_id: int

class RegistrationResponse(BaseModel):
    id: int
    tournament_id: int
    user_id: int
    status: str
    seat_number: int | None

    class Config:
        from_attributes = True