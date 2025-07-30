// frontend/src/api/services/index.js - REMPLACER TOUT LE CONTENU PAR CECI

// ===== SERVICES CLASSES (nouveaux) =====
export { DashboardService } from './dashboardService';
export { ProductService } from './productService';
export { IdentifierService } from './identifierService';
export { SalesService } from './salesService';
export { StockService } from './stockService';
export { PurchaseService } from './purchaseService';
export { SuggestionService } from './suggestionService';
export { OptimizationService } from './optimizationService';

// ===== INSTANCES SINGLETONS (pour compatibilité) =====
export { dashboardService } from './dashboardService';
export { productService } from './productService';
export { identifierService } from './identifierService';
export { salesService } from './salesService';
export { stockService } from './stockService';
export { purchaseService } from './purchaseService';
export { suggestionService } from './suggestionService';
export { optimizationService } from './optimizationService';

// ===== CLIENT PRINCIPAL =====
export { default as apiClient } from '../core/client';