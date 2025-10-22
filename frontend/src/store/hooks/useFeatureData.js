import { useMemo } from 'react';
import { useApiData } from '@/store/hooks/useApiData';

export function useFeatureData(featureName, apiFunction, filters, transformData = null, options = {}) {
    const { data, isLoading, isError, error, refetch, isFetching, hasActiveFilters, hasData } = 
        useApiData(featureName, apiFunction, filters, options);

    const transformedData = useMemo(() => {
        if (!data) return null;
        if (!transformData) return data;
        return transformData(data);
    }, [data, transformData]);

    return {
        data: transformedData,
        rawData: data,
        isLoading,
        isError,
        isFetching,
        hasData,
        hasActiveFilters,
        error,
        refetch,
        refreshData: refetch,
        [`${featureName}Data`]: transformedData,
    };
}