// ===================================
// 📁 RefFiltersSection.jsx - AVEC TRADUCTIONS
// ===================================

import React, { useMemo } from 'react';
import { Box, Paper, Grid, Typography } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from '@/store/contexts/LanguageContext';

function RefCrnList({ list = [], value, onChange, t }) {
    return (
        <FormControl fullWidth size="small">
            <InputLabel id="refcrn-label">{t('dashboard.filters.ref_crn', 'Ref CRN')}</InputLabel>
            <Select
                labelId="refcrn-label"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={t('dashboard.filters.ref_crn', 'Ref CRN')}
            >
                <MenuItem value="">{t('dashboard.filters.all', 'Toutes')} ({list.length})</MenuItem>
                {list.map((ref) => (
                    <MenuItem key={ref} value={ref}>
                        {ref}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

function RefExtList({ list = [], value, onChange, t }) {
    return (
        <FormControl fullWidth size="small">
            <InputLabel id="refext-label">{t('dashboard.filters.ref_ext', 'Ref Ext')}</InputLabel>
            <Select
                labelId="refext-label"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={t('dashboard.filters.ref_ext', 'Ref Ext')}
            >
                <MenuItem value="">{t('dashboard.filters.all', 'Toutes')} ({list.length})</MenuItem>
                {list.map((ref) => (
                    <MenuItem key={ref} value={ref}>
                        {ref}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default function RefFiltersSection({
    data,
    selectedRefCrn,
    selectedRefExt,
    onRefCrnChange,
    onRefExtChange
}) {
    const { t } = useTranslation();

    if (!data?.details || data.details.length === 0) return null;

    const refCrnList = useMemo(() => {
        const refCrnSet = new Set();

        if (data.matches && data.matches.length > 0) {
            data.matches.forEach(match => {
                if (match.ref_crn) {
                    refCrnSet.add(match.ref_crn);
                }
            });
        }

        if (refCrnSet.size === 0) {
            data.details.forEach(product => {
                if (product.ref_crn) {
                    refCrnSet.add(product.ref_crn);
                }
            });
        }

        return Array.from(refCrnSet).sort();
    }, [data.details, data.matches]);

    const refExtList = useMemo(() => {
        const refExtSet = new Set();

        data.details.forEach(product => {
            if (product.ref_ext) {
                refExtSet.add(product.ref_ext);
            }
        });

        if (data.matches) {
            data.matches.forEach(match => {
                if (match.ref_ext) {
                    refExtSet.add(match.ref_ext);
                }
            });
        }

        return Array.from(refExtSet).sort();
    }, [data.details, data.matches]);

    const getFilteredCount = () => {
        let count = data.details.length;

        if (selectedRefCrn || selectedRefExt) {
            count = data.details.filter(product => {
                const matchRefCrn = !selectedRefCrn || (
                    data.matches?.some(match =>
                        match.cod_pro === product.cod_pro && match.ref_crn === selectedRefCrn
                    )
                );

                const matchRefExt = !selectedRefExt || product.ref_ext === selectedRefExt;

                return matchRefCrn && matchRefExt;
            }).length;
        }

        return count;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
        >
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                    🔍 {t('dashboard.filters.title', 'Filtres de Références')}
                </Typography>

                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <RefCrnList
                            list={refCrnList}
                            value={selectedRefCrn}
                            onChange={onRefCrnChange}
                            t={t}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <RefExtList
                            list={refExtList}
                            value={selectedRefExt}
                            onChange={onRefExtChange}
                            t={t}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                                {getFilteredCount()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('dashboard.filters.products_displayed', 'produit(s) affiché(s)')}
                            </Typography>

                            {(selectedRefCrn || selectedRefExt) && (
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                    {selectedRefCrn && `CRN: ${selectedRefCrn}`}
                                    {selectedRefCrn && selectedRefExt && ' • '}
                                    {selectedRefExt && `Ext: ${selectedRefExt}`}
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </motion.div>
    );
}