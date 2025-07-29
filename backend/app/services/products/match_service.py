from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.common.logger import logger
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.match_schema import ProductMatchListResponse
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.common.payload_utils import is_payload_empty

async def get_codpro_match_list(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductMatchListResponse:
    if is_payload_empty(payload):
        return ProductMatchListResponse(matches=[])
    """
    Retourne le matching cod_pro <-> ref_crn <-> ref_ext pour toute une liste de cod_pro.
    Retourne toujours un objet Pydantic ProductMatchListResponse.
    """
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductMatchListResponse(matches=[])

    placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
    params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

    result = await db.execute(
        text(f"""
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
            SELECT DISTINCT 
                pdp.cod_pro, 
                pdp.ref_crn, 
                Dim_Produit.refext AS ref_ext
            FROM CBM_DATA.Pricing.Dimensions_Produit pdp WITH (NOLOCK)
            LEFT JOIN CBM_DATA.dm.Dim_Produit WITH (NOLOCK)
                ON pdp.cod_pro = Dim_Produit.cod_pro
            WHERE pdp.cod_pro IN ({placeholders})
        """),
        params
    )

    rows = result.fetchall()
    seen = set()
    matches = []

    for row in rows:
        key = (row[0], row[1], row[2])
        if key not in seen:
            matches.append({
                "cod_pro": row[0],
                "ref_crn": row[1],
                "ref_ext": row[2]
            })
            seen.add(key)

    return ProductMatchListResponse(matches=matches)
