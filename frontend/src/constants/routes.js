// ===================================
// 📁 frontend/src/constants/routes.js - ROUTES CBM
// ===================================

/**
 * Routes et navigation CBM Product Explorer
 */

export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  MATRIX: '/matrix',
  OPTIMIZATION: '/optimization',
  ANALYTICS: '/analytics',
};

export const ROUTE_TITLES = {
  [ROUTES.ROOT]: 'CBM Product Explorer',
  [ROUTES.DASHBOARD]: 'Analyse Produit',
  [ROUTES.MATRIX]: 'Matrice Produits',
  [ROUTES.OPTIMIZATION]: 'Optimisation',
  [ROUTES.ANALYTICS]: 'Analytics',
};

export const ROUTE_META = {
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Analyse des produits et KPIs',
    icon: 'Dashboard',
  },
  [ROUTES.MATRIX]: {
    title: 'Matrice',
    description: 'Matrice de correspondance produits',
    icon: 'GridView',
  },
  [ROUTES.OPTIMIZATION]: {
    title: 'Optimisation',
    description: 'Analyses et optimisations business',
    icon: 'TrendingUp',
  },
  [ROUTES.ANALYTICS]: {
    title: 'Analytics',
    description: 'Métriques et analyses avancées',
    icon: 'Analytics',
  },
};

// Navigation principale
export const MAIN_NAVIGATION = [
  { path: ROUTES.DASHBOARD, ...ROUTE_META[ROUTES.DASHBOARD] },
  { path: ROUTES.MATRIX, ...ROUTE_META[ROUTES.MATRIX] },
  { path: ROUTES.OPTIMIZATION, ...ROUTE_META[ROUTES.OPTIMIZATION] },
  { path: ROUTES.ANALYTICS, ...ROUTE_META[ROUTES.ANALYTICS] },
];

export const DEFAULT_ROUTE = ROUTES.DASHBOARD;
