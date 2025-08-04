// ===================================
// 📁 frontend/src/features/optimization/pages/OptimizationPage.jsx - VERSION CORRIGÉE
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
    const { data: optimizationData, isLoading, isError, error } = useOptimizationData(filters);

    // ✅ 2. TOUS LES useState ENSEMBLE - SUPPRIMÉ selectedGroupingCrn
    const [selectedOptimization, setSelectedOptimization] = useState(null);
    const [selectedQualite, setSelectedQualite] = useState('');
    const [simulationModalOpen, setSimulationModalOpen] = useState(false);
    const [selectedSimulationData, setSelectedSimulationData] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table', 'charts', 'summary'

    // ✅ 3. FILTRAGE AVEC LOGIQUE PMQ/PMV FRONTEND
    const filteredData = useMemo(() => {
        if (!optimizationData?.items) return { items: [] };

        let filtered = [...optimizationData.items];

        // Filtrage par Qualité avec logique PMQ/PMV
        if (selectedQualite) {
            if (selectedQualite === 'PMQ') {
                // PMQ inclut PMQ + PMV
                filtered = filtered.filter(item =>
                    item.qualite === 'PMQ' || item.qualite === 'PMV'
                );

                // Regroupement PMQ/PMV par grouping_crn avec priorité PMV
                const grouped = {};
                filtered.forEach(item => {
                    const key = item.grouping_crn;
                    if (!grouped[key]) {
                        grouped[key] = item;
                    } else {
                        // Priorité PMV sur PMQ
                        if (item.qualite === 'PMV' && grouped[key].qualite === 'PMQ') {
                            grouped[key] = item;
                        }
                        // Si même qualité, garder celui avec meilleur gain
                        else if (item.qualite === grouped[key].qualite &&
                            item.gain_potentiel > grouped[key].gain_potentiel) {
                            grouped[key] = item;
                        }
                    }
                });

                filtered = Object.values(grouped);
            } else {
                // Filtre normal pour OEM, OE, etc.
                filtered = filtered.filter(item =>
                    item.qualite === selectedQualite
                );
            }
        }

        return { items: filtered };
    }, [optimizationData, selectedQualite]);

    // ✅ 4. VÉRIFICATION hasData APRÈS filteredData
    const hasData = useMemo(() => {
        return filteredData && filteredData.items && filteredData.items.length > 0;
    }, [filteredData]);

    // ✅ 5. CALCULS TOTAUX
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
            avgTauxCroissance
        };
    }, [filteredData]);

    // ✅ 6. FONCTIONS HANDLERS
    const handleOptimizationSelect = (optimization) => {
        setSelectedOptimization(optimization);
    };

    const handleQualiteChange = (value) => {
        setSelectedQualite(value);
        setSelectedOptimization(null); // Reset sélection
    };

    const handleSimulationModalOpen = (optimizationData) => {
        // S'assurer que c'est un array
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

    // ✅ 7. RENDU CONDITIONNEL
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
                {/* FILTRES EN PREMIER (se mettent à jour avec KPI) */}
                <OptimizationFiltersSection
                    selectedQualite={selectedQualite}
                    onQualiteChange={handleQualiteChange}
                    data={optimizationData} // Données non filtrées pour stats
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                />

                {/* Section KPI (mise à jour avec filtres) */}
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

    // ✅ 8. RENDU PRINCIPAL
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

