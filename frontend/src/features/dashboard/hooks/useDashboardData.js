// ===================================
// 📁 frontend/src/features/dashboard/hooks/useDashboardData.js - VERSION ORIGINALE QUI MARCHE
// ===================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/api/services/dashboardService';
import { toast } from 'react-toastify';

export function useDashboardData(filters) {
    const hasActiveFilters = Object.keys(filters || {}).length > 0;

    const query = useQuery({
        queryKey: ['dashboard', 'fiche', filters],
        queryFn: () => dashboardService.getFiche(filters),
        enabled: hasActiveFilters,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            const count = data?.details?.length || 0;
            if (count === 0) {
                toast.info('Aucun produit trouvé');
            } else {
                toast.success(`${count} produit(s) chargé(s)`);
            }
        },
        onError: (error) => {
            console.error('Erreur dashboard:', error);
            toast.error('Impossible de charger les données');
        },
    });

    const transformedData = useMemo(() => {
        if (!query.data) return null;

        const { details, sales, stock, purchase, matches, history } = query.data;

        // KPIs corrects - que 3 utiles
        const kpis = {
            totalProducts: details.length,
            totalRevenue: sales.reduce((sum, s) => sum + (s.ca_total || 0), 0),
            averageMargin: sales.length > 0 ?
                sales.reduce((sum, s) => sum + (s.marge_percent_total || 0), 0) / sales.length : 0,
        };

        // Enrichissement des produits
        const enrichedProducts = details.map((product) => {
            const productSales = sales.find(s => s.cod_pro === product.cod_pro) || {};
            const productStock = stock.filter(s => s.cod_pro === product.cod_pro);
            const productPurchase = purchase.find(p => p.cod_pro === product.cod_pro) || {};

            const stockTotal = productStock.reduce((sum, s) => sum + (s.stock || 0), 0);

            return {
                ...product,
                ca_total: productSales.ca_total || 0,
                quantite_total: productSales.quantite_total || 0,
                marge_percent_total: productSales.marge_percent_total || 0,
                stock_total: stockTotal,
                px_achat_eur: productPurchase.px_achat_eur || 0,
                pmp: productStock[0]?.pmp || 0,
            };
        });

        return {
            details: enrichedProducts,
            sales,
            stock,
            purchase,
            matches,
            history,
            kpis,
        };
    }, [query.data]);

    return {
        dashboardData: transformedData,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refreshData: query.refetch,
        isFetching: query.isFetching,
    };
}
