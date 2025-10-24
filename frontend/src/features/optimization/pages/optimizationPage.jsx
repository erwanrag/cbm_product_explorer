// ===================================
// 📁 frontend/src/features/optimization/pages/OptimizationPage.jsx
// ✅ VERSION FINALE - Export dans header
// ===================================

import React, { useMemo, useState } from 'react';
import { Box, Typography, Alert, IconButton, CircularProgress, Paper, Collapse, Tooltip } from '@mui/material';
import { Refresh, HelpOutline } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useOptimizationData } from '../hooks/useOptimizationData';
import { useLayout } from '@/store/hooks/useLayout';
import { ExportExcelButton } from '@/shared/components/export';

// Components
import OptimizationKPISection from '../components/OptimizationKPISection';
import OptimizationChartsSection from '../components/OptimizationChartsSection';
import OptimizationFiltersSection from '../components/OptimizationFiltersSection';
import OptimizationTableSection from '../components/OptimizationTableSection';
import OptimizationDetailPanel from '../components/OptimizationDetailPanel';

export default function OptimizationPage() {
    const { filters } = useLayout();
    
    // Chargement des données
    const { 
        data: optimizationData, 
        isLoading, 
        isError, 
        error,
        refetch 
    } = useOptimizationData(filters);

    // États locaux
    const [selectedQualite, setSelectedQualite] = useState('');
    const [viewMode, setViewMode] = useState('all');
    const [selectedOptimization, setSelectedOptimization] = useState(null);
    const [detailPanelOpen, setDetailPanelOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    // Données filtrées
    const filteredData = useMemo(() => {
        if (!optimizationData?.items) return null;

        let filtered = [...optimizationData.items];

        if (selectedQualite) {
            if (selectedQualite === 'PMQ') {
                filtered = filtered.filter(item => 
                    item.qualite === 'PMQ' || item.qualite === 'PMV'
                );
            } else {
                filtered = filtered.filter(item => 
                    item.qualite === selectedQualite
                );
            }
        }

        return {
            items: filtered,
            count: filtered.length
        };
    }, [optimizationData, selectedQualite]);

    // Totaux
    
    const totals = useMemo(() => {
    if (!filteredData?.items?.length) return null;

    const items = filteredData.items;

    // ✅ On définit refsByQualite AVANT de le retourner
    const refsByQualite = {};

    items.forEach(item => {
        if (!refsByQualite[item.qualite]) refsByQualite[item.qualite] = [];
        if (item.refs_to_keep?.length) {
        refsByQualite[item.qualite].push(...item.refs_to_keep);
        }
    });

    return {
        totalGroups: items.length,
        totalGain18m: items.reduce((sum, item) =>
        sum + (item.synthese_totale?.gain_total_achat_18m || 0), 0
        ),
        totalGainHistorique: items.reduce((sum, item) =>
        sum + (item.synthese_totale?.gain_manque_achat_12m || 0), 0
        ),
        totalGainProjection: items.reduce((sum, item) =>
        sum + (item.synthese_totale?.gain_potentiel_achat_6m || 0), 0
        ),
        avgQuality: items.reduce((sum, item) =>
        sum + (item.projection_6m?.metadata?.quality_score || 0), 0
        ) / items.length,
        totalRefs: items.reduce((sum, item) => sum + (item.refs_total || 0), 0),

        
        refsByQualite,
    };
    }, [filteredData]);


    // ✅ Export data pour ExportExcelButton
    const exportData = useMemo(() => {
        if (!filteredData?.items?.length) return [];

        return filteredData.items.map(item => ({
            'Groupe CRN': item.grouping_crn,
            'Qualité': item.qualite,
            'Refs Total': item.refs_total,
            'Refs Conservées': item.refs_to_keep?.length || 0,
            'Refs Supprimées': (item.refs_to_delete_low_sales?.length || 0) + (item.refs_to_delete_no_sales?.length || 0),
            'Manque à gagner 12M (€)': item.synthese_totale?.gain_manque_achat_12m || 0,
            'Gain potentiel 6M (€)': item.synthese_totale?.gain_potentiel_achat_6m || 0,
            'Gain Total 18M (€)': item.synthese_totale?.gain_total_achat_18m || 0,
            'Marge actuelle 18M (€)': item.synthese_totale?.marge_achat_actuelle_18m || 0,
            'Marge optimisée 18M (€)': item.synthese_totale?.marge_achat_optimisee_18m || 0,
            'Qualité Projection': item.projection_6m?.metadata?.quality_score ? 
                `${(item.projection_6m.metadata.quality_score * 100).toFixed(0)}%` : 'N/A',
            'Méthode': item.projection_6m?.metadata?.method || 'N/A'
        }));
    }, [filteredData]);

    // Handlers
    const handleOptimizationClick = (optimization) => {
        setSelectedOptimization(optimization);
        setDetailPanelOpen(true);
    };

    const handleDetailPanelClose = () => {
        setDetailPanelOpen(false);
        setSelectedOptimization(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* ✅ Header avec Export */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3 
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        🎯 Optimisation d'Achat
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Aide">
                            <IconButton 
                                onClick={() => setHelpOpen(!helpOpen)}
                                color={helpOpen ? 'primary' : 'default'}
                            >
                                <HelpOutline />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Rafraîchir">
                            <IconButton onClick={refetch} disabled={isLoading}>
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                        
                        {/* ✅ Export Excel comme Dashboard/Matrix */}
                        <ExportExcelButton
                            data={exportData}
                            filename="optimisations_cbm"
                            sheetName="Optimisations"
                            disabled={!exportData?.length}
                        />
                    </Box>
                </Box>

                {/* Module d'aide */}
                <Collapse in={helpOpen}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'info.50', borderLeft: 4, borderColor: 'info.main' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}>
                            📚 Méthodologie de Calcul des Optimisations
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            1️⃣ Analyse sur 18 mois (12M passés + 6M futurs)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, pl: 2 }}>
                            • <strong>Historique 12M</strong> : Données réelles des ventes passées<br />
                            • <strong>Projection 6M</strong> : Prévisions ML basées sur les tendances historiques<br />
                            • <strong>Total 18M</strong> : Somme du manque à gagner passé + gain potentiel futur
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            2️⃣ Formule de calcul du gain
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, pl: 2, fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                            Gain = (Prix Vente Moyen - Prix Achat Optimisé) × Volume × Coverage Factor
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            3️⃣ Sélection des références à conserver
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, pl: 2 }}>
                            • <strong>Critères</strong> : Volume de ventes, marge brute, stabilité dans le temps<br />
                            • <strong>PMQ/PMV</strong> : PMV prioritaire si disponible, sinon PMQ (meilleur prix d'achat)<br />
                            • <strong>OEM</strong> : Qualité premium, priorité aux marges élevées et fidélisation<br />
                            • <strong>OE</strong> : Balance entre qualité originale et prix compétitif
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            4️⃣ Qualité des projections ML
                        </Typography>
                        <Typography variant="body2" sx={{ pl: 2 }}>
                            • <strong>Score de qualité</strong> : Basé sur la quantité de données historiques, stabilité des ventes<br />
                            • <strong>Méthodes</strong> : Régression linéaire, décomposition saisonnière, lissage exponentiel<br />
                            • <strong>Confiance</strong> : High (&gt;70%), Medium (40-70%), Low (&lt;40%)
                        </Typography>
                    </Paper>
                </Collapse>

                {/* Loading */}
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error */}
                {isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2">
                            Erreur de chargement
                        </Typography>
                        <Typography variant="body2">
                            {error?.message || "Impossible de charger les données d'optimisation"}
                        </Typography>
                    </Alert>
                )}

                {/* No data */}
                {!optimizationData && !isLoading && !isError && (
                    <Alert severity="info">
                        Aucune donnée d'optimisation disponible pour les filtres sélectionnés
                    </Alert>
                )}

                {/* Contenu principal */}
                {!isLoading && filteredData && (
                    <>
                        {/* KPIs */}
                        {totals && (
                            <OptimizationKPISection
                                data={totals}
                                loading={isLoading}
                            />
                        )}

                        {/* Filtres */}
                        <OptimizationFiltersSection
                            selectedQualite={selectedQualite}
                            onQualiteChange={setSelectedQualite}
                            data={optimizationData}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />

                        {/* Affichage selon viewMode */}
                        {(viewMode === 'all' || viewMode === 'charts') && (
                            <OptimizationChartsSection
                                data={filteredData}
                                isLoading={isLoading}
                            />
                        )}

                        {(viewMode === 'all' || viewMode === 'table') && (
                            <OptimizationTableSection
                                data={filteredData}
                                onOptimizationSelect={handleOptimizationClick}
                                onSimulationOpen={() => {}}
                            />
                        )}
                    </>
                )}

                {/* Modal détail */}
                <OptimizationDetailPanel
                    optimization={selectedOptimization}
                    open={detailPanelOpen}
                    onClose={handleDetailPanelClose}
                />
            </motion.div>
        </Box>
    );
}