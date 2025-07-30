// frontend/src/store/hooks/useLayout.js - HOOK LAYOUT
import { useContext } from 'react';
import { LayoutContext } from '@/store/contexts/LayoutContext';

/**
 * Hook pour accéder au contexte Layout
 * Gère les filtres, la sidebar, les notifications
 */
export const useLayout = () => {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error('useLayout doit être utilisé dans un LayoutProvider');
  }

  return context;
};

export default useLayout;
