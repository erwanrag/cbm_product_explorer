from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.purchase.purchase_schema import ProductPurchasePriceResponse
from app.common.payload_utils import is_payload_empty
from app.common.logger import logger


async def get_purchase_price(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductPurchasePriceResponse:
    """
    Récupère le prix d'achat net (px_achat_eur) pour une liste de cod_pro.
    Version sécurisée sans injection SQL.
    """
    if is_payload_empty(payload):
        return ProductPurchasePriceResponse(items=[])  # 🛑 early return

    # ✅ 1. Résolution de la cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductPurchasePriceResponse(items=[])

    try:
        # ✅ 2. Paramètres sécurisés
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

        # ✅ 3. Requête SQL sécurisée
        query = f"""
            SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
            SELECT cod_pro, px_net_eur as px_achat_eur
            FROM CBM_DATA.Pricing.Px_achat_net WITH (NOLOCK)
            WHERE cod_pro IN ({placeholders})
        """
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        # ✅ 4. Construction du résultat Pydantic
        items = [
            {
                "cod_pro": int(r[0]),
                "px_achat_eur": float(r[1]) if r[1] is not None else None
            }
            for r in rows
        ]
        logger.debug(f"✅ Prix d'achat récupérés: {len(items)} éléments")
        return ProductPurchasePriceResponse(items=items)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_purchase_price pour cod_pro_list={cod_pro_list}: {e}")
        return ProductPurchasePriceResponse(items=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_purchase_price pour cod_pro_list={cod_pro_list}: {e}")
        return ProductPurchasePriceResponse(items=[])