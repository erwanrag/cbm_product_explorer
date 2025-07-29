from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.common.logger import logger
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.match_schema import ProductMatchListResponse
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.common.payload_utils import is_payload_empty


async def get_codpro_match_list(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductMatchListResponse:
    """
    Retourne le matching cod_pro <-> ref_crn <-> ref_ext pour toute une liste de cod_pro.
    Version sécurisée sans injection SQL.
    """
    if is_payload_empty(payload):
        return ProductMatchListResponse(matches=[])

    # ✅ 1. Résolution de la cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductMatchListResponse(matches=[])

    try:
        # ✅ 2. Paramètres sécurisés
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        # ✅ 3. Requête SQL sécurisée
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

        # ✅ 4. Dédoublonnage et construction du résultat
        for row in rows:
            key = (int(row[0]), row[1], row[2])
            if key not in seen:
                matches.append({
                    "cod_pro": int(row[0]),
                    "ref_crn": row[1],
                    "ref_ext": row[2]
                })
                seen.add(key)

        logger.debug(f"✅ Matches récupérés: {len(matches)} éléments uniques")
        return ProductMatchListResponse(matches=matches)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_codpro_match_list pour cod_pro_list={cod_pro_list}: {e}")
        return ProductMatchListResponse(matches=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_codpro_match_list pour cod_pro_list={cod_pro_list}: {e}")
        return ProductMatchListResponse(matches=[])