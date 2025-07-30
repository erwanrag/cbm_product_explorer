// frontend/src/features/dashboard/DashboardPage.jsx - VERSION PROPRE
import React, { useEffect, useState } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import { Refresh, Analytics } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks enterprise
import { useProductData } from '@/store/hooks/useProductData';
import { useAppState } from '@/store/contexts/AppStateContext';

// Composants partitionnés
import DashboardHeader from '@/features/dashboard/components/DashboardHeader';
import DashboardKPISection from '@/features/dashboard/components/DashboardKPISection';
import DashboardChartsSection from '@/features/dashboard/components/DashboardChartsSection';
import DashboardTableSection from '@/features/dashboard/components/DashboardTableSection';
import ProductAnalysisDrawer from '@/features/dashboard/components/ProductAnalysisDrawer';
import DashboardEmptyState from '@/features/dashboard/components/DashboardEmptyState';
import DashboardErrorState from '@/features/dashboard/components/DashboardErrorState';

// Hooks métier spécialisés
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useDashboardActions } from '@/features/dashboard/hooks/useDashboardActions';

/**
 * Page Dashboard principale - Architecture enterprise clean
 * Responsabilité unique: orchestration des composants enfants
 */
export default function DashboardPage() {
    const { state, actions } = useAppState();
    const activeFilters = state.filters.active;
    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    // Hook métier centralisé
    const {
        dashboardData,
        isLoading,
        isError,
        error,
        refreshData
    } = useDashboardData(activeFilters);

    // Actions métier centralisées
    const {
        handleProductSelect,
        handleExport,
        handleViewModeChange,
        selectedProduct,
        viewMode
    } = useDashboardActions();

    // État local minimal
    const [refreshKey, setRefreshKey] = useState(0);

    // Gestion du refresh
    const handleRefresh = async () => {
        setRefreshKey(prev => prev + 1);
        await refreshData();
    };

    // Rendu conditionnel clean
    if (!hasActiveFilters) {
        return <DashboardEmptyState />;
    }

    if (isError) {
        return <DashboardErrorState error={error} onRetry={handleRefresh} />;
    }

    return (
        <motion.div
            key={refreshKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
                {/* Header avec actions - Composant dédié */}
                <DashboardHeader
                    productCount={dashboardData?.details?.length || 0}
                    onRefresh={handleRefresh}
                    onExport={handleExport}
                    onViewModeChange={handleViewModeChange}
                    viewMode={viewMode}
                    loading={isLoading}
                />

                {/* Section KPI - Composant dédié */}
                <DashboardKPISection
                    data={dashboardData}
                    loading={isLoading}
                    onKpiClick={handleViewModeChange}
                />

                {/* Section Graphiques - Composant dédié */}
                <DashboardChartsSection
                    data={dashboardData}
                    loading={isLoading}
                    viewMode={viewMode}
                />

                {/* Section Tableau - Composant dédié */}
                <DashboardTableSection
                    data={dashboardData}
                    loading={isLoading}
                    onProductSelect={handleProductSelect}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                />

                {/* Drawer d'analyse - Composant dédié */}
                <AnimatePresence>
                    {selectedProduct && (
                        <ProductAnalysisDrawer
                            product={selectedProduct}
                            onClose={() => handleProductSelect(null)}
                            viewMode={viewMode}
                        />
                    )}
                </AnimatePresence>

                {/* FAB de refresh */}
                <Fab
                    color="primary"
                    aria-label="actualiser"
                    sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    <Refresh sx={{
                        animation: isLoading ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                        }
                    }} />
                </Fab>
            </Box>
        </motion.div>
    );
}
