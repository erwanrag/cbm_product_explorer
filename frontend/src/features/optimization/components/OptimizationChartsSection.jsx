// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationChartsSection.jsx
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

    // Données pour le graphique de gains par groupe
    const gainsData = useMemo(() => {
        if (!data?.items) return [];

        return data.items.map(item => ({
            groupe: `${item.grouping_crn}-${item.qualite}`,
            gainImmediat: item.gain_potentiel || 0,
            gain6m: item.gain_potentiel_6m || 0,
            refsTotal: item.refs_total || 0,
            qualite: item.qualite,
            croissance: (item.taux_croissance || 0) * 100
        })).sort((a, b) => b.gainImmediat - a.gainImmediat);
    }, [data]);

    // Données historiques agrégées
    const historiqueData = useMemo(() => {
        if (!data?.items) return [];

        const periodeMap = new Map();

        data.items.forEach(item => {
            if (item.historique_6m) {
                item.historique_6m.forEach(hist => {
                    const existing = periodeMap.get(hist.periode) || { periode: hist.periode, ca: 0, marge: 0, qte: 0 };
                    existing.ca += hist.ca || 0;
                    existing.marge += hist.marge || 0;
                    existing.qte += hist.qte || 0;
                    periodeMap.set(hist.periode, existing);
                });
            }
        });

        return Array.from(periodeMap.values()).sort((a, b) => a.periode.localeCompare(b.periode));
    }, [data]);

    // Données projections agrégées
    const projectionData = useMemo(() => {
        if (!data?.items) return [];

        const periodeMap = new Map();

        data.items.forEach(item => {
            if (item.projection_6m?.mois) {
                item.projection_6m.mois.forEach(proj => {
                    const existing = periodeMap.get(proj.periode) || { periode: proj.periode, ca: 0, marge: 0, qte: 0 };
                    existing.ca += proj.ca || 0;
                    existing.marge += proj.marge || 0;
                    existing.qte += proj.qte || 0;
                    periodeMap.set(proj.periode, existing);
                });
            }
        });

        return Array.from(periodeMap.values()).sort((a, b) => a.periode.localeCompare(b.periode));
    }, [data]);

    // Données distribution par qualité
    const qualiteData = useMemo(() => {
        if (!data?.items) return [];

        const qualiteMap = new Map();

        data.items.forEach(item => {
            const existing = qualiteMap.get(item.qualite) || {
                qualite: item.qualite,
                gain: 0,
                gain6m: 0,
                groupes: 0,
                refs: 0
            };
            existing.gain += item.gain_potentiel || 0;
            existing.gain6m += item.gain_potentiel_6m || 0;
            existing.groupes += 1;
            existing.refs += item.refs_total || 0;
            qualiteMap.set(item.qualite, existing);
        });

        return Array.from(qualiteMap.values());
    }, [data]);

    // Données scatter plot prix vs gain
    const scatterData = useMemo(() => {
        if (!data?.items) return [];

        return data.items.map(item => ({
            prixMin: item.px_achat_min || 0,
            prixMoyen: item.px_vente_pondere || 0,
            gain: item.gain_potentiel || 0,
            qualite: item.qualite,
            refs: item.refs_total || 0,
            groupe: item.grouping_crn
        })).filter(item => item.prixMin > 0 && item.gain > 0);
    }, [data]);

    // Couleurs pour les graphiques
    const colors = {
        OEM: '#2196F3',
        PMQ: '#4CAF50',
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
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Potentiel de Gain par Groupe
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
                                                <YAxis />
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
                        </Grid>
                    </motion.div>
                )}

                {/* Évolution Temporelle */}
                {activeTab === 1 && (
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
                                            Historique 6 Derniers Mois
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={historiqueData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="periode" />
                                                <YAxis />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Area
                                                    type="monotone"
                                                    dataKey="marge"
                                                    name="Marge"
                                                    stackId="1"
                                                    stroke="#1976D2"
                                                    fill="#1976D2"
                                                    fillOpacity={0.6}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Projection 6 Prochains Mois
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={projectionData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="periode" />
                                                <YAxis />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Area
                                                    type="monotone"
                                                    dataKey="marge"
                                                    name="Marge Projetée"
                                                    stackId="1"
                                                    stroke="#388E3C"
                                                    fill="#388E3C"
                                                    fillOpacity={0.6}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {/* Répartition par Qualité */}
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
                                                        `${qualite}: ${formatCurrency(value)}`
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
                                                        {item.groupes} groupes • {item.refs} références
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