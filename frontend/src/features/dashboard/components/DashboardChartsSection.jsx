// frontend/src/features/dashboard/components/DashboardChartsSection.jsx
import React, { useMemo } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import { formatCurrency } from '@/lib/formatUtils';
import { getQualiteColor } from '@/lib/colors';

export default function DashboardChartsSection({ data, loading, selectedProduct }) {
    if (!data?.details || data.details.length === 0) return null;

    // 1. CA par qualité avec tes couleurs
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
                color: getQualiteColor(qualite)
            };
        }).filter(item => item.count > 0);
    }, [data.details]);

    // 2. Répartition qualités
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
            color: getQualiteColor(qualite)
        }));
    }, [data.details]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* CA par qualité */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{
                        p: 3,
                        height: 400,
                        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                        border: selectedProduct ? '2px solid #1976d2' : '1px solid #e0e0e0'
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>
                            📊 CA et Marges par Qualité
                            {selectedProduct && (
                                <Typography variant="body2" color="text.secondary">
                                    Focus: {selectedProduct.refint} ({selectedProduct.qualite})
                                </Typography>
                            )}
                        </Typography>
                        <ResponsiveContainer width="100%" height={320}>
                            <ComposedChart data={caByQualite}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis
                                    dataKey="qualite"
                                    tick={{ fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis yAxisId="left" orientation="left" tickFormatter={formatCurrency} />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'ca') return [formatCurrency(value), 'CA Total'];
                                        if (name === 'margin') return [`${value.toFixed(1)}%`, 'Marge Moyenne'];
                                        return [value, name];
                                    }}
                                    contentStyle={{
                                        border: '1px solid #1976d2',
                                        borderRadius: 8,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                <Bar
                                    yAxisId="left"
                                    dataKey="ca"
                                    name="CA Total"
                                    fill={(entry) => entry.color}
                                    radius={[4, 4, 0, 0]}
                                >
                                    {caByQualite.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="margin"
                                    name="Marge Moyenne %"
                                    stroke="#f57c00"
                                    strokeWidth={3}
                                    dot={{ fill: '#f57c00', strokeWidth: 2, r: 6 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Répartition qualités */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{
                        p: 3,
                        height: 400,
                        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                        border: '1px solid #e0e0e0'
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>
                            🎯 Répartition par Qualité
                        </Typography>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={qualiteDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    stroke="#fff"
                                    strokeWidth={2}
                                >
                                    {qualiteDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [`${value} produits`, 'Nombre']}
                                    contentStyle={{
                                        border: '1px solid #1976d2',
                                        borderRadius: 8,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Top 10 produits */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                        border: '1px solid #e0e0e0'
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>
                            🏆 Top 10 Produits par CA
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                            {data.details
                                .sort((a, b) => (b.ca_total || 0) - (a.ca_total || 0))
                                .slice(0, 10)
                                .map((product, index) => (
                                    <Paper
                                        key={product.cod_pro}
                                        elevation={2}
                                        sx={{
                                            p: 2,
                                            bgcolor: index < 3 ? '#fff3e0' : '#f8f9fa',
                                            border: `2px solid ${index < 3 ? '#f57c00' : '#e0e0e0'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { transform: 'scale(1.02)' }
                                        }}
                                        onClick={() => console.log('Top product click:', product)}
                                    >
                                        <Typography variant="caption" color="text.secondary">
                                            #{index + 1}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {product.refint}
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                                            {formatCurrency(product.ca_total || 0)}
                                        </Typography>
                                        <Box sx={{
                                            display: 'inline-block',
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: 1,
                                            bgcolor: getQualiteColor(product.qualite),
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            fontWeight: 600
                                        }}>
                                            {product.qualite || 'N/A'}
                                        </Box>
                                    </Paper>
                                ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </motion.div>
    );
}