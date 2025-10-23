// ===================================
// 📁 DashboardChartsSection.jsx - AVEC TRADUCTIONS
// ===================================

import React, { useMemo } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area
} from 'recharts';
import { formatCurrency, formatAxisCurrency, formatAxisPercentage } from '@/lib/formatUtils';
import { getQualiteColor } from '@/constants/colors';
import { useTranslation } from '@/store/contexts/LanguageContext';

export default function DashboardChartsSection({ data, loading }) {
    const { t } = useTranslation();

    if (!data?.details || data.details.length === 0) return null;

    const QUALITE_COLORS = {
        'OE': '#2196f3',
        'OEM': '#4caf50',
        'PMQ': '#ff9800',
        'PMV': '#9c27b0'
    };

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

    const monthlyData = useMemo(() => {
        if (!data.history || data.history.length === 0) {
            return [];
        }

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

            monthlyMap[periode].ca += historyItem.ca_total || historyItem.ca || 0;
            monthlyMap[periode].quantite += historyItem.quantite_total || historyItem.quantite || 0;
            monthlyMap[periode].marge += historyItem.marge_percent_total || historyItem.marge_percent || 0;
            monthlyMap[periode].count += 1;
        });

        return Object.values(monthlyMap)
            .map(item => ({
                periode: item.periode,
                ca: item.ca,
                quantite: item.quantite,
                marge: item.count > 0 ? item.marge / item.count : 0
            }))
            .sort((a, b) => a.periode.localeCompare(b.periode))
            .slice(-12);
    }, [data.history]);

    const topProducts = useMemo(() => {
        return [...data.details]
            .sort((a, b) => (b.ca_total || 0) - (a.ca_total || 0))
            .slice(0, 10)
            .map(p => ({
                name: `${p.cod_pro} - ${(p.nom_pro || '').substring(0, 20)}`,
                ca: p.ca_total || 0,
                quantite: p.quantite_total || 0,
                marge: p.marge_percent_total || 0
            }));
    }, [data.details]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    boxShadow: 2
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: {
                                entry.name.includes('%') ?
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>

                {/* Évolution mensuelle */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 320 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                            {t('dashboard.charts.monthly_evolution', 'Évolution CA et Marge (12 mois)')}
                        </Typography>

                        <ResponsiveContainer width="100%" height={260}>
                            {monthlyData.length > 0 ? (
                                <ComposedChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="periode" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                                    <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} tickFormatter={formatAxisCurrency} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={formatAxisPercentage} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area yAxisId="left" type="monotone" dataKey="ca" name="CA" fill="#2196f3" fillOpacity={0.3} stroke="#2196f3" strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="marge" name="Marge %" stroke="#f57c00" strokeWidth={3} dot={{ fill: '#f57c00', r: 4 }} />
                                </ComposedChart>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('dashboard.charts.no_history', 'Aucune donnée d\'historique disponible')}
                                    </Typography>
                                </Box>
                            )}
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* CA par qualité */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 320 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                            {t('dashboard.charts.revenue_by_quality', 'CA par Qualité')}
                        </Typography>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={caByQualite}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="qualite" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={formatAxisCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="ca" name="CA" radius={[4, 4, 0, 0]}>
                                    {caByQualite.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Distribution qualités */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 320 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                            {t('dashboard.charts.quality_distribution', 'Répartition par Qualité')}
                        </Typography>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={qualiteDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {qualiteDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Top 10 produits */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 320 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                            {t('dashboard.charts.top_products', 'Top 10 Produits (CA)')}
                        </Typography>
                        <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                            data={topProducts}
                            layout="vertical"
                            margin={{ left: 120, right: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={formatAxisCurrency} />
                            <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 9 }}
                            width={130}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                            dataKey="ca"
                            name={t('dashboard.charts.ca', 'CA')}
                            fill="#2196f3"
                            radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

            </Grid>
        </motion.div>
    );
}