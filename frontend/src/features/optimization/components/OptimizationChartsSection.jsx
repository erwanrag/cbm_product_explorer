// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationChartsSection.jsx - CORRIGÉ
// ===================================

import React, { useMemo } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent,
    Skeleton, Tabs, Tab, Chip
} from '@mui/material';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';

const OptimizationChartsSection = ({ data, isLoading }) => {
    const [activeTab, setActiveTab] = React.useState(0);

    // Formatage des devises
    const formatCurrency = (value) => {
        if (!value) return '0 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // ✅ Formatage K€ pour les axes
    const formatCurrencyK = (value) => {
        if (!value) return '0';
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K€`;
        return `${value}€`;
    };

    // Données pour le graphique de gains par groupe
    const gainsData = useMemo(() => {
        if (!data?.items) return [];

        return data.items.map(item => ({
            groupe: `${item.grouping_crn}-${item.qualite}`,
            gainImmediat: item.gain_potentiel || 0,
            gain6m: item.gain_potentiel_6m || 0,
            margeActuelle6m: item.marge_actuelle_6m || 0,
            margeOptimisee6m: item.marge_optimisee_6m || 0,
            refsTotal: item.refs_total || 0,
            refsConservees: item.refs_to_keep?.length || 0,
            qualite: item.qualite,
            croissance: (item.taux_croissance || 0) * 100
        })).sort((a, b) => b.gainImmediat - a.gainImmediat);
    }, [data]);

    // ✅ Données historiques + projections combinées
    const timelineData = useMemo(() => {
        if (!data?.items) return [];

        const periodeMap = new Map();

        // Historique
        data.items.forEach(item => {
            if (item.historique_6m) {
                item.historique_6m.forEach(hist => {
                    const existing = periodeMap.get(hist.periode) || {
                        periode: hist.periode,
                        ca: 0,
                        marge: 0,
                        qte: 0,
                        type: 'historique'
                    };
                    existing.ca += hist.ca || 0;
                    existing.marge += hist.marge || 0;
                    existing.qte += hist.qte || 0;
                    periodeMap.set(hist.periode, existing);
                });
            }
        });

        // Projections
        data.items.forEach(item => {
            if (item.projection_6m?.mois) {
                item.projection_6m.mois.forEach(proj => {
                    const existing = periodeMap.get(proj.periode) || {
                        periode: proj.periode,
                        ca: 0,
                        margeActuelle: 0,
                        margeOptimisee: 0,
                        qte: 0,
                        type: 'projection'
                    };
                    existing.ca += proj.ca || 0;
                    existing.margeActuelle += proj.marge_actuelle || 0;
                    existing.margeOptimisee += proj.marge_optimisee || 0;
                    existing.qte += proj.qte || 0;
                    periodeMap.set(proj.periode, existing);
                });
            }
        });

        return Array.from(periodeMap.values()).sort((a, b) => a.periode.localeCompare(b.periode));
    }, [data]);

    // ✅ Données distribution par qualité avec PMQ/PMV groupés
    const qualiteData = useMemo(() => {
        if (!data?.items) return [];

        const qualiteMap = new Map();

        data.items.forEach(item => {
            // ✅ Grouper PMQ et PMV ensemble
            const qualiteKey = (item.qualite === 'PMV') ? 'PMQ/PMV' : item.qualite;

            const existing = qualiteMap.get(qualiteKey) || {
                qualite: qualiteKey,
                gain: 0,
                gain6m: 0,
                groupes: 0,
                refs: 0,
                refsConservees: 0
            };
            existing.gain += item.gain_potentiel || 0;
            existing.gain6m += item.gain_potentiel_6m || 0;
            existing.groupes += 1;
            existing.refs += item.refs_total || 0;
            existing.refsConservees += item.refs_to_keep?.length || 0;
            qualiteMap.set(qualiteKey, existing);
        });

        return Array.from(qualiteMap.values());
    }, [data]);

    // ✅ Couleurs pour les graphiques
    const colors = {
        OEM: '#2196F3',
        'PMQ/PMV': '#4CAF50',
        PMQ: '#4CAF50',
        PMV: '#66BB6A',
        OE: '#FF9800',
        OTHER: '#9C27B0'
    };

    // Tooltip personnalisé
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: 2,
                    border: 1,
                    borderColor: 'divider'
                }}>
                    <Typography variant="subtitle2" gutterBottom>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: {
                                entry.name.includes('Gain') || entry.name.includes('CA') || entry.name.includes('Marge')
                                    ? formatCurrency(entry.value)
                                    : entry.value
                            }
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                    {Array.from({ length: 4 }, (_, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Skeleton variant="rectangular" height={300} />
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center', mb: 3 }}>
                <Typography color="text.secondary">
                    Aucune donnée disponible pour les graphiques
                </Typography>
            </Paper>
        );
    }

    const tabs = [
        { label: 'Gains par Groupe', value: 0 },
        { label: 'Évolution Temporelle', value: 1 },
        { label: 'Répartition Qualité', value: 2 }
    ];

    return (
        <Paper elevation={1} sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Analyse Graphique des Optimisations
                </Typography>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    {tabs.map((tab) => (
                        <Tab key={tab.value} label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
                {/* Gains par Groupe */}
                {activeTab === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={3}>
                            {/* ✅ Graphique principal avec références conservées visibles */}
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Potentiel de Gain par Groupe (Top 15)
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={gainsData.slice(0, 15)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="groupe"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={100}
                                                    fontSize={11}
                                                />
                                                <YAxis tickFormatter={formatCurrencyK} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Bar
                                                    dataKey="gainImmediat"
                                                    name="Gain Immédiat"
                                                    fill="#2196F3"
                                                />
                                                <Bar
                                                    dataKey="gain6m"
                                                    name="Gain 6M"
                                                    fill="#4CAF50"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ✅ Nouveau graphique: Références conservées */}
                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            📦 Références Conservées vs Total
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={gainsData.slice(0, 10)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="groupe"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={80}
                                                    fontSize={10}
                                                />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar
                                                    dataKey="refsTotal"
                                                    name="Total Refs"
                                                    fill="#FF9800"
                                                />
                                                <Bar
                                                    dataKey="refsConservees"
                                                    name="Refs Conservées"
                                                    fill="#4CAF50"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ✅ Marge actuelle vs optimisée */}
                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            💰 Marge Actuelle vs Optimisée (6M)
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={gainsData.slice(0, 10)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="groupe"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={80}
                                                    fontSize={10}
                                                />
                                                <YAxis tickFormatter={formatCurrencyK} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Bar
                                                    dataKey="margeActuelle6m"
                                                    name="Marge Actuelle"
                                                    fill="#FF5722"
                                                />
                                                <Bar
                                                    dataKey="margeOptimisee6m"
                                                    name="Marge Optimisée"
                                                    fill="#4CAF50"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {/* ✅ Évolution Temporelle corrigée */}
                {activeTab === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            📈 Évolution Temporelle - Historique + Projections
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart data={timelineData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="periode" />
                                                <YAxis tickFormatter={formatCurrencyK} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                {/* Historique */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="ca"
                                                    name="CA"
                                                    stroke="#2196F3"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#2196F3', strokeWidth: 2, r: 4 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="marge"
                                                    name="Marge Historique"
                                                    stroke="#FF9800"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#FF9800', strokeWidth: 2, r: 4 }}
                                                />
                                                {/* Projections */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="margeActuelle"
                                                    name="Marge Actuelle Projetée"
                                                    stroke="#F44336"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    dot={{ fill: '#F44336', strokeWidth: 2, r: 4 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="margeOptimisee"
                                                    name="Marge Optimisée Projetée"
                                                    stroke="#4CAF50"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {/* ✅ Répartition par Qualité corrigée */}
                {activeTab === 2 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Répartition des Gains par Qualité
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={qualiteData}
                                                    dataKey="gain"
                                                    nameKey="qualite"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    label={({ qualite, value }) =>
                                                        `${qualite}: ${formatCurrencyK(value)}`
                                                    }
                                                >
                                                    {qualiteData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={colors[entry.qualite] || colors.OTHER}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Statistiques par Qualité
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            {qualiteData.map((item, index) => (
                                                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Chip
                                                            label={item.qualite}
                                                            sx={{
                                                                bgcolor: colors[item.qualite] || colors.OTHER,
                                                                color: 'white'
                                                            }}
                                                        />
                                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                            {formatCurrency(item.gain)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.groupes} groupes • {item.refs} références totales
                                                    </Typography>
                                                    <Typography variant="body2" color="primary.main">
                                                        📦 {item.refsConservees} références conservées
                                                    </Typography>
                                                    <Typography variant="body2" color="success.main">
                                                        Projection 6M: {formatCurrency(item.gain6m)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}
            </Box>
        </Paper>
    );
};

export default OptimizationChartsSection;