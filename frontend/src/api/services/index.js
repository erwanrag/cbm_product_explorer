// frontend/src/api/services/index.js - EXPORT CENTRALISÉ
export { identifierService } from './identifierService';
export { productService } from './productService';
export { dashboardService } from './dashboardService';
export { salesService } from './salesService';
export { stockService } from './stockService';
export { purchaseService } from './purchaseService';
export { suggestionService } from './suggestionService';
export { optimizationService } from './optimizationService';

// Export du client principal
export { default as apiClient } from '../core/apiClient';