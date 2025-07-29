from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.purchase.purchase_schema import ProductPurchasePriceResponse
from app.common.payload_utils import is_payload_empty


async def get_purchase_price(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductPurchasePriceResponse:
    if is_payload_empty(payload):
        return ProductPurchasePriceResponse(items=[])  # 🛑 early return

    """
    Récupère le prix d'achat net (px_achat_eur) pour une liste de cod_pro.
    Retourne toujours un ProductPurchasePriceResponse (Pydantic).
    """

    # ✅ 1. Résolution de la cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductPurchasePriceResponse(items=[])

    # ✅ 2. Placeholders dynamiques
    placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
    params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

    # ✅ 3. Requête SQL
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
            "cod_pro": r[0],
            "px_achat_eur": float(r[1]) if r[1] is not None else None
        }
        for r in rows
    ]
    return ProductPurchasePriceResponse(items=items)
