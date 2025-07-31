// ===================================
// 📁 frontend/src/features/dashboard/pages/DashboardPage.jsx - AVEC MODAL STOCK
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
    const { filters } = useLayout();
    const { dashboardData, isLoading, isError } = useDashboardData(filters);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // ✅ ÉTATS POUR LES FILTRES REF_CRN ET REF_EXT
    const [selectedRefCrn, setSelectedRefCrn] = useState('');
    const [selectedRefExt, setSelectedRefExt] = useState('');

    // ✅ ÉTAT POUR LE MODAL STOCK AVANCÉ
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedDepotData, setSelectedDepotData] = useState(null);

    // États de chargement et erreur
    if (isLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        Chargement du dashboard...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (isError) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Alert severity="error">
                    Erreur lors du chargement des données du dashboard
                </Alert>
            </Container>
        );
    }

    if (!Object.keys(filters).length || !dashboardData) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Box sx={{
                        textAlign: 'center',
                        py: 8,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px dashed #ccc'
                    }}>
                        <Typography variant="h5" gutterBottom color="text.secondary">
                            🎯 Dashboard CBM GRC Matcher
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Sélectionnez un produit dans les filtres pour commencer l'analyse
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            💡 Utilisez le panneau de filtres à gauche pour rechercher par code produit,
                            référence ou qualité
                        </Typography>
                    </Box>
                </motion.div>
            </Container>
        );
    }

    // ✅ FILTRAGE DES DONNÉES SELON REF_CRN ET REF_EXT
    const filteredDashboardData = useMemo(() => {
        if (!selectedRefCrn && !selectedRefExt) {
            return dashboardData;
        }

        const filteredDetails = dashboardData.details.filter(product => {
            // Filtre ref_crn (via matches)
            const matchRefCrn = !selectedRefCrn || (
                dashboardData.matches?.some(match =>
                    match.cod_pro === product.cod_pro && match.ref_crn === selectedRefCrn
                )
            );

            // Filtre ref_ext (directement sur le produit)
            const matchRefExt = !selectedRefExt || product.ref_ext === selectedRefExt;

            return matchRefCrn && matchRefExt;
        });

        // Filtrer les cod_pro correspondants
        const filteredCodPros = filteredDetails.map(p => p.cod_pro);

        return {
            ...dashboardData,
            details: filteredDetails,
            sales: dashboardData.sales?.filter(s => filteredCodPros.includes(s.cod_pro)) || [],
            history: dashboardData.history?.filter(h => filteredCodPros.includes(h.cod_pro)) || [],
            stock: dashboardData.stock?.filter(s => filteredCodPros.includes(s.cod_pro)) || [],
            purchase: dashboardData.purchase?.filter(p => filteredCodPros.includes(p.cod_pro)) || [],
        };
    }, [dashboardData, selectedRefCrn, selectedRefExt]);

    // ✅ GESTIONNAIRES D'ÉVÉNEMENTS
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
    };

    const handleCloseDetail = () => {
        setSelectedProduct(null);
    };

    const handleDepotClick = (depotData) => {
        console.log('🏪 Dépôt cliqué:', depotData);
        setSelectedDepotData(depotData);
        setStockModalOpen(true);
    };

    const handleStockModalClose = () => {
        setStockModalOpen(false);
        setSelectedDepotData(null);
    };

    const handleRefCrnChange = (value) => {
        setSelectedRefCrn(value);
    };

    const handleRefExtChange = (value) => {
        setSelectedRefExt(value);
    };

    return (
        <>
            <Container
                maxWidth="xl"
                disableGutters
                sx={{
                    px: { xs: 1, sm: 2, md: 3 },
                    py: 2,
                    maxWidth: '1400px !important'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* ✅ HEADER */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                fontSize: { xs: '1.5rem', md: '2rem' }
                            }}
                        >
                            📊 Dashboard Produits
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Analyse de {filteredDashboardData?.details?.length || 0} produit(s) sélectionné(s)
                            {(selectedRefCrn || selectedRefExt) &&
                                ` (filtré depuis ${dashboardData?.details?.length || 0} produits)`
                            }
                        </Typography>
                    </Box>

                    <Box sx={{
                        width: '100%',
                        margin: '0 auto',
                        overflow: 'hidden'
                    }}>

                        {/* ✅ KPIs Section */}
                        <DashboardKPISection
                            data={filteredDashboardData}
                            loading={isLoading}
                        />

                        {/* ✅ Charts Section */}
                        <DashboardChartsSection
                            data={filteredDashboardData}
                            loading={isLoading}
                        />

                        {/* ✅ Section Stock par Dépôt */}
                        <Box sx={{ mb: 3 }}>
                            <StockDepotChart
                                data={filteredDashboardData}
                                onDepotClick={handleDepotClick}
                            />
                        </Box>

                        {/* ✅ Filtres Références */}
                        <RefFiltersSection
                            data={dashboardData} // Données complètes pour les listes
                            selectedRefCrn={selectedRefCrn}
                            selectedRefExt={selectedRefExt}
                            onRefCrnChange={handleRefCrnChange}
                            onRefExtChange={handleRefExtChange}
                        />

                        {/* ✅ Table Section avec données filtrées */}
                        <DashboardTableSection
                            data={filteredDashboardData}
                            onProductSelect={handleProductSelect}
                        />
                    </Box>
                </motion.div>
            </Container>

            {/* ✅ PANEL DE DÉTAILS PRODUIT */}
            <DashboardDetailPanel
                product={selectedProduct}
                onClose={handleCloseDetail}
                dashboardData={filteredDashboardData}
            />

            {/* ✅ MODAL STOCK AVANCÉ */}
            <StockAdvancedModal
                open={stockModalOpen}
                onClose={handleStockModalClose}
                data={filteredDashboardData}
                selectedDepot={selectedDepotData}
            />
        </>
    );
}