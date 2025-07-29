from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.detail_schema import ProductDetailResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.detail_schema import ProductDetailResponse
from app.common.payload_utils import is_payload_empty

async def get_product_details(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductDetailResponse:
    if is_payload_empty(payload):
        return ProductDetailResponse(products=[])  # 🛑 early return
    """
    Retourne un ProductDetailResponse (Pydantic) contenant la liste des détails produits.
    """
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    # Si get_codpro_list_from_identifier renvoie un CodProListResponse, on prend .cod_pro_list
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductDetailResponse(products=[])

    placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
    params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

    query = f"""
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        SELECT 
            p.cod_pro,
            p.refint,
            p.refext AS ref_ext,
            p.famille,
            p.s_famille,
            p.qualite,
            p.statut,
            f.cod_fou_principal,
            fou.nom_fou
        FROM CBM_DATA.dm.Dim_Produit p WITH (NOLOCK)
        LEFT JOIN (
            SELECT DISTINCT cod_pro, cod_fou_principal
            FROM CBM_DATA.dm.Fact_Produit_Depot_Fournisseur WITH (NOLOCK)
        ) f ON p.cod_pro = f.cod_pro
        LEFT JOIN (
            SELECT cod_fou, nom_fou
            FROM CBM_DATA.dm.Dim_Fournisseur WITH (NOLOCK)
        ) fou ON f.cod_fou_principal = fou.cod_fou
        WHERE p.cod_pro IN ({placeholders})
    """

    result = await db.execute(text(query), params)
    rows = result.fetchall()
    columns = result.keys()

    products = [dict(zip(columns, row)) for row in rows]
    return ProductDetailResponse(products=products)


async def get_product_details(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductDetailResponse:
    if is_payload_empty(payload):
        return ProductDetailResponse(products=[])  # 🛑 early return
    """
    Retourne un ProductDetailResponse (Pydantic) contenant la liste des détails produits.
    """
    cod_pro_list = payload.cod_pro_list or await get_codpro_list_from_identifier(payload, db)
    # Si get_codpro_list_from_identifier renvoie un CodProListResponse, on prend .cod_pro_list
    if hasattr(cod_pro_list, "cod_pro_list"):
        cod_pro_list = cod_pro_list.cod_pro_list

    if not cod_pro_list:
        return ProductDetailResponse(products=[])

    placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
    params = {f"p{i}": cod for i, cod in enumerate(cod_pro_list)}

    query = f"""
        SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        SELECT 
            p.cod_pro,
            p.refint,
            p.refext AS ref_ext,
            p.famille,
            p.s_famille,
            p.qualite,
            p.statut,
            f.cod_fou_principal,
            fou.nom_fou
        FROM CBM_DATA.dm.Dim_Produit p WITH (NOLOCK)
        LEFT JOIN (
            SELECT DISTINCT cod_pro, cod_fou_principal
            FROM CBM_DATA.dm.Fact_Produit_Depot_Fournisseur WITH (NOLOCK)
        ) f ON p.cod_pro = f.cod_pro
        LEFT JOIN (
            SELECT cod_fou, nom_fou
            FROM CBM_DATA.dm.Dim_Fournisseur WITH (NOLOCK)
        ) fou ON f.cod_fou_principal = fou.cod_fou
        WHERE p.cod_pro IN ({placeholders})
    """

    result = await db.execute(text(query), params)
    rows = result.fetchall()
    columns = result.keys()

    products = [dict(zip(columns, row)) for row in rows]
    return ProductDetailResponse(products=products)
