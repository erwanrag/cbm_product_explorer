import { useMemo } from 'react';
import { optimizationService } from '@/api/services/optimizationService';
import { useFeatureData } from '@/store/hooks/useFeatureData';

function calculatePriority(item) {
    const gain = item.gain_potentiel || 0;
    const croissance = item.taux_croissance || 0;

    if (gain > 5000 && croissance > 0) return 'high';
    if (gain > 2000 || croissance > 10) return 'medium';
    return 'low';
}

function categorizeGain(gain) {
    if (gain > 10000) return 'high';
    if (gain > 3000) return 'medium';
    return 'low';
}

export function useOptimizationData(filters, options = {}) {
    const transformOptimization = useMemo(() => (data) => {
        if (!data) return null;

        const items = data.items || [];

        const summary = {
            totalGroups: items.length,
            totalGainImmediat: items.reduce((sum, item) => sum + (item.gain_potentiel || 0), 0),
            totalGain6m: items.reduce((sum, item) => sum + (item.gain_potentiel_6m || 0), 0),
            totalRefs: items.reduce((sum, item) => sum + (item.refs_total || 0), 0),
            avgTauxCroissance: items.length > 0
                ? items.reduce((sum, item) => sum + (item.taux_croissance || 0), 0) / items.length
                : 0,
        };

        const enrichedItems = items.map((item) => ({
            ...item,
            priority: calculatePriority(item),
            gainCategory: categorizeGain(item.gain_potentiel),
        }));

        return {
            items: enrichedItems,
            summary,
            metadata: {
                lastUpdate: new Date().toISOString(),
                itemsCount: items.length,
            },
        };
    }, []);

    return useFeatureData(
        'optimization',
        optimizationService.getOptimizationData.bind(optimizationService),
        filters,
        transformOptimization,
        options
    );
}
