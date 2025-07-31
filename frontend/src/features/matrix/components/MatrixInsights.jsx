// frontend/src/features/matrix/components/MatrixInsights.jsx

import React, { useMemo } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Chip,
    LinearProgress,
    Tooltip,
    Card,
    CardContent
} from '@mui/material';
import {
    Analytics,
    TrendingUp,
    CheckCircle,
    Cancel,
    Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { QUALITES, getCellColor, getColumnColor } from '../constants/matrixConstants';

/**
 * Composant d'analyse rapide de la matrice
 */
export default function MatrixInsights({ data, filters }) {
    const insights = useMemo(() => {
        if (!data.products.length) return null;

        const { products, columnRefs, correspondences } = data;

        // 1. Stats globales
        const totalCells = products.length * columnRefs.length;
        const matchedCells = correspondences.filter(c => c.ref_crn || c.ref_ext).length;
        const matchRate = totalCells > 0 ? (matchedCells / totalCells) * 100 : 0;

        // 2. Répartition par qualité
        const qualityDistribution = Object.keys(QUALITES).reduce((acc, qualite) => {
            const count = products.filter(p => p.qualite === qualite).length;
            acc[qualite] = {
                count,
                percentage: products.length > 0 ? (count / products.length) * 100 : 0
            };
            return acc;
        }, {});

        // 3. Analyse des colonnes
        const columnAnalysis = {
            crnOnly: columnRefs.filter(c => c.type === 'crn_only').length,
            extOnly: columnRefs.filter(c => c.type === 'ext_only').length,
            both: columnRefs.filter(c => c.type === 'both').length
        };

        // 4. Top produits avec le plus de correspondances
        const productMatches = products.map(product => {
            const matches = correspondences.filter(c => c.cod_pro === product.cod_pro);
            return {
                ...product,
                matchCount: matches.length,
                matchRate: columnRefs.length > 0 ? (matches.length / columnRefs.length) * 100 : 0
            };
        }).sort((a, b) => b.matchCount - a.matchCount);

        // 5. Colonnes les plus populaires
        const columnPopularity = columnRefs.map(col => {
            const matches = correspondences.filter(c =>
                c.ref_crn === col.ref || c.ref_ext === col.ref
            );
            return {
                ...col,
                matchCount: matches.length,
                matchRate: products.length > 0 ? (matches.length / products.length) * 100 : 0
            };
        }).sort((a, b) => b.matchCount - a.matchCount);

        // 6. Statuts actifs vs inactifs
        const statusDistribution = {
            active: products.filter(p => p.statut === 0).length,
            inactive: products.filter(p => p.statut !== 0).length
        };

        return {
            totalCells,
            matchedCells,
            matchRate,
            qualityDistribution,
            columnAnalysis,
            topProducts: productMatches.slice(0, 5),
            topColumns: columnPopularity.slice(0, 5),
            statusDistribution
        };
    }, [data]);

    if (!insights) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Analytics color="primary" />
                    Analyse de la Matrice
                </Typography>

                <Grid container spacing={3}>
                    {/* Statistiques globales */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
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
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: '#f0f0f0'
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {insights.matchedCells} correspondances sur {insights.totalCells} cellules
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="primary.main">
                                                {data.products.length}
                                            </Typography>
                                            <Typography variant="caption">
                                                Produits
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" color="secondary.main">
                                                {data.columnRefs.length}
                                            </Typography>
                                            <Typography variant="caption">
                                                Références
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Répartition des qualités */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                    🏷️ Répartition par Qualité
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {Object.entries(insights.qualityDistribution)
                                        .filter(([, data]) => data.count > 0)
                                        .map(([qualite, data]) => (
                                            <Box key={qualite} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={qualite}
                                                    size="small"
                                                    sx={{ minWidth: 50 }}
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={data.percentage}
                                                        sx={{ height: 6, borderRadius: 3 }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" sx={{ minWidth: 60 }}>
                                                    {data.count} ({data.percentage.toFixed(1)}%)
                                                </Typography>
                                            </Box>
                                        ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Analyse des colonnes */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                    📋 Types de Références
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                bgcolor: getColumnColor('crn_only'),
                                                borderRadius: 1
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                            CRN uniquement
                                        </Typography>
                                        <Typography variant="caption">
                                            {insights.columnAnalysis.crnOnly}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                bgcolor: getColumnColor('both'),
                                                borderRadius: 1
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                            CRN + EXT
                                        </Typography>
                                        <Typography variant="caption">
                                            {insights.columnAnalysis.both}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                bgcolor: getColumnColor('ext_only'),
                                                borderRadius: 1
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                            EXT uniquement
                                        </Typography>
                                        <Typography variant="caption">
                                            {insights.columnAnalysis.extOnly}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Top produits */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                    🏆 Produits les mieux référencés
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {insights.topProducts.slice(0, 3).map((product, index) => (
                                        <Box key={product.cod_pro} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="caption" sx={{ minWidth: 20 }}>
                                                #{index + 1}
                                            </Typography>
                                            <Tooltip title={product.designation}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        flexGrow: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {product.cod_pro} - {product.ref_int}
                                                </Typography>
                                            </Tooltip>
                                            <Chip
                                                label={`${product.matchCount} refs`}
                                                size="small"
                                                color={product.matchRate > 50 ? 'success' : 'default'}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filtres appliqués */}
                {filters && Object.values(filters).some(v => v !== null && v !== '') && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Info fontSize="small" />
                            Filtres appliqués - Les statistiques reflètent uniquement les données filtrées
                        </Typography>
                    </Box>
                )}
            </Paper>
        </motion.div>
    );
}