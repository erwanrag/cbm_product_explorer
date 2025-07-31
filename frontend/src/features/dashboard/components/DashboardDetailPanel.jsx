// ===================================
// 📁 frontend/src/features/dashboard/components/DashboardDetailPanel.jsx - AVEC DÉTAILS ÉTENDUS
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

    // ✅ UTILISATION CORRECTE DES DONNÉES HISTORY
    // Filtrer l'historique pour ce produit spécifique
    const productHistory = dashboardData?.history?.filter(h => h.cod_pro === product.cod_pro) || [];

    // Données pour les graphiques
    const dates = productHistory.map(s => s.periode) || [];
    const ca = productHistory.map(s => s.ca) || [];
    const margePct = productHistory.map(s => s.marge_percent || 0) || [];
    const quantite = productHistory.map(s => s.quantite || 0) || [];

    console.log('🔍 DashboardDetailPanel Debug:');
    console.log('  - product.cod_pro:', product.cod_pro);
    console.log('  - dashboardData.history:', dashboardData?.history);
    console.log('  - productHistory filtered:', productHistory);
    console.log('  - dates:', dates);
    console.log('  - ca:', ca);

    return (
        <Drawer
            anchor="right"
            open={Boolean(product)}
            onClose={onClose}
            sx={{ zIndex: 1300 }}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 500 } } // Élargi pour plus d'infos
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* ✅ HEADER AVEC BOUTON FERMER */}
                <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Produit {product.cod_pro}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {product.refint} • {product.ref_ext || 'Pas de ref externe'}
                            </Typography>
                            {/* ✅ NOM DU PRODUIT */}
                            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                                {product.nom_pro || 'Nom non défini'}
                            </Typography>
                        </Box>

                        <IconButton
                            onClick={onClose}
                            sx={{
                                bgcolor: 'grey.100',
                                '&:hover': { bgcolor: 'grey.200' }
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </Paper>

                {/* ✅ CONTENU SCROLLABLE */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>

                    {/* KPI Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Card sx={{ bgcolor: '#f8f9fa', textAlign: 'center' }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Euro sx={{ color: '#2e7d32', fontSize: 28, mb: 1 }} />
                                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '1rem' }}>
                                        {formatCurrency(product.ca_total || 0, 'EUR', true)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        CA Total
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={6}>
                            <Card sx={{ bgcolor: '#f8f9fa', textAlign: 'center' }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Inventory sx={{ color: '#1976d2', fontSize: 28, mb: 1 }} />
                                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, fontSize: '1rem' }}>
                                        {(product.stock_total || 0).toLocaleString('fr-FR')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Stock Total
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* ✅ INFORMATIONS DÉTAILLÉES */}
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Info sx={{ mr: 1, fontSize: 20 }} />
                        Informations Détaillées
                    </Typography>

                    <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 3 }}>
                        {/* Nom du produit */}
                        <ListItem divider>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Category sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                        Nom du produit
                                    </Box>
                                }
                                secondary={product.nom_pro || 'Non défini'}
                            />
                        </ListItem>

                        {/* Référence externe */}
                        <ListItem divider>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Badge sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                        Référence externe
                                    </Box>
                                }
                                secondary={
                                    product.ref_ext ? (
                                        <Chip
                                            label={product.ref_ext}
                                            size="small"
                                            sx={{
                                                bgcolor: '#e3f2fd',
                                                color: '#1565c0',
                                                fontWeight: 600,
                                                mt: 0.5
                                            }}
                                        />
                                    ) : 'Pas de référence externe'
                                }
                            />
                        </ListItem>

                        {/* Qualité */}
                        <ListItem divider>
                            <ListItemText
                                primary="Qualité"
                                secondary={
                                    <Chip
                                        label={product.qualite || 'N/A'}
                                        size="small"
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

                        {/* ✅ STATUT */}
                        <ListItem divider>
                            <ListItemText
                                primary="Statut"
                                secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={product.statut !== null ? product.statut : 'N/A'}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatutColor(product.statut),
                                                color: 'white',
                                                fontWeight: 600,
                                                mr: 1
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {getStatutLabel(product.statut)}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>

                        {/* Fournisseur */}
                        <ListItem divider>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Business sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                                        Fournisseur
                                    </Box>
                                }
                                secondary={product.nom_fou || 'Non défini'}
                            />
                        </ListItem>

                        {/* Prix et PMP */}
                        <ListItem divider>
                            <ListItemText
                                primary="Prix d'achat"
                                secondary={formatCurrency(product.px_achat_eur || 0)}
                            />
                        </ListItem>

                        <ListItem divider>
                            <ListItemText
                                primary="PMP"
                                secondary={formatCurrency(product.pmp || 0)}
                            />
                        </ListItem>

                        {/* Marge */}
                        <ListItem>
                            <ListItemText
                                primary="Marge"
                                secondary={
                                    <Chip
                                        label={`${(product.marge_percent_total || 0).toFixed(1)}%`}
                                        size="small"
                                        sx={{
                                            bgcolor: (product.marge_percent_total || 0) > 15 ? '#4caf50' : '#ff9800',
                                            color: 'white',
                                            fontWeight: 600,
                                            mt: 0.5
                                        }}
                                    />
                                }
                            />
                        </ListItem>
                    </List>

                    {/* ✅ GRAPHIQUE VENTES SIMPLIFIÉ ET CLAIR */}
                    {dates.length > 0 ? (
                        <>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Historique Ventes - {dates.length} mois
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
                                            name: showCA ? 'CA (€)' : 'Quantité',
                                            type: 'bar',
                                            marker: { color: '#1976d2' },
                                            yaxis: 'y',
                                        },
                                        {
                                            x: dates,
                                            y: margePct,
                                            name: 'Marge %',
                                            type: 'scatter',
                                            mode: 'lines+markers',
                                            line: { color: '#f57c00', width: 3 },
                                            marker: { size: 8, color: '#f57c00' },
                                            yaxis: 'y2',
                                        }
                                    ]}
                                    layout={{
                                        height: 350,
                                        margin: { t: 20, b: 60, l: 60, r: 80 },
                                        plot_bgcolor: 'rgba(0,0,0,0)',
                                        paper_bgcolor: 'rgba(0,0,0,0)',
                                        yaxis: {
                                            title: {
                                                text: showCA ? 'CA (€)' : 'Quantité',
                                                font: { color: '#1976d2', size: 14 }
                                            },
                                            side: 'left',
                                            tickformat: showCA ? ',.0f' : ',.0f',
                                            tickfont: { color: '#1976d2' },
                                            gridcolor: '#f0f0f0',
                                            zerolinecolor: '#e0e0e0'
                                        },
                                        yaxis2: {
                                            title: {
                                                text: 'Marge %',
                                                font: { color: '#f57c00', size: 14 }
                                            },
                                            overlaying: 'y',
                                            side: 'right',
                                            tickformat: '.1f',
                                            ticksuffix: '%',
                                            tickfont: { color: '#f57c00' },
                                            showgrid: false
                                        },
                                        xaxis: {
                                            title: 'Période',
                                            tickangle: -45,
                                            tickfont: { size: 11 },
                                            gridcolor: '#f0f0f0'
                                        },
                                        legend: {
                                            orientation: 'h',
                                            x: 0,
                                            y: -0.25,
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                            bordercolor: '#e0e0e0',
                                            borderwidth: 1
                                        },
                                        font: { size: 12 },
                                        showlegend: true,
                                        hovermode: 'x unified'
                                    }}
                                    config={{
                                        responsive: true,
                                        displayModeBar: true,
                                        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
                                        displaylogo: false,
                                        toImageButtonOptions: {
                                            format: 'png',
                                            filename: `historique_${product.cod_pro}_${showCA ? 'CA' : 'QTE'}`,
                                            height: 500,
                                            width: 800,
                                            scale: 2
                                        }
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Paper>

                            {/* ✅ RÉSUMÉ STATISTIQUES AMÉLIORÉ */}
                            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                    📊 Résumé de la période ({dates.length} mois)
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary">CA Total</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                                                {formatCurrency(ca.reduce((sum, val) => sum + val, 0), 'EUR', true)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Qté Totale</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                                                {quantite.reduce((sum, val) => sum + val, 0).toLocaleString('fr-FR')}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary">Marge Moy.</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
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
            </Box>
        </Drawer>
    );
}