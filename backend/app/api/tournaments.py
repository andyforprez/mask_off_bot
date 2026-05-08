from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.dependencies import get_db

from app.schemas.tournament import (
    TournamentCreate,
    TournamentResponse
)

from app.services.tournament_service import (
    create_new_tournament,
    list_tournaments,
    get_tournament
)

router = APIRouter(
    prefix="/tournaments",
    tags=["Tournaments"]
)

@router.post(
    "/",
    response_model=TournamentResponse
)
def create_tournament(
    tournament: TournamentCreate,
    db: Session = Depends(get_db)
):
    return create_new_tournament(
        db,
        tournament.dict()
    )

@router.get(
    "/",
    response_model=list[TournamentResponse]
)
def get_tournaments(
    db: Session = Depends(get_db)
):
    return list_tournaments(db)

@router.get(
    "/{tournament_id}",
    response_model=TournamentResponse
)
def get_single_tournament(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    tournament = get_tournament(
        db,
        tournament_id
    )

    if not tournament:
        raise HTTPException(
            status_code=404,
            detail="Tournament not found"
        )

    return tournament