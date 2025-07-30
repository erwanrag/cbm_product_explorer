// ===================================
// 📁 frontend/src/lib/index.js - EXPORT PRINCIPAL
// ===================================

// Export de tous les utilitaires
export * from './colors';
export * from './formatUtils';
export * from './exportUtils';
export * from './utils';

// Exports par défaut pour compatibilité
export { formatPrix, formatNumber, formatDate } from './formatUtils';
export { exportToCSV, exportToJSON } from './exportUtils';
export { getQualiteColor, getStatutColor, getMargeColor } from './colors';