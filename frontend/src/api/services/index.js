// frontend/src/api/services/index.js - REMPLACER TOUT LE CONTENU PAR CECI

// ===== SERVICES CLASSES (nouveaux) =====
export { DashboardService } from '@/api/services/dashboardService';
export { ProductService } from '@/api/services/productService';
export { IdentifierService } from '@/api/services/identifierService';
export { SalesService } from '@/api/services/salesService';
export { StockService } from '@/api/services/stockService';
export { PurchaseService } from '@/api/services/purchaseService';
export { SuggestionService } from '@/api/services/suggestionService';
export { OptimizationService } from '@/api/services/optimizationService';
export { MatrixService } from '@/api/services/matrixService';

// ===== INSTANCES SINGLETONS (pour compatibilité) =====
export { dashboardService } from '@/api/services/dashboardService';
export { productService } from '@/api/services/productService';
export { identifierService } from '@/api/services/identifierService';
export { salesService } from '@/api/services/salesService';
export { stockService } from '@/api/services/stockService';
export { purchaseService } from '@/api/services/purchaseService';
export { suggestionService } from '@/api/services/suggestionService';
export { optimizationService } from '@/api/services/optimizationService';
export { matrixService } from '@/api/services/matrixService';

// ===== CLIENT PRINCIPAL =====
export { default as apiClient } from '@/api/core/client';
