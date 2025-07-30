// ===================================
// 📁 frontend/src/constants/colors.js - COULEURS CBM
// ===================================

/**
 * Couleurs CBM GRC Matcher - Basé sur votre logique métier
 */

// Couleurs par qualité produit (votre logique existante)
export const QUALITE_COLORS = {
    OE: "#2196f3",   // Bleu - Origine Équipementier
    OEM: "#4caf50",  // Vert - Original Equipment Manufacturer  
    PMQ: "#ff9800",  // Orange - Pièce Marché Qualité
    PMV: "#9c27b0",  // Violet - Pièce Marché Véhicule
};

export const QUALITE_LABELS = {
    OE: "OE",
    OEM: "OEM",
    PMQ: "PMQ",
    PMV: "PMV",
};

// Couleurs par statut produit (votre logique backend)
export const STATUT_COLORS = {
    0: "#27ae60",    // Vert - RAS (normal)
    1: "#F59E42",    // Jaune - Interdit Achat
    2: "#e57330",    // Orange - Interdit Vente  
    8: "#8B5CF6",    // Violet - Interdit Achat/Vente
};

export const STATUT_LABELS = {
    0: "RAS",
    1: "Interdit Achat",
    2: "Interdit Vente",
    8: "Interdit Achat/Vente",
};

// Couleurs de marge (logique métier CBM)
export function getMargeColor(val) {
    if (val == null || isNaN(val)) return "#ccc";
    if (val < 10) return "#e53935";                    // Rouge (faible)
    if (val <= 20) return "#ff9800";                   // Orange (moyenne)
    return "#27ae60";                                  // Vert (bonne)
}

// Fonctions utilitaires
export function getQualiteColor(qualite) {
    return QUALITE_COLORS[qualite?.toUpperCase()] || "#757575";
}

export function getStatutColor(statut) {
    return STATUT_COLORS[statut] || "#999999";
}

export function getQualiteLabel(qualite) {
    return QUALITE_LABELS[qualite] || qualite || "?";
}

export function getStatutLabel(statut) {
    return STATUT_LABELS[statut] || `Code ${statut}`;
}