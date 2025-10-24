// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationFiltersSection.jsx
// ✅ VERSION FINALE SIMPLIFIÉE
// - Pas d'exports (dans le header)
// - Pas de choix méthode (données déjà calculées backend)
// - 2 blocs références VISIBLES et GRANDS
// ===================================

import React, { useMemo, useState  } from 'react';
import {
    Collapse, Box, Paper, Grid, Typography, ToggleButtonGroup, ToggleButton,
    FormControl, InputLabel, Select, MenuItem, Button, Stack, Chip, Alert
} from '@mui/material';
import {
    TableChart, BarChart, FilterList, Clear, Dashboard
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

    const [showMethodology, setShowMethodology] = useState(false);

    // Options qualités disponibles
    const availableQualites = useMemo(() => {
        if (!data?.items) return [];

        const qualites = [...new Set(data.items.map(item => item.qualite))].sort();
        const options = [];

        options.push({ value: '', label: 'Toutes les qualités', color: 'default' });

        qualites.forEach(qualite => {
            if (qualite === 'PMV') return;
            const label = qualite === 'PMQ' ? 'PMQ + PMV (Marché)' : qualite;
            options.push({
                value: qualite,
                label: label,
                color: getQualiteColor(qualite)
            });
        });

        return options;
    }, [data]);

    // ✅ Références internes PAR QUALITÉ
    const internalReferencesByQuality = useMemo(() => {
        if (!data?.items) return { PMQ_PMV: [], OEM: [] };

        const pmqPmvRefs = new Set();
        const oemRefs = new Set();

        data.items.forEach(item => {
            if (item.refs_to_keep) {
                item.refs_to_keep.forEach(ref => {
                    if (ref.ref_int) {
                        if (item.qualite === 'PMQ' || item.qualite === 'PMV') {
                            pmqPmvRefs.add(ref.ref_int);
                        } else if (item.qualite === 'OEM') {
                            oemRefs.add(ref.ref_int);
                        }
                    }
                });
            }
        });

        return {
            PMQ_PMV: Array.from(pmqPmvRefs).sort(),
            OEM: Array.from(oemRefs).sort()
        };
    }, [data]);

    const handleClearFilters = () => {
        onQualiteChange('');
    };

    const hasActiveFilters = selectedQualite;

    // Explications par qualité
    const getQualityExplanation = (qualite) => {
        const explanations = {
            'OEM': {
                title: 'OEM (Original Equipment Manufacturer)',
                strategy: 'Conserver les références avec les meilleures marges et volumes stables',
                priority: 'Priorité : Qualité premium et fidélisation client'
            },
            'PMQ': {
                title: 'PMQ + PMV (Pièces Marché - Qualité & Volume)',
                strategy: 'PMV prioritaire si disponible, sinon PMQ. Optimiser selon le meilleur prix d\'achat',
                priority: 'Priorité : Meilleur rapport qualité/prix pour le client'
            },
            'OE': {
                title: 'OE (Original Equipment)',
                strategy: 'Conserver les références stratégiques et marges élevées',
                priority: 'Priorité : Balance entre qualité OEM et prix compétitif'
            }
        };

        return explanations[qualite] || null;
    };

    const currentExplanation = selectedQualite ? getQualityExplanation(selectedQualite) : null;

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
                        <ToggleButton value="all">
                            <Dashboard fontSize="small" sx={{ mr: 1 }} />
                            Tout
                        </ToggleButton>
                        <ToggleButton value="table">
                            <TableChart fontSize="small" sx={{ mr: 1 }} />
                            Tableau
                        </ToggleButton>
                        <ToggleButton value="charts">
                            <BarChart fontSize="small" sx={{ mr: 1 }} />
                            Graphiques
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Grid container spacing={3} alignItems="center">
                    {/* Filtre Qualité */}
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

                    {/* Espace */}
                    <Grid item xs={12} md={6}>
                        {/* Vide */}
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

                {/* ✅ 2 BLOCS RÉFÉRENCES SÉPARÉS - BIEN VISIBLES */}
                {(internalReferencesByQuality.PMQ_PMV.length > 0 || internalReferencesByQuality.OEM.length > 0) && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            📦 Références Internes Conservées
                        </Typography>
                        
                        <Grid container spacing={2}>
                            {/* Bloc PMQ/PMV */}
                            {internalReferencesByQuality.PMQ_PMV.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Paper 
                                        elevation={2} 
                                        sx={{ 
                                            p: 2.5, 
                                            bgcolor: 'success.50', 
                                            border: '2px solid', 
                                            borderColor: 'success.main',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'success.main' }}>
                                            🟢 PMQ/PMV ({internalReferencesByQuality.PMQ_PMV.length} références)
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {internalReferencesByQuality.PMQ_PMV.slice(0, 15).map((ref, index) => (
                                                <Chip
                                                    key={index}
                                                    label={ref}
                                                    size="medium"
                                                    sx={{ 
                                                        bgcolor: 'success.main', 
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            ))}
                                            {internalReferencesByQuality.PMQ_PMV.length > 15 && (
                                                <Chip
                                                    label={`+${internalReferencesByQuality.PMQ_PMV.length - 15} autres`}
                                                    size="medium"
                                                    sx={{ 
                                                        bgcolor: 'success.dark', 
                                                        color: 'white',
                                                        fontWeight: 700
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}

                            {/* Bloc OEM */}
                            {internalReferencesByQuality.OEM.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Paper 
                                        elevation={2} 
                                        sx={{ 
                                            p: 2.5, 
                                            bgcolor: 'primary.50', 
                                            border: '2px solid', 
                                            borderColor: 'primary.main',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'primary.main' }}>
                                            🔵 OEM ({internalReferencesByQuality.OEM.length} références)
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {internalReferencesByQuality.OEM.slice(0, 15).map((ref, index) => (
                                                <Chip
                                                    key={index}
                                                    label={ref}
                                                    size="medium"
                                                    sx={{ 
                                                        bgcolor: 'primary.main', 
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem'
                                                    }}
                                                />
                                            ))}
                                            {internalReferencesByQuality.OEM.length > 15 && (
                                                <Chip
                                                    label={`+${internalReferencesByQuality.OEM.length - 15} autres`}
                                                    size="medium"
                                                    sx={{ 
                                                        bgcolor: 'primary.dark', 
                                                        color: 'white',
                                                        fontWeight: 700
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}

                {/* Explication par qualité */}
                {currentExplanation && (
                    <Alert severity="info" icon={false} sx={{ mt: 3, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                            📋 {currentExplanation.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Stratégie :</strong> {currentExplanation.strategy}
                        </Typography>
                        <Typography variant="body2">
                            <strong>{currentExplanation.priority}</strong>
                        </Typography>
                    </Alert>
                )}

                {/* Explications générales déroulantes */}
                <Box sx={{ mt: 3 }}>
                <Paper 
                    variant="outlined" 
                    sx={{ 
                    bgcolor: 'info.50', 
                    borderColor: 'info.main', 
                    borderWidth: 1.5, 
                    borderStyle: 'solid', 
                    p: 2, 
                    borderRadius: 2 
                    }}
                >
                    <Box 
                    onClick={() => setShowMethodology(prev => !prev)} 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        cursor: 'pointer' 
                    }}
                    >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'info.main' }}>
                        📊 Méthodologie de calcul des gains
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ color: 'info.main', fontWeight: 500 }}
                    >
                        {showMethodology ? 'Masquer ▲' : 'Afficher ▼'}
                    </Typography>
                    </Box>

                    <Collapse in={showMethodology} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
                        • <strong>Manque à gagner 12M</strong> : Gains non réalisés sur les 12 derniers mois (historique réel)<br />
                        • <strong>Gain potentiel 6M</strong> : Gains projetés sur les 6 prochains mois (prévision ML)<br />
                        • <strong>Gain total 18M</strong> : Somme des 2 périodes (12M passés + 6M futurs)<br />
                        • <strong>Formule</strong> : (Prix vente moyen - Prix achat optimisé) × Volume × Coverage Factor<br />
                        • <strong>Références conservées</strong> : Sélection basée sur volume, marge et stabilité des ventes
                        </Typography>
                    </Box>
                    </Collapse>
                </Paper>
                </Box>

            </Box>
        </Paper>
    );
};

export default OptimizationFiltersSection;