// ===================================
// 📁 frontend/src/store/contexts/LayoutContext.jsx - FUSIONNER VOS EXISTANTS
// ===================================

import React, { createContext, useContext } from 'react';
import { useAppState } from './AppStateContext';

// Context simple qui utilise AppState pour la compatibilité
const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
    const { state, actions } = useAppState();

    // Interface compatible avec votre code existant
    const value = {
        filters: state.filters.active,
        setFilters: actions.setFilters,
        filterType: state.filters.type,
        setFilterType: actions.setFilterType,

        // Fonctions de compatibilité
        clearFilters: actions.clearFilters,
        refreshData: actions.refresh,
    };

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within LayoutProvider');
    }
    return context;
}

export { LayoutContext };
