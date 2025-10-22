import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useLayout } from '@/store/hooks/useLayout';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

// Components
import DashboardKPISection from '@/features/dashboard/components/DashboardKPISection';
import DashboardChartsSection from '@/features/dashboard/components/DashboardChartsSection';
import RefFiltersSection from '@/features/dashboard/components/RefFiltersSection';
import StockDepotChart from '@/features/dashboard/components/StockDepotChart';
import DashboardTableSection from '@/features/dashboard/components/DashboardTableSection';
import DashboardDetailPanel from '@/features/dashboard/components/DashboardDetailPanel';
import StockAdvancedModal from '@/features/dashboard/components/StockAdvancedModal';

export default function DashboardPage() {
    // ✅ 1. TOUS LES HOOKS DANS L'ORDRE STRICT - NE JAMAIS CHANGER
    const { filters } = useLayout();
    const { dashboardData, isLoading, isError } = useDashboardData(filters);

    // ✅ 2. TOUS LES useState
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedRefCrn, setSelectedRefCrn] = useState('');
    const [selectedRefExt, setSelectedRefExt] = useState('');
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedDepotData, setSelectedDepotData] = useState(null);

    // ✅ 3. TOUS LES useCallback
    const handleProductSelect = useCallback((product) => {
        setSelectedProduct(product);
    }, []);

    const handleRefCrnChange = useCallback((refCrn) => {
        setSelectedRefCrn(refCrn);
    }, []);

    const handleRefExtChange = useCallback((refExt) => {
        setSelectedRefExt(refExt);
    }, []);

    const handleStockModalOpen = useCallback((depotData) => {
        setSelectedDepotData(depotData);
        setStockModalOpen(true);
    }, []);

    const handleStockModalClose = useCallback(() => {
        setStockModalOpen(false);
        setSelectedDepotData(null);
    }, []);

    const handleAdvancedAnalysis = useCallback(() => {
        setStockModalOpen(true);
    }, []);

    // ✅ 4. TOUS LES useMemo
    const hasData = useMemo(() => {
        return dashboardData && (
            (dashboardData.details && dashboardData.details.length > 0) ||
            (dashboardData.sales && dashboardData.sales.length > 0) ||
            (dashboardData.stock && dashboardData.stock.length > 0)
        );
    }, [dashboardData]);

    const filteredData = useMemo(() => {
        if (!dashboardData) return null;

        let filtered = { ...dashboardData };

        if (selectedRefCrn) {
            filtered.details = filtered.details?.filter(item =>
                item.ref_crn && item.ref_crn.toLowerCase().includes(selectedRefCrn.toLowerCase())
            ) || [];
        }

        if (selectedRefExt) {
            filtered.details = filtered.details?.filter(item =>
                item.ref_ext && item.ref_ext.toLowerCase().includes(selectedRefExt.toLowerCase())
            ) || [];
        }

        return filtered;
    }, [dashboardData, selectedRefCrn, selectedRefExt]);

    // ✅ 5. FONCTIONS DE RENDU (pas de hooks ici)
    const renderContent = () => {
        if (isLoading) {
            return (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Chargement des données...
                </Alert>
            );
        }

        if (isError) {
            return (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Erreur lors du chargement des données. Veuillez réessayer.
                </Alert>
            );
        }

        if (!hasData) {
            return (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Aucune donnée disponible pour les filtres sélectionnés.
                </Alert>
            );
        }

        return (
            <>
                <DashboardKPISection data={filteredData} isLoading={isLoading} />
                
                <RefFiltersSection
                    selectedRefCrn={selectedRefCrn}
                    selectedRefExt={selectedRefExt}
                    onRefCrnChange={handleRefCrnChange}
                    onRefExtChange={handleRefExtChange}
                    data={dashboardData}
                />
                
                <DashboardChartsSection data={filteredData} isLoading={isLoading} />
                
                <StockDepotChart
                    data={filteredData}
                    onDepotClick={handleStockModalOpen}
                    onAdvancedAnalysis={handleAdvancedAnalysis}
                />
                
                <DashboardTableSection
                    data={filteredData}
                    onProductSelect={handleProductSelect}
                />

                {selectedProduct && (
                    <DashboardDetailPanel
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        dashboardData={filteredData}
                    />
                )}

                <StockAdvancedModal
                    open={stockModalOpen}
                    onClose={handleStockModalClose}
                    data={filteredData}
                    selectedDepot={selectedDepotData}
                />
            </>
        );
    };

    // ✅ 6. RENDU PRINCIPAL
    return (
        <Box sx={{ px: 3, py: 3, width: '100%' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Tableau de Bord CBM
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Vue d'ensemble des données produits, ventes et stocks
                    </Typography>
                </Box>

                {renderContent()}
            </motion.div>
        </Box>
    );
}