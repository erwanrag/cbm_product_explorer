// frontend/src/features/matrix/components/MatrixFilters.jsx

import React from 'react';
import {
    Paper,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Typography,
    Collapse,
    Chip
} from '@mui/material';
import {
    FilterList,
    Clear,
    ExpandMore,
    ExpandLess,
    Search
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { QUALITE_OPTIONS, STATUT_OPTIONS } from '../constants/matrixConstants';

/**
 * Composant de filtres pour la vue matricielle
 */
export default function MatrixFilters({ filters, onFiltersChange, disabled = false }) {
    const [expanded, setExpanded] = React.useState(false);

    const handleFilterChange = (field, value) => {
        const newFilters = {
            ...filters,
            [field]: value || null
        };
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        onFiltersChange({
            qualite: null,
            famille: null,
            statut: null,
            search_term: null
        });
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value =>
            value !== null && value !== '' && value !== undefined
        ).length;
    };

    const getActiveFiltersChips = () => {
        const chips = [];

        if (filters.qualite) {
            const qualiteOption = QUALITE_OPTIONS.find(q => q.value === filters.qualite);
            chips.push({
                key: 'qualite',
                label: `Qualité: ${qualiteOption?.label || filters.qualite}`,
                color: 'primary'
            });
        }

        if (filters.statut !== null && filters.statut !== '') {
            const statutOption = STATUT_OPTIONS.find(s => s.value === filters.statut);
            chips.push({
                key: 'statut',
                label: `Statut: ${statutOption?.label || filters.statut}`,
                color: 'secondary'
            });
        }

        if (filters.famille) {
            chips.push({
                key: 'famille',
                label: `Famille: ${filters.famille}`,
                color: 'default'
            });
        }

        if (filters.search_term) {
            chips.push({
                key: 'search_term',
                label: `Recherche: "${filters.search_term}"`,
                color: 'info'
            });
        }

        return chips;
    };

    const handleChipDelete = (filterKey) => {
        handleFilterChange(filterKey, null);
    };

    const activeFiltersCount = getActiveFiltersCount();
    const activeChips = getActiveFiltersChips();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                elevation={1}
                sx={{
                    mb: 3,
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e0e0e0'
                }}
            >
                {/* En-tête des filtres */}
                <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    sx={{ p: 2, pb: expanded ? 1 : 2 }}
                >
                    <Grid item xs>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <FilterList fontSize="small" />
                            Filtres Matrice
                            {activeFiltersCount > 0 && (
                                <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        px: 1,
                                        borderRadius: 1,
                                        fontSize: '0.75rem',
                                        minWidth: '20px',
                                        textAlign: 'center'
                                    }}
                                >
                                    {activeFiltersCount}
                                </Typography>
                            )}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <IconButton
                            size="small"
                            onClick={clearAllFilters}
                            disabled={disabled || activeFiltersCount === 0}
                            title="Effacer tous les filtres"
                        >
                            <Clear />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setExpanded(!expanded)}
                            disabled={disabled}
                        >
                            {expanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </Grid>
                </Grid>

                {/* Chips des filtres actifs */}
                {activeChips.length > 0 && (
                    <Grid container spacing={1} sx={{ px: 2, pb: 2 }}>
                        {activeChips.map((chip) => (
                            <Grid item key={chip.key}>
                                <Chip
                                    label={chip.label}
                                    color={chip.color}
                                    size="small"
                                    onDelete={() => handleChipDelete(chip.key)}
                                    disabled={disabled}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Filtres détaillés */}
                <Collapse in={expanded}>
                    <Grid container spacing={3} sx={{ p: 2, pt: 0 }}>
                        {/* Recherche textuelle */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Recherche"
                                placeholder="Ref interne, désignation..."
                                value={filters.search_term || ''}
                                onChange={(e) => handleFilterChange('search_term', e.target.value)}
                                disabled={disabled}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>

                        {/* Filtre Qualité */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Qualité</InputLabel>
                                <Select
                                    value={filters.qualite || ''}
                                    onChange={(e) => handleFilterChange('qualite', e.target.value)}
                                    disabled={disabled}
                                    label="Qualité"
                                >
                                    {QUALITE_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Filtre Famille */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Famille"
                                placeholder="Code famille..."
                                value={filters.famille || ''}
                                onChange={(e) => handleFilterChange('famille', e.target.value ? parseInt(e.target.value) : null)}
                                disabled={disabled}
                                variant="outlined"
                            />
                        </Grid>

                        {/* Filtre Statut */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Statut</InputLabel>
                                <Select
                                    value={filters.statut !== null ? filters.statut.toString() : ''}
                                    onChange={(e) => handleFilterChange('statut', e.target.value !== '' ? parseInt(e.target.value) : null)}
                                    disabled={disabled}
                                    label="Statut"
                                >
                                    {STATUT_OPTIONS.map((option) => (
                                        <MenuItem key={option.value.toString()} value={option.value.toString()}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Collapse>
            </Paper>
        </motion.div>
    );
}