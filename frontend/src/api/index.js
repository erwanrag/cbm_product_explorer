// ===================================
// 📁 frontend/src/api/index.js - POINT D'ENTRÉE MODERNE
// ===================================

// Export de tous les services
export * from '@/api/services';

// Export du client principal
export { default as apiClient } from '@/api/core/client';

// Export des hooks React Query
export * from '@/hooks';
