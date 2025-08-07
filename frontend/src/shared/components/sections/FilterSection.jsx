// ===================================
// 📁 frontend/src/shared/components/filters/FilterSection.jsx
// ===================================

import React, { useState, useEffect } from 'react';
import {
    Paper, Box, Typography, Grid, Stack, Button,
    FormControlLabel, Checkbox, Divider, Chip
} from '@mui/material';
import { ClearAll, FilterList, Save, History } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTranslation } from '@/store/contexts/LanguageContext';

/**
 * Gestionnaire de filtres générique et déclaratif
 * Remplace FiltersPanel et standardise tous les filtres
 */
export default function FilterManager({
    // Configuration des filtres
    filterDefinitions = [],

    // État et callbacks
    initialFilters = {},
    onFiltersChange,

    // Options d'affichage
    title = "🔍 Filtres de Recherche",
    layout = "vertical", // "vertical" | "horizontal" | "compact" | "grid"
    showActions = true,
    showSaveLoad = false,
    showGrouping = false,

    // Options de comportement
    resetKey = 0,
    clearOnApply = false,
    autoApply = false,

    // Styles
    sx = {}
}) {
    const { t } = useTranslation();

    // État local des filtres
    const [localFilters, setLocalFilters] = useState(initialFilters);
    const [savedFilters, setSavedFilters] = useState([]);

    // Reset quand resetKey change
    useEffect(() => {
        setLocalFilters(initialFilters);
    }, [resetKey]);

    // Chargement des filtres sauvegardés
    useEffect(() => {
        if (showSaveLoad) {
            const saved = localStorage.getItem('cbm-saved-filters');
            if (saved) {
                try {
                    setSavedFilters(JSON.parse(saved));
                } catch (e) {
                    console.warn('Erreur chargement filtres sauvegardés:', e);
                }
            }
        }
    }, [showSaveLoad]);

    // Auto-application des filtres
    useEffect(() => {
        if (autoApply && onFiltersChange) {
            onFiltersChange(localFilters);
        }
    }, [localFilters, autoApply, onFiltersChange]);

    // Vérifier si on a des filtres actifs
    const hasActiveFilters = Object.values(localFilters).some(value =>
        value !== null && value !== undefined && value !== '' && value !== false
    );

    // Gestionnaires d'événements
    const handleFilterChange = (name, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClear = () => {
        setLocalFilters(initialFilters);
        if (onFiltersChange) {
            onFiltersChange(initialFilters);
        }
        toast.info(t('filters.toast.clear', 'Filtres effacés'));
    };

    const handleApply = () => {
        if (onFiltersChange) {
            onFiltersChange(localFilters);
        }
        toast.success(t('filters.toast.apply', 'Filtres appliqués'));
    };

    const handleSave = () => {
        const name = prompt('Nom du filtre à sauvegarder:');
        if (name) {
            const newSaved = [...savedFilters, { name, filters: localFilters }];
            setSavedFilters(newSaved);
            localStorage.setItem('cbm-saved-filters', JSON.stringify(newSaved));
            toast.success(t('filters.toast.save', `Filtre sauvegardé comme "${name}"`));
        }
    };

    const handleLoadSaved = (savedFilter) => {
        setLocalFilters(savedFilter.filters);
        toast.success(t('filters.toast.load', `Filtre "${savedFilter.name}" chargé`));
    };

    // Rendu d'un filtre individuel
    const renderFilter = (definition, index) => {
        const {
            name,
            component: Component,
            label,
            props = {},
            width = 12,
            show = true
        } = definition;

        if (!show) return null;

        const filterProps = {
            ...props,
            value: localFilters[name] || props.defaultValue || null,
            onChange: (value) => handleFilterChange(name, value),
            label: label || props.label,
            size: "small",
            fullWidth: true
        };

        return (
            <Grid item xs={12} sm={width} key={name || index}>
                <Component {...filterProps} />
            </Grid>
        );
    };

    // Rendu des actions
    const renderActions = () => {
        if (!showActions) return null;

        return (
            <Stack spacing={1}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleApply}
                    disabled={!hasActiveFilters && !autoApply}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none'
                    }}
                >
                    {t('filters.apply', 'Appliquer les filtres')}
                </Button>

                {hasActiveFilters && (
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleClear}
                        startIcon={<ClearAll />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
                        {t('filters.clear', 'Effacer')}
                    </Button>
                )}
            </Stack>
        );
    };

    // Rendu des filtres sauvegardés
    const renderSavedFilters = () => {
        if (!showSaveLoad || savedFilters.length === 0) return null;

        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('filters.saved', 'Filtres sauvegardés')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {savedFilters.map((saved, index) => (
                        <Chip
                            key={index}
                            label={saved.name}
                            onClick={() => handleLoadSaved(saved)}
                            variant="outlined"
                            size="small"
                        />
                    ))}
                </Stack>
            </Box>
        );
    };

    return (
        <Paper sx={{ p: 3, mb: 3, ...sx }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3
                }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <FilterList sx={{ mr: 1 }} />
                        {title}
                    </Typography>

                    {showSaveLoad && hasActiveFilters && (
                        <Button
                            size="small"
                            startIcon={<Save />}
                            onClick={handleSave}
                        >
                            {t('filters.save', 'Sauvegarder')}
                        </Button>
                    )}
                </Box>

                {/* Filtres actifs (chips) */}
                <AnimatePresence>
                    {hasActiveFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    Filtres actifs:
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                    {Object.entries(localFilters).map(([key, value]) => {
                                        if (!value || value === '') return null;
                                        const def = filterDefinitions.find(f => f.name === key);
                                        const label = def?.label || key;
                                        return (
                                            <Chip
                                                key={key}
                                                label={`${label}: ${value}`}
                                                onDelete={() => handleFilterChange(key, null)}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grille des filtres */}
                <Grid container spacing={3}>
                    {filterDefinitions.map((def, index) => renderFilter(def, index))}

                    {/* Grouping checkbox si activé */}
                    {showGrouping && (
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={localFilters.use_grouping || false}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            handleFilterChange('use_grouping', checked);
                                            if (checked) {
                                                handleFilterChange('ref_crn', null);
                                            }
                                        }}
                                        size="small"
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        {t('filters.groupingLabel', 'Grouper par CRN')}
                                    </Typography>
                                }
                            />
                        </Grid>
                    )}
                </Grid>

                {/* Divider */}
                <Divider sx={{ my: 3 }} />

                {/* Actions */}
                {renderActions()}

                {/* Filtres sauvegardés */}
                {renderSavedFilters()}
            </motion.div>
        </Paper>
    );
}