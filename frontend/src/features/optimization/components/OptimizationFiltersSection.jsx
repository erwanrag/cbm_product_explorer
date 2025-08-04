// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationFiltersSection.jsx - VERSION SIMPLIFIÉE
// ===================================

import React, { useMemo } from 'react';
import {
    Box, Paper, Grid, Typography, ToggleButtonGroup, ToggleButton,
    FormControl, InputLabel, Select, MenuItem, Button, Stack, Chip, Alert
} from '@mui/material';
import {
    TableChart, BarChart, ViewList, FilterList, Clear
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getQualiteColor } from '@/constants/colors';

const OptimizationFiltersSection = ({
    selectedQualite,
    onQualiteChange,
    data,
    viewMode,
    onViewModeChange
}) => {
    // Options qualités disponibles
    const availableQualites = useMemo(() => {
        if (!data?.items) return [];

        const qualites = [...new Set(data.items.map(item => item.qualite))].sort();
        const options = [];

        // Ajouter option "Toutes"
        options.push({ value: '', label: 'Toutes les qualités', color: 'default' });

        // Ajouter qualités individuelles
        qualites.forEach(qualite => {
            if (qualite === 'PMV') return; // PMV sera inclus dans PMQ

            const label = qualite === 'PMQ' ? 'PMQ + PMV (Marché)' : qualite;
            options.push({
                value: qualite,
                label: label,
                color: getQualiteColor(qualite)
            });
        });

        return options;
    }, [data]);

    // Statistiques dynamiques basées sur les filtres
    const filteredStats = useMemo(() => {
        if (!data?.items) return null;

        let filtered = data.items;

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
            total: data.items.length,
            filtered: filtered.length,
            totalGain: filtered.reduce((sum, item) => sum + (item.gain_potentiel || 0), 0),
            totalGain6m: filtered.reduce((sum, item) => sum + (item.gain_potentiel_6m || 0), 0),
            refsTotal: filtered.reduce((sum, item) => sum + (item.refs_total || 0), 0),
            refsToDelete: filtered.reduce((sum, item) =>
                sum + (item.refs_to_delete_low_sales?.length || 0) +
                (item.refs_to_delete_no_sales?.length || 0), 0
            )
        };
    }, [data, selectedQualite]);

    // Formatage des devises
    const formatCurrency = (value) => {
        if (!value) return '0 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const handleClearFilters = () => {
        onQualiteChange('');
    };

    const hasActiveFilters = selectedQualite;

    return (
        <Paper elevation={1} sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Filtres et Affichage
                    </Typography>

                    {/* Mode d'affichage */}
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
                        size="small"
                    >
                        <ToggleButton value="table">
                            <TableChart fontSize="small" sx={{ mr: 1 }} />
                            Tableau
                        </ToggleButton>
                        <ToggleButton value="charts">
                            <BarChart fontSize="small" sx={{ mr: 1 }} />
                            Graphiques
                        </ToggleButton>
                        <ToggleButton value="summary">
                            <ViewList fontSize="small" sx={{ mr: 1 }} />
                            Résumé
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Grid container spacing={3} alignItems="center">
                    {/* Filtre Qualité SEUL */}
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Qualité Produit</InputLabel>
                            <Select
                                value={selectedQualite}
                                onChange={(e) => onQualiteChange(e.target.value)}
                                label="Qualité Produit"
                                startAdornment={<FilterList fontSize="small" sx={{ mr: 1, color: 'action.active' }} />}
                            >
                                {availableQualites.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: option.color
                                                }}
                                            />
                                            {option.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Bouton Clear */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Clear />}
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters}
                            fullWidth
                        >
                            Effacer
                        </Button>
                    </Grid>

                    {/* Espace pour équilibrer */}
                    <Grid item xs={12} md={6}>
                        {/* Vide pour équilibrer */}
                    </Grid>
                </Grid>

                {/* Chips filtres actifs */}
                {hasActiveFilters && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Filtres actifs :
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <AnimatePresence>
                                {selectedQualite && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                    >
                                        <Chip
                                            size="small"
                                            label={`Qualité: ${selectedQualite === 'PMQ' ? 'PMQ + PMV' : selectedQualite}`}
                                            onDelete={() => onQualiteChange('')}
                                            sx={{
                                                bgcolor: getQualiteColor(selectedQualite) + '20',
                                                borderColor: getQualiteColor(selectedQualite),
                                                color: getQualiteColor(selectedQualite)
                                            }}
                                            variant="outlined"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Stack>
                    </Box>
                )}

                {/* Explications importantes */}
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        📊 Comprendre les gains d'optimisation
                    </Typography>
                    <Typography variant="body2" component="div">
                        • <strong>Économie immédiate</strong> : Réduction coûts d'achat si rationalisation appliquée aujourd'hui<br />
                        • <strong>Projection 6 mois</strong> : Basée sur tendance historique (⚠️ données août partielles)<br />
                        • <strong>PMQ + PMV</strong> : Analysés ensemble, priorité PMV si disponible<br />
                        • <strong>Calcul</strong> : (Prix vente moyen - Prix achat minimum) × Volume total
                    </Typography>
                </Alert>

                {/* Statistiques filtrées */}
                {filteredStats && (
                    <Box sx={{
                        mt: 3,
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider'
                    }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Groupes analysés
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {filteredStats.filtered} / {filteredStats.total}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Économie immédiate
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                    {formatCurrency(filteredStats.totalGain)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Projection 6 mois
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                                    {formatCurrency(filteredStats.totalGain6m)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography variant="body2" color="text.secondary">
                                    Références à rationaliser
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                    {filteredStats.refsToDelete} / {filteredStats.refsTotal}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default OptimizationFiltersSection;
