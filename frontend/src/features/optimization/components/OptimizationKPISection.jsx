// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationKPISection.jsx - COMPLET
// ===================================

import React from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Skeleton,
    Chip, Stack
} from '@mui/material';
import {
    TrendingUp, TrendingDown, Euro, Inventory, Assessment, Timeline
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const OptimizationKPISection = ({ data, totals, isLoading }) => {
    // Formatage des devises
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '0 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Formatage des pourcentages
    const formatPercentage = (value) => {
        if (value === null || value === undefined) return '0%';
        return `${(value * 100).toFixed(2)}%`;
    };

    // Composant KPI Card
    const KPICard = ({ title, value, subtitle, icon, color = 'primary', trend = null, isLoading = false }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ color: `${color}.main` }}>
                            {icon}
                        </Box>
                        {trend !== null && (
                            <Chip
                                size="small"
                                icon={trend >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                                label={formatPercentage(Math.abs(trend))}
                                color={trend >= 0 ? 'success' : 'error'}
                                variant="outlined"
                            />
                        )}
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main`, mb: 1 }}>
                        {isLoading ? <Skeleton width="80%" /> : value}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>

                    {subtitle && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Indicateurs Clés d'Optimisation
            </Typography>

            <Grid container spacing={3}>
                {/* Nombre de groupes analysés */}
                <Grid item xs={12} sm={6} md={2.4}>
                    <KPICard
                        title="Groupes Analysés"
                        value={isLoading ? <Skeleton /> : (totals?.totalGroups || 0)}
                        subtitle="Familles de produits"
                        icon={<Assessment fontSize="large" />}
                        color="primary"
                        isLoading={isLoading}
                    />
                </Grid>

                {/* Gain potentiel immédiat */}
                <Grid item xs={12} sm={6} md={2.4}>
                    <KPICard
                        title="Gain Immédiat"
                        value={isLoading ? <Skeleton /> : formatCurrency(totals?.totalGainImmediat || 0)}
                        subtitle="Optimisation instantanée"
                        icon={<Euro fontSize="large" />}
                        color="success"
                        isLoading={isLoading}
                    />
                </Grid>

                {/* Gain projeté 6 mois */}
                <Grid item xs={12} sm={6} md={2.4}>
                    <KPICard
                        title="Projection 6 Mois"
                        value={isLoading ? <Skeleton /> : formatCurrency(totals?.totalGain6m || 0)}
                        subtitle="Gain projeté avec nouvelles ventes"
                        icon={<TrendingUp fontSize="large" />}
                        color="info"
                        trend={totals?.avgTauxCroissance}
                        isLoading={isLoading}
                    />
                </Grid>

                {/* ✅ NOUVEAU: Marge optimisée 6M */}
                <Grid item xs={12} sm={6} md={2.4}>
                    <KPICard
                        title="Marge Optimisée 6M"
                        value={isLoading ? <Skeleton /> : formatCurrency(totals?.totalMargeOptimisee6m || 0)}
                        subtitle={`vs ${formatCurrency(totals?.totalMargeActuelle6m || 0)} actuelle`}
                        icon={<Timeline fontSize="large" />}
                        color="secondary"
                        isLoading={isLoading}
                    />
                </Grid>

                {/* Références totales */}
                <Grid item xs={12} sm={6} md={2.4}>
                    <KPICard
                        title="Références Totales"
                        value={isLoading ? <Skeleton /> : (totals?.totalRefs || 0)}
                        subtitle="Produits dans l'analyse"
                        icon={<Inventory fontSize="large" />}
                        color="warning"
                        isLoading={isLoading}
                    />
                </Grid>
            </Grid>

            {/* ✅ Résumé des gains */}
            {!isLoading && totals && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        💰 <strong>Résumé des gains potentiels :</strong> Gain immédiat de {formatCurrency(totals.totalGainImmediat)}
                        + projection 6 mois de {formatCurrency(totals.totalGain6m)} sur {totals.totalGroups} groupe(s) analysé(s)
                    </Typography>
                    {totals.totalMargeOptimisee6m > totals.totalMargeActuelle6m && (
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            📈 Amélioration de marge de {formatCurrency(totals.totalMargeOptimisee6m - totals.totalMargeActuelle6m)}
                            sur 6 mois grâce à l'optimisation
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default OptimizationKPISection;