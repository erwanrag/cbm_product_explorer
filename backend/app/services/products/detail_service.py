from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest
from app.schemas.products.detail_schema import ProductDetailResponse
from app.common.payload_utils import is_payload_empty
from app.common.logger import logger


async def get_product_details(payload: ProductIdentifierRequest, db: AsyncSession) -> ProductDetailResponse:
    """
    Retourne un ProductDetailResponse (Pydantic) contenant la liste des détails produits.
    Version sécurisée avec support du grouping_crn.
    """
    if is_payload_empty(payload):
        return ProductDetailResponse(products=[])  # 🛑 early return

    # ✅ Résolution via identifier_service (supporte grouping_crn)
    cod_pro_response = await get_codpro_list_from_identifier(payload, db)
    cod_pro_list = cod_pro_response.cod_pro_list if hasattr(cod_pro_response, "cod_pro_list") else cod_pro_response

    if not cod_pro_list:
        logger.warning("⚠️ Aucun cod_pro résolu pour le payload")
        return ProductDetailResponse(products=[])

    # ✅ Requête sécurisée avec paramètres liés
    try:
        # Création des paramètres dynamiques sécurisés
        placeholders = ", ".join([f":p{i}" for i in range(len(cod_pro_list))])
        params = {f"p{i}": int(cod) for i, cod in enumerate(cod_pro_list)}

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
                fou.nom_fou, 
                p.nom_pro
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
            ORDER BY p.cod_pro
        """

        result = await db.execute(text(query), params)
        rows = result.fetchall()
        columns = result.keys()

        products = [dict(zip(columns, row)) for row in rows]
        
        logger.debug(f"✅ Détails produits récupérés: {len(products)} éléments")
        return ProductDetailResponse(products=products)

    except SQLAlchemyError as e:
        logger.error(f"❌ Erreur SQL get_product_details pour cod_pro_list={cod_pro_list}: {e}")
        return ProductDetailResponse(products=[])
    except Exception as e:
        logger.error(f"❌ Erreur inattendue get_product_details pour cod_pro_list={cod_pro_list}: {e}")
        return ProductDetailResponse(products=[])