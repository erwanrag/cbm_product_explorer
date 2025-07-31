// frontend/src/features/matrix/index.js

/**
 * Export centralisé du module Matrix
 */

// Pages principales
export { default as MatrixPage } from './pages/MatrixPage';

// Composants principaux
export { default as MatrixView } from './components/MatrixView';
export { default as MatrixFilters } from './components/MatrixFilters';
export { default as MatrixLegend } from './components/MatrixLegend';
export { default as MatrixExport } from './components/MatrixExport';
export { default as MatrixInsights } from './components/MatrixInsights';

// Hooks
export { useMatrixData } from './hooks/useMatrixData';

// Services
export { matrixService } from '@/services/api/matrixService';

// Constantes
export * from './constants/matrixConstants';

// Utilitaires
export * from './utils/exportUtils';