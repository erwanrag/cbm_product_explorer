// ===================================
// 📁 frontend/src/features/dashboard/components/StockAdvancedModal.jsx - NOUVEAU
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
    Divider
} from '@mui/material';
import { Close, Warehouse, TrendingDown, TrendingUp, Schedule } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '@/lib/formatUtils';

export default function StockAdvancedModal({
    open,
    onClose,
    data,
    selectedDepot = null
}) {
    const [viewMode, setViewMode] = useState('valorisation'); // valorisation | quantite
    const [selectedDepotFilter, setSelectedDepotFilter] = useState(selectedDepot?.depot || '');
    const [selectedProduct, setSelectedProduct] = useState('');

    if (!data?.stock) return null;

    // ✅ LISTES POUR LES FILTRES
    const depotList = useMemo(() => {
        const depots = [...new Set(data.stock.map(s => s.depot))].sort();
        return depots;
    }, [data.stock]);

    const productList = useMemo(() => {
        const products = [...new Set(data.stock.map(s => s.cod_pro))].sort();
        return products;
    }, [data.stock]);

    // ✅ DONNÉES FILTRÉES
    const filteredStock = useMemo(() => {
        return data.stock.filter(item => {
            const matchDepot = !selectedDepotFilter || item.depot === selectedDepotFilter;
            const matchProduct = !selectedProduct || item.cod_pro === selectedProduct;
            return matchDepot && matchProduct;
        });
    }, [data.stock, selectedDepotFilter, selectedProduct]);

    // ✅ KPI MÉTIER STOCK
    const stockKPIs = useMemo(() => {
        if (filteredStock.length === 0) return null;

        const totalQte = filteredStock.reduce((sum, s) => sum + (s.stock || 0), 0);
        const totalVal = filteredStock.reduce((sum, s) => sum + ((s.stock || 0) * (s.pmp || 0)), 0);
        const produitsSansStock = filteredStock.filter(s => (s.stock || 0) === 0).length;
        const produitsEnStock = filteredStock.filter(s => (s.stock || 0) > 0).length;

        // Calcul du taux de disponibilité
        const tauxDisponibilite = filteredStock.length > 0 ?
            (produitsEnStock / filteredStock.length) * 100 : 0;

        // Simulation jours à 0 (à adapter selon vos données réelles)
        const joursZeroMoyen = 15; // Exemple

        return {
            totalQuantite: totalQte,
            totalValorisation: totalVal,
            produitsSansStock,
            produitsEnStock,
            tauxDisponibilite,
            joursZeroMoyen,
            pmpMoyen: totalQte > 0 ? totalVal / totalQte : 0
        };
    }, [filteredStock]);

    // ✅ DONNÉES POUR GRAPHIQUES
    const chartData = useMemo(() => {
        // Grouper par dépôt si pas de filtre dépôt, sinon par produit
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
            .slice(0, 20); // Top 20
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
            PaperProps={{
                sx: { height: '90vh' }
            }}
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
                        <Grid item xs={12} sm={3}>
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

                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Produit</InputLabel>
                                <Select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    label="Produit"
                                >
                                    <MenuItem value="">Tous les produits</MenuItem>
                                    {productList.map(cod_pro => (
                                        <MenuItem key={cod_pro} value={cod_pro}>
                                            {cod_pro}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
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

                        <Grid item xs={12} sm={3}>
                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                <strong>{filteredStock.length}</strong> ligne(s) de stock
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* ✅ KPI MÉTIER STOCK */}
                {stockKPIs && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                                        {stockKPIs.tauxDisponibilite.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption">Taux Disponibilité</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#ffebee' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                                        {stockKPIs.produitsSansStock}
                                    </Typography>
                                    <Typography variant="caption">Produits à 0</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                                        {stockKPIs.produitsEnStock}
                                    </Typography>
                                    <Typography variant="caption">Produits en stock</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700 }}>
                                        {stockKPIs.joursZeroMoyen}j
                                    </Typography>
                                    <Typography variant="caption">Jours à 0 moy.</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#f3e5f5' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                                        {formatCurrency(stockKPIs.totalValorisation, 'EUR', true)}
                                    </Typography>
                                    <Typography variant="caption">Valorisation</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#f8f9fa' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {stockKPIs.totalQuantite.toLocaleString('fr-FR')}
                                    </Typography>
                                    <Typography variant="caption">Quantité totale</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* ✅ GRAPHIQUE PRINCIPAL */}
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {selectedDepotFilter ?
                            `Top Produits - Dépôt ${selectedDepotFilter}` :
                            'Top Dépôts'
                        }
                        {viewMode === 'valorisation' ? ' par Valorisation' : ' par Quantité'}
                    </Typography>

                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={viewMode === 'valorisation' ?
                                    (value) => formatCurrency(value, 'EUR', true) :
                                    (value) => value.toLocaleString('fr-FR')
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

            <DialogActions sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    💡 Cliquez sur les filtres pour affiner l'analyse
                </Typography>
                <Button onClick={onClose} variant="contained">
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    );
}