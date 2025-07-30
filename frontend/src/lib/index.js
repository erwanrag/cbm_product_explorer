// ===================================
// 📁 frontend/src/lib/index.js - EXPORT PRINCIPAL
// ===================================

// Export de tous les utilitaires
export * from '@/lib/colors';
export * from '@/lib/formatUtils';
export * from '@/lib/exportUtils';
export * from '@/lib/utils';

// Exports par défaut pour compatibilité
export { formatPrix, formatNumber, formatDate } from '@/lib/formatUtils';
export { exportToCSV, exportToJSON } from '@/lib/exportUtils';
export { getQualiteColor, getStatutColor, getMargeColor } from '@/lib/colors';
