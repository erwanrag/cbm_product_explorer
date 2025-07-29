from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.schemas.groups.groups_schema import (
    GroupsFilterRequest,
    GroupsResponse,
)
from app.services.groups.groups_service import (
    get_groups,
)

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("/list", response_model=GroupsResponse)
async def groups_list(
    payload: GroupsFilterRequest = Body(...),
    page: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=400),
    db: AsyncSession = Depends(get_db),
):
    return await get_groups(payload, db, page, limit)
