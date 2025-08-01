// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationChartsSection.jsx
// ===================================

import React, { useMemo } from 'react';
import { Box, Paper, Grid, Typography } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
    ComposedChart, Area, AreaChart, Legend
} from 'recharts';

const OptimizationChartsSection = ({ data, isLoading }) => {
    const displayData = data?.items || [];

    // Couleurs pour les graphiques
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#0288d1', '#689f38'];
    const qualiteColors = {
        'OEM': '#2e7d32',
        'PMQ': '#1976d2',
        'PMV': '#ed6c02'
    };

    // Formatage des devises
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Données pour le graphique gains par qualité
    const gainsByQualite = useMemo(() => {
        const grouped = displayData.reduce((acc, item) => {
            const existing = acc.find(g => g.qualite === item.qualite);
            if (existing) {
                existing.gain_immediat += item.gain_potentiel || 0;
                existing.gain_6m += item.gain_potentiel_6m || 0;
                existing.count += 1;
            } else {
                acc.push({
                    qualite: item.qualite,
                    gain_immediat: item.gain_potentiel || 0,
                    gain_6m: item.gain_potentiel_6m || 0,
                    count: 1
                });
            }
            return acc;
        }, []);

        return grouped.map(g => ({
            ...g,
            gain_immediat_formatted: Math.round(g.gain_immediat),
            gain_6m_formatted: Math.round(g.gain_6m)
        }));
    }, [displayData]);

    // Top 10 des groupes par gain
    const topGroups = useMemo(() => {
        return displayData
            .sort((a, b) => (b.gain_potentiel || 0) - (a.gain_potentiel || 0))
            .slice(0, 10)
            .map(item => ({
                groupe: `${item.grouping_crn}-${item.qualite}`,
                gain_immediat: Math.round(item.gain_potentiel || 0),
                gain_6m: Math.round(item.gain_potentiel_6m || 0),
                croissance: (item.taux_croissance || 0) * 100,
                refs_total: item.refs_total || 0
            }));
    }, [displayData]);

    // Distribution des références
    const refsDistribution = useMemo(() => {
        return displayData
            .slice(0, 15) // Limiter pour la lisibilité
            .map(item => ({
                groupe: `${item.grouping_crn}`,
                total_refs: item.refs_total || 0,
                refs_garder: item.refs_to_keep?.length || 0,
                refs_supprimer_ventes: item.refs_to_delete_low_sales?.length || 0,
                refs_supprimer_sans_ventes: item.refs_to_delete_no_sales?.length || 0,
                gain: Math.round(item.gain_potentiel || 0)
            }));
    }, [displayData]);

    // Analyse croissance vs gain
    const croissanceVsGain = useMemo(() => {
        return displayData.map(item => ({
            groupe: `${item.grouping_crn}-${item.qualite}`,
            croissance: (item.taux_croissance || 0) * 100,
            gain: item.gain_potentiel || 0,
            qualite: item.qualite,
            refs_total: item.refs_total || 0
        }));
    }, [displayData]);

    // Tooltip personnalisé
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="body2" fontWeight={500}>{label}</Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </Typography>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Chargement des graphiques...</Typography>
            </Box>
        );
    }

    if (displayData.length === 0) {
        return (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center', mb: 3 }}>
                <Typography color="text.secondary">
                    Aucune donnée à afficher dans les graphiques
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Analyse Graphique des Optimisations
            </Typography>

            <Grid container spacing={3}>
                {/* Gains par qualité */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={1} sx={{ p: 3, height: 400 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                            Gains par Qualité
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={gainsByQualite}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="qualite" />
                                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k€`} />
                                <Tooltip content={CustomTooltip} />
                                <Legend />
                                <Bar
                                    dataKey="gain_immediat_formatted"
                                    name="Gain Immédiat"
                                    fill="#1976d2"
                                />
                                <Bar
                                    dataKey="gain_6m_formatted"
                                    name="Gain 6 mois"
                                    fill="#2e7d32"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Top 10 groupes */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={1} sx={{ p: 3, height: 400 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                            Top 10 Groupes par Gain
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={topGroups} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => `${Math.round(value / 1000)}k€`} />
                                <YAxis dataKey="groupe" type="category" width={80} fontSize={12} />
                                <Tooltip content={CustomTooltip} />
                                <Bar dataKey="gain_immediat" fill="#ed6c02" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Distribution des références */}
                <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 3, height: 450 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                            Distribution des Références par Groupe
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <ComposedChart data={refsDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="groupe"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    interval={0}
                                    fontSize={12}
                                />
                                <YAxis yAxisId="refs" orientation="left" />
                                <YAxis yAxisId="gain" orientation="right" tickFormatter={(value) => `${Math.round(value / 1000)}k€`} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
                                                    <Typography variant="body2" fontWeight={500}>{label}</Typography>
                                                    {payload.map((entry, index) => (
                                                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                                                            {entry.name}: {entry.name === 'Gain' ? formatCurrency(entry.value) : entry.value}
                                                        </Typography>
                                                    ))}
                                                </Paper>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="refs" stackId="refs" dataKey="refs_garder" name="À garder" fill="#2e7d32" />
                                <Bar yAxisId="refs" stackId="refs" dataKey="refs_supprimer_ventes" name="À suppr. (avec ventes)" fill="#ed6c02" />
                                <Bar yAxisId="refs" stackId="refs" dataKey="refs_supprimer_sans_ventes" name="À suppr. (sans ventes)" fill="#d32f2f" />
                                <Line yAxisId="gain" type="monotone" dataKey="gain" name="Gain" stroke="#7b1fa2" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Croissance vs Gain */}
                <Grid item xs={12} lg={8}>
                    <Paper elevation={1} sx={{ p: 3, height: 400 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                            Analyse Croissance vs Gain Potentiel
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="croissance"
                                    name="Croissance"
                                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                                />
                                <YAxis
                                    dataKey="gain"
                                    name="Gain"
                                    tickFormatter={(value) => `${Math.round(value / 1000)}k€`}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
                                                    <Typography variant="body2" fontWeight={500}>{data.groupe}</Typography>
                                                    <Typography variant="body2">Croissance: {data.croissance.toFixed(2)}%</Typography>
                                                    <Typography variant="body2">Gain: {formatCurrency(data.gain)}</Typography>
                                                    <Typography variant="body2">Qualité: {data.qualite}</Typography>
                                                    <Typography variant="body2">Refs: {data.refs_total}</Typography>
                                                </Paper>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                {Object.keys(qualiteColors).map(qualite => (
                                    <Scatter
                                        key={qualite}
                                        name={qualite}
                                        data={croissanceVsGain.filter(d => d.qualite === qualite)}
                                        fill={qualiteColors[qualite]}
                                    />
                                ))}
                            </ScatterChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Répartition par qualité (Pie Chart) */}
                <Grid item xs={12} lg={4}>
                    <Paper elevation={1} sx={{ p: 3, height: 400 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                            Répartition par Qualité
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={gainsByQualite}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ qualite, count }) => `${qualite} (${count})`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {gainsByQualite.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={qualiteColors[entry.qualite] || colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
                                                    <Typography variant="body2" fontWeight={500}>{data.qualite}</Typography>
                                                    <Typography variant="body2">Groupes: {data.count}</Typography>
                                                    <Typography variant="body2">Gain total: {formatCurrency(data.gain_immediat)}</Typography>
                                                </Paper>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OptimizationChartsSection;