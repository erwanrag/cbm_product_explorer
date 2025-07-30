// ===================================
// 📁 frontend/src/store/index.js - EXPORT PRINCIPAL
// ===================================

// Contexts
export { AppStateProvider, useAppState } from '@/store/contexts/AppStateContext';
export {
  LayoutProvider,
  useLayout as useContextLayout,
  LayoutContext,
} from '@/store/contexts/LayoutContext';

// Hooks
export * from '@/store/hooks';

// Export principal pour compatibilité
export { useAppState as useGlobalState } from '@/store/contexts/AppStateContext';
