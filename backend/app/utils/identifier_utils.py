# app/utils/identifier_utils.py

from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from sqlalchemy.ext.asyncio import AsyncSession

async def resolve_codpro_list(payload: ProductIdentifierRequest, db: AsyncSession) -> list[int]:
    if payload.cod_pro_list:
        return payload.cod_pro_list

    payload_dict = payload.model_dump(exclude_none=False)
    full_payload = ProductIdentifierRequest(**payload_dict)
    response = await get_codpro_list_from_identifier(full_payload, db)
    return response.cod_pro_list
