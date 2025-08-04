// ===================================
// 📁 frontend/src/features/optimization/pages/OptimizationPage.jsx - COMPLET
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
    // ✅ Hooks
    const { filters } = useLayout();
    const { data: optimizationData, isLoading, isError, error } = useOptimizationData(filters);

    // ✅ États locaux
    const [selectedOptimization, setSelectedOptimization] = useState(null);
    const [selectedQualite, setSelectedQualite] = useState('');
    const [simulationModalOpen, setSimulationModalOpen] = useState(false);
    const [selectedSimulationData, setSelectedSimulationData] = useState(null);
    const [viewMode, setViewMode] = useState('table');

    // ✅ Filtrage des données par qualité
    const filteredData = useMemo(() => {
        if (!optimizationData?.items) return optimizationData;

        if (!selectedQualite) return optimizationData;

        return {
            ...optimizationData,
            items: optimizationData.items.filter(item => item.qualite === selectedQualite)
        };
    }, [optimizationData, selectedQualite]);

    // Vérification des données
    const hasData = filteredData?.items?.length > 0;

    // ✅ Calculs des totaux - AVEC LES NOUVEAUX CHAMPS
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

        // ✅ NOUVEAUX CHAMPS du backend
        const totalMargeActuelle6m = items.reduce((sum, item) => sum + (item.marge_actuelle_6m || 0), 0);
        const totalMargeOptimisee6m = items.reduce((sum, item) => sum + (item.marge_optimisee_6m || 0), 0);

        return {
            totalGroups,
            totalGainImmediat,
            totalGain6m,
            totalRefs,
            avgTauxCroissance,
            totalMargeActuelle6m,
            totalMargeOptimisee6m
        };
    }, [filteredData]);

    // ✅ Handlers
    const handleOptimizationSelect = (optimization) => {
        setSelectedOptimization(optimization);
    };

    const handleQualiteChange = (value) => {
        setSelectedQualite(value);
        setSelectedOptimization(null);
    };

    const handleSimulationModalOpen = (optimizationData) => {
        const dataArray = Array.isArray(optimizationData) ? optimizationData : [optimizationData];
        setSelectedSimulationData(dataArray);
        setSimulationModalOpen(true);
    };

    const handleSimulationModalClose = () => {
        setSimulationModalOpen(false);
        setSelectedSimulationData(null);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    // ✅ Rendu conditionnel
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
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Erreur lors du chargement des données d'optimisation
                    </Typography>
                    {error && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                            Erreur: {error.message}
                        </Typography>
                    )}
                </Alert>
            );
        }

        if (!hasData) {
            return (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        Aucune donnée d'optimisation disponible pour les filtres sélectionnés.
                    </Typography>
                </Alert>
            );
        }

        return (
            <>
                {/* Section Filtres */}
                <OptimizationFiltersSection
                    selectedQualite={selectedQualite}
                    onQualiteChange={handleQualiteChange}
                    data={optimizationData}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                />

                {/* Section KPI */}
                <OptimizationKPISection
                    data={filteredData}
                    totals={totals}
                    isLoading={isLoading}
                />

                {/* Graphiques */}
                {viewMode === 'charts' && (
                    <OptimizationChartsSection
                        data={filteredData}
                        isLoading={isLoading}
                    />
                )}

                {/* Tableau */}
                {viewMode === 'table' && (
                    <OptimizationTableSection
                        data={filteredData}
                        onOptimizationSelect={handleOptimizationSelect}
                        onSimulationOpen={handleSimulationModalOpen}
                    />
                )}

                {/* Panel de détail */}
                {selectedOptimization && (
                    <OptimizationDetailPanel
                        optimization={selectedOptimization}
                        onClose={() => setSelectedOptimization(null)}
                        optimizationData={filteredData}
                    />
                )}

                {/* Modal Simulation */}
                <OptimizationSimulationModal
                    open={simulationModalOpen}
                    onClose={handleSimulationModalClose}
                    data={selectedSimulationData}
                />
            </>
        );
    };

    // ✅ Rendu principal
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
                        Analyse des économies potentielles par rationalisation gamme
                    </Typography>
                </Box>

                {renderContent()}
            </motion.div>
        </Container>
    );
}