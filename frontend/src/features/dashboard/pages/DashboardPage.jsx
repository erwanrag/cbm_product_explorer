// frontend/src/features/dashboard/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

import { useAppState } from '@/store/contexts/AppStateContext';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

import DashboardHeader from '@/features/dashboard/components/DashboardHeader';
import DashboardKPISection from '@/features/dashboard/components/DashboardKPISection';
import DashboardChartsSection from '@/features/dashboard/components/DashboardChartsSection';
import DashboardTableSection from '@/features/dashboard/components/DashboardTableSection';
import DashboardEmptyState from '@/features/dashboard/components/DashboardEmptyState';
import ProductDetailPanel from '@/features/dashboard/components/ProductDetailPanel';

export default function DashboardPage() {
    const { state } = useAppState();
    const [searchParams] = useSearchParams();
    const [selectedProduct, setSelectedProduct] = useState(null);

    const activeFilters = state?.filters?.active || {};
    const urlFilters = Object.fromEntries(searchParams.entries());
    const finalFilters = Object.keys(urlFilters).length > 0 ? urlFilters : activeFilters;
    const hasActiveFilters = Object.keys(finalFilters).length > 0;

    const {
        dashboardData,
        isLoading,
        isError,
        error,
        refreshData
    } = useDashboardData(finalFilters);

    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = async () => {
        setRefreshKey(prev => prev + 1);
        await refreshData();
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
    };

    if (!hasActiveFilters) {
        return <DashboardEmptyState />;
    }

    if (isError) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert
                    severity="error"
                    action={
                        <button onClick={handleRefresh} style={{ marginLeft: 10 }}>
                            Réessayer
                        </button>
                    }
                >
                    Erreur lors du chargement: {error?.message || 'Erreur inconnue'}
                </Alert>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Dashboard principal */}
            <Box sx={{
                flexGrow: 1,
                overflow: 'auto',
                transition: 'all 0.3s ease',
                width: selectedProduct ? '70%' : '100%'
            }}>
                <motion.div
                    key={refreshKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
                        <DashboardHeader
                            data={dashboardData}
                            filters={finalFilters}
                            onRefresh={handleRefresh}
                            loading={isLoading}
                            selectedProduct={selectedProduct}
                            onClearSelection={() => setSelectedProduct(null)}
                        />

                        <DashboardKPISection
                            data={dashboardData}
                            loading={isLoading}
                            selectedProduct={selectedProduct}
                        />

                        <DashboardChartsSection
                            data={dashboardData}
                            loading={isLoading}
                            selectedProduct={selectedProduct}
                        />

                        <DashboardTableSection
                            data={dashboardData}
                            loading={isLoading}
                            onRefresh={handleRefresh}
                            onProductSelect={handleProductSelect}
                            selectedProduct={selectedProduct}
                        />
                    </Box>
                </motion.div>
            </Box>

            {/* Panel détail produit */}
            {selectedProduct && (
                <ProductDetailPanel
                    product={selectedProduct}
                    data={dashboardData}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </Box>
    );
}
