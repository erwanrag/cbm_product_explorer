// ===================================
// 📁 frontend/src/store/hooks/useLayout.js - MODERNE
// ===================================

import { useAppState } from '@store/contexts/AppStateContext';

/**
 * Hook pour la gestion du layout et sidebar
 * Remplace useSidebar.js
 */
export function useLayout() {
  const { state, actions } = useAppState();

  return {
    // Sidebar state
    isSidebarOpen: state.sidebar.isOpen,
    isSidebarPinned: state.sidebar.isPinned,

    // Sidebar actions
    openSidebar: () => actions.setSidebarOpen(true),
    closeSidebar: () => actions.setSidebarOpen(false),
    toggleSidebar: actions.toggleSidebar,
    pinSidebar: () => actions.setSidebarPinned(true),
    unpinSidebar: () => actions.setSidebarPinned(false),
    togglePin: () => actions.setSidebarPinned(!state.sidebar.isPinned),

    // Filtres (pour compatibilité)
    filters: state.filters.active,
    filterType: state.filters.type,
    setFilters: actions.setFilters,
    setFilterType: actions.setFilterType,
    clearFilters: actions.clearFilters,
  };
}

// Alias pour compatibilité avec l'ancien code
export const useSidebar = useLayout;
