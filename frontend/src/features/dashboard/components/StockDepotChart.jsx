// ===================================
// 📁 StockDepotChart.jsx - AVEC TRADUCTIONS
// ===================================

import React, { useMemo, useState } from 'react';
import { Paper, Typography, Box, Chip, Grid, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Analytics } from '@mui/icons-material';
import { formatCurrency, formatAxisCurrency } from '@/lib/formatUtils';
import { useTranslation } from '@/store/contexts/LanguageContext';

const getDepotColor = (index) => {
    const colors = [
        '#1976d2', '#2e7d32', '#f57c00', '#9c27b0', '#00acc1',
        '#5e35b1', '#c0ca33', '#6d4c41', '#546e7a', '#e91e63'
    ];
    return colors[index % colors.length];
};

export default function StockDepotChart({ data, onDepotClick, onAdvancedAnalysis }) {
    const { t } = useTranslation();
    const [showValue, setShowValue] = useState(true);

    if (!data?.stock || data.stock.length === 0) return null;

    const stockByDepot = useMemo(() => {
        const depotMap = {};
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
                    articlesUniques: new Set(),
                    totalLignes: 0
                };
            }

            depotMap[depot].quantite += stock;
            depotMap[depot].valorisation += valorisation;
            depotMap[depot].articlesUniques.add(codPro);
            depotMap[depot].totalLignes += 1;
        });

        return Object.values(depotMap)
            .map((depot, index) => ({
                depot: depot.depot,
                quantite: depot.quantite,
                valorisation: depot.valorisation,
                articles: depot.articlesUniques.size,
                totalLignes: depot.totalLignes,
                color: getDepotColor(index)
            }))
            .sort((a, b) => b.valorisation - a.valorisation);
    }, [data.stock]);

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
            articles: articlesUniques.size
        };
    }, [stockByDepot, data.stock]);

    if (stockByDepot.length === 0) {
        return (
            <Paper elevation={2} sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
                    {t('dashboard.stock.title', 'Stock par Dépôt')}
                </Typography>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('dashboard.stock.no_positive_stock', '📦 Aucun stock positif trouvé')}
                    </Typography>
                </Box>
            </Paper>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid #ddd', borderRadius: 1, boxShadow: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        {t('dashboard.stock.depot', 'Dépôt')} {label}
                    </Typography>
                    <Typography variant="body2">
                        {t('dashboard.stock.valuation', 'Valorisation')}: {formatCurrency(data.valorisation)}
                    </Typography>
                    <Typography variant="body2">
                        {t('dashboard.stock.quantity', 'Quantité')}: {data.quantite.toLocaleString('fr-FR')}
                    </Typography>
                    <Typography variant="body2">
                        {t('dashboard.stock.unique_items', 'Articles distincts')}: {data.articles}
                    </Typography>
                    <Typography variant="body2">
                        {t('dashboard.stock.total_lines', 'Total lignes')}: {data.totalLignes}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const handleAdvancedClick = () => {
        if (onAdvancedAnalysis) {
            onAdvancedAnalysis(data);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, height: 450 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {t('dashboard.stock.title', 'Stock par Dépôt')} ({stockByDepot.length} {t('dashboard.stock.depots_with_stock', 'dépôts avec stock')})
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Analytics />}
                        onClick={handleAdvancedClick}
                        sx={{ mr: 1, borderColor: '#1976d2', color: '#1976d2', '&:hover': { bgcolor: '#1976d2', color: 'white' } }}
                    >
                        {t('dashboard.stock.advanced_analysis', 'Analyse Avancée')}
                    </Button>

                    <Chip label={t('dashboard.stock.valuation', 'Valorisation')} clickable onClick={() => setShowValue(true)} color={showValue ? "primary" : "default"} size="small" sx={{ fontWeight: 600 }} />
                    <Chip label={t('dashboard.stock.quantity', 'Quantité')} clickable onClick={() => setShowValue(false)} color={!showValue ? "primary" : "default"} size="small" sx={{ fontWeight: 600 }} />
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, fontSize: '0.9rem' }}>
                            {formatCurrency(totalStats.valorisation, 'EUR', true)}
                        </Typography>
                        <Typography variant="caption">{t('dashboard.stock.total_valuation', 'Valorisation totale')}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700, fontSize: '0.9rem' }}>
                            {totalStats.quantite.toLocaleString('fr-FR')}
                        </Typography>
                        <Typography variant="caption">{t('dashboard.stock.total_quantity', 'Quantité totale')}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700, fontSize: '0.9rem' }}>
                            {totalStats.articles}
                        </Typography>
                        <Typography variant="caption">{t('dashboard.stock.unique_items', 'Articles distincts')}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700, fontSize: '0.9rem' }}>
                            {totalStats.totalLignes}
                        </Typography>
                        <Typography variant="caption">{t('dashboard.stock.total_lines', 'Total lignes')}</Typography>
                    </Box>
                </Grid>
            </Grid>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stockByDepot} margin={{ top: 10, right: 30, left: 20, bottom: 60 }} onClick={(data) => { if (data && data.activePayload) { onDepotClick?.(data.activePayload[0].payload); } }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="depot" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} interval={0} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={showValue ? formatAxisCurrency : (value) => value.toLocaleString('fr-FR')} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey={showValue ? "valorisation" : "quantite"} name={showValue ? "Valorisation" : "Quantité"} radius={[4, 4, 0, 0]} cursor="pointer">
                        {stockByDepot.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    {t('dashboard.stock.help_text', '💡 Cliquez sur une barre pour voir le détail du dépôt • Bouton "Analyse Avancée" pour l\'historique complet')}
                </Typography>
            </Box>
        </Paper>
    );
}