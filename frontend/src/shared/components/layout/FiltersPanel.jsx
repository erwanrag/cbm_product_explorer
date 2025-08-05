import React, { useState, useEffect } from 'react';
import {
    Box, Typography, FormControlLabel, Checkbox, Button,
    Stack, IconButton, Tooltip, Divider, Chip
} from '@mui/material';
import { ClearAll, FilterList, Save, History } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTranslation } from '@/store/contexts/LanguageContext';
import { useLayout } from '@/store/hooks/useLayout';
import AutocompleteRefint from '@/shared/components/inputs/autocomplete/AutocompleteRefint';
import AutocompleteRefCrn from '@/shared/components/inputs/autocomplete/AutocompleteRefCrn';
import AutocompleteRefCrnFromCodpro from '@/shared/components/inputs/autocomplete/AutocompleteRefCrnFromCodpro';
import AutocompleteRefExt from '@/shared/components/inputs/autocomplete/AutocompleteRefExt';
import SelectQualite from '@/shared/components/inputs/selects/SelectQualite';

const initialState = {
    cod_pro: null,
    ref_crn: null,
    ref_ext: null,
    qualite: null,
    use_grouping: false,
};

const FiltersPanel = () => {
    const { t } = useTranslation();
    const { setFilters, clearFilters } = useLayout();
    const [localFilters, setLocalFilters] = useState(initialState);
    const [resetCount, setResetCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [savedFilters, setSavedFilters] = useState([]);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const codProParam = searchParams.get('cod_pro');
        const refCrnParam = searchParams.get('ref_crn');
        const refExtParam = searchParams.get('ref_ext');
        const qualiteParam = searchParams.get('qualite');
        const groupingParam = searchParams.get('grouping_crn');

        if (codProParam || refCrnParam || refExtParam || qualiteParam) {
            setLocalFilters({
                ...initialState,
                cod_pro: codProParam,
                ref_crn: refCrnParam || null,
                ref_ext: refExtParam || null,
                qualite: qualiteParam || null,
                use_grouping: groupingParam === '1',
            });
            setIsExpanded(true);
        }
    }, [searchParams]);

    useEffect(() => {
        const saved = localStorage.getItem('cbm-saved-filters');
        if (saved) {
            try {
                setSavedFilters(JSON.parse(saved));
            } catch (e) {
                console.warn('Erreur chargement filtres sauvegardés:', e);
            }
        }
    }, []);

    const handleClear = () => {
        setLocalFilters(initialState);
        clearFilters();
        setResetCount((c) => c + 1);
        navigate('/dashboard', { replace: true });
        oast.info(t('filters.toast.clear', 'Filtres effacés'));
    };

    const handleSubmit = () => {
        const payload = {
            cod_pro: localFilters.cod_pro?.cod_pro || localFilters.cod_pro || null,
            ref_crn: localFilters.ref_crn || null,
            ref_ext: localFilters.ref_ext || null,
            grouping_crn: localFilters.use_grouping ? 1 : 0,
            qualite: localFilters.qualite || null,
            _forceRefresh: Date.now(),
        };

        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, value]) => value !== null)
        );

        setFilters(cleanPayload);

        const urlParams = new URLSearchParams();
        Object.entries(cleanPayload).forEach(([key, value]) => {
            if (key !== '_forceRefresh') urlParams.set(key, value.toString());
        });

        navigate(`?${urlParams.toString()}`, { replace: true });
        toast.success(t('filters.toast.apply', 'Filtres appliqués'));
    };

    const handleSaveFilters = () => {
        const name = `${t('filters.saved', 'Filtres sauvegardés')} ${new Date().toLocaleDateString()}`;
        const newSaved = {
            name,
            filters: localFilters,
            timestamp: Date.now(),
        };

        const updated = [...savedFilters, newSaved].slice(-5);
        setSavedFilters(updated);
        localStorage.setItem('cbm-saved-filters', JSON.stringify(updated));
        toast.success(t('filters.toast.save', 'Filtres sauvegardés sous "{{name}}"').replace('{{name}}', name));
    };

    const handleLoadSavedFilters = (saved) => {
        setLocalFilters(saved.filters);
        toast.info(`${t('filters.loaded')} "${saved.name}"`);
    };

    const hasActiveFilters = Object.values(localFilters).some(
        (value) => value !== null && value !== false && value !== ''
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterList fontSize="small" />
                    {t('filters.title', 'Filtres de Recherche')}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {hasActiveFilters && (
                        <Tooltip title={t('filters.save', 'Sauvegarder')}>
                            <IconButton size="small" onClick={handleSaveFilters}>
                                <Save fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={t('filters.history', 'Historique')}>
                        <IconButton
                            size="small"
                            onClick={() => setIsExpanded(!isExpanded)}
                            sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                        >
                            <History fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <AnimatePresence>
                {isExpanded && savedFilters.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                {t('filters.savedList', 'Filtres sauvegardés')}
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {savedFilters.map((saved, index) => (
                                    <Chip
                                        key={index}
                                        label={saved.name}
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleLoadSavedFilters(saved)}
                                        sx={{ fontSize: '0.7rem', height: 24 }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            <Stack spacing={2}>
                <AutocompleteRefint value={localFilters.cod_pro} onChange={(value) => setLocalFilters((prev) => ({ ...prev, cod_pro: value }))} resetCount={resetCount} size="small" />

                {!localFilters.use_grouping && (
                    localFilters.cod_pro ? (
                        <AutocompleteRefCrnFromCodpro
                            cod_pro={localFilters.cod_pro}
                            value={localFilters.ref_crn}
                            onChange={(value) => setLocalFilters((prev) => ({ ...prev, ref_crn: value }))}
                            resetCount={resetCount}
                            size="small"
                        />
                    ) : (
                        <AutocompleteRefCrn
                            value={localFilters.ref_crn}
                            onChange={(value) => setLocalFilters((prev) => ({ ...prev, ref_crn: value }))}
                            resetCount={resetCount}
                            size="small"
                        />
                    )
                )}

                <AutocompleteRefExt value={localFilters.ref_ext} onChange={(value) => setLocalFilters((prev) => ({ ...prev, ref_ext: value }))} resetCount={resetCount} size="small" />
                <SelectQualite value={localFilters.qualite} onChange={(value) => setLocalFilters((prev) => ({ ...prev, qualite: value }))} resetCount={resetCount} size="small" />

                <Tooltip title={t('filters.groupingLabel', 'Grouper par CRN')}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={localFilters.use_grouping}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        use_grouping: checked,
                                        ref_crn: checked ? null : prev.ref_crn,
                                    }));
                                }}
                                size="small"
                            />
                        }
                        label={<Typography variant="body2">{t('filters.groupingLabel', 'Grouper par CRN')}</Typography>}
                    />
                </Tooltip>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                    <Button variant="contained" fullWidth onClick={handleSubmit} disabled={!hasActiveFilters} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}>
                        {t('filters.apply', 'Filtres appliqués')}
                    </Button>
                    {hasActiveFilters && (
                        <Button variant="outlined" fullWidth onClick={handleClear} startIcon={<ClearAll />} sx={{ borderRadius: 2, textTransform: 'none' }}>
                            {t('filters.clear', 'Filtres effacés')}
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

export default FiltersPanel;