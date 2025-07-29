// frontend/src/features/dashboard/DashboardPage.jsx - VERSION PROPRE
import React, { useEffect, useState } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import { Refresh, Analytics } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks enterprise
import { useProductData } from '@/store/hooks/useProductData';
import { useAppState } from '@/store/contexts/AppStateContext';

// Composants partitionnés
import DashboardHeader from './components/DashboardHeader';
import DashboardKPISection from './components/DashboardKPISection';
import DashboardChartsSection from './components/DashboardChartsSection';
import DashboardTableSection from './components/DashboardTableSection';
import ProductAnalysisDrawer from './components/ProductAnalysisDrawer';
import DashboardEmptyState from './components/DashboardEmptyState';
import DashboardErrorState from './components/DashboardErrorState';

// Hooks métier spécialisés
import { useDashboardData } from './hooks/useDashboardData';
import { useDashboardActions } from './hooks/useDashboardActions';

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

// frontend/src/features/dashboard/hooks/useDashboardData.js
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/api/services';
import { toast } from 'react-toastify';

/**
 * Hook métier pour la gestion des données dashboard
 * Encapsule toute la logique de chargement et transformation
 */
export function useDashboardData(filters) {
    const hasActiveFilters = Object.keys(filters || {}).length > 0;

    // Query principale
    const query = useQuery({
        queryKey: ['dashboard', 'fiche', filters],
        queryFn: () => dashboardService.getFiche(filters),
        enabled: hasActiveFilters,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchInterval: 5 * 60 * 1000, // Auto-refresh 5 min
        onSuccess: (data) => {
            const count = data?.details?.length || 0;
            if (count === 0) {
                toast.info('Aucun produit trouvé pour les filtres sélectionnés');
            } else {
                toast.success(`${count} produit(s) chargé(s)`);
            }
        },
        onError: (error) => {
            console.error('Erreur dashboard:', error);
            toast.error('Impossible de charger les données dashboard');
        }
    });

    // Transformation des données
    const transformedData = useMemo(() => {
        if (!query.data) return null;

        const { details, sales, stock, purchase, matches, history } = query.data;

        // Enrichissement des données produits
        const enrichedProducts = details.map(product => ({
            ...product,
            ...enrichProductWithMetrics(product, sales, stock, purchase)
        }));

        return {
            ...query.data,
            details: enrichedProducts,
            kpis: calculateKPIs(enrichedProducts, sales, stock, purchase),
            chartData: prepareChartData(history, sales)
        };
    }, [query.data]);

    return {
        dashboardData: transformedData,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refreshData: query.refetch,
        isFetching: query.isFetching
    };
}

// Fonctions utilitaires extraites
function enrichProductWithMetrics(product, sales, stock, purchase) {
    const productSales = sales.find(s => s.cod_pro === product.cod_pro) || {};
    const productStock = stock.filter(s => s.cod_pro === product.cod_pro);
    const productPurchase = purchase.find(p => p.cod_pro === product.cod_pro) || {};

    const stockTotal = productStock.reduce((sum, s) => sum + (s.stock || 0), 0);
    const stockValue = productStock.reduce((sum, s) => sum + (s.stock || 0) * (s.pmp || 0), 0);

    return {
        ca_total: productSales.ca_total || 0,
        quantite_total: productSales.quantite_total || 0,
        marge_percent_total: productSales.marge_percent_total || 0,
        stock_total: stockTotal,
        stock_value: stockValue,
        px_achat_eur: productPurchase.px_achat_eur || 0,
        performance_score: calculatePerformanceScore(productSales, stockTotal)
    };
}

function calculateKPIs(products, sales, stock, purchase) {
    return {
        totalProducts: products.length,
        totalRevenue: sales.reduce((sum, s) => sum + (s.ca_total || 0), 0),
        totalQuantity: sales.reduce((sum, s) => sum + (s.quantite_total || 0), 0),
        averageMargin: sales.length > 0
            ? sales.reduce((sum, s) => sum + (s.marge_percent_total || 0), 0) / sales.length
            : 0,
        totalStockValue: stock.reduce((sum, s) => sum + (s.stock || 0) * (s.pmp || 0), 0),
        lowStockItems: stock.filter(s => (s.stock || 0) < 10).length,
        topSupplier: calculateTopSupplier(products, sales)
    };
}

function calculateTopSupplier(products, sales) {
    const supplierMap = sales.reduce((acc, s) => {
        const product = products.find(p => p.cod_pro === s.cod_pro);
        if (product?.nom_fou) {
            acc[product.nom_fou] = (acc[product.nom_fou] || 0) + (s.ca_total || 0);
        }
        return acc;
    }, {});

    const [name, revenue] = Object.entries(supplierMap)
        .sort(([, a], [, b]) => b - a)[0] || ['Aucun', 0];

    return { name, revenue };
}

function prepareChartData(history, sales) {
    if (!history?.length) return null;

    const monthlyData = history.reduce((acc, item) => {
        const period = item.periode;
        if (!acc[period]) {
            acc[period] = { ca: 0, marge: 0, quantity: 0 };
        }
        acc[period].ca += item.ca || 0;
        acc[period].marge += item.marge || 0;
        acc[period].quantity += item.quantite || 0;
        return acc;
    }, {});

    const sortedPeriods = Object.keys(monthlyData).sort();

    return {
        periods: sortedPeriods,
        revenue: sortedPeriods.map(p => monthlyData[p].ca),
        margin: sortedPeriods.map(p => monthlyData[p].marge),
        quantity: sortedPeriods.map(p => monthlyData[p].quantity)
    };
}

function calculatePerformanceScore(sales, stock) {
    const revenue = sales.ca_total || 0;
    const margin = sales.marge_percent_total || 0;

    let score = 0;
    if (revenue > 10000) score += 40;
    else if (revenue > 5000) score += 25;
    else if (revenue > 1000) score += 15;

    if (margin > 20) score += 30;
    else if (margin > 10) score += 20;
    else if (margin > 5) score += 10;

    if (stock > 50) score += 20;
    else if (stock > 20) score += 15;
    else if (stock > 10) score += 10;
    else if (stock > 0) score += 5;

    if (stock === 0 && revenue === 0) score = 0;

    return Math.min(score, 100);
}

// frontend/src/features/dashboard/hooks/useDashboardActions.js
import { useState, useCallback } from 'react';
import { useAppState } from '@/store/contexts/AppStateContext';
import { toast } from 'react-toastify';

/**
 * Hook pour les actions dashboard
 * Centralise toute la logique d'interaction utilisateur
 */
export function useDashboardActions() {
    const { actions } = useAppState();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('overview');

    const handleProductSelect = useCallback((product) => {
        setSelectedProduct(product);
        actions.setCurrentProduct(product);
    }, [actions]);

    const handleExport = useCallback(async (data) => {
        try {
            // Logique d'export CSV optimisée
            const csv = generateCSV(data);
            downloadFile(csv, `dashboard-export-${Date.now()}.csv`);
            toast.success('Export réussi');
        } catch (error) {
            toast.error('Erreur lors de l\'export');
        }
    }, []);

    const handleViewModeChange = useCallback((mode) => {
        setViewMode(mode);
        actions.setActiveView(mode);
    }, [actions]);

    return {
        selectedProduct,
        viewMode,
        handleProductSelect,
        handleExport,
        handleViewModeChange
    };
}

function generateCSV(data) {
    if (!data?.rows || !data?.columns) return '';

    const headers = data.columns.map(col => col.headerName).join(';');
    const rows = data.rows.map(row =>
        data.columns.map(col => row[col.field] || '').join(';')
    ).join('\n');

    return `${headers}\n${rows}`;
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// frontend/src/features/dashboard/components/DashboardHeader.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import QuickActionsMenu from './QuickActionsMenu';

/**
 * Header du dashboard - Composant focalisé
 */
export default function DashboardHeader({
    productCount,
    onRefresh,
    onExport,
    onViewModeChange,
    viewMode,
    loading
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        📊 Dashboard Produits
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Analyse en temps réel • {productCount} produit(s) •
                        Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                    </Typography>
                </Box>

                <QuickActionsMenu
                    onRefresh={onRefresh}
                    onExport={onExport}
                    onViewModeChange={onViewModeChange}
                    currentViewMode={viewMode}
                    loading={loading}
                />
            </Box>
        </motion.div>
    );
}
