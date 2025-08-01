// ===================================
// 📁 frontend/src/features/optimization/pages/OptimizationPage.jsx
// ===================================

import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useLayout } from '@/store/hooks/useLayout';
import { useOptimizationData } from '@/features/optimization/hooks/useOptimizationData';

// Components
import OptimizationKPISection from '@/features/optimization/components/OptimizationKPISection';
import OptimizationChartsSection from '@/features/optimization/components/OptimizationChartsSection';
import OptimizationFiltersSection from '@/features/optimization/components/OptimizationFiltersSection';
import OptimizationTableSection from '@/features/optimization/components/OptimizationTableSection';
import OptimizationDetailPanel from '@/features/optimization/components/OptimizationDetailPanel';
import OptimizationSimulationModal from '@/features/optimization/components/OptimizationSimulationModal';

export default function OptimizationPage() {
    // ✅ 1. TOUS LES HOOKS EN PREMIER - ORDRE FIXE
    const { filters } = useLayout();
    const { optimizationData, isLoading, isError } = useOptimizationData(filters);

    // ✅ 2. TOUS LES useState ENSEMBLE
    const [selectedOptimization, setSelectedOptimization] = useState(null);
    const [selectedGroupingCrn, setSelectedGroupingCrn] = useState('');
    const [selectedQualite, setSelectedQualite] = useState('');
    const [simulationModalOpen, setSimulationModalOpen] = useState(false);
    const [selectedSimulationData, setSelectedSimulationData] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table', 'charts', 'summary'

    // ✅ 3. TOUS LES useMemo/useCallback ENSEMBLE
    const hasData = useMemo(() => {
        return optimizationData && optimizationData.items && optimizationData.items.length > 0;
    }, [optimizationData]);

    const filteredData = useMemo(() => {
        if (!optimizationData?.items) return null;

        let filtered = [...optimizationData.items];

        // Filtrage par Grouping CRN
        if (selectedGroupingCrn) {
            filtered = filtered.filter(item =>
                item.grouping_crn && item.grouping_crn.toString().includes(selectedGroupingCrn)
            );
        }

        // Filtrage par Qualité
        if (selectedQualite) {
            filtered = filtered.filter(item =>
                item.qualite && item.qualite.toLowerCase().includes(selectedQualite.toLowerCase())
            );
        }

        return { items: filtered };
    }, [optimizationData, selectedGroupingCrn, selectedQualite]);

    const totals = useMemo(() => {
        if (!filteredData?.items) return {};

        return {
            totalGroups: filteredData.items.length,
            totalGainImmediat: filteredData.items.reduce((sum, item) => sum + (item.gain_potentiel || 0), 0),
            totalGain6m: filteredData.items.reduce((sum, item) => sum + (item.gain_potentiel_6m || 0), 0),
            totalRefs: filteredData.items.reduce((sum, item) => sum + (item.refs_total || 0), 0),
            avgTauxCroissance: filteredData.items.length > 0
                ? filteredData.items.reduce((sum, item) => sum + (item.taux_croissance || 0), 0) / filteredData.items.length
                : 0
        };
    }, [filteredData]);

    // ✅ 4. FONCTIONS HANDLERS
    const handleOptimizationSelect = (optimization) => {
        setSelectedOptimization(optimization);
    };

    const handleGroupingCrnChange = (value) => {
        setSelectedGroupingCrn(value);
    };

    const handleQualiteChange = (value) => {
        setSelectedQualite(value);
    };

    const handleSimulationModalOpen = (optimizationData) => {
        setSelectedSimulationData(optimizationData);
        setSimulationModalOpen(true);
    };

    const handleSimulationModalClose = () => {
        setSimulationModalOpen(false);
        setSelectedSimulationData(null);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    // ✅ 5. RENDU CONDITIONNEL SANS EARLY RETURN AVANT LES HOOKS
    const renderContent = () => {
        if (isLoading) {
            return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        Chargement de l'analyse d'optimisation...
                    </Typography>
                </Box>
            );
        }

        if (isError) {
            return (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Erreur lors du chargement des données d'optimisation. Veuillez réessayer.
                </Alert>
            );
        }

        if (!hasData) {
            return (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Aucune donnée d'optimisation disponible pour les filtres sélectionnés.
                </Alert>
            );
        }

        return (
            <>
                {/* Section KPI */}
                <OptimizationKPISection
                    data={filteredData}
                    totals={totals}
                    isLoading={isLoading}
                />

                {/* Filtres d'optimisation */}
                <OptimizationFiltersSection
                    selectedGroupingCrn={selectedGroupingCrn}
                    selectedQualite={selectedQualite}
                    onGroupingCrnChange={handleGroupingCrnChange}
                    onQualiteChange={handleQualiteChange}
                    data={optimizationData}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                />

                {/* Graphiques */}
                {viewMode === 'charts' && (
                    <OptimizationChartsSection
                        data={filteredData}
                        isLoading={isLoading}
                    />
                )}

                {/* Section Tableau */}
                {viewMode === 'table' && (
                    <OptimizationTableSection
                        data={filteredData}
                        onOptimizationSelect={handleOptimizationSelect}
                        onSimulationOpen={handleSimulationModalOpen}
                    />
                )}

                {/* Panel de détail avec historique */}
                {selectedOptimization && (
                    <OptimizationDetailPanel
                        optimization={selectedOptimization}
                        onClose={() => setSelectedOptimization(null)}
                        optimizationData={filteredData}
                    />
                )}

                {/* Modal Simulation avec appel à l'API */}
                <OptimizationSimulationModal
                    open={simulationModalOpen}
                    onClose={handleSimulationModalClose}
                    data={selectedSimulationData}
                />
            </>
        );
    };

    // ✅ 6. RENDU PRINCIPAL
    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Optimisation Catalogue
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Analyse des gains potentiels par groupe et qualité
                    </Typography>
                </Box>

                {renderContent()}
            </motion.div>
        </Container>
    );
}