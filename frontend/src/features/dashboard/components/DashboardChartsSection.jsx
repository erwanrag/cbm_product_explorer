// ===================================
// 📁 frontend/src/features/dashboard/components/DashboardChartsSection.jsx - AVEC HISTORY
// ===================================

import React, { useMemo } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area, AreaChart
} from 'recharts';
import { formatCurrency, formatAxisCurrency, formatAxisPercentage } from '@/lib/formatUtils';
import { getQualiteColor } from '@/constants/colors';

export default function DashboardChartsSection({ data, loading }) {
    if (!data?.details || data.details.length === 0) return null;

    // ✅ COULEURS FIXES PAR QUALITÉ (cohérentes partout)
    const QUALITE_COLORS = {
        'OE': '#2196f3',
        'OEM': '#4caf50',
        'PMQ': '#ff9800',
        'PMV': '#9c27b0'
    };

    // Loggers pour debug
    //console.log('📊 Dashboard data:', data);
    //console.log('📈 History data:', data.history);
    //console.log('💰 Sales data:', data.sales);

    // ✅ 1. CA par qualité avec couleurs fixes
    const caByQualite = useMemo(() => {
        const qualites = ['OE', 'OEM', 'PMQ', 'PMV'];
        return qualites.map(qualite => {
            const products = data.details.filter(p => p.qualite === qualite);
            const totalCA = products.reduce((sum, p) => sum + (p.ca_total || 0), 0);
            const avgMargin = products.length > 0 ?
                products.reduce((sum, p) => sum + (p.marge_percent_total || 0), 0) / products.length : 0;

            return {
                qualite,
                ca: totalCA,
                count: products.length,
                margin: avgMargin,
                fill: QUALITE_COLORS[qualite] || '#757575'
            };
        }).filter(item => item.count > 0);
    }, [data.details]);

    // ✅ 2. Répartition qualités
    const qualiteDistribution = useMemo(() => {
        const qualiteCounts = data.details.reduce((acc, product) => {
            const qualite = product.qualite || 'Autre';
            acc[qualite] = (acc[qualite] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(qualiteCounts).map(([qualite, count]) => ({
            name: qualite,
            value: count,
            percentage: ((count / data.details.length) * 100).toFixed(1),
            fill: QUALITE_COLORS[qualite] || '#757575'
        }));
    }, [data.details]);

    // ✅ 3. DONNÉES MENSUELLES depuis HISTORY (pas sales)
    const monthlyData = useMemo(() => {
        // Utiliser data.history qui contient les données mensuelles
        if (!data.history || data.history.length === 0) {
            console.warn('⚠️ Pas de données history disponibles');
            return [];
        }

        // Grouper par période et calculer les totaux
        const monthlyMap = {};

        data.history.forEach(historyItem => {
            const periode = historyItem.periode || historyItem.mois || new Date().toISOString().slice(0, 7);

            if (!monthlyMap[periode]) {
                monthlyMap[periode] = {
                    periode,
                    ca: 0,
                    quantite: 0,
                    marge: 0,
                    count: 0
                };
            }

            // Accumuler les valeurs
            monthlyMap[periode].ca += historyItem.ca_total || historyItem.ca || 0;
            monthlyMap[periode].quantite += historyItem.quantite_total || historyItem.quantite || 0;
            monthlyMap[periode].marge += historyItem.marge_percent_total || historyItem.marge_percent || 0;
            monthlyMap[periode].count += 1;
        });

        // Convertir en array et calculer les moyennes
        const result = Object.values(monthlyMap)
            .map(item => ({
                periode: item.periode,
                ca: item.ca,
                quantite: item.quantite,
                marge: item.count > 0 ? item.marge / item.count : 0
            }))
            .sort((a, b) => a.periode.localeCompare(b.periode))
            .slice(-12); // 12 derniers mois

        //console.log('📊 Monthly data processed:', result);
        return result;
    }, [data.history]);

    // ✅ 4. Top produits avec couleurs par qualité
    const topProductsByCA = useMemo(() => {
        return [...data.details]
            .sort((a, b) => (b.ca_total || 0) - (a.ca_total || 0))
            .slice(0, 8)
            .map(product => ({
                refint: (product.refint || product.cod_pro.toString()).substring(0, 12),
                ca: product.ca_total || 0,
                marge: product.marge_percent_total || 0,
                qualite: product.qualite,
                fournisseur: (product.nom_fou || 'N/A').substring(0, 15)
            }));
    }, [data.details]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 1.5,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    boxShadow: 2,
                    fontSize: '0.875rem'
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography
                            key={index}
                            variant="body2"
                            sx={{ color: entry.color, fontSize: '0.8rem' }}
                        >
                            {entry.name}: {
                                entry.name.includes('CA') || entry.name === 'CA' ?
                                    formatCurrency(entry.value) :
                                    entry.name.includes('%') || entry.name === 'marge' ?
                                        `${entry.value?.toFixed(1)}%` :
                                        entry.value?.toLocaleString('fr-FR')
                            }
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Grid container spacing={2} sx={{ mb: 3 }}>

                {/* ✅ 1. ÉVOLUTION MENSUELLE CA/MARGE depuis HISTORY */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 320 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                            Évolution CA et Marge (12 mois)
                            {monthlyData.length === 0 && (
                                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                                    - Pas de données history
                                </Typography>
                            )}
                        </Typography>

                        <ResponsiveContainer width="100%" height={260}>
                            {monthlyData.length > 0 ? (
                                <ComposedChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="periode"
                                        tick={{ fontSize: 11 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={formatAxisCurrency}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={formatAxisPercentage}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="ca"
                                        name="CA"
                                        fill="#2196f3"
                                        fillOpacity={0.3}
                                        stroke="#2196f3"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="marge"
                                        name="Marge %"
                                        stroke="#f57c00"
                                        strokeWidth={3}
                                        dot={{ fill: '#f57c00', r: 4 }}
                                    />
                                </ComposedChart>
                            ) : (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: 'text.secondary'
                                }}>
                                    <Typography variant="body2">
                                        Aucune donnée d'historique disponible
                                    </Typography>
                                </Box>
                            )}
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* ✅ 2. RÉPARTITION QUALITÉS */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 320 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                            Répartition par Qualité ({data.details.length} produits)
                        </Typography>

                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={qualiteDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={35}
                                    paddingAngle={2}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    labelLine={false}
                                >
                                    {qualiteDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [`${value} produits`, 'Nombre']}
                                    labelFormatter={(label) => `Qualité: ${label}`}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* ✅ 3. CA PAR QUALITÉ */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                            CA par Qualité
                        </Typography>

                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={caByQualite}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="qualite" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="ca" name="CA Total" radius={[4, 4, 0, 0]}>
                                    {caByQualite.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* ✅ 4. TOP PRODUITS */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                            Top Produits par CA
                        </Typography>

                        <ResponsiveContainer width="100%" height={240}>
                            <ComposedChart
                                data={topProductsByCA}
                                margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="refint"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    tick={{ fontSize: 9 }}
                                    interval={0}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 9 }}
                                    tickFormatter={formatAxisCurrency}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 9 }}
                                    tickFormatter={formatAxisPercentage}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    yAxisId="left"
                                    dataKey="ca"
                                    name="CA"
                                    radius={[2, 2, 0, 0]}
                                >
                                    {topProductsByCA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={QUALITE_COLORS[entry.qualite] || '#757575'} />
                                    ))}
                                </Bar>
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="marge"
                                    name="Marge %"
                                    stroke="#e91e63"
                                    strokeWidth={2}
                                    dot={{ fill: '#e91e63', r: 3 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </motion.div>
    );
}