// ===================================
// 📁 frontend/src/constants/colors.js - COULEURS CBM
// ===================================

/**
 * Couleurs CBM GRC Matcher - Basé sur votre logique métier
 */

// Couleurs par qualité produit (votre logique existante)
export const QUALITE_COLORS = {
  OE: '#2196f3', // Bleu - Origine Équipementier
  OEM: '#4caf50', // Vert - Original Equipment Manufacturer
  PMQ: '#ff9800', // Orange - Pièce Marché Qualité
  PMV: '#9c27b0', // Violet - Pièce Marché Véhicule
};

export const QUALITE_LABELS = {
  OE: 'OE',
  OEM: 'OEM',
  PMQ: 'PMQ',
  PMV: 'PMV',
};

// Couleurs par statut produit (votre logique backend)
export const STATUT_COLORS = {
  0: '#27ae60', // Vert - RAS (normal)
  1: '#F59E42', // Jaune - Interdit Achat
  2: '#e57330', // Orange - Interdit Vente
  8: '#8B5CF6', // Violet - Interdit Achat/Vente
};

export const STATUT_LABELS = {
  0: 'RAS',
  1: 'Interdit Achat',
  2: 'Interdit Vente',
  8: 'Interdit Achat/Vente',
};

// Couleurs de marge (logique métier CBM)
export function getMargeColor(val, qualite) {
    if (val == null || isNaN(val)) return '#ccc';
    if (!qualite) return '#ccc';

    const q = qualite.toUpperCase();
    if (q === 'PMV') {
        if (val < 50) return '#e53935';
        if (val <= 60) return '#f9a825';
        return '#43a047';
    }
    if (q === 'PMQ') {
        if (val < 40) return '#e53935';
        if (val <= 50) return '#f9a825';
        return '#43a047';
    }
    if (q === 'OEM') {
        if (val < 25) return '#e53935';
        if (val <= 32) return '#f9a825';
        return '#43a047';
    }
    if (q === 'OE') {
        if (val < 20) return '#e53935';
        if (val <= 25) return '#f9a825';
        return '#43a047';
    }

    return '#999'; // fallback
}

// Couleurs du matchg pour les pourcentages
export function getMatchPercentColor(value) {
    if (value == null || isNaN(value)) return '#9e9e9e'; // gris
    if (value < 65) return '#e53935';      // rouge
    if (value < 80) return '#f9a825';      // orange
    return '#43a047';                      // vert
}

// Fonctions utilitaires
export function getQualiteColor(qualite) {
  return QUALITE_COLORS[qualite?.toUpperCase()] || '#757575';
}

export function getStatutColor(statut) {
  return STATUT_COLORS[statut] || '#999999';
}

export function getQualiteLabel(qualite) {
  return QUALITE_LABELS[qualite] || qualite || '?';
}

export function getStatutLabel(statut) {
  return STATUT_LABELS[statut] || `Code ${statut}`;
}
