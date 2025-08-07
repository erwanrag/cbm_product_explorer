// ===================================
// 📁 frontend/src/constants/business.js - LOGIQUE MÉTIER CBM
// ===================================

/**
 * Constantes métier CBM Product Explorer
 */

// Limites métier
export const BUSINESS_LIMITS = {
  MAX_PRODUCTS_BATCH: 100,
  MAX_SEARCH_RESULTS: 500,
  MIN_MARGE_ACCEPTABLE: 10, // %
  STOCK_ALERT_THRESHOLD: 10,
  DEFAULT_MONTHS_HISTORY: 12,
};

// Formats d'affichage
export const DISPLAY_FORMATS = {
  DATE: 'DD/MM/YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  CURRENCY: 'EUR',
  DECIMAL_PLACES: 2,
  PERCENTAGE_PLACES: 1,
};

// Types de filtres
export const FILTER_TYPES = {
  NONE: 'none',
  DASHBOARD: 'dashboard',
  MATRIX: 'matrix',
  OPTIMIZATION: 'optimization',
  ANALYTICS: 'analytics',
};

// États de chargement
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};
