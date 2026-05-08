from pydantic import BaseModel

class UserCreate(BaseModel):
    telegram_id: str
    username: str
    display_name: str

class UserResponse(BaseModel):
    id: int
    telegram_id: str
    username: str
    display_name: str
    role: str

    class Config:
        from_attributes = True