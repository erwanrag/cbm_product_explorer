// ===================================
// 📁 frontend/src/features/matrix/components/MatrixFilters.jsx - AMÉLIORÉ
// ===================================

import React, { useState } from 'react';
import {
    Paper,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    Typography,
    IconButton,
    Collapse,
    Divider,
    InputAdornment
} from '@mui/material';
import {
    ExpandMore,
    ExpandLess,
    Search,
    FilterList,
    Clear,
    Tune
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { QUALITE_OPTIONS, STATUT_OPTIONS } from '../constants/matrixConstants';

const MatrixFilters = ({
    filters = {},
    onFiltersChange,
    disabled = false,
    showAdvancedFilters = true
}) => {
    const [expanded, setExpanded] = useState(false);

    // ===== GESTION DES FILTRES =====
    const handleFilterChange = (filterKey, value) => {
        const newFilters = {
            ...filters,
            [filterKey]: value || null
        };
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        onFiltersChange({});
    };

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter(value =>
            value !== null && value !== undefined && value !== ''
        ).length;
    };

    const getActiveFiltersChips = () => {
        const chips = [];

        if (filters.cod_pro) {
            chips.push({
                key: 'cod_pro',
                label: `Code: ${filters.cod_pro}`,
                color: 'primary'
            });
        }

        if (filters.refint) {
            chips.push({
                key: 'refint',
                label: `Ref Int: ${filters.refint}`,
                color: 'primary'
            });
        }

        if (filters.ref_crn) {
            chips.push({
                key: 'ref_crn',
                label: `CRN: ${filters.ref_crn}`,
                color: 'secondary'
            });
        }

        // NOUVEAU: Filtre ref_grc
        if (filters.ref_grc) {
            chips.push({
                key: 'ref_grc',
                label: `GRC: ${filters.ref_grc}`,
                color: 'warning'
            });
        }

        // NOUVEAU: Filtre ref_ext 
        if (filters.ref_ext) {
            chips.push({
                key: 'ref_ext',
                label: `Ext: ${filters.ref_ext}`,
                color: 'info'
            });
        }

        if (filters.qualite) {
            const qualiteLabel = QUALITE_OPTIONS.find(q => q.value === filters.qualite)?.label || filters.qualite;
            chips.push({
                key: 'qualite',
                label: `Qualité: ${qualiteLabel}`,
                color: 'success'
            });
        }

        if (filters.famille) {
            chips.push({
                key: 'famille',
                label: `Famille: ${filters.famille}`,
                color: 'default'
            });
        }

        if (filters.statut !== null && filters.statut !== undefined) {
            const statutLabel = STATUT_OPTIONS.find(s => s.value === filters.statut)?.label || filters.statut;
            chips.push({
                key: 'statut',
                label: `Statut: ${statutLabel}`,
                color: 'default'
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
                    sx={{ p: 2, pb: expanded ? 2 : 2 }}
                >
                    <Grid item xs>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <FilterList fontSize="small" />
                            Filtres de Recherche
                            {activeFiltersCount > 0 && (
                                <Chip
                                    label={activeFiltersCount}
                                    size="small"
                                    color="primary"
                                    variant="filled"
                                />
                            )}
                        </Typography>
                    </Grid>
                    <Grid item>
                        {activeFiltersCount > 0 && (
                            <IconButton
                                size="small"
                                onClick={clearAllFilters}
                                disabled={disabled}
                                title="Effacer tous les filtres"
                            >
                                <Clear />
                            </IconButton>
                        )}
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
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {activeChips.map((chip) => (
                                <Chip
                                    key={chip.key}
                                    label={chip.label}
                                    color={chip.color}
                                    size="small"
                                    onDelete={() => handleChipDelete(chip.key)}
                                    disabled={disabled}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Filtres détaillés */}
                <Collapse in={expanded}>
                    <Divider />
                    <Grid container spacing={3} sx={{ p: 3 }}>
                        {/* Filtres de base */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom color="primary">
                                🔍 Identification Produit
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Code Produit"
                                type="number"
                                placeholder="Ex: 14855"
                                value={filters.cod_pro || ''}
                                onChange={(e) => handleFilterChange('cod_pro', e.target.value ? parseInt(e.target.value) : null)}
                                disabled={disabled}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Référence Interne"
                                placeholder="Ex: D9098273"
                                value={filters.refint || ''}
                                onChange={(e) => handleFilterChange('refint', e.target.value)}
                                disabled={disabled}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            CBM
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Référence Constructeur (CRN)"
                                placeholder="Ex: ATS52460"
                                value={filters.ref_crn || ''}
                                onChange={(e) => handleFilterChange('ref_crn', e.target.value)}
                                disabled={disabled}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            CRN
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        {/* NOUVEAUX FILTRES : ref_grc et ref_ext */}
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Référence GRC"
                                placeholder="Ex: MBR5032"
                                value={filters.ref_grc || ''}
                                onChange={(e) => handleFilterChange('ref_grc', e.target.value)}
                                disabled={disabled}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            GRC
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'warning.main'
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Référence Externe"
                                placeholder="Ex: 09.B325.30"
                                value={filters.ref_ext || ''}
                                onChange={(e) => handleFilterChange('ref_ext', e.target.value)}
                                disabled={disabled}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            EXT
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'info.main'
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        {/* Filtres avancés */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" gutterBottom color="primary">
                                ⚙️ Critères Avancés
                            </Typography>
                        </Grid>

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
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Statut</InputLabel>
                                <Select
                                    value={filters.statut !== null && filters.statut !== undefined ? filters.statut.toString() : ''}
                                    onChange={(e) => handleFilterChange('statut', e.target.value !== '' ? parseInt(e.target.value) : null)}
                                    disabled={disabled}
                                    label="Statut"
                                >
                                    {STATUT_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value.toString()}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Terme de recherche"
                                placeholder="Recherche libre..."
                                value={filters.search_term || ''}
                                onChange={(e) => handleFilterChange('search_term', e.target.value)}
                                disabled={disabled}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                    </Grid>
                </Collapse>
            </Paper>
        </motion.div>
    );
};

export default MatrixFilters;