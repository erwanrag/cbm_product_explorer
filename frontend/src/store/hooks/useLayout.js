// src/store/hooks/useLayout.js - VERSION CORRIGÉE FINALE
import { useContext } from 'react';
import { LayoutContext } from '@/store/contexts/LayoutContext';

/**
 * Hook useLayout - Version qui fonctionne
 */
export const useLayout = () => {
    const context = useContext(LayoutContext);

    // Si pas de contexte, retourner des valeurs par défaut
    if (!context) {
        console.warn('useLayout utilisé en dehors de LayoutProvider');
        return {
            sidebarOpen: true,
            sidebarMobileOpen: false,
            toggleSidebar: () => { },
            toggleMobileSidebar: () => { },
            filters: {},
            setFilters: () => { },
            clearFilters: () => { },
        };
    }

    // Retourner directement le contexte
    return context;
};

export default useLayout;