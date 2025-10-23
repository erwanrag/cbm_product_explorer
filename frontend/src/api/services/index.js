// frontend/src/api/services/index.js

// ✅ Export des INSTANCES (avec minuscule)
export { dashboardService } from '@/api/services/dashboardService';
export { productService } from '@/api/services/productService';
export { identifierService } from '@/api/services/identifierService';
export { salesService } from '@/api/services/salesService';
export { stockService } from '@/api/services/stockService';
export { purchaseService } from '@/api/services/purchaseService';
export { suggestionService } from '@/api/services/suggestionService';
export { optimizationService } from '@/api/services/optimizationService';
export { matrixService } from '@/api/services/matrixService';

// ✅ Export du client principal
export { default as apiClient } from '@/api/core/client';