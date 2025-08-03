// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationFiltersSection.jsx
// ===================================

import React, { useMemo } from 'react';
import {
    Box, Paper, Grid, TextField, Autocomplete,
    ToggleButton, ToggleButtonGroup, Chip,
    Typography, Button, Stack
} from '@mui/material';
import {
    TableChart, BarChart, ViewList,
    FilterList, Clear
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const OptimizationFiltersSection = ({
    selectedGroupingCrn,
    selectedQualite,
    onGroupingCrnChange,
    onQualiteChange,
    data,
    viewMode,
    onViewModeChange
}) => {
    // Extraction des valeurs uniques pour les filtres
    const availableGroupingCrns = useMemo(() => {
        if (!data?.items) return [];

        const crns = [...new Set(data.items.map(item => item.grouping_crn))]
            .filter(crn => crn !== null && crn !== undefined)
            .sort((a, b) => a - b);

        return crns.map(crn => ({
            label: `Groupe ${crn}`,
            value: crn.toString()
        }));
    }, [data]);

    const availableQualites = useMemo(() => {
        if (!data?.items) return [];

        const qualites = [...new Set(data.items.map(item => item.qualite))]
            .filter(qualite => qualite !== null && qualite !== undefined)
            .sort();

        return qualites.map(qualite => ({
            label: qualite,
            value: qualite,
            color: getQualiteColor(qualite)
        }));
    }, [data]);

    // Statistiques filtrées
    const filteredStats = useMemo(() => {
        if (!data?.items) return { total: 0, filtered: 0 };

        let filtered = data.items;

        if (selectedGroupingCrn) {
            filtered = filtered.filter(item =>
                item.grouping_crn && item.grouping_crn.toString().includes(selectedGroupingCrn)
            );
        }

        if (selectedQualite) {
            filtered = filtered.filter(item =>
                item.qualite && item.qualite.toLowerCase().includes(selectedQualite.toLowerCase())
            );
        }

        return {
            total: data.items.length,
            filtered: filtered.length,
            totalGain: filtered.reduce((sum, item) => sum + (item.gain_potentiel || 0), 0),
            totalGain6m: filtered.reduce((sum, item) => sum + (item.gain_potentiel_6m || 0), 0)
        };
    }, [data, selectedGroupingCrn, selectedQualite]);

    // Couleurs pour les qualités
    function getQualiteColor(qualite) {
        switch (qualite) {
            case 'OEM': return 'success';
            case 'PMQ': return 'primary';
            case 'OE': return 'warning';
            default: return 'secondary';
        }
    }

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
        onGroupingCrnChange('');
        onQualiteChange('');
    };

    const hasActiveFilters = selectedGroupingCrn || selectedQualite;

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
                    {/* Filtre Grouping CRN */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            options={availableGroupingCrns}
                            value={availableGroupingCrns.find(option => option.value === selectedGroupingCrn) || null}
                            onChange={(event, newValue) => {
                                onGroupingCrnChange(newValue ? newValue.value : '');
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Grouping CRN"
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: <FilterList fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Typography variant="body2">
                                        {option.label}
                                    </Typography>
                                </Box>
                            )}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            clearable
                            placeholder="Tous les groupes"
                        />
                    </Grid>

                    {/* Filtre Qualité */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            options={availableQualites}
                            value={availableQualites.find(option => option.value === selectedQualite) || null}
                            onChange={(event, newValue) => {
                                onQualiteChange(newValue ? newValue.value : '');
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Qualité"
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: <FilterList fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Chip
                                        size="small"
                                        label={option.label}
                                        color={option.color}
                                        variant="outlined"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="body2">
                                        {option.label}
                                    </Typography>
                                </Box>
                            )}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            clearable
                            placeholder="Toutes les qualités"
                        />
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} sm={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {hasActiveFilters && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Clear />}
                                    onClick={handleClearFilters}
                                >
                                    Effacer les filtres
                                </Button>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {/* Filtres actifs */}
                {hasActiveFilters && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Filtres actifs:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {selectedGroupingCrn && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Chip
                                        size="small"
                                        label={`Groupe: ${selectedGroupingCrn}`}
                                        onDelete={() => onGroupingCrnChange('')}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </motion.div>
                            )}
                            {selectedQualite && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Chip
                                        size="small"
                                        label={`Qualité: ${selectedQualite}`}
                                        onDelete={() => onQualiteChange('')}
                                        color={getQualiteColor(selectedQualite)}
                                        variant="outlined"
                                    />
                                </motion.div>
                            )}
                        </Stack>
                    </Box>
                )}

                {/* Statistiques filtrées */}
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
                                Résultats
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {filteredStats.filtered} / {filteredStats.total}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                                Gain Immédiat
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                {formatCurrency(filteredStats.totalGain)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                                Gain 6 Mois
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                                {formatCurrency(filteredStats.totalGain6m)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                                Efficacité Filtre
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {filteredStats.total > 0 ? Math.round((filteredStats.filtered / filteredStats.total) * 100) : 0}%
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Paper>
    );
};

export default OptimizationFiltersSection;