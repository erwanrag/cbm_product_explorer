// ===================================
// 📁 frontend/src/lib/colors.js - VERSION COMPLÈTE
// ===================================

// Import des constantes et fonctions depuis constants/colors.js
import {
  QUALITE_COLORS,
  STATUT_COLORS,
  QUALITE_LABELS,
  STATUT_LABELS,
  getQualiteColor,
  getStatutColor,
  getQualiteLabel,
  getStatutLabel,
  getMargeColor,
  getMatchPercentColor,
} from '@/constants/colors';

// ✅ Ré-export COMPLET
export {
  QUALITE_COLORS,
  STATUT_COLORS,
  QUALITE_LABELS,
  STATUT_LABELS,
  getQualiteColor,
  getStatutColor,
  getQualiteLabel,
  getStatutLabel,
  getMargeColor,
  getMatchPercentColor,
};

// Couleurs étendues pour graphiques
export const CHART_COLORS = [
  '#1976d2',
  '#dc004e',
  '#2e7d32',
  '#ed6c02',
  '#9c27b0',
  '#00acc1',
  '#5e35b1',
  '#c0ca33',
  '#6d4c41',
  '#546e7a',
  '#8d6e63',
  '#78909c',
];

/**
 * Récupère une couleur de graphique par index
 */
export function getChartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Génère une couleur basée sur un hash de chaîne
 */
export function getColorFromString(str) {
  if (!str) return '#757575';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

/**
 * Couleur de performance (0-100, rouge à vert)
 */
export function getPerformanceColor(value) {
  if (value == null || isNaN(value)) return '#757575';
  const hue = Math.max(0, Math.min(120, (value / 100) * 120));
  return `hsl(${hue}, 70%, 45%)`;
}

/**
 * ✨ NOUVELLE : Label textuel pour la marge selon qualité
 */
export function getMargeLabel(marge, qualite) {
  const color = getMargeColor(marge, qualite);
  
  if (color === '#43a047') return 'Bonne marge';     // Vert
  if (color === '#f9a825') return 'Marge moyenne';   // Orange/Jaune
  if (color === '#e53935') return 'Marge faible';    // Rouge
  
  return 'N/A';
}

// Export par défaut
export default {
  QUALITE_COLORS,
  STATUT_COLORS,
  QUALITE_LABELS,
  STATUT_LABELS,
  getQualiteColor,
  getStatutColor,
  getQualiteLabel,
  getStatutLabel,
  getMargeColor,
  getMargeLabel,
  getMatchPercentColor,
  getChartColor,
  getColorFromString,
  getPerformanceColor,
};