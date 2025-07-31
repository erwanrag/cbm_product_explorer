// ===================================
// 📁 frontend/src/features/dashboard/components/StockDepotChart.jsx - COMPLET
// ===================================

import React, { useMemo, useState } from 'react';
import { Paper, Typography, Box, Chip, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, formatAxisCurrency } from '@/lib/formatUtils';

export default function StockDepotChart({ data, onDepotClick }) {
    const [showValue, setShowValue] = useState(true); // true = valorisation, false = quantité

    if (!data?.stock || data.stock.length === 0) return null;

    // ✅ AGGREGATION PAR DÉPÔT
    const stockByDepot = useMemo(() => {
        const depotMap = {};

        data.stock.forEach(stockItem => {
            const depot = stockItem.depot || 'Dépôt inconnu';
            const stock = stockItem.stock || 0;
            const pmp = stockItem.pmp || 0;
            const valorisation = stock * pmp;

            if (!depotMap[depot]) {
                depotMap[depot] = {
                    depot,
                    quantite: 0,
                    valorisation: 0,
                    articles: 0
                };
            }

            depotMap[depot].quantite += stock;
            depotMap[depot].valorisation += valorisation;
            depotMap[depot].articles += 1;
        });

        // Convertir en array et trier par valorisation décroissante
        return Object.values(depotMap)
            .sort((a, b) => b.valorisation - a.valorisation)
            .map((depot, index) => ({
                ...depot,
                color: getDepotColor(index)
            }));
    }, [data.stock]);

    // ✅ STATISTIQUES GLOBALES
    const totalStats = useMemo(() => {
        const total = stockByDepot.reduce((acc, depot) => ({
            quantite: acc.quantite + depot.quantite,
            valorisation: acc.valorisation + depot.valorisation,
            articles: acc.articles + depot.articles
        }), { quantite: 0, valorisation: 0, articles: 0 });

        return total;
    }, [stockByDepot]);

    // Couleurs pour les dépôts
    const getDepotColor = (index) => {
        const colors = [
            '#1976d2', '#2e7d32', '#f57c00', '#9c27b0', '#00acc1',
            '#5e35b1', '#c0ca33', '#6d4c41', '#546e7a', '#e91e63'
        ];
        return colors[index % colors.length];
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    boxShadow: 2
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Dépôt {label}
                    </Typography>
                    <Typography variant="body2">
                        Valorisation: {formatCurrency(data.valorisation)}
                    </Typography>
                    <Typography variant="body2">
                        Quantité: {data.quantite.toLocaleString('fr-FR')}
                    </Typography>
                    <Typography variant="body2">
                        Articles: {data.articles}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Stock par Dépôt ({stockByDepot.length} dépôts)
                </Typography>

                {/* Sélecteur Valorisation / Quantité */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label="Valorisation"
                        clickable
                        onClick={() => setShowValue(true)}
                        color={showValue ? "primary" : "default"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip
                        label="Quantité"
                        clickable
                        onClick={() => setShowValue(false)}
                        color={!showValue ? "primary" : "default"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            </Box>

            {/* KPI Stats */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, fontSize: '0.9rem' }}>
                            {formatCurrency(totalStats.valorisation, 'EUR', true)}
                        </Typography>
                        <Typography variant="caption">Valorisation totale</Typography>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700, fontSize: '0.9rem' }}>
                            {totalStats.quantite.toLocaleString('fr-FR')}
                        </Typography>
                        <Typography variant="caption">Quantité totale</Typography>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700, fontSize: '0.9rem' }}>
                            {totalStats.articles}
                        </Typography>
                        <Typography variant="caption">Articles</Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Graphique */}
            <ResponsiveContainer width="100%" height={240}>
                <BarChart
                    data={stockByDepot}
                    margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                    onClick={(data) => {
                        if (data && data.activePayload) {
                            onDepotClick?.(data.activePayload[0].payload);
                        }
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="depot"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                        interval={0}
                    />
                    <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={showValue ? formatAxisCurrency : (value) => value.toLocaleString('fr-FR')}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey={showValue ? "valorisation" : "quantite"}
                        name={showValue ? "Valorisation" : "Quantité"}
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                    >
                        {stockByDepot.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
}