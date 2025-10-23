// ===================================
// 📁 StockAdvancedModal.jsx - AVEC TRADUCTIONS
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
import { useTranslation } from '@/store/contexts/LanguageContext';

export default function StockAdvancedModal({
    open,
    onClose,
    data,
    selectedDepot = null
}) {
    const { t } = useTranslation();
    const { filters } = useLayout();
    const [viewMode, setViewMode] = useState('valorisation');
    const [selectedDepotFilter, setSelectedDepotFilter] = useState(selectedDepot?.depot || '');
    const [selectedProduct, setSelectedProduct] = useState('');

    if (!data?.stock) return null;

    const depotList = useMemo(() => {
        const depots = [...new Set(data.stock.map(s => s.depot))].filter(Boolean).sort();
        return depots;
    }, [data.stock]);

    const productList = useMemo(() => {
        const products = [...new Set(data.stock.map(s => s.cod_pro))].filter(Boolean).sort();
        return products;
    }, [data.stock]);

    const filteredStock = useMemo(() => {
        return data.stock.filter(item => {
            const hasStock = (item.stock || 0) > 0;
            const matchDepot = !selectedDepotFilter || item.depot === selectedDepotFilter;
            const matchProduct = !selectedProduct || item.cod_pro === selectedProduct;
            return hasStock && matchDepot && matchProduct;
        });
    }, [data.stock, selectedDepotFilter, selectedProduct]);

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
                <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid #ddd', borderRadius: 1, boxShadow: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedDepotFilter ? `${t('dashboard.stock.product', 'Produit')} ${label}` : `${t('dashboard.stock.depot', 'Dépôt')} ${label}`}
                    </Typography>
                    <Typography variant="body2">
                        {t('dashboard.stock.valuation', 'Valorisation')}: {formatCurrency(data.valorisation)}
                    </Typography>
                    <Typography variant="body2">
                        {t('dashboard.stock.quantity', 'Quantité')}: {data.quantite.toLocaleString('fr-FR')}
                    </Typography>
                    <Typography variant="body2">
                        {t('dashboard.stock.items', 'Articles')}: {data.articles}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warehouse sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        {t('dashboard.stock.advanced_analysis', 'Analyse Stock Avancée')}
                        {selectedDepot && ` - ${t('dashboard.stock.depot', 'Dépôt')} ${selectedDepot.depot}`}
                    </Typography>
                </Box>
                <Button onClick={onClose} startIcon={<Close />}>
                    {t('common.close', 'Fermer')}
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('dashboard.stock.depot', 'Dépôt')}</InputLabel>
                                <Select value={selectedDepotFilter} onChange={(e) => setSelectedDepotFilter(e.target.value)} label={t('dashboard.stock.depot', 'Dépôt')}>
                                    <MenuItem value="">{t('dashboard.stock.all_depots', 'Tous les dépôts')}</MenuItem>
                                    {depotList.map(depot => (
                                        <MenuItem key={depot} value={depot}>
                                            {t('dashboard.stock.depot', 'Dépôt')} {depot}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{t('dashboard.stock.product', 'Produit')}</InputLabel>
                                <Select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} label={t('dashboard.stock.product', 'Produit')}>
                                    <MenuItem value="">{t('dashboard.stock.all_products', 'Tous les produits')}</MenuItem>
                                    {productList.slice(0, 50).map(cod_pro => (
                                        <MenuItem key={cod_pro} value={cod_pro}>{cod_pro}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Chip label={t('dashboard.stock.valuation', 'Valorisation')} clickable onClick={() => setViewMode('valorisation')} color={viewMode === 'valorisation' ? "primary" : "default"} size="small" />
                                <Chip label={t('dashboard.stock.quantity', 'Quantité')} clickable onClick={() => setViewMode('quantite')} color={viewMode === 'quantite' ? "primary" : "default"} size="small" />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {stockKPIs && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                                        {stockKPIs.tauxDisponibilite.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption">{t('dashboard.stock.availability_rate', 'Taux Disponibilité')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                                        {stockKPIs.produitsEnStock}
                                    </Typography>
                                    <Typography variant="caption">{t('dashboard.stock.products_in_stock', 'Produits en stock')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6} sm={2}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700 }}>
                                        {stockKPIs.articlesUniques}
                                    </Typography>
                                    <Typography variant="caption">{t('dashboard.stock.unique_items', 'Articles uniques')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#f3e5f5' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                                        {formatCurrency(stockKPIs.totalValorisation, 'EUR', true)}
                                    </Typography>
                                    <Typography variant="caption">{t('dashboard.stock.total_valuation', 'Valorisation totale')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e0f2f1' }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#00695c', fontWeight: 700 }}>
                                        {formatCurrency(stockKPIs.pmpMoyen)}
                                    </Typography>
                                    <Typography variant="caption">{t('dashboard.stock.average_pmp', 'PMP Moyen')}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                        {t('dashboard.stock.current_stock', 'Stock Actuel')} ({chartData.length} {selectedDepotFilter ? t('dashboard.stock.products', 'produits') : t('dashboard.stock.depots', 'dépôts')})
                    </Typography>

                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={viewMode === 'valorisation' ? (value) => formatCurrency(value, 'EUR', true) : (value) => value.toLocaleString('fr-FR')} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey={viewMode} fill="#1976d2" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" startIcon={<Close />}>
                    {t('common.close', 'Fermer')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}