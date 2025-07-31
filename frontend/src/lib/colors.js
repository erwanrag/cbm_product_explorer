// ===================================
// 📁 frontend/src/lib/colors.js - REMPLACER VOTRE EXISTANT
// ===================================

// Import des constantes
import {
  QUALITE_COLORS,
  STATUT_COLORS,
  getQualiteColor,
  getStatutColor,
  getMargeColor,
} from '@/constants/colors';

// Ré-export pour compatibilité
export { QUALITE_COLORS, STATUT_COLORS, getQualiteColor, getStatutColor, getMargeColor, getMatchPercentColor };

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
