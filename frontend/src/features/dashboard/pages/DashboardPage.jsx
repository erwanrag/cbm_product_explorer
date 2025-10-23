// ===================================
// 📁 DashboardPage.jsx - VERSION FINALE
// ===================================

import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useLayout } from '@/store/hooks/useLayout';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useTranslation } from '@/store/contexts/LanguageContext';

// Components
import DashboardKPISection from '@/features/dashboard/components/DashboardKPISection';
import DashboardChartsSection from '@/features/dashboard/components/DashboardChartsSection';
import RefFiltersSection from '@/features/dashboard/components/RefFiltersSection';
import StockDepotChart from '@/features/dashboard/components/StockDepotChart';
import DashboardTableSection from '@/features/dashboard/components/DashboardTableSection';
import DashboardDetailPanel from '@/features/dashboard/components/DashboardDetailPanel';
import StockAdvancedModal from '@/features/dashboard/components/StockAdvancedModal';

export default function DashboardPage() {
    const { t } = useTranslation();
    
    // ✅ 1. TOUS LES HOOKS DANS L'ORDRE STRICT
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

    // ✅ CALCULER LES KPIs
    const kpis = useMemo(() => {
        if (!filteredData?.details || filteredData.details.length === 0) {
            return {
                totalProducts: 0,
                totalRevenue: 0,
                averageMargin: 0,
                totalQuantity: 0,
            };
        }

        const details = filteredData.details;
        
        return {
            totalProducts: details.length,
            totalRevenue: details.reduce((sum, p) => sum + (p.ca_total || 0), 0),
            averageMargin: details.length > 0 
                ? details.reduce((sum, p) => sum + (p.marge_percent_total || 0), 0) / details.length 
                : 0,
            totalQuantity: details.reduce((sum, p) => sum + (p.quantite_total || 0), 0),
        };
    }, [filteredData]);

    // ✅ 5. FONCTIONS DE RENDU
    const renderContent = () => {
        if (isLoading) {
            return (
                <Alert severity="info" sx={{ mb: 3 }}>
                    {t('common.loading', 'Chargement des données...')}
                </Alert>
            );
        }

        if (isError) {
            return (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {t('dashboard.error.loading', 'Erreur lors du chargement des données. Veuillez réessayer.')}
                </Alert>
            );
        }

        if (!hasData) {
            return (
                <Alert severity="info" sx={{ mb: 3 }}>
                    {t('dashboard.no_data', 'Aucune donnée disponible pour les filtres sélectionnés.')}
                </Alert>
            );
        }

        return (
            <>
                <DashboardKPISection kpis={kpis} loading={isLoading} />
                
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
                        open={Boolean(selectedProduct)}
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
                        {t('dashboard.title', 'Tableau de Bord CBM')}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {t('dashboard.subtitle', 'Vue d\'ensemble des données produits, ventes et stocks')}
                    </Typography>
                </Box>

                {renderContent()}
            </motion.div>
        </Box>
    );
}