// ===================================
// 📁 frontend/src/api/index.js - POINT D'ENTRÉE MODERNE
// ===================================

// Export de tous les services
export * from './services';

// Export du client principal
export { default as apiClient } from './core/client';

// Export des hooks React Query
export * from './hooks';