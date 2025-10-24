# ============================================
# 📁 backend/app/services/optimisation/optimisation_batch_job.py - VERSION ADAPTÉE
# ============================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime
from app.common.logger import logger
from app.services.optimisation.optimisation_service import evaluate_group_optimization
from app.schemas.identifiers.identifier_schema import ProductIdentifierRequest


async def run_full_optimisation_batch(db: AsyncSession):
    """
    ⚙️ Lance le calcul d'optimisation sur tous les groupes non encore présents
    dans la table cbm_product_explorer.Optimisation_Monitoring
    """

    logger.info("🚀 Démarrage du batch global d'optimisation")

    try:
        query = """
            SELECT grouping_crn, MIN(cod_pro) as cod_pro
            FROM (
                SELECT DISTINCT g.grouping_crn, g.cod_pro, g.qualite
                FROM CBM_DATA.Pricing.Grouping_crn_table g
                LEFT JOIN [CBM_DATA].[cbm_product_explorer].[Optimisation_Monitoring] m
                    ON m.grouping_crn = g.grouping_crn
                WHERE m.grouping_crn IS NULL
            ) tab
            GROUP BY grouping_crn
            HAVING COUNT(CASE WHEN qualite = 'OEM' THEN cod_pro END) > 1
                OR COUNT(CASE WHEN qualite IN ('PMV', 'PMQ') THEN cod_pro END) > 1
        """
        result = await db.execute(text(query))
        groups = result.fetchall()
    except Exception as e:
        logger.error(f"❌ Erreur récupération des groupes: {e}")
        return

    logger.info(f"📊 {len(groups)} groupes trouvés à traiter")

    inserted_count, skipped = 0, 0

    for grouping_crn, cod_pro in groups:
        try:
            logger.info(f"🔄 Traitement grouping_crn={grouping_crn}, cod_pro={cod_pro}")

            payload = ProductIdentifierRequest(
                cod_pro=cod_pro,
                grouping_crn=1,
                single_cod_pro=False
            )

            response = await evaluate_group_optimization(payload, db)
            if not response.items:
                logger.warning(f"⚠️ Aucun résultat pour grouping_crn={grouping_crn}")
                skipped += 1
                continue

            for item in response.items:
                cod_pro_principal = item.refs_to_keep[0].cod_pro if item.refs_to_keep else None

                hist = item.historique_12m.totaux_12m
                proj = item.projection_6m.totaux
                synth = item.synthese_totale

                values = {
                    "grouping_crn": int(item.grouping_crn),
                    "cod_pro": cod_pro_principal,
                    "nb_refs": item.refs_total,
                    "qualite": item.qualite,

                    # Historique
                    "ca_12m": hist.ca_reel,
                    "marge_achat_actuelle_12m": hist.marge_achat_actuelle,
                    "marge_achat_optimisee_12m": hist.marge_achat_optimisee,
                    "gain_manque_achat_12m": hist.gain_manque_achat,
                    "marge_pmp_actuelle_12m": hist.marge_pmp_actuelle,
                    "marge_pmp_optimisee_12m": hist.marge_pmp_optimisee,
                    "gain_manque_pmp_12m": hist.gain_manque_pmp,

                    # Projection
                    "ca_proj_6m": proj.ca,
                    "marge_achat_actuelle_proj_6m": proj.marge_achat_actuelle,
                    "marge_achat_optimisee_proj_6m": proj.marge_achat_optimisee,
                    "gain_potentiel_achat_6m": proj.gain_potentiel_achat,
                    "marge_pmp_actuelle_proj_6m": proj.marge_pmp_actuelle,
                    "marge_pmp_optimisee_proj_6m": proj.marge_pmp_optimisee,
                    "gain_potentiel_pmp_6m": proj.gain_potentiel_pmp,

                    # Synthèse
                    "marge_achat_actuelle_18m": synth.marge_achat_actuelle_18m,
                    "marge_achat_optimisee_18m": synth.marge_achat_optimisee_18m,
                    "marge_pmp_actuelle_18m": synth.marge_pmp_actuelle_18m,
                    "marge_pmp_optimisee_18m": synth.marge_pmp_optimisee_18m,
                    "gain_total_achat_18m": synth.gain_total_achat_18m,
                    "gain_total_pmp_18m": synth.gain_total_pmp_18m,
                    "amelioration_pct": synth.amelioration_pct,

                    "generated_at": datetime.now(),
                }

                insert_query = text("""
                    INSERT INTO CBM_DATA.cbm_product_explorer.Optimisation_Monitoring (
                        grouping_crn, cod_pro, nb_refs, qualite,
                        ca_12m,
                        marge_achat_actuelle_12m, marge_achat_optimisee_12m, gain_manque_achat_12m,
                        marge_pmp_actuelle_12m, marge_pmp_optimisee_12m, gain_manque_pmp_12m,
                        ca_proj_6m,
                        marge_achat_actuelle_proj_6m, marge_achat_optimisee_proj_6m, gain_potentiel_achat_6m,
                        marge_pmp_actuelle_proj_6m, marge_pmp_optimisee_proj_6m, gain_potentiel_pmp_6m,
                        marge_achat_actuelle_18m, marge_achat_optimisee_18m,
                        marge_pmp_actuelle_18m, marge_pmp_optimisee_18m,
                        gain_total_achat_18m, gain_total_pmp_18m,
                        amelioration_pct, generated_at
                    )
                    VALUES (
                        :grouping_crn, :cod_pro, :nb_refs, :qualite,
                        :ca_12m,
                        :marge_achat_actuelle_12m, :marge_achat_optimisee_12m, :gain_manque_achat_12m,
                        :marge_pmp_actuelle_12m, :marge_pmp_optimisee_12m, :gain_manque_pmp_12m,
                        :ca_proj_6m,
                        :marge_achat_actuelle_proj_6m, :marge_achat_optimisee_proj_6m, :gain_potentiel_achat_6m,
                        :marge_pmp_actuelle_proj_6m, :marge_pmp_optimisee_proj_6m, :gain_potentiel_pmp_6m,
                        :marge_achat_actuelle_18m, :marge_achat_optimisee_18m,
                        :marge_pmp_actuelle_18m, :marge_pmp_optimisee_18m,
                        :gain_total_achat_18m, :gain_total_pmp_18m,
                        :amelioration_pct, :generated_at
                    )
                """)
                await db.execute(insert_query, values)
                inserted_count += 1

            await db.commit()

        except Exception as e:
            logger.error(f"⚠️ Erreur grouping_crn={grouping_crn}: {e}")
            await db.rollback()
            skipped += 1

    logger.info(f"✅ Batch terminé: {inserted_count} insertions, {skipped} skips")
