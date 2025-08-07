// ===================================
// 📁 frontend/src/features/dashboard/components/StockAdvancedModal.jsx - VERSION FINALE COMPLÈTE
// ===================================

import React, { useState, useMemo, useEffect } from 'react';
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
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import { Close, Warehouse, TrendingDown, TrendingUp, Schedule, History } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '@/lib/formatUtils';
import { stockService } from '@/api/services/stockService';
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
    const [historyMonths, setHistoryMonths] = useState(12);

    // ✅ États pour l'historique
    const [stockHistory, setStockHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);

    if (!data?.stock) return null;

    // ✅ APPEL API POUR RÉCUPÉRER L'HISTORIQUE AVEC LES FILTRES DU DASHBOARD
    useEffect(() => {
        const fetchStockHistory = async () => {
            if (!open || !filters) return;

            setHistoryLoading(true);
            setHistoryError(null);

            try {
                // ✅ Utiliser les filtres du dashboard (cod_pro, grouping_crn, etc.)
                //console.log('🔄 Fetching stock history with dashboard filters:', filters, 'months:', historyMonths);

                const payload = {
                    ...filters, // Reprendre tous les filtres du dashboard
                    // Ajouter des filtres spécifiques si besoin
                };

                const response = await stockService.getHistory(payload, historyMonths);
                const historyData = response?.items || [];

                //console.log('✅ Stock history received:', historyData.length, 'items');
                //console.log('📊 Sample history data:', historyData.slice(0, 3));
                setStockHistory(historyData);

            } catch (error) {
                console.error('❌ Error fetching stock history:', error);
                setHistoryError(`Erreur lors du chargement de l'historique: ${error.message}`);
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchStockHistory();
    }, [open, filters, historyMonths]);

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
            const hasStock = (item.stock || 0) > 0; // ✅ Seulement stock > 0
            const matchDepot = !selectedDepotFilter || item.depot === selectedDepotFilter;
            const matchProduct = !selectedProduct || item.cod_pro === selectedProduct;
            return hasStock && matchDepot && matchProduct;
        });
    }, [data.stock, selectedDepotFilter, selectedProduct]);

    // ✅ DONNÉES HISTORIQUES FILTRÉES
    const filteredHistory = useMemo(() => {
        return stockHistory.filter(item => {
            const matchDepot = !selectedDepotFilter || item.depot === selectedDepotFilter;
            const matchProduct = !selectedProduct || item.cod_pro === selectedProduct;
            return matchDepot && matchProduct;
        });
    }, [stockHistory, selectedDepotFilter, selectedProduct]);

    // ✅ KPI MÉTIER STOCK
    const stockKPIs = useMemo(() => {
        if (filteredStock.length === 0) return null;

        const totalQte = filteredStock.reduce((sum, s) => sum + (s.stock || 0), 0);
        const totalVal = filteredStock.reduce((sum, s) => sum + ((s.stock || 0) * (s.pmp || 0)), 0);
        const produitsEnStock = filteredStock.length; // Tous ont stock > 0
        const articlesUniques = new Set(filteredStock.map(s => s.cod_pro)).size;

        // Calcul du taux de disponibilité basé sur les données complètes
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

    // ✅ DONNÉES POUR GRAPHIQUES (STOCK ACTUEL)
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

    // ✅ DONNÉES POUR GRAPHIQUE HISTORIQUE - GROUPÉ PAR PÉRIODE
    const historyChartData = useMemo(() => {
        if (filteredHistory.length === 0) return [];

        const grouped = {};

        filteredHistory.forEach(item => {
            const periode = item.dat_deb ? item.dat_deb.substring(0, 7) : null; // YYYY-MM
            if (!periode) return;

            if (!grouped[periode]) {
                grouped[periode] = {
                    periode,
                    quantite: 0,
                    valorisation: 0,
                    articles: new Set(),
                    entrees: 0
                };
            }

            grouped[periode].quantite += item.stock || 0;
            grouped[periode].valorisation += (item.stock || 0) * (item.pmp || 0);
            grouped[periode].articles.add(item.cod_pro);
            grouped[periode].entrees += 1;
        });

        return Object.values(grouped)
            .map(item => ({
                periode: item.periode,
                quantite: item.entrees > 0 ? item.quantite / item.entrees : 0,
                valorisation: item.entrees > 0 ? item.valorisation / item.entrees : 0,
                articles: item.articles.size
            }))
            .sort((a, b) => a.periode.localeCompare(b.periode))
            .slice(-24); // 24 derniers mois max
    }, [filteredHistory]);

    // ✅ DONNÉES DÉTAILLÉES POUR GRAPHIQUE GRANULAIRE (par semaine/jour)
    const detailedChartData = useMemo(() => {
        if (filteredHistory.length === 0) return [];

        return filteredHistory
            .map(item => ({
                periode: item.dat_deb,
                fin: item.dat_fin,
                quantite: item.stock || 0,
                valorisation: (item.stock || 0) * (item.pmp || 0),
                depot: item.depot,
                cod_pro: item.cod_pro,
                pmp: item.pmp || 0
            }))
            .sort((a, b) => a.periode.localeCompare(b.periode))
            .slice(-100); // 100 dernières entrées
    }, [filteredHistory]);

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
                        <Grid item xs={12} sm={2.5}>
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

                        <Grid item xs={12} sm={2.5}>
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

                        <Grid item xs={12} sm={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Historique</InputLabel>
                                <Select
                                    value={historyMonths}
                                    onChange={(e) => setHistoryMonths(e.target.value)}
                                    label="Historique"
                                >
                                    <MenuItem value={6}>6 mois</MenuItem>
                                    <MenuItem value={12}>12 mois</MenuItem>
                                    <MenuItem value={24}>24 mois</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={2}>
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
                                <strong>{filteredStock.length}</strong> ligne(s) de stock {'> 0'}
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
                                        {stockKPIs.articlesUniques}
                                    </Typography>
                                    <Typography variant="caption">Articles uniques</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#f3e5f5' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                                        {formatCurrency(stockKPIs.totalValorisation, 'EUR', true)}
                                    </Typography>
                                    <Typography variant="caption">Valorisation totale</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={3}>
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

                {/* ✅ GRAPHIQUES EN PARALLÈLE */}
                <Grid container spacing={3}>
                    {/* Graphique Stock Actuel */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                                Stock Actuel ({chartData.length} {selectedDepotFilter ? 'produits' : 'dépôts'})
                            </Typography>

                            <ResponsiveContainer width="100%" height={300}>
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
                                            viewMode === 'valorisation' ?
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
                    </Grid>

                    {/* Graphique Historique Mensuel */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <History sx={{ mr: 1, color: 'secondary.main' }} />
                                Évolution Mensuelle ({historyMonths} mois)
                                {historyLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                            </Typography>

                            {historyError && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    {historyError}
                                </Alert>
                            )}

                            {historyChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={historyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="periode"
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={
                                                viewMode === 'valorisation' ?
                                                    (value) => formatCurrency(value, 'EUR', true) :
                                                    (value) => value.toLocaleString('fr-FR')
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value) =>
                                                viewMode === 'valorisation' 
                                                    ? [formatCurrency(value), 'Valorisation']
                                                     : [value.toLocaleString('fr-FR'), 'Quantité']
                                            }
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={viewMode}
                                            stroke="#ff7300"
                                            strokeWidth={3}
                                            dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, stroke: '#ff7300', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {historyLoading ?
                                            '⏳ Chargement de l\'historique...' :
                                            '📊 Aucune donnée historique disponible'
                                        }
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* ✅ GRAPHIQUE DÉTAILLÉ (GRANULAIRE) */}
                {detailedChartData.length > 0 && (
                    <Paper sx={{ p: 2, mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Schedule sx={{ mr: 1, color: 'info.main' }} />
                            Évolution Détaillée ({detailedChartData.length} périodes)
                        </Typography>

                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={detailedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="periode"
                                    tick={{ fontSize: 8 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={
                                        viewMode === 'valorisation' ?
                                            (value) => formatCurrency(value, 'EUR', true) :
                                            (value) => value.toLocaleString('fr-FR')
                                    }
                                />
                                <Tooltip
                                    formatter={(value) =>
                                        viewMode === 'valorisation'
                                            ? [formatCurrency(value), 'Valorisation']
                                            : [value.toLocaleString('fr-FR'), 'Quantité']
                                    }
                                    labelFormatter={(label) => `Période: ${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey={viewMode}
                                    stroke="#1976d2"
                                    strokeWidth={2}
                                    dot={{ fill: '#1976d2', strokeWidth: 1, r: 2 }}
                                    activeDot={{ r: 4, stroke: '#1976d2', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                )}

                {/* ✅ TABLEAU RÉCAPITULATIF */}
                {filteredHistory.length > 0 && (
                    <Paper sx={{ p: 2, mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            📋 Résumé Historique ({filteredHistory.length} entrées)
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {filteredHistory.length > 0 ?
                                            filteredHistory.reduce((min, h) => h.dat_deb < min ? h.dat_deb : min, filteredHistory[0].dat_deb) :
                                            'N/A'
                                        }
                                    </Typography>
                                    <Typography variant="caption">Première date</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {filteredHistory.length > 0 ?
                                            filteredHistory.reduce((max, h) => h.dat_deb > max ? h.dat_deb : max, filteredHistory[0].dat_deb) :
                                            'N/A'
                                        }
                                    </Typography>
                                    <Typography variant="caption">Dernière date</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {filteredHistory.length > 0 ?
                                            filteredHistory.reduce((max, h) => h.dat_deb > max ? h.dat_deb : max, filteredHistory[0].dat_deb) :
                                            'N/A'
                                        }
                                    </Typography>
                                    <Typography variant="caption">Dernière date</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {filteredHistory.reduce((sum, h) => sum + (h.stock || 0), 0).toLocaleString('fr-FR')}
                                    </Typography>
                                    <Typography variant="caption">Quantité totale</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={3}>
                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {formatCurrency(
                                            filteredHistory.reduce((sum, h) => sum + ((h.stock || 0) * (h.pmp || 0)), 0),
                                            'EUR',
                                            true
                                        )}
                                    </Typography>
                                    <Typography variant="caption">Valorisation totale</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" startIcon={<Close />}>
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    );
}
