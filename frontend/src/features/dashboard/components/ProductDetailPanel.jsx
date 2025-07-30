// frontend/src/features/dashboard/components/ProductDetailPanel.jsx
import React from 'react';
import {
    Box, Paper, Typography, IconButton, Divider, Grid,
    Card, CardContent, Chip, List, ListItem, ListItemText,
    Avatar, LinearProgress
} from '@mui/material';
import {
    Close, Inventory, Euro, TrendingUp, LocalShipping,
    History, Assessment, Store, ShoppingCart
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function ProductDetailPanel({ product, data, onClose }) {
    if (!product) return null;

    // Récupérer toutes les données liées au produit
    const productSales = data.sales.find(s => s.cod_pro === product.cod_pro) || {};
    const productStock = data.stock.filter(s => s.cod_pro === product.cod_pro);
    const productPurchase = data.purchase.find(p => p.cod_pro === product.cod_pro) || {};
    const productMatches = data.matches.filter(m => m.cod_pro === product.cod_pro);
    const productHistory = data.history.filter(h => h.cod_pro === product.cod_pro);

    const formatCurrency = (value) => new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(value || 0);

    const getQualiteColor = (qualite) => {
        const configs = {
            'OE': '#1976d2',
            'OEM': '#2e7d32',
            'PMQ': '#f57c00',
            'PMV': '#9c27b0',
        };
        return configs[qualite] || '#757575';
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
                position: 'fixed',
                right: 0,
                top: 0,
                height: '100vh',
                width: '30%',
                minWidth: '400px',
                zIndex: 1000,
            }}
        >
            <Paper elevation={8} sx={{
                height: '100%',
                overflow: 'auto',
                borderLeft: '3px solid #1976d2'
            }}>
                {/* Header */}
                <Box sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {product.refint}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Détail du Produit
                        </Typography>
                    </Box>
                    <IconButton color="inherit" onClick={onClose}>
                        <Close />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2 }}>
                    {/* Informations principales */}
                    <Card sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{
                                    bgcolor: getQualiteColor(product.qualite),
                                    mr: 2,
                                    width: 56,
                                    height: 56
                                }}>
                                    <Inventory />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {product.designation}
                                    </Typography>
                                    <Chip
                                        label={product.qualite || 'N/A'}
                                        size="small"
                                        sx={{
                                            bgcolor: getQualiteColor(product.qualite),
                                            color: 'white',
                                            fontWeight: 700
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Code Produit
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {product.cod_pro}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Statut
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {product.statut_clean || 'RAS'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Famille
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {product.famille || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Sous-Famille
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {product.s_famille || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* KPIs du produit */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
                                <CardContent sx={{ p: 1.5 }}>
                                    <Euro color="success" />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                        {formatCurrency(productSales.ca_total || 0)}
                                    </Typography>
                                    <Typography variant="caption">CA Total</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
                                <CardContent sx={{ p: 1.5 }}>
                                    <TrendingUp color="warning" />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                                        {(productSales.marge_percent_total || 0).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption">Marge</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
                                <CardContent sx={{ p: 1.5 }}>
                                    <ShoppingCart color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                                        {(productSales.quantite_total || 0).toLocaleString('fr-FR')}
                                    </Typography>
                                    <Typography variant="caption">Quantité</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card sx={{ textAlign: 'center', bgcolor: '#f3e5f5' }}>
                                <CardContent sx={{ p: 1.5 }}>
                                    <Store color="secondary" />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                                        {productStock.reduce((sum, s) => sum + (s.stock || 0), 0)}
                                    </Typography>
                                    <Typography variant="caption">Stock</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Stock par dépôt */}
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                        📦 Stock par Dépôt
                    </Typography>
                    <List dense>
                        {productStock.map((stock, index) => (
                            <ListItem key={index} sx={{
                                bgcolor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                borderRadius: 1,
                                mb: 0.5
                            }}>
                                <ListItemText
                                    primary={`Dépôt ${stock.depot || 'N/A'}`}
                                    secondary={
                                        <Box>
                                            <Typography variant="body2">
                                                Stock: <strong>{(stock.stock || 0).toLocaleString('fr-FR')}</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                PMP: <strong>{formatCurrency(stock.pmp || 0)}</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                Valeur: <strong>{formatCurrency((stock.stock || 0) * (stock.pmp || 0))}</strong>
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                        {productStock.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                Aucun stock trouvé
                            </Typography>
                        )}
                    </List>

                    <Divider sx={{ my: 2 }} />

                    {/* Prix d'achat */}
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                        💰 Prix d'Achat
                    </Typography>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Prix Achat EUR
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                        {formatCurrency(productPurchase.px_achat_eur || 0)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Devise
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {productPurchase.devise || 'EUR'}
                                    </Typography>
                                </Grid>
                                {productPurchase.px_achat_devise && (
                                    <>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Prix Devise
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {(productPurchase.px_achat_devise || 0).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Taux Change
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {(productPurchase.taux_change || 1).toFixed(4)}
                                            </Typography>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Correspondances */}
                    {productMatches.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                                🔗 Correspondances
                            </Typography>
                            <List dense>
                                {productMatches.map((match, index) => (
                                    <ListItem key={index} sx={{
                                        bgcolor: '#e3f2fd',
                                        borderRadius: 1,
                                        mb: 0.5
                                    }}>
                                        <ListItemText
                                            primary={`${match.ref_crn} → ${match.ref_ext}`}
                                            secondary={`Confiance: ${match.confidence_score || 0}%`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}

                    {/* Historique récent */}
                    {productHistory.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                                📈 Historique Récent
                            </Typography>
                            <List dense>
                                {productHistory.slice(0, 5).map((hist, index) => (
                                    <ListItem key={index} sx={{
                                        bgcolor: index % 2 === 0 ? '#f8f9fa' : 'white',
                                        borderRadius: 1,
                                        mb: 0.5
                                    }}>
                                        <ListItemText
                                            primary={hist.periode || hist.date}
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2">
                                                        CA: <strong>{formatCurrency(hist.ca_total || 0)}</strong>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Qté: <strong>{(hist.quantite_total || 0).toLocaleString('fr-FR')}</strong>
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </Box>
            </Paper>
        </motion.div>
    );
}
