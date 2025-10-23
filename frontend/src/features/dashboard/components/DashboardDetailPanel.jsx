// ===================================
// 📁 frontend/src/features/dashboard/components/DashboardDetailPanel.jsx
// ===================================

import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Paper,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { Close, Info, Euro, Inventory } from '@mui/icons-material';
import { formatCurrency } from '@/lib/formatUtils';
import { getQualiteColor, getStatutColor, getStatutLabel } from '@/constants/colors';
import { useTranslation } from '@/store/contexts/LanguageContext';
import Plot from 'react-plotly.js';

export default function DashboardDetailPanel({ product, open, onClose, dashboardData }) {
    const { t } = useTranslation();
    const [showCA, setShowCA] = useState(true);

    if (!product) return null;

    // 🔹 Historique ventes pour ce produit
    const productHistory = dashboardData?.history?.filter(h => h.cod_pro === product.cod_pro) || [];
    const sortedHistory = productHistory.sort((a, b) => (a.periode || '').localeCompare(b.periode || ''));

    const dates = sortedHistory.map(h => h.periode);
    const ca = sortedHistory.map(h => h.ca_total || h.ca || 0);
    const quantite = sortedHistory.map(h => h.quantite_total || h.quantite || 0);
    const margePct = sortedHistory.map(h => h.marge_percent_total || h.marge_percent || 0);

    return (
        <Drawer
            anchor="right"
            open={Boolean(open)}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 450,
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            {/* 🔹 HEADER FIXE */}
            <Box sx={{
                p: 3,
                bgcolor: '#1976d2',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {product.nom_pro || t('common.not_defined', 'Produit sans nom')}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {t('dashboard.table.cod_pro', 'Code')}: {product.cod_pro} • {t('dashboard.table.ref_crn', 'Ref CRN')}: {product.ref_crn || 'N/A'}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white', mt: -1 }}>
                    <Close />
                </IconButton>
            </Box>

            {/* 🔹 CONTENU SCROLLABLE */}
            <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                {/* Informations produit */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Info sx={{ mr: 1, color: '#1976d2' }} />
                        {t('dashboard.detail_panel.general_info', 'Informations Produit')}
                    </Typography>

                    <List dense>
                        <ListItem>
                            <ListItemText
                                primary={t('dashboard.table.ref_ext', 'Référence externe')}
                                secondary={product.ref_ext || t('common.not_defined', 'Non définie')}
                                secondaryTypographyProps={{ sx: { fontWeight: 600 } }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary={t('dashboard.table.supplier', 'Fournisseur')}
                                secondary={product.nom_fou || t('common.not_defined', 'Non défini')}
                                secondaryTypographyProps={{ sx: { fontWeight: 600 } }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary={t('dashboard.table.qualite', 'Qualité')}
                                secondary={
                                    <Chip
                                        label={product.qualite || 'N/A'}
                                        sx={{
                                            bgcolor: getQualiteColor(product.qualite),
                                            color: 'white',
                                            fontWeight: 600,
                                            mt: 0.5
                                        }}
                                    />
                                }
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary={t('dashboard.table.status', 'Statut')}
                                secondary={
                                    <Chip
                                        label={getStatutLabel(product.statut) || 'N/A'}
                                        sx={{
                                            bgcolor: getStatutColor(product.statut),
                                            color: 'white',
                                            fontWeight: 600,
                                            mt: 0.5
                                        }}
                                    />
                                }
                            />
                        </ListItem>
                    </List>
                </Paper>

                {/* Performance commerciale */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Euro sx={{ mr: 1, color: '#2e7d32' }} />
                        {t('dashboard.detail_panel.sales_info', 'Performance Commerciale')}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                                    {formatCurrency(product.ca_total || 0)}
                                </Typography>
                                <Typography variant="caption">{t('dashboard.table.revenue', 'CA Total')}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700 }}>
                                    {product.marge_percent_total?.toFixed(1) || '0.0'}%
                                </Typography>
                                <Typography variant="caption">{t('dashboard.table.margin', 'Marge %')}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Stock */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Inventory sx={{ mr: 1, color: '#1976d2' }} />
                        {t('dashboard.table.stock', 'Stock')}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                                    {product.stock_total?.toLocaleString('fr-FR') || '0'}
                                </Typography>
                                <Typography variant="caption">{t('dashboard.table.quantity', 'Quantité')}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                                    {formatCurrency((product.stock_total || 0) * (product.pmp_moyen || 0))}
                                </Typography>
                                <Typography variant="caption">{t('dashboard.detail_panel.stock_value', 'Valorisation')}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Historique ventes */}
                {dates.length > 0 ? (
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            📈 {t('dashboard.detail_panel.sales_history', 'Historique Ventes')} ({dates.length})
                        </Typography>

                        {/* Toggle CA / Quantité */}
                        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                            <Chip
                                label="CA (€)"
                                clickable
                                onClick={() => setShowCA(true)}
                                color={showCA ? 'primary' : 'default'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                            <Chip
                                label={t('dashboard.table.quantity', 'Quantité')}
                                clickable
                                onClick={() => setShowCA(false)}
                                color={!showCA ? 'primary' : 'default'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>

                        <Plot
                            data={[
                                {
                                    x: dates,
                                    y: showCA ? ca : quantite,
                                    type: 'scatter',
                                    mode: 'lines+markers',
                                    line: {
                                        color: showCA ? '#2e7d32' : '#1976d2',
                                        width: 3
                                    },
                                    marker: {
                                        size: 7,
                                        color: showCA ? '#2e7d32' : '#1976d2'
                                    }
                                }
                            ]}
                            layout={{
                                height: 280,
                                margin: { l: 50, r: 20, t: 20, b: 40 },
                                xaxis: { title: 'Période', showgrid: true, gridcolor: '#f0f0f0' },
                                yaxis: { title: showCA ? 'CA (€)' : 'Quantité', gridcolor: '#f0f0f0' },
                                showlegend: false,
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                paper_bgcolor: 'rgba(0,0,0,0)'
                            }}
                            config={{ displayModeBar: false, responsive: true }}
                        />
                    </Paper>
                ) : (
                    <Paper sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#fff3e0' }}>
                        <Typography variant="body2" color="text.secondary">
                            📊 {t('dashboard.detail_panel.no_sales_history', 'Aucun historique de ventes disponible')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            (12 derniers mois)
                        </Typography>
                    </Paper>
                )}

                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        📊 {t('dashboard.detail_panel.footer_hint', 'Cliquez sur un autre produit pour changer la vue')}
                    </Typography>
                </Paper>
            </Box>
        </Drawer>
    );
}
