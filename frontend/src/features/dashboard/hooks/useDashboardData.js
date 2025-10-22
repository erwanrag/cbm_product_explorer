import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/api/services/dashboardService';
import { toast } from 'react-toastify';

export function useDashboardData(filters) {
    const extractedCodPro = useMemo(() => {
        if (!filters?.cod_pro) return null;
        if (typeof filters.cod_pro === 'object' && filters.cod_pro.cod_pro) {
            return filters.cod_pro.cod_pro;
        }
        if (typeof filters.cod_pro === 'number') return filters.cod_pro;
        if (typeof filters.cod_pro === 'string') {
            const parsed = parseInt(filters.cod_pro, 10);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }, [filters?.cod_pro]);

    const queryKey = useMemo(() => [
        'dashboard', 'fiche',
        extractedCodPro,
        filters?.ref_crn || null,
        filters?.ref_ext || null,
        filters?.grouping_crn || 0,
        filters?.qualite || null,
        filters?._forceRefresh || 0
    ], [
        extractedCodPro,
        filters?.ref_crn,
        filters?.ref_ext,
        filters?.grouping_crn,
        filters?.qualite,
        filters?._forceRefresh
    ]);

    const hasActiveFilters = useMemo(() => {
        return !!(extractedCodPro || filters?.ref_crn || filters?.ref_ext);
    }, [extractedCodPro, filters?.ref_crn, filters?.ref_ext]);

    const query = useQuery({
        queryKey,
        queryFn: () => dashboardService.getFiche({
            ...filters,
            cod_pro: extractedCodPro
        }),
        enabled: hasActiveFilters,
        staleTime: 2 * 60 * 1000, // 2 min
        refetchOnWindowFocus: false,
    });
    
    const transformedData = useMemo(() => {
        if (!query.data) return null;

        const { details, sales, stock, purchase, matches, history } = query.data;

        const kpis = {
            totalProducts: details.length,
            totalRevenue: sales.reduce((sum, s) => sum + (s.ca_total || 0), 0),
            averageMargin: sales.length > 0 ?
                sales.reduce((sum, s) => sum + (s.marge_percent_total || 0), 0) / sales.length : 0,
        };

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