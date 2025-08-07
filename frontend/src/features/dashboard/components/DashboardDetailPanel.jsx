// ===================================
// 📁 frontend/src/features/dashboard/components/DashboardDetailPanel.jsx - AVEC HISTORIQUE VENTES
// ===================================

import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Paper,
    Grid,
    Chip,
    Card,
    CardContent
} from '@mui/material';
import { Close, Info, Euro, Inventory, Business, Category, Badge } from '@mui/icons-material';
import { formatCurrency } from '@/lib/formatUtils';
import { getQualiteColor, getStatutColor, getStatutLabel } from '@/constants/colors';
import Plot from 'react-plotly.js';

export default function DashboardDetailPanel({ product, onClose, dashboardData }) {
    const [showCA, setShowCA] = useState(true); // État pour CA vs Quantité

    if (!product) return null;

    // ✅ RÉCUPÉRATION DE L'HISTORIQUE DEPUIS DASHBOARD DATA
    //console.log('🔍 DashboardDetailPanel Debug:');
    //console.log('  - product.cod_pro:', product.cod_pro);
    //console.log('  - dashboardData?.history?.length:', dashboardData?.history?.length);

    // Filtrer l'historique pour ce produit spécifique
    const productHistory = dashboardData?.history?.filter(h => h.cod_pro === product.cod_pro) || [];
    //console.log('  - productHistory.length:', productHistory.length);
    //console.log('  - productHistory sample:', productHistory.slice(0, 3));

    // Données pour les graphiques - Trier par date
    const sortedHistory = productHistory.sort((a, b) => (a.periode || '').localeCompare(b.periode || ''));
    const dates = sortedHistory.map(h => h.periode) || [];
    const ca = sortedHistory.map(h => h.ca_total || h.ca || 0) || [];
    const margePct = sortedHistory.map(h => h.marge_percent_total || h.marge_percent || 0) || [];
    const quantite = sortedHistory.map(h => h.quantite_total || h.quantite || 0) || [];

    //console.log('  - dates:', dates);
    //console.log('  - ca:', ca);
    //console.log('  - quantite:', quantite);

    return (
        <Drawer
            anchor="right"
            open={Boolean(product)}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: 450,
                    p: 0
                }
            }}
        >
            <Box sx={{ p: 3, bgcolor: '#1976d2', color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                            {product.nom_pro || 'Produit sans nom'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Code: {product.cod_pro} • Référence: {product.refint || 'N/A'}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        sx={{ color: 'white', mt: -1 }}
                    >
                        <Close />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ p: 3, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {/* ✅ INFORMATIONS PRODUIT */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Info sx={{ mr: 1, color: '#1976d2' }} />
                        Informations Produit
                    </Typography>

                    <List dense>
                        <ListItem>
                            <ListItemText
                                primary="Référence externe"
                                secondary={product.ref_ext || 'Non définie'}
                                secondaryTypographyProps={{ sx: { fontWeight: 600 } }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Référence CRN"
                                secondary={product.ref_crn || 'Non définie'}
                                secondaryTypographyProps={{ sx: { fontWeight: 600 } }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Fournisseur"
                                secondary={product.nom_fou || 'Non défini'}
                                secondaryTypographyProps={{ sx: { fontWeight: 600 } }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="Qualité"
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
                                primary="Statut"
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

                {/* ✅ PERFORMANCE COMMERCIALE */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Euro sx={{ mr: 1, color: '#2e7d32' }} />
                        Performance Commerciale
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                                    {formatCurrency(product.ca_total || 0)}
                                </Typography>
                                <Typography variant="caption">CA Total</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700 }}>
                                    {product.marge_percent_total?.toFixed(1) || '0.0'}%
                                </Typography>
                                <Typography variant="caption">Marge %</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* ✅ STOCK INFORMATION */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Inventory sx={{ mr: 1, color: '#1976d2' }} />
                        Stock
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                                    {product.stock_total?.toLocaleString('fr-FR') || '0'}
                                </Typography>
                                <Typography variant="caption">Quantité</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                                    {formatCurrency((product.stock_total || 0) * (product.pmp_moyen || 0))}
                                </Typography>
                                <Typography variant="caption">Valorisation</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* ✅ GRAPHIQUE HISTORIQUE VENTES */}
                {dates.length > 0 ? (
                    <>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            📈 Historique Ventes - {dates.length} périodes
                        </Typography>

                        <Paper sx={{ p: 2, mb: 3 }}>
                            {/* ✅ SÉLECTEUR CA / QUANTITÉ */}
                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <Chip
                                    label="CA (€)"
                                    clickable
                                    onClick={() => setShowCA(true)}
                                    color={showCA ? "primary" : "default"}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                                <Chip
                                    label="Quantité"
                                    clickable
                                    onClick={() => setShowCA(false)}
                                    color={!showCA ? "primary" : "default"}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>

                            <Plot
                                data={[
                                    {
                                        x: dates,
                                        y: showCA ? ca : quantite,
                                        name: showCA ? 'Chiffre d\'affaires' : 'Quantité vendue',
                                        type: 'scatter',
                                        mode: 'lines+markers',
                                        line: {
                                            color: showCA ? '#2e7d32' : '#1976d2',
                                            width: 3
                                        },
                                        marker: {
                                            size: 8,
                                            color: showCA ? '#2e7d32' : '#1976d2'
                                        }
                                    }
                                ]}
                                layout={{
                                    height: 300,
                                    margin: { l: 50, r: 20, t: 20, b: 40 },
                                    xaxis: {
                                        title: 'Période',
                                        showgrid: true,
                                        gridcolor: '#f0f0f0'
                                    },
                                    yaxis: {
                                        title: showCA ? 'CA (€)' : 'Quantité',
                                        showgrid: true,
                                        gridcolor: '#f0f0f0'
                                    },
                                    showlegend: false,
                                    plot_bgcolor: 'rgba(0,0,0,0)',
                                    paper_bgcolor: 'rgba(0,0,0,0)',
                                }}
                                config={{
                                    displayModeBar: false,
                                    responsive: true
                                }}
                            />

                            {/* ✅ KPI HISTORIQUE */}
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                <Grid item xs={3}>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">CA Total</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {formatCurrency(ca.reduce((sum, val) => sum + val, 0))}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3}>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Qté Totale</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {quantite.reduce((sum, val) => sum + val, 0).toLocaleString('fr-FR')}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3}>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Marge Moy.</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {margePct.length > 0 ?
                                                (margePct.reduce((sum, val) => sum + val, 0) / margePct.length).toFixed(1) + '%'
                                                : '0%'
                                            }
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={3}>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary">Meilleur Mois</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {ca.length > 0 ?
                                                dates[ca.indexOf(Math.max(...ca))] || 'N/A'
                                                : 'N/A'
                                            }
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </>
                ) : (
                    <Paper sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#fff3e0' }}>
                        <Typography variant="body2" color="text.secondary">
                            📈 Aucun historique de vente disponible pour ce produit
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            (Période des 12 derniers mois)
                        </Typography>
                    </Paper>
                )}

                {/* Footer */}
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        📊 Cliquez sur un autre produit pour changer la vue
                    </Typography>
                </Paper>
            </Box>
        </Drawer>
    );
}