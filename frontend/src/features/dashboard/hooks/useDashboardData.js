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
