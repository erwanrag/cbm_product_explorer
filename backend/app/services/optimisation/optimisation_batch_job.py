# ============================================
# 📁 backend/app/services/optimisation/optimisation_batch_job.py
# ============================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime
from app.common.logger import logger

# ✅ Services internes
from app.services.optimisation.optimisation_service import evaluate_group_optimization
from app.services.identifiers.identifier_service import get_codpro_list_from_identifier
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest


async def run_full_optimisation_batch(db: AsyncSession):
    """
    ⚙️ Lance le calcul d'optimisation sur tous les groupes
    et sauvegarde les résultats consolidés dans la table dédiée.
    """

    logger.info("🚀 Démarrage du batch global d’optimisation (avec routing identifier_service)")

    # 1️⃣ Récupération des grouping_crn / qualité
    try:
        query = """
            SELECT DISTINCT grouping_crn, qualite
            FROM CBM_DATA.Pricing.Grouping_crn_table
            WHERE qualite IN ('OEM', 'PMQ', 'PMV')
              AND grouping_crn IS NOT NULL
        """
        result = await db.execute(text(query))
        groups = result.fetchall()
    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des groupes: {e}")
        return

    logger.info(f"📊 {len(groups)} groupes trouvés pour analyse")

    inserted_count = 0
    skipped = 0

    # 2️⃣ Boucle principale
    for grouping_crn, qualite in groups:
        try:
            # ✅ On construit un vrai payload pour la fonction d'identification
            payload = ProductIdentifierRequest(
                grouping_crn=grouping_crn,
                qualite=qualite,
                cod_pro=None,
                ref_crn=None,
                refint=None,
                ref_ext=None
            )

            # ✅ On récupère la liste complète des cod_pro avec la logique de ton service
            codpro_response = await get_codpro_list_from_identifier(payload, db)
            if not codpro_response.cod_pro_list:
                skipped += 1
                continue

            # ✅ Appel du moteur d'optimisation complet
            response = await evaluate_group_optimization(payload, db)
            if not response.items:
                skipped += 1
                continue

            # ✅ Insertion dans la table analytique
            for item in response.items:
                cod_pro_principal = (
                    item["refs_to_keep"][0]["cod_pro"]
                    if item.get("refs_to_keep")
                    else None
                )

                historique = item.get("historique_6m", [])
                projection = item.get("projection_6m", {})

                ca_12m = sum(m["ca"] for m in historique)
                marge_12m = sum(m["marge"] for m in historique)
                saving_12m = item.get("gain_potentiel", 0.0)

                ca_proj_6m = projection.get("totaux", {}).get("ca", 0.0)
                marge_proj_6m = projection.get("totaux", {}).get("marge_optimisee", 0.0)

                values = {
                    "grouping_crn": int(grouping_crn),
                    "cod_pro": cod_pro_principal,
                    "nb_refs": item.get("refs_total", 0),
                    "qualite": qualite,
                    "ca_12m": float(ca_12m),
                    "marge_12m": float(marge_12m),
                    "saving_12m": float(saving_12m),
                    "ca_proj_6m": float(ca_proj_6m),
                    "marge_proj_6m": float(marge_proj_6m),
                    "generated_at": datetime.now(),
                }

                insert_query = text("""
                    INSERT INTO CBM_DATA.Analytics.Optimisation_Monitoring (
                        grouping_crn, cod_pro, nb_refs, qualite,
                        ca_12m, marge_12m, saving_12m,
                        ca_proj_6m, marge_proj_6m, generated_at
                    )
                    VALUES (
                        :grouping_crn, :cod_pro, :nb_refs, :qualite,
                        :ca_12m, :marge_12m, :saving_12m,
                        :ca_proj_6m, :marge_proj_6m, :generated_at
                    )
                """)
                await db.execute(insert_query, values)
                inserted_count += 1

            await db.commit()

        except Exception as e:
            logger.error(f"⚠️ Erreur sur le groupe {grouping_crn}-{qualite}: {e}")
            await db.rollback()

    logger.info(f"✅ Batch terminé: {inserted_count} lignes insérées, {skipped} groupes ignorés.")
