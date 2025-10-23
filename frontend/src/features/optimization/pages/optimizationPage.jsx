// ===================================
// 📁 frontend/src/features/optimization/pages/OptimizationPage.jsx
// ✅ VERSION CORRIGÉE - Gestion d'erreurs et compatibilité
// ===================================

import React, { useMemo, useState } from 'react';
import { Box, Typography, Alert, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useOptimizationData } from '../hooks/useOptimizationData';
import { useFeatureStates } from '@/store/hooks/useFeatureStates';
import { useLayout } from '@/store/hooks/useLayout';
import { ExportExcelButton } from '@/shared/components/export';

// Components
import OptimizationKPISection from '../components/OptimizationKPISection';
import OptimizationChartsSection from '../components/OptimizationChartsSection';
import OptimizationFiltersSection from '../components/OptimizationFiltersSection';
import OptimizationTableSection from '../components/OptimizationTableSection';
import OptimizationDetailPanel from '../components/OptimizationDetailPanel';
import OptimizationSimulationModal from '../components/OptimizationSimulationModal';

export default function OptimizationPage() {
    const { filters } = useLayout();
    
    // ✅ États features
    const states = useFeatureStates({
        enableDetailModal: true,
        enableSimulationModal: true,
        enableInsights: true,
        defaultViewMode: 'table',
    });

    // ✅ Chargement des données avec gestion d'erreur
    const { 
        data: optimizationData, 
        isLoading, 
        isError, 
        error,
        refetch 
    } = useOptimizationData(filters);

    // ✅ Filtres locaux
    const [qualiteFilter, setQualiteFilter] = useState('');
    const [minGainFilter, setMinGainFilter] = useState(0);
    const [minRefsFilter, setMinRefsFilter] = useState(0);

    // ✅ Données filtrées
    const filteredData = useMemo(() => {
        if (!optimizationData?.items) return null;

        let filtered = [...optimizationData.items];

        if (qualiteFilter) {
            filtered = filtered.filter(item => item.qualite === qualiteFilter);
        }

        if (minGainFilter > 0) {
            filtered = filtered.filter(item => 
                (item.gain_potentiel || 0) >= minGainFilter
            );
        }

        if (minRefsFilter > 0) {
            filtered = filtered.filter(item => 
                (item.refs_total || 0) >= minRefsFilter
            );
        }

        return {
            ...optimizationData,
            items: filtered
        };
    }, [optimizationData, qualiteFilter, minGainFilter, minRefsFilter]);

    // ✅ Calcul des totaux
    const totals = useMemo(() => {
        if (!filteredData?.items?.length) return null;

        const items = filteredData.items;
        return {
            totalGroups: items.length,
            totalGainImmediat: items.reduce((sum, item) => sum + (item.gain_potentiel || 0), 0),
            totalGain6m: items.reduce((sum, item) => sum + (item.gain_potentiel_6m || 0), 0),
            totalRefs: items.reduce((sum, item) => sum + (item.refs_total || 0), 0),
            avgTauxCroissance: items.length > 0
                ? items.reduce((sum, item) => sum + (item.taux_croissance_mo || 0), 0) / items.length
                : 0
        };
    }, [filteredData]);

    // ✅ Export data
    const exportData = useMemo(() => {
        if (!filteredData?.items?.length) return [];

        return filteredData.items.map(item => ({
            'Groupe CRN': item.grouping_crn,
            'Qualité': item.qualite,
            'Refs Total': item.refs_total,
            'Refs à Garder': item.refs_to_keep,
            'Refs à Supprimer': item.refs_to_delete,
            'Gain Immédiat': item.gain_potentiel?.toFixed(2) || 0,
            'Gain 6M': item.gain_potentiel_6m?.toFixed(2) || 0,
            'Taux Croissance': item.taux_croissance_mo?.toFixed(2) || 0,
        }));
    }, [filteredData]);

    // ✅ Handlers
    const handleOptimizationClick = (optimization) => {
        if (states.detailModal) {
            states.detailModal.open(optimization);
        }
    };

    const handleSimulationClick = (optimization) => {
        if (states.simulationModal) {
            states.simulationModal.open(optimization);
        }
    };

    // ===================================
    // 🎨 Rendu principal
    // ===================================

    return (
        <Box sx={{ p: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* HEADER */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 3,
                        alignItems: 'center',
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={600}>
                            Optimisation du Catalogue
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Analyse des gains potentiels par rationalisation de gamme
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Rafraîchir les données">
                            <IconButton onClick={refetch}>
                                <Refresh />
                            </IconButton>
                        </Tooltip>

                        <ExportExcelButton
                            data={exportData}
                            filename="optimisation_cbm_export"
                            sheetName="Optimisations"
                        />
                    </Box>
                </Box>

                {/* États de chargement et erreurs */}
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            Erreur de chargement
                        </Typography>
                        <Typography variant="body2">
                            {error?.message || "Impossible de charger les données d'optimisation"}
                        </Typography>
                    </Alert>
                )}

                {!optimizationData && !isLoading && !isError && (
                    <Alert severity="info">
                        Aucune donnée d'optimisation disponible pour les filtres sélectionnés
                    </Alert>
                )}

                {/* Contenu principal */}
                {!isLoading && filteredData && (
                    <>
                        {/* Filtres */}
                        <OptimizationFiltersSection
                            qualiteFilter={qualiteFilter}
                            onQualiteChange={setQualiteFilter}
                            minGainFilter={minGainFilter}
                            onMinGainChange={setMinGainFilter}
                            minRefsFilter={minRefsFilter}
                            onMinRefsChange={setMinRefsFilter}
                            availableQualities={[...new Set(
                                optimizationData.items?.map(item => item.qualite) || []
                            )].filter(Boolean)}
                        />

                        {/* KPIs */}
                        {totals && (
                            <OptimizationKPISection
                                totals={totals}
                                loading={isLoading}
                            />
                        )}

                        {/* Charts */}
                        {states.insights?.isVisible && (
                            <OptimizationChartsSection
                                data={filteredData}
                                loading={isLoading}
                            />
                        )}

                        {/* Table */}
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

                {/* Modals */}
                {states.detailModal && (
                    <OptimizationDetailPanel
                        optimization={states.detailModal.data}
                        open={states.detailModal.isOpen}
                        onClose={states.detailModal.close}
                    />
                )}

                {states.simulationModal && (
                    <OptimizationSimulationModal
                        open={states.simulationModal.isOpen}
                        onClose={states.simulationModal.close}
                        data={states.simulationModal.data}
                    />
                )}
            </motion.div>
        </Box>
    );
}