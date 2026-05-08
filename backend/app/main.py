from fastapi import FastAPI

from app.api.users import router as users_router

from app.api.tournaments import router as tournaments_router

from app.api.registrations import router as registration_router

app = FastAPI(
    title="Poker Moskva API",
    version="1.0.0"
)

app.include_router(users_router)
app.include_router(tournaments_router)
app.include_router(registration_router)

@app.get("/")
async def root():
    return {
        "message": "Poker Moskva backend running"
    }