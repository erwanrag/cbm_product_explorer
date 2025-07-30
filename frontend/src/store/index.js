// ===================================
// 📁 frontend/src/store/index.js - EXPORT PRINCIPAL
// ===================================

// Contexts
export { AppStateProvider, useAppState } from './contexts/AppStateContext';
export { LayoutProvider, useLayout as useContextLayout, LayoutContext } from './contexts/LayoutContext';

// Hooks
export * from './hooks';

// Export principal pour compatibilité
export { useAppState as useGlobalState } from './contexts/AppStateContext';