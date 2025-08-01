// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationFiltersSection.jsx
// ===================================

import React from 'react';
import {
    Box, Paper, Grid, TextField, Autocomplete,
    ToggleButton, ToggleButtonGroup, Chip, Typography,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
    TableChart, BarChart, Assessment
} from '@mui/icons-material';

const OptimizationFiltersSection = ({
    selectedGroupingCrn,
    selectedQualite,
    onGroupingCrnChange,
    onQualiteChange,
    data,
    viewMode,
    onViewModeChange
}) => {
    // Options de qualité
    const qualiteOptions = ['OEM', 'PMQ', 'PMV'];

    // Extraction des grouping_crn uniques
    const groupingCrnOptions = React.useMemo(() => {
        if (!data?.items) return [];
        const uniqueGroupingCrn = [...new Set(data.items.map(item => item.grouping_crn))];
        return uniqueGroupingCrn.sort((a, b) => a - b);
    }, [data]);

    return (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
                {/* Filtres */}
                <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                        {/* Filtre Grouping CRN */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                size="small"
                                options={groupingCrnOptions}
                                value={selectedGroupingCrn}
                                onChange={(event, newValue) => onGroupingCrnChange(newValue || '')}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Groupe CRN"
                                        placeholder="Filtrer par groupe..."
                                        variant="outlined"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Typography variant="body2">
                                                {option}
                                            </Typography>
                                            <Box sx={{ ml: 'auto' }}>
                                                <Chip
                                                    size="small"
                                                    label={data?.items?.filter(item => item.grouping_crn === option).length || 0}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Box>
                                    </li>
                                )}
                                freeSolo
                                clearOnEscape
                            />
                        </Grid>

                        {/* Filtre Qualité */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Qualité</InputLabel>
                                <Select
                                    value={selectedQualite}
                                    onChange={(e) => onQualiteChange(e.target.value)}
                                    label="Qualité"
                                >
                                    <MenuItem value="">
                                        <em>Toutes</em>
                                    </MenuItem>
                                    {qualiteOptions.map((qualite) => (
                                        <MenuItem key={qualite} value={qualite}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Typography variant="body2">
                                                    {qualite}
                                                </Typography>
                                                <Box sx={{ ml: 'auto' }}>
                                                    <Chip
                                                        size="small"
                                                        label={data?.items?.filter(item => item.qualite === qualite).length || 0}
                                                        color={
                                                            qualite === 'OEM' ? 'success' :
                                                                qualite === 'PMQ' ? 'primary' : 'warning'
                                                        }
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Statistiques rapides */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {data?.items && (
                                    <>
                                        <Chip
                                            size="small"
                                            label={`${data.items.length} groupes`}
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            label={`${data.items.reduce((sum, item) => sum + (item.refs_total || 0), 0)} refs`}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    </>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Mode d'affichage */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(event, newMode) => {
                                if (newMode !== null) {
                                    onViewModeChange(newMode);
                                }
                            }}
                            size="small"
                        >
                            <ToggleButton value="table" aria-label="tableau">
                                <TableChart fontSize="small" sx={{ mr: 1 }} />
                                Tableau
                            </ToggleButton>
                            <ToggleButton value="charts" aria-label="graphiques">
                                <BarChart fontSize="small" sx={{ mr: 1 }} />
                                Graphiques
                            </ToggleButton>
                            <ToggleButton value="summary" aria-label="résumé">
                                <Assessment fontSize="small" sx={{ mr: 1 }} />
                                Résumé
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Grid>
            </Grid>

            {/* Filtres actifs */}
            {(selectedGroupingCrn || selectedQualite) && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Filtres actifs :
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedGroupingCrn && (
                            <Chip
                                size="small"
                                label={`Groupe: ${selectedGroupingCrn}`}
                                onDelete={() => onGroupingCrnChange('')}
                                color="primary"
                            />
                        )}
                        {selectedQualite && (
                            <Chip
                                size="small"
                                label={`Qualité: ${selectedQualite}`}
                                onDelete={() => onQualiteChange('')}
                                color={
                                    selectedQualite === 'OEM' ? 'success' :
                                        selectedQualite === 'PMQ' ? 'primary' : 'warning'
                                }
                            />
                        )}
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default OptimizationFiltersSection;