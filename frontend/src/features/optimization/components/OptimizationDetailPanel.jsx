// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationDetailPanel.jsx
// ===================================

import React, { useState } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent,
    IconButton, Collapse, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button,
    Stack, Divider, Tabs, Tab, Alert
} from '@mui/material';
import {
    Close, ExpandMore, ExpandLess, TrendingUp, TrendingDown,
    CheckCircle, Cancel, Warning, Info, PlayArrowOutlined
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectionQualityIndicator from './indicators/ProjectionQualityIndicator'; // Assurez-vous que le chemin est correct

const OptimizationDetailPanel = ({ optimization, onClose, optimizationData }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [expandedSection, setExpandedSection] = useState('historique');

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

    // Données combinées historique + projection pour le graphique
    const timelineData = React.useMemo(() => {
        const historique = optimization.historique_6m || [];
        const projection = optimization.projection_6m?.mois || [];

        return [
            ...historique.map(item => ({ ...item, type: 'historique' })),
            ...projection.map(item => ({ ...item, type: 'projection' }))
        ].sort((a, b) => a.periode.localeCompare(b.periode));
    }, [optimization]);

    const handleSectionToggle = (section) => {
        setExpandedSection(expandedSection === section ? '' : section);
    };

    const tabs = [
        { label: 'Vue d\'ensemble', value: 0 },
        { label: 'Références', value: 1 },
        { label: 'Chronologie', value: 2 },
        { label: 'Simulation', value: 3 }
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.3 }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        right: 0,
                        top: 0,
                        height: '100vh',
                        width: { xs: '100vw', md: '60vw', lg: '50vw' },
                        zIndex: 1300,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header */}
                    <Box sx={{
                        p: 3,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Optimisation Groupe {optimization.grouping_crn}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Qualité {optimization.qualite} • {optimization.refs_total} références
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={onClose}
                                sx={{ color: 'primary.contrastText' }}
                            >
                                <Close />
                            </IconButton>
                        </Box>

                        {/* KPI Header */}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {formatCurrency(optimization.gain_potentiel)}
                                    </Typography>
                                    <Typography variant="caption">
                                        Gain Immédiat
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        {formatCurrency(optimization.gain_potentiel_6m)}
                                    </Typography>
                                    <Typography variant="caption">
                                        Projection 6M
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {optimization.taux_croissance > 0 ? (
                                        <TrendingUp sx={{ mr: 0.5 }} />
                                    ) : (
                                        <TrendingDown sx={{ mr: 0.5 }} />
                                    )}
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                            {formatPercentage(optimization.taux_croissance)}
                                        </Typography>
                                        <Typography variant="caption">
                                            Croissance
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <ProjectionQualityIndicator
                                        score={optimization.projection_6m?.metadata?.quality_score}
                                        method={optimization.projection_6m?.metadata?.method}
                                        variant="chip"
                                    />
                                    <Typography variant="caption">
                                        Fiabilité projection
                                    </Typography>
                                </Box>
                            </Grid>

                        </Grid>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                            {tabs.map(tab => (
                                <Tab key={tab.value} label={tab.label} />
                            ))}
                        </Tabs>
                    </Box>
                    {/* Projection */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                    Qualité de la Projection
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <ProjectionQualityIndicator
                                        score={optimization.projection_6m?.metadata?.quality_score}
                                        method={optimization.projection_6m?.metadata?.method}
                                        confidence={optimization.projection_6m?.metadata?.confidence_level}
                                        variant="card"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Content */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        {/* Vue d'ensemble */}
                        {activeTab === 0 && (
                            <Box>
                                <Grid container spacing={3}>
                                    {/* Prix et marges */}
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={2}>
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Analyse des Prix
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Prix d'achat minimum
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {formatCurrency(optimization.px_achat_min)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Prix de vente pondéré
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {formatCurrency(optimization.px_vente_pondere)}
                                                        </Typography>
                                                    </Box>
                                                    <Divider />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Marge théorique
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                            {formatCurrency(optimization.px_vente_pondere - optimization.px_achat_min)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Répartition des références */}
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={2}>
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Répartition des Références
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CheckCircle fontSize="small" sx={{ color: 'success.main', mr: 1 }} />
                                                            <Typography variant="body2">À conserver</Typography>
                                                        </Box>
                                                        <Chip
                                                            size="small"
                                                            label={optimization.refs_to_keep?.length || 0}
                                                            color="success"
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Warning fontSize="small" sx={{ color: 'warning.main', mr: 1 }} />
                                                            <Typography variant="body2">Faibles ventes</Typography>
                                                        </Box>
                                                        <Chip
                                                            size="small"
                                                            label={optimization.refs_to_delete_low_sales?.length || 0}
                                                            color="warning"
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Cancel fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                                                            <Typography variant="body2">Sans ventes</Typography>
                                                        </Box>
                                                        <Chip
                                                            size="small"
                                                            label={optimization.refs_to_delete_no_sales?.length || 0}
                                                            color="error"
                                                        />
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Graphique chronologique */}
                                    <Grid item xs={12}>
                                        <Card elevation={2}>
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Évolution Historique et Projection
                                                </Typography>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={timelineData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="periode" />
                                                        <YAxis />
                                                        <Tooltip
                                                            formatter={(value, name) => [formatCurrency(value), name]}
                                                            labelFormatter={(label) => `Période: ${label}`}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="marge"
                                                            stroke="#2196F3"
                                                            strokeWidth={2}
                                                            dot={{ fill: '#2196F3' }}
                                                            connectNulls={false}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Références */}
                        {activeTab === 1 && (
                            <Box>
                                <Stack spacing={3}>
                                    {/* Références à conserver */}
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                    Références à Conserver ({optimization.refs_to_keep?.length || 0})
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleSectionToggle('keep')}
                                                >
                                                    {expandedSection === 'keep' ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Box>
                                            <Collapse in={expandedSection === 'keep'}>
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
                                                            {optimization.refs_to_keep?.map((ref, index) => (
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
                                            </Collapse>
                                        </CardContent>
                                    </Card>

                                    {/* Références à supprimer - faibles ventes */}
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                                    Références avec Faibles Ventes ({optimization.refs_to_delete_low_sales?.length || 0})
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleSectionToggle('low_sales')}
                                                >
                                                    {expandedSection === 'low_sales' ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Box>
                                            <Collapse in={expandedSection === 'low_sales'}>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Code Produit</TableCell>
                                                                <TableCell align="right">Prix Achat</TableCell>
                                                                <TableCell align="right">CA</TableCell>
                                                                <TableCell align="right">Quantité</TableCell>
                                                                <TableCell align="right">Gain Potentiel</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {optimization.refs_to_delete_low_sales?.map((ref, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{ref.cod_pro}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ref.px_achat)}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ref.ca)}</TableCell>
                                                                    <TableCell align="right">{ref.qte}</TableCell>
                                                                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                                                                        {formatCurrency(ref.gain_potentiel_par_ref)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Collapse>
                                        </CardContent>
                                    </Card>

                                    {/* Références sans ventes */}
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                                                    Références sans Ventes ({optimization.refs_to_delete_no_sales?.length || 0})
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleSectionToggle('no_sales')}
                                                >
                                                    {expandedSection === 'no_sales' ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Box>
                                            <Collapse in={expandedSection === 'no_sales'}>
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
                                                            {optimization.refs_to_delete_no_sales?.map((ref, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{ref.cod_pro}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ref.px_achat)}</TableCell>
                                                                    <TableCell align="right">-</TableCell>
                                                                    <TableCell align="right">-</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Collapse>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            </Box>
                        )}

                        {/* Chronologie */}
                        {activeTab === 2 && (
                            <Box>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={2}>
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Historique 6 Derniers Mois
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {optimization.historique_6m?.map((hist, index) => (
                                                        <Box key={index} sx={{
                                                            display: 'flex',
                                                            justify: 'space-between',
                                                            p: 1,
                                                            bgcolor: 'grey.50',
                                                            borderRadius: 1
                                                        }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {hist.periode}
                                                            </Typography>
                                                            <Box sx={{ textAlign: 'right' }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {formatCurrency(hist.marge)}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {hist.qte} unités
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={2}>
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Projection 6 Prochains Mois
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {optimization.projection_6m?.mois?.map((proj, index) => (
                                                        <Box key={index} sx={{
                                                            display: 'flex',
                                                            justify: 'space-between',
                                                            p: 1,
                                                            bgcolor: 'success.50',
                                                            borderRadius: 1,
                                                            border: 1,
                                                            borderColor: 'success.200'
                                                        }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {proj.periode}
                                                            </Typography>
                                                            <Box sx={{ textAlign: 'right' }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                    {formatCurrency(proj.marge)}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {proj.qte} unités
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Stack>

                                                {optimization.projection_6m?.totaux && (
                                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'success.100', borderRadius: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            Total Projection
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                                                            {formatCurrency(optimization.projection_6m.totaux.marge)}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            {optimization.projection_6m.totaux.qte} unités • {formatCurrency(optimization.projection_6m.totaux.ca)} CA
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Simulation */}
                        {activeTab === 3 && (
                            <Box>
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    <Typography variant="body2">
                                        Cette section permet de simuler l'impact de l'optimisation avant application.
                                    </Typography>
                                </Alert>

                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                            Paramètres de Simulation
                                        </Typography>

                                        <Grid container spacing={3} sx={{ mt: 1 }}>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Références concernées
                                                </Typography>
                                                <Typography variant="h6">
                                                    {(optimization.refs_to_delete_low_sales?.length || 0) +
                                                        (optimization.refs_to_delete_no_sales?.length || 0)} à supprimer
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Impact estimé
                                                </Typography>
                                                <Typography variant="h6" sx={{ color: 'success.main' }}>
                                                    {formatCurrency(optimization.gain_potentiel)}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                startIcon={<PlayArrowOutlined />}
                                                color="primary"
                                            >
                                                Lancer la Simulation
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </Box>

                    {/* Footer Actions */}
                    <Box sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        bgcolor: 'grey.50'
                    }}>
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button variant="outlined" onClick={onClose}>
                                Fermer
                            </Button>
                            <Button variant="contained" startIcon={<PlayArrowOutlined />}>
                                Simuler cette Optimisation
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </motion.div>
        </AnimatePresence>
    );
};

export default OptimizationDetailPanel;