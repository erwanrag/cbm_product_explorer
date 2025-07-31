// ===================================
// 📁 frontend/src/features/dashboard/components/StockDepotChart.jsx - AVEC BOUTON MODAL AVANCÉ
// ===================================

import React, { useMemo, useState } from 'react';
import { Paper, Typography, Box, Chip, Grid, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Analytics, TrendingUp } from '@mui/icons-material';
import { formatCurrency, formatAxisCurrency } from '@/lib/formatUtils';

// ✅ FONCTION DE COULEURS DÉCLARÉE EN PREMIER
const getDepotColor = (index) => {
    const colors = [
        '#1976d2', '#2e7d32', '#f57c00', '#9c27b0', '#00acc1',
        '#5e35b1', '#c0ca33', '#6d4c41', '#546e7a', '#e91e63'
    ];
    return colors[index % colors.length];
};

export default function StockDepotChart({ data, onDepotClick, onAdvancedAnalysis }) {
    const [showValue, setShowValue] = useState(true); // true = valorisation, false = quantité

    if (!data?.stock || data.stock.length === 0) return null;

    // ✅ AGGREGATION PAR DÉPÔT - SEULEMENT STOCK > 0
    const stockByDepot = useMemo(() => {
        const depotMap = {};

        // ✅ FILTRER SEULEMENT LES STOCKS > 0
        const stocksPositifs = data.stock.filter(stockItem => (stockItem.stock || 0) > 0);

        stocksPositifs.forEach(stockItem => {
            const depot = stockItem.depot || 'Dépôt inconnu';
            const stock = stockItem.stock || 0;
            const pmp = stockItem.pmp || 0;
            const valorisation = stock * pmp;
            const codPro = stockItem.cod_pro;

            if (!depotMap[depot]) {
                depotMap[depot] = {
                    depot,
                    quantite: 0,
                    valorisation: 0,
                    articlesUniques: new Set(), // ✅ Utiliser un Set pour les articles uniques
                    totalLignes: 0
                };
            }

            depotMap[depot].quantite += stock;
            depotMap[depot].valorisation += valorisation;
            depotMap[depot].articlesUniques.add(codPro); // ✅ Ajouter au Set (évite les doublons)
            depotMap[depot].totalLignes += 1;
        });

        // Convertir en array et trier par valorisation décroissante
        return Object.values(depotMap)
            .map((depot, index) => ({
                depot: depot.depot,
                quantite: depot.quantite,
                valorisation: depot.valorisation,
                articles: depot.articlesUniques.size, // ✅ Nombre d'articles distincts
                totalLignes: depot.totalLignes,
                color: getDepotColor(index)
            }))
            .sort((a, b) => b.valorisation - a.valorisation);
    }, [data.stock]);

    // ✅ STATISTIQUES GLOBALES - SEULEMENT STOCKS > 0
    const totalStats = useMemo(() => {
        const stocksPositifs = data.stock.filter(s => (s.stock || 0) > 0);
        const articlesUniques = new Set(stocksPositifs.map(s => s.cod_pro));

        const total = stockByDepot.reduce((acc, depot) => ({
            quantite: acc.quantite + depot.quantite,
            valorisation: acc.valorisation + depot.valorisation,
            totalLignes: acc.totalLignes + depot.totalLignes
        }), { quantite: 0, valorisation: 0, totalLignes: 0 });

        return {
            ...total,
            articles: articlesUniques.size // ✅ Articles uniques globaux
        };
    }, [stockByDepot, data.stock]);

    // ✅ AFFICHAGE SEULEMENT DES DÉPÔTS AVEC STOCK > 0
    if (stockByDepot.length === 0) {
        return (
            <Paper elevation={2} sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
                    Stock par Dépôt
                </Typography>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                        📦 Aucun stock positif trouvé
                    </Typography>
                </Box>
            </Paper>
        );
    }

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
                        Articles distincts: {data.articles}
                    </Typography>
                    <Typography variant="body2">
                        Total lignes: {data.totalLignes}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    // ✅ HANDLERS
    const handleAdvancedClick = () => {
        if (onAdvancedAnalysis) {
            onAdvancedAnalysis(data);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, height: 450 }}>
            {/* Header avec titre et boutons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    Stock par Dépôt ({stockByDepot.length} dépôts avec stock)
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {/* Bouton Analyse Avancée */}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Analytics />}
                        onClick={handleAdvancedClick}
                        sx={{
                            mr: 1,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                                bgcolor: '#1976d2',
                                color: 'white'
                            }
                        }}
                    >
                        Analyse Avancée
                    </Button>

                    {/* Sélecteur Valorisation / Quantité */}
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

            {/* KPI Stats - Seulement stocks > 0 */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, fontSize: '0.9rem' }}>
                            {formatCurrency(totalStats.valorisation, 'EUR', true)}
                        </Typography>
                        <Typography variant="caption">Valorisation totale</Typography>
                    </Box>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700, fontSize: '0.9rem' }}>
                            {totalStats.quantite.toLocaleString('fr-FR')}
                        </Typography>
                        <Typography variant="caption">Quantité totale</Typography>
                    </Box>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700, fontSize: '0.9rem' }}>
                            {totalStats.articles}
                        </Typography>
                        <Typography variant="caption">Articles distincts</Typography>
                    </Box>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700, fontSize: '0.9rem' }}>
                            {totalStats.totalLignes}
                        </Typography>
                        <Typography variant="caption">Total lignes</Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Graphique */}
            <ResponsiveContainer width="100%" height={280}>
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

            {/* Aide utilisateur */}
            <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    💡 Cliquez sur une barre pour voir le détail du dépôt • Bouton "Analyse Avancée" pour l'historique complet
                </Typography>
            </Box>
        </Paper>
    );
}