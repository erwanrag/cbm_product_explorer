// ===================================
// 📁 frontend/src/features/matrix/components/MatrixInsights.jsx - VERSION SIMPLIFIÉE
// ===================================

import React, { useMemo } from 'react';
import {
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Chip,
    LinearProgress,
    Stack
} from '@mui/material';
import {
    Analytics,
    CheckCircle,
    Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Import des couleurs CBM
import { getQualiteColor } from '@/constants/colors';

/**
 * Composant d'analyse et insights pour la matrice - VERSION SIMPLIFIÉE
 */
export default function MatrixInsights({ data, filters, sx = {} }) {
    // ✅ CALCUL DES INSIGHTS SIMPLIFIÉ
    const insights = useMemo(() => {
        if (!data || !data.products || !data.correspondences || !data.column_refs) {
            return null;
        }

        const { products, correspondences, column_refs: columnRefs } = data;

        // 1. Statistiques globales
        const totalCells = products.length * columnRefs.length;
        const matchedCells = correspondences.length;
        const matchRate = totalCells > 0 ? (matchedCells / totalCells) * 100 : 0;

        // 2. Distribution par qualité (ordre CBM)
        const qualityOrder = ['OE', 'OEM', 'PMQ', 'PMV'];
        const qualityDistribution = qualityOrder.reduce((acc, quality) => {
            const count = products.filter(p => p.qualite === quality).length;
            if (count > 0) {
                acc[quality] = count;
            }
            return acc;
        }, {});

        // 3. Analyse des colonnes
        const columnAnalysis = {
            crn_only: columnRefs.filter(c => c.type === 'crn_only').length,
            ext_only: columnRefs.filter(c => c.type === 'ext_only').length,
            both: columnRefs.filter(c => c.type === 'both').length,
            total: columnRefs.length
        };

        // 4. Distribution des statuts
        const statusDistribution = {
            active: products.filter(p => p.statut === 0).length,
            inactive: products.filter(p => p.statut !== 0).length
        };

        // 5. Top 5 produits avec le plus de correspondances
        const productMatches = products.map(product => {
            const matches = correspondences.filter(c => c.cod_pro === product.cod_pro);
            const matchPercent = columnRefs.length > 0 ? (matches.length / columnRefs.length) * 100 : 0;
            return {
                ...product,
                matchCount: matches.length,
                matchPercent
            };
        }).sort((a, b) => b.matchCount - a.matchCount).slice(0, 5);

        return {
            totalCells,
            matchedCells,
            matchRate,
            qualityDistribution,
            columnAnalysis,
            statusDistribution,
            topProducts: productMatches
        };
    }, [data]);

    if (!insights) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Paper elevation={1} sx={{ p: 3, mb: 3, ...sx }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Analytics color="primary" />
                    Analyse de la Matrice
                </Typography>

                <Grid container spacing={3}>
                    {/* ✅ VUE D'ENSEMBLE */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                    📊 Vue d'ensemble
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">
                                            Taux de correspondance
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {insights.matchRate.toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={insights.matchRate}
                                        sx={{ height: 8, borderRadius: 4 }}
                                        color={insights.matchRate > 70 ? 'success' : insights.matchRate > 40 ? 'warning' : 'error'}
                                    />
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" color="primary" fontWeight={600}>
                                                {data.products.length}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Produits
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" color="secondary" fontWeight={600}>
                                                {data.column_refs.length}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Références constructeur / externes
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" color="success.main" fontWeight={600}>
                                                {insights.matchedCells}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Matches
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {insights.matchedCells.toLocaleString()} correspondances sur {insights.totalCells.toLocaleString()} cellules possibles
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* ✅ DISTRIBUTION PAR QUALITÉ */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                    🏷️ Répartition par qualité
                                </Typography>

                                <Stack spacing={1.5}>
                                    {Object.entries(insights.qualityDistribution)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([qualite, count]) => {
                                            const percentage = (count / data.products.length) * 100;
                                            const color = getQualiteColor(qualite);

                                            return (
                                                <Box key={qualite}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Chip
                                                            label={qualite}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: color,
                                                                color: '#fff',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                        <Typography variant="body2">
                                                            {count} ({percentage.toFixed(1)}%)
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percentage}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: color
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* ✅ ANALYSE DES COLONNES */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                    📋 Types de références constructeur / externes
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: '#bbdefb',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 1
                                                }}
                                            >
                                                <Typography variant="h6" fontWeight={600}>
                                                    {insights.columnAnalysis.crn_only}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption">
                                                CRN seul
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: '#c8e6c9',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 1
                                                }}
                                            >
                                                <Typography variant="h6" fontWeight={600}>
                                                    {insights.columnAnalysis.both}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption">
                                                CRN + EXT
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: '#ffcc80',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 1
                                                }}
                                            >
                                                <Typography variant="h6" fontWeight={600}>
                                                    {insights.columnAnalysis.ext_only}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption">
                                                EXT seul
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* ✅ TOP PRODUITS */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                    🥇 Top produits (correspondances)
                                </Typography>

                                <Stack spacing={1}>
                                    {insights.topProducts.map((product) => (
                                        <Box
                                            key={product.cod_pro}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: '#f8f9fa'
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight={600} color="primary">
                                                {product.cod_pro}
                                            </Typography>
                                            <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                                                {product.nom_pro || product.refint}
                                            </Typography>
                                            <Chip
                                                label={`${product.matchCount}/${data.column_refs.length}`}
                                                size="small"
                                                color={product.matchPercent > 80 ? 'success' : 'default'}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* ✅ STATUTS */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                    📈 État des produits
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                                <CheckCircle color="success" sx={{ mr: 1 }} />
                                                <Typography variant="h5" color="success.main" fontWeight={600}>
                                                    {insights.statusDistribution.active}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Produits actifs
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                                <Info color="warning" sx={{ mr: 1 }} />
                                                <Typography variant="h5" color="warning.main" fontWeight={600}>
                                                    {insights.statusDistribution.inactive}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Produits inactifs
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Taux d'activité: {((insights.statusDistribution.active / data.products.length) * 100).toFixed(1)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(insights.statusDistribution.active / data.products.length) * 100}
                                        sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                                        color="success"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* ✅ INFO FILTRES APPLIQUÉS */}
                {filters && Object.values(filters).some(v => v !== null && v !== '') && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Info fontSize="small" />
                            Les statistiques reflètent uniquement les données filtrées selon vos critères de recherche
                        </Typography>
                    </Box>
                )}
            </Paper>
        </motion.div>
    );
}