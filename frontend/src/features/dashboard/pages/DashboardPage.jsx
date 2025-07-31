// ===================================
// 📁 frontend/src/features/dashboard/pages/DashboardPage.jsx - VERSION FINALE COMPLÈTE
// ===================================

import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
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
    // ✅ 1. TOUS LES HOOKS EN PREMIER - ORDRE FIXE
    const { filters } = useLayout();
    const { dashboardData, isLoading, isError } = useDashboardData(filters);

    // ✅ 2. TOUS LES useState ENSEMBLE
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedRefCrn, setSelectedRefCrn] = useState('');
    const [selectedRefExt, setSelectedRefExt] = useState('');
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedDepotData, setSelectedDepotData] = useState(null);

    // ✅ 3. TOUS LES useMemo/useCallback ENSEMBLE
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

        // Filtrage par REF_CRN
        if (selectedRefCrn) {
            filtered.details = filtered.details?.filter(item =>
                item.ref_crn && item.ref_crn.toLowerCase().includes(selectedRefCrn.toLowerCase())
            ) || [];
        }

        // Filtrage par REF_EXT
        if (selectedRefExt) {
            filtered.details = filtered.details?.filter(item =>
                item.ref_ext && item.ref_ext.toLowerCase().includes(selectedRefExt.toLowerCase())
            ) || [];
        }

        return filtered;
    }, [dashboardData, selectedRefCrn, selectedRefExt]);

    // ✅ 4. FONCTIONS HANDLERS
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
    };

    const handleRefCrnChange = (value) => {
        setSelectedRefCrn(value);
    };

    const handleRefExtChange = (value) => {
        setSelectedRefExt(value);
    };

    const handleStockModalOpen = (depotData) => {
        setSelectedDepotData(depotData);
        setStockModalOpen(true);
    };

    const handleAdvancedAnalysis = (stockData) => {
        setSelectedDepotData(null); // Pas de dépôt spécifique
        setStockModalOpen(true);
    };

    const handleStockModalClose = () => {
        setStockModalOpen(false);
        setSelectedDepotData(null);
    };

    // ✅ 5. RENDU CONDITIONNEL SANS EARLY RETURN AVANT LES HOOKS
    const renderContent = () => {
        if (isLoading) {
            return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        Chargement des données...
                    </Typography>
                </Box>
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
                {/* Section KPI */}
                <DashboardKPISection
                    data={filteredData}
                    isLoading={isLoading}
                />

                {/* Filtres de référence */}
                <RefFiltersSection
                    selectedRefCrn={selectedRefCrn}
                    selectedRefExt={selectedRefExt}
                    onRefCrnChange={handleRefCrnChange}
                    onRefExtChange={handleRefExtChange}
                    data={dashboardData}
                />

                {/* Graphiques */}
                <DashboardChartsSection
                    data={filteredData}
                    isLoading={isLoading}
                />

                {/* Graphique Stock par Dépôt avec bouton Modal */}
                <StockDepotChart
                    data={filteredData}
                    onDepotClick={handleStockModalOpen}
                    onAdvancedAnalysis={handleAdvancedAnalysis}
                />

                {/* Section Tableau */}
                <DashboardTableSection
                    data={filteredData}
                    onProductSelect={handleProductSelect}
                />

                {/* Panel de détail avec historique */}
                {selectedProduct && (
                    <DashboardDetailPanel
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        dashboardData={filteredData}
                    />
                )}

                {/* Modal Stock Avancé avec appel à getHistory */}
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
        <Container maxWidth="xl" sx={{ py: 3 }}>
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
        </Container>
    );
}