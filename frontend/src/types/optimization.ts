// Types pour la nouvelle structure backend

export interface Historique12M {
  totaux_12m: {
    qte_totale: number;
    ca_reel: number;
    marge_achat_actuelle: number;
    marge_achat_optimisee: number;
    gain_manque_achat: number;
    marge_pmp_actuelle: number;
    marge_pmp_optimisee: number;
    gain_manque_pmp: number;
  };
  mois: Array<{
    periode: string;
    qte_reelle: number;
    ca_reel: number;
    marge_achat_actuelle: number;
    marge_achat_optimisee: number;
    gain_manque_achat: number;
    marge_pmp_actuelle: number;
    marge_pmp_optimisee: number;
    gain_manque_pmp: number;
    ca_optimise_theorique: number;
    facteur_couverture: number;
  }>;
}

export interface Projection6Mois {
  taux_croissance: number;
  totaux: {
    qte: number;
    ca: number;
    marge_achat_actuelle: number;
    marge_achat_optimisee: number;
    gain_potentiel_achat: number;
    marge_pmp_actuelle: number;
    marge_pmp_optimisee: number;
    gain_potentiel_pmp: number;
  };
  mois: Array<{
    periode: string;
    qte: number;
    ca: number;
    marge_achat_actuelle: number;
    marge_achat_optimisee: number;
    gain_potentiel_achat: number;
    marge_pmp_actuelle: number;
    marge_pmp_optimisee: number;
    gain_potentiel_pmp: number;
    facteur_couverture: number;
  }>;
  metadata: {
    method: string;
    model_quality: string;
    quality_score: number;
    confidence_level: string;
    data_points: number;
    warnings: string[];
    recommendations: string[];
    summary: string;
    evaluation_timestamp: string;
    validator_available: boolean;
  };
}

export interface SyntheseTotale {
  gain_manque_achat_12m: number;
  gain_manque_pmp_12m: number;
  gain_potentiel_achat_6m: number;
  gain_potentiel_pmp_6m: number;
  gain_total_achat_18m: number;
  gain_total_pmp_18m: number;
  marge_achat_actuelle_18m: number;
  marge_achat_optimisee_18m: number;
  marge_pmp_actuelle_18m: number;
  marge_pmp_optimisee_18m: number;
  amelioration_pct: number;
}

export interface GroupOptimization {
  grouping_crn: number;
  qualite: string;
  refs_total: number;
  px_achat_min: number;
  px_vente_pondere: number;
  gain_potentiel: number; // ancien champ conservé
  
  // NOUVEAUX BLOCS
  historique_12m: Historique12M;
  projection_6m: Projection6Mois;
  synthese_totale: SyntheseTotale;
  
  // Références (inchangé)
  refs_to_keep: Array<any>;
  refs_to_delete_low_sales: Array<any>;
  refs_to_delete_no_sales: Array<any>;
}