import React, { useMemo } from 'react';
import { Box, Container, Typography, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useLayout } from '@/store/hooks/useLayout';
import { useOptimizationData } from '@/features/optimization/hooks/useOptimizationData';
import { useFeatureStates } from '@/store/hooks/useFeatureStates';
import { useTranslation } from '@/store/contexts/LanguageContext';

// Components
import OptimizationKPISection from '@/features/optimization/components/OptimizationKPISection';
import OptimizationChartsSection from '@/features/optimization/components/OptimizationChartsSection';
import OptimizationFiltersSection from '@/features/optimization/components/OptimizationFiltersSection';
import OptimizationTableSection from '@/features/optimization/components/OptimizationTableSection';
import OptimizationDetailPanel from '@/features/optimization/components/OptimizationDetailPanel';
import OptimizationSimulationModal from '@/features/optimization/components/OptimizationSimulationModal';

export default function OptimizationPage() {
    const { t } = useTranslation();
    const { filters } = useLayout();
    const { data: optimizationData, isLoading, isError, error } = useOptimizationData(filters);

    const states = useFeatureStates({
        enableDetailModal: true,
        enableSimulationModal: true,
        enableInsights: true,
        defaultViewMode: 'table',
    });

    const filteredData = useMemo(() => {
        if (!optimizationData?.items) return optimizationData;
        if (!states.qualiteFilter) return optimizationData;

        return {
            ...optimizationData,
            items: optimizationData.items.filter(item => item.qualite === states.qualiteFilter)
        };
    }, [optimizationData, states.qualiteFilter]);

    const hasData = filteredData?.items?.length > 0;

    const totals = useMemo(() => {
        if (!filteredData?.items?.length) return null;

        const items = filteredData.items;
        const totalGroups = items.length;
        const totalGainImmediat = items.reduce((sum, item) => sum + (item.gain_potentiel || 0), 0);
        const totalGain6m = items.reduce((sum, item) => sum + (item.gain_potentiel_6m || 0), 0);
        const totalRefs = items.reduce((sum, item) => sum + (item.refs_total || 0), 0);
        const avgTauxCroissance = totalGroups > 0
            ? items.reduce((sum, item) => sum + (item.taux_croissance || 0), 0) / totalGroups
            : 0;

        return {
            totalGroups,
            totalGainImmediat,
            totalGain6m,
            totalRefs,
            avgTauxCroissance,
        };
    }, [filteredData]);

    const handleOptimizationClick = (optimization) => {
        states.detailModal.open(optimization);
    };

    const handleSimulationClick = (simulationData) => {
        states.simulationModal.open(simulationData);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        {t('optimization.title', 'Optimisation du Catalogue')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('optimization.subtitle', 'Analyse des gains potentiels')}
                    </Typography>
                </Box>

                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                )}

                {isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {t('optimization.error', 'Erreur lors du chargement')}
                        {error?.message && `: ${error.message}`}
                    </Alert>
                )}

                {!isLoading && !isError && !hasData && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        {t('optimization.no_data', 'Aucune donnée disponible')}
                    </Alert>
                )}

                {!isLoading && !isError && hasData && (
                    <>
                        <OptimizationKPISection
                            totals={totals}
                            loading={isLoading}
                        />

                        <OptimizationFiltersSection
                            selectedQualite={states.qualiteFilter}
                            onQualiteChange={states.setQualiteFilter}
                        />

                        {states.insights.isVisible && (
                            <OptimizationChartsSection
                                data={filteredData}
                                loading={isLoading}
                            />
                        )}

                        <OptimizationTableSection
                            data={filteredData}
                            loading={isLoading}
                            onOptimizationClick={handleOptimizationClick}
                            onSimulationClick={handleSimulationClick}
                            viewMode={states.viewMode}
                            onViewModeChange={states.setViewMode}
                        />
                    </>
                )}

                <OptimizationDetailPanel
                    optimization={states.detailModal.data}
                    open={states.detailModal.isOpen}
                    onClose={states.detailModal.close}
                />

                <OptimizationSimulationModal
                    open={states.simulationModal.isOpen}
                    onClose={states.simulationModal.close}
                    data={states.simulationModal.data}
                />
            </motion.div>
        </Container>
    );
}