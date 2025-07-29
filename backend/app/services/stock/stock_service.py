from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.stock.stock_schema import (
    ProductStockResponse,
    ProductStockHistoryResponse
)
from app.common.date_service import get_last_n_months
from app.common.payload_utils import is_payload_empty


async def get_stock_actuel(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductStockResponse:
    if is_payload_empty(payload):
        return ProductStockResponse(items=[])  # 🛑 early return

    # ✅ Résolution cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductStockResponse(items=[])

    placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
    params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

    query = f"""
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        SELECT cod_pro, depot, stock, pmp_eur
        FROM CBM_DATA.stock.Fact_Stock_Actuel WITH (NOLOCK)
        WHERE cod_pro IN ({placeholders})
    """
    result = await db.execute(text(query), params)
    rows = result.fetchall()

    items = [
        {
            "cod_pro": r[0],
            "depot": r[1],
            "stock": float(r[2]),
            "pmp": float(r[3]) if r[3] is not None else None,
        }
        for r in rows
    ]
    return ProductStockResponse(items=items)


async def get_stock_history(
    payload: ProductIdentifierRequest, db: AsyncSession, last_n_months: int = None
) -> ProductStockHistoryResponse:
    if is_payload_empty(payload):
        return ProductStockHistoryResponse(items=[])  # 🛑 early return

    # ✅ Résolution cod_pro_list
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductStockHistoryResponse(items=[])

    placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
    params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

    date_filter = ""
    if last_n_months is not None:
        months = get_last_n_months(last_n_months)
        first_month = months[0] + "-01"
        date_filter = "AND dat_deb >= :first_month"
        params["first_month"] = first_month

    query = f"""
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        SELECT depot, cod_pro, dat_deb, dat_fin, stock, pmp
        FROM CBM_DATA.stock.Historique WITH (NOLOCK)
        WHERE cod_pro IN ({placeholders}) {date_filter}
        ORDER BY cod_pro, depot, dat_deb
    """
    result = await db.execute(text(query), params)
    rows = result.fetchall()

    items = [
        {
            "depot": r[0],
            "cod_pro": r[1],
            "dat_deb": r[2].strftime("%Y-%m-%d") if r[2] else None,
            "dat_fin": r[3].strftime("%Y-%m-%d") if r[3] else None,
            "stock": float(r[4]),
            "pmp": float(r[5]) if r[5] is not None else None,
        }
        for r in rows
    ]
    return ProductStockHistoryResponse(items=items)
