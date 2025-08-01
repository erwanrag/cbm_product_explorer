// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationDetailPanel.jsx
// ===================================

import React, { useState } from 'react';
import {
    Drawer, Box, Typography, IconButton, Divider,
    Grid, Card, CardContent, Chip, Button, Stack,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Tabs, Tab,
    LinearProgress, Alert
} from '@mui/material';
import {
    Close, TrendingUp, TrendingDown, PlayArrow,
    CheckCircle, Timeline, Inventory, MonetizationOn
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const OptimizationDetailPanel = ({ optimization, onClose, optimizationData }) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!optimization) return null;

    // Formatage des devises
    const formatCurrency = (value) => {
        if (!value) return '0 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Formatage des pourcentages
    const formatPercentage = (value) => {
        if (value === null || value === undefined) return '0%';
        return `${(value * 100).toFixed(2)}%`;
    };

    // Préparation des données pour les graphiques
    const historiqueData = optimization.historique_6m?.map(item => ({
        periode: item.periode,
        marge: item.marge,
        ca: item.ca,
        qte: item.qte
    })) || [];

    const projectionData = optimization.projection_6m?.mois?.map(item => ({
        periode: item.periode,
        marge: item.marge,
        ca: item.ca,
        qte: item.qte
    })) || [];

    const combinedData = [
        ...historiqueData.map(item => ({ ...item, type: 'historique' })),
        ...projectionData.map(item => ({ ...item, type: 'projection' }))
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Drawer
            anchor="right"
            open={Boolean(optimization)}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 600, md: 800 } }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h5" fontWeight={600}>
                                Groupe {optimization.grouping_crn}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Chip
                                    label={optimization.qualite}
                                    color={
                                        optimization.qualite === 'OEM' ? 'success' :
                                            optimization.qualite === 'PMQ' ? 'primary' : 'warning'
                                    }
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {optimization.refs_total} références
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                </Box>

                {/* Contenu principal */}
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
                    >
                        <Tab label="Vue d'ensemble" />
                        <Tab label="Historique & Projection" />
                        <Tab label="Références détaillées" />
                        <Tab label="Simulation" />
                    </Tabs>

                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        {/* Onglet Vue d'ensemble */}
                        {activeTab === 0 && (
                            <Stack spacing={3}>
                                {/* KPI Cards */}
                                <Grid container spacing={2}>
                                    <Grid item xs={6} md={3}>
                                        <Card elevation={1}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <MonetizationOn color="success" sx={{ fontSize: 32, mb: 1 }} />
                                                <Typography variant="h6" color="success.main" fontWeight={600}>
                                                    {formatCurrency(optimization.gain_potentiel)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Gain Immédiat
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Card elevation={1}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <Timeline color="info" sx={{ fontSize: 32, mb: 1 }} />
                                                <Typography variant="h6" color="info.main" fontWeight={600}>
                                                    {formatCurrency(optimization.gain_potentiel_6m)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Gain 6 mois
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Card elevation={1}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                {optimization.taux_croissance > 0 ? (
                                                    <TrendingUp color="success" sx={{ fontSize: 32, mb: 1 }} />
                                                ) : (
                                                    <TrendingDown color="error" sx={{ fontSize: 32, mb: 1 }} />
                                                )}
                                                <Typography
                                                    variant="h6"
                                                    color={optimization.taux_croissance > 0 ? 'success.main' : 'error.main'}
                                                    fontWeight={600}
                                                >
                                                    {formatPercentage(optimization.taux_croissance)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Croissance
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <Card elevation={1}>
                                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                                <Inventory color="warning" sx={{ fontSize: 32, mb: 1 }} />
                                                <Typography variant="h6" color="warning.main" fontWeight={600}>
                                                    {optimization.refs_to_keep?.length || 0}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Refs à garder
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>

                                {/* Résumé de l'optimisation */}
                                <Card elevation={1}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Résumé de l'optimisation
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Prix d'achat minimum
                                                </Typography>
                                                <Typography variant="h6" fontWeight={500}>
                                                    {formatCurrency(optimization.px_achat_min)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Prix de vente pondéré
                                                </Typography>
                                                <Typography variant="h6" fontWeight={500}>
                                                    {formatCurrency(optimization.px_vente_pondere)}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Potentiel d'optimisation
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min((optimization.gain_potentiel / 50000) * 100, 100)}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: 'grey.200',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: 'success.main'
                                                    }
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                {Math.round((optimization.gain_potentiel / Math.max(optimization.gain_potentiel_6m, optimization.gain_potentiel, 1)) * 100)}% du potentiel maximum
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <Card elevation={1}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Actions recommandées
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<PlayArrow />}
                                                color="primary"
                                            >
                                                Simuler l'optimisation
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={<CheckCircle />}
                                                color="success"
                                            >
                                                Appliquer maintenant
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        )}

                        {/* Onglet Historique & Projection */}
                        {activeTab === 1 && (
                            <Stack spacing={3}>
                                <Card elevation={1}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Évolution des marges
                                        </Typography>
                                        <Box sx={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={combinedData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="periode" />
                                                    <YAxis tickFormatter={formatCurrency} />
                                                    <Tooltip formatter={(value) => [formatCurrency(value), 'Marge']} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="marge"
                                                        stroke="#1976d2"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#1976d2' }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Totaux projection */}
                                {optimization.projection_6m?.totaux && (
                                    <Alert severity="info">
                                        <Typography variant="body2">
                                            <strong>Projection 6 mois :</strong> {formatCurrency(optimization.projection_6m.totaux.marge)} de marge totale
                                            sur {optimization.projection_6m.totaux.qte} unités vendues
                                        </Typography>
                                    </Alert>
                                )}
                            </Stack>
                        )}

                        {/* Onglet Références détaillées */}
                        {activeTab === 2 && (
                            <Stack spacing={3}>
                                {/* Références à conserver */}
                                {optimization.refs_to_keep?.length > 0 && (
                                    <Card elevation={1}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="success.main">
                                                Références à conserver ({optimization.refs_to_keep.length})
                                            </Typography>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Code Produit</TableCell>
                                                            <TableCell align="right">Prix Achat</TableCell>
                                                            <TableCell align="right">CA</TableCell>
                                                            <TableCell align="right">Quantité</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {optimization.refs_to_keep.map((ref, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{ref.cod_pro}</TableCell>
                                                                <TableCell align="right">{formatCurrency(ref.px_achat)}</TableCell>
                                                                <TableCell align="right">{formatCurrency(ref.ca)}</TableCell>
                                                                <TableCell align="right">{ref.qte}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Références à supprimer avec ventes */}
                                {optimization.refs_to_delete_low_sales?.length > 0 && (
                                    <Card elevation={1}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="warning.main">
                                                Références à supprimer - avec ventes ({optimization.refs_to_delete_low_sales.length})
                                            </Typography>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Code Produit</TableCell>
                                                            <TableCell align="right">Prix Achat</TableCell>
                                                            <TableCell align="right">CA</TableCell>
                                                            <TableCell align="right">Gain Potentiel</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {optimization.refs_to_delete_low_sales.map((ref, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{ref.cod_pro}</TableCell>
                                                                <TableCell align="right">{formatCurrency(ref.px_achat)}</TableCell>
                                                                <TableCell align="right">{formatCurrency(ref.ca)}</TableCell>
                                                                <TableCell align="right">
                                                                    <Typography color="success.main" fontWeight={500}>
                                                                        {formatCurrency(ref.gain_potentiel_par_ref)}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Références à supprimer sans ventes */}
                                {optimization.refs_to_delete_no_sales?.length > 0 && (
                                    <Card elevation={1}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="error.main">
                                                Références à supprimer - sans ventes ({optimization.refs_to_delete_no_sales.length})
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                Ces références n'ont généré aucune vente et peuvent être supprimées sans impact.
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {optimization.refs_to_delete_no_sales.slice(0, 10).map((ref, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={ref.cod_pro}
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                    />
                                                ))}
                                                {optimization.refs_to_delete_no_sales.length > 10 && (
                                                    <Chip
                                                        label={`+${optimization.refs_to_delete_no_sales.length - 10} autres`}
                                                        size="small"
                                                        variant="outlined"
                                                        color="default"
                                                    />
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                )}
                            </Stack>
                        )}

                        {/* Onglet Simulation */}
                        {activeTab === 3 && (
                            <Stack spacing={3}>
                                <Alert severity="info">
                                    Utilisez la simulation pour tester l'impact de cette optimisation avant de l'appliquer.
                                </Alert>

                                <Card elevation={1}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Paramètres de simulation
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Références à supprimer
                                                </Typography>
                                                <Typography variant="h6">
                                                    {(optimization.refs_to_delete_low_sales?.length || 0) +
                                                        (optimization.refs_to_delete_no_sales?.length || 0)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Période de simulation
                                                </Typography>
                                                <Typography variant="h6">6 mois</Typography>
                                            </Grid>
                                        </Grid>

                                        <Button
                                            variant="contained"
                                            startIcon={<PlayArrow />}
                                            sx={{ mt: 2 }}
                                            fullWidth
                                        >
                                            Lancer la simulation
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
};

export default OptimizationDetailPanel;