// ===================================
// 📁 frontend/src/features/dashboard/components/StockAdvancedModal.jsx
// ===================================

import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Paper,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
} from '@mui/material';
import { Close, Warehouse, TrendingUp } from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatUtils';
import { useLayout } from '@/store/hooks/useLayout';

export default function StockAdvancedModal({
    open,
    onClose,
    data,
    selectedDepot = null
}) {
    const { filters } = useLayout();
    const [viewMode, setViewMode] = useState('valorisation'); // valorisation | quantite
    const [selectedDepotFilter, setSelectedDepotFilter] = useState(selectedDepot?.depot || '');
    const [selectedProduct, setSelectedProduct] = useState('');

    if (!data?.stock) return null;

    // ✅ LISTES POUR LES FILTRES
    const depotList = useMemo(() => {
        const depots = [...new Set(data.stock.map(s => s.depot))].filter(Boolean).sort();
        return depots;
    }, [data.stock]);

    const productList = useMemo(() => {
        const products = [...new Set(data.stock.map(s => s.cod_pro))].filter(Boolean).sort();
        return products;
    }, [data.stock]);

    // ✅ DONNÉES FILTRÉES (STOCK ACTUEL) - SEULEMENT STOCK > 0
    const filteredStock = useMemo(() => {
        return data.stock.filter(item => {
            const hasStock = (item.stock || 0) > 0;
            const matchDepot = !selectedDepotFilter || item.depot === selectedDepotFilter;
            const matchProduct = !selectedProduct || item.cod_pro === selectedProduct;
            return hasStock && matchDepot && matchProduct;
        });
    }, [data.stock, selectedDepotFilter, selectedProduct]);

    // ✅ KPI MÉTIER STOCK
    const stockKPIs = useMemo(() => {
        if (filteredStock.length === 0) return null;

        const totalQte = filteredStock.reduce((sum, s) => sum + (s.stock || 0), 0);
        const totalVal = filteredStock.reduce((sum, s) => sum + ((s.stock || 0) * (s.pmp || 0)), 0);
        const produitsEnStock = filteredStock.length;
        const articlesUniques = new Set(filteredStock.map(s => s.cod_pro)).size;

        const totalProductsForFilter = data.stock.filter(item => {
            const matchDepot = !selectedDepotFilter || item.depot === selectedDepotFilter;
            const matchProduct = !selectedProduct || item.cod_pro === selectedProduct;
            return matchDepot && matchProduct;
        }).length;

        const tauxDisponibilite = totalProductsForFilter > 0 ?
            (produitsEnStock / totalProductsForFilter) * 100 : 0;

        return {
            totalQuantite: totalQte,
            totalValorisation: totalVal,
            produitsEnStock,
            articlesUniques,
            tauxDisponibilite,
            pmpMoyen: totalQte > 0 ? totalVal / totalQte : 0
        };
    }, [filteredStock, data.stock, selectedDepotFilter, selectedProduct]);

    // ✅ DONNÉES POUR GRAPHIQUE STOCK ACTUEL
    const chartData = useMemo(() => {
        const groupBy = selectedDepotFilter ? 'cod_pro' : 'depot';
        const grouped = {};

        filteredStock.forEach(item => {
            const key = item[groupBy];
            if (!grouped[key]) {
                grouped[key] = {
                    name: key,
                    quantite: 0,
                    valorisation: 0,
                    articles: 0
                };
            }
            grouped[key].quantite += item.stock || 0;
            grouped[key].valorisation += (item.stock || 0) * (item.pmp || 0);
            grouped[key].articles += 1;
        });

        return Object.values(grouped)
            .sort((a, b) => b[viewMode] - a[viewMode])
            .slice(0, 20);
    }, [filteredStock, selectedDepotFilter, viewMode]);

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
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedDepotFilter ? `Produit ${label}` : `Dépôt ${label}`}
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
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{ sx: { height: '90vh' } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warehouse sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        Analyse Stock Avancée
                        {selectedDepot && ` - Dépôt ${selectedDepot.depot}`}
                    </Typography>
                </Box>
                <Button onClick={onClose} startIcon={<Close />}>
                    Fermer
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* ✅ FILTRES */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Dépôt</InputLabel>
                                <Select
                                    value={selectedDepotFilter}
                                    onChange={(e) => setSelectedDepotFilter(e.target.value)}
                                    label="Dépôt"
                                >
                                    <MenuItem value="">Tous les dépôts</MenuItem>
                                    {depotList.map(depot => (
                                        <MenuItem key={depot} value={depot}>
                                            Dépôt {depot}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Produit</InputLabel>
                                <Select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    label="Produit"
                                >
                                    <MenuItem value="">Tous les produits</MenuItem>
                                    {productList.slice(0, 50).map(cod_pro => (
                                        <MenuItem key={cod_pro} value={cod_pro}>
                                            {cod_pro}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Chip
                                    label="Valorisation"
                                    clickable
                                    onClick={() => setViewMode('valorisation')}
                                    color={viewMode === 'valorisation' ? "primary" : "default"}
                                    size="small"
                                />
                                <Chip
                                    label="Quantité"
                                    clickable
                                    onClick={() => setViewMode('quantite')}
                                    color={viewMode === 'quantite' ? "primary" : "default"}
                                    size="small"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* ✅ KPI MÉTIER */}
                {stockKPIs && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                                        {stockKPIs.tauxDisponibilite.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption">Taux Disponibilité</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                                        {stockKPIs.produitsEnStock}
                                    </Typography>
                                    <Typography variant="caption">Produits en stock</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700 }}>
                                        {stockKPIs.articlesUniques}
                                    </Typography>
                                    <Typography variant="caption">Articles uniques</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#f3e5f5' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                                        {formatCurrency(stockKPIs.totalValorisation, 'EUR', true)}
                                    </Typography>
                                    <Typography variant="caption">Valorisation totale</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e0f2f1' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#00695c', fontWeight: 700 }}>
                                        {formatCurrency(stockKPIs.pmpMoyen)}
                                    </Typography>
                                    <Typography variant="caption">PMP Moyen</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* ✅ GRAPHIQUE STOCK ACTUEL */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                        Stock Actuel ({chartData.length} {selectedDepotFilter ? 'produits' : 'dépôts'})
                    </Typography>

                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={
                                    viewMode === 'valorisation'
                                        ? (value) => formatCurrency(value, 'EUR', true)
                                        : (value) => value.toLocaleString('fr-FR')
                                }
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey={viewMode}
                                fill="#1976d2"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" startIcon={<Close />}>
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    );
}
