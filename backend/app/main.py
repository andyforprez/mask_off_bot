from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.users import router as users_router
from app.api.tournaments import router as tournaments_router
from app.api.registrations import router as registration_router
from app.api.rating import router as rating_router
from app.api.admin import router as admin_router
from app.api.friends import router as friends_router
from app.api.ws import router as ws_router

app = FastAPI(
    title="MaskOff Poker API",
    version="2.0.0",
    description="Backend for the MaskOff Poker Telegram Mini App"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(tournaments_router)
app.include_router(registration_router)
app.include_router(rating_router)
app.include_router(admin_router)
app.include_router(friends_router)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {"message": "MaskOff Poker API running", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}