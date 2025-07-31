// ===================================
// 📁 frontend/src/features/dashboard/components/RefFiltersSection.jsx - NOUVEAU
// ===================================

import React, { useMemo } from 'react';
import { Box, Paper, Grid, Typography } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';

// Composant RefCrnList
function RefCrnList({ list = [], value, onChange }) {
    return (
        <FormControl fullWidth size="small">
            <InputLabel id="refcrn-label">Ref CRN</InputLabel>
            <Select
                labelId="refcrn-label"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label="Ref CRN"
            >
                <MenuItem value="">Toutes ({list.length})</MenuItem>
                {list.map((ref) => (
                    <MenuItem key={ref} value={ref}>
                        {ref}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

// Composant RefExtList
function RefExtList({ list = [], value, onChange }) {
    return (
        <FormControl fullWidth size="small">
            <InputLabel id="refext-label">Ref Ext</InputLabel>
            <Select
                labelId="refext-label"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label="Ref Ext"
            >
                <MenuItem value="">Toutes ({list.length})</MenuItem>
                {list.map((ref) => (
                    <MenuItem key={ref} value={ref}>
                        {ref}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

// Composant principal
export default function RefFiltersSection({
    data,
    selectedRefCrn,
    selectedRefExt,
    onRefCrnChange,
    onRefExtChange
}) {
    if (!data?.details || data.details.length === 0) return null;

    // ✅ EXTRACTION DES LISTES REF_CRN ET REF_EXT
    const refCrnList = useMemo(() => {
        // Extraire ref_crn depuis les matches si disponible
        const refCrnSet = new Set();

        // Option 1: Depuis matches
        if (data.matches && data.matches.length > 0) {
            data.matches.forEach(match => {
                if (match.ref_crn) {
                    refCrnSet.add(match.ref_crn);
                }
            });
        }

        // Option 2: Fallback - essayer d'extraire depuis details si pas de matches
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

        // Extraire ref_ext depuis details et matches
        data.details.forEach(product => {
            if (product.ref_ext) {
                refExtSet.add(product.ref_ext);
            }
        });

        // Ajouter depuis matches si disponible
        if (data.matches) {
            data.matches.forEach(match => {
                if (match.ref_ext) {
                    refExtSet.add(match.ref_ext);
                }
            });
        }

        return Array.from(refExtSet).sort();
    }, [data.details, data.matches]);

    // ✅ STATS DE FILTRAGE
    const getFilteredCount = () => {
        let count = data.details.length;

        if (selectedRefCrn || selectedRefExt) {
            // Compter les produits qui matchent les filtres
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
            <Paper
                elevation={1}
                sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e0e0e0'
                }}
            >
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                    🔍 Filtres de Références
                </Typography>

                <Grid container spacing={3} alignItems="center">
                    {/* Sélecteur Ref CRN */}
                    <Grid item xs={12} sm={4}>
                        <RefCrnList
                            list={refCrnList}
                            value={selectedRefCrn}
                            onChange={onRefCrnChange}
                        />
                    </Grid>

                    {/* Sélecteur Ref Ext */}
                    <Grid item xs={12} sm={4}>
                        <RefExtList
                            list={refExtList}
                            value={selectedRefExt}
                            onChange={onRefExtChange}
                        />
                    </Grid>

                    {/* Statistiques */}
                    <Grid item xs={12} sm={4}>
                        <Box sx={{
                            textAlign: 'center',
                            p: 1,
                            bgcolor: 'white',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                                {getFilteredCount()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                produit(s) affiché(s)
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

                {/* Debug info (à retirer en prod) */}
                {process.env.NODE_ENV === 'development' && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'white', borderRadius: 1, fontSize: '0.75rem' }}>
                        <strong>Debug:</strong> ref_crn: {refCrnList.length} • ref_ext: {refExtList.length} • matches: {data.matches?.length || 0}
                    </Box>
                )}
            </Paper>
        </motion.div>
    );
}