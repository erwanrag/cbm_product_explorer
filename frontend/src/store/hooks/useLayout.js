// ===================================
// 📁 frontend/src/store/hooks/useLayout.js - VERSION CORRIGÉE AVEC setFilters
// ===================================

import { useContext } from 'react';
import { LayoutContext } from '@/store/contexts/LayoutContext';

/**
 * Hook useLayout - Version qui fonctionne avec setFilters
 */
export const useLayout = () => {
    const context = useContext(LayoutContext);

    // Si pas de contexte, retourner des valeurs par défaut fonctionnelles
    if (!context) {
        console.warn('useLayout utilisé en dehors de LayoutProvider - valeurs par défaut utilisées');
        return {
            sidebarOpen: true,
            sidebarMobileOpen: false,
            toggleSidebar: () => { console.warn('toggleSidebar: LayoutProvider non trouvé'); },
            toggleMobileSidebar: () => { console.warn('toggleMobileSidebar: LayoutProvider non trouvé'); },
            filters: {},
            setFilters: (newFilters) => {
                console.warn('setFilters appelé mais LayoutProvider non trouvé:', newFilters);
            },
            clearFilters: () => {
                console.warn('clearFilters: LayoutProvider non trouvé');
            },
            loading: false,
            setLoading: () => { console.warn('setLoading: LayoutProvider non trouvé'); },
            notifications: [],
            addNotification: () => { console.warn('addNotification: LayoutProvider non trouvé'); },
            removeNotification: () => { console.warn('removeNotification: LayoutProvider non trouvé'); },
            currentPage: '',
            setCurrentPage: () => { console.warn('setCurrentPage: LayoutProvider non trouvé'); },
            breadcrumbs: [],
            setBreadcrumbs: () => { console.warn('setBreadcrumbs: LayoutProvider non trouvé'); },
        };
    }

    // Retourner le contexte complet avec toutes les méthodes
    return context;
};

/**
 * Hook pour utiliser seulement la sidebar (compatibilité)
 */
export const useSidebar = () => {
    const { sidebarOpen, sidebarMobileOpen, toggleSidebar, toggleMobileSidebar } = useLayout();

    return {
        sidebarOpen,
        sidebarMobileOpen,
        toggleSidebar,
        toggleMobileSidebar,
    };
};

export default useLayout;