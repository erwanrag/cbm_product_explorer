// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationDetailPanel.jsx - COMPLET CORRIGÉ
// ===================================

import React, { useState } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent,
    IconButton, Collapse, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Button,
    Stack, Divider, Tabs, Tab, Alert, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
    Close, ExpandMore, ExpandLess, TrendingUp, TrendingDown,
    CheckCircle, Cancel, Warning, Info, PlayArrowOutlined, GetApp
} from '@mui/icons-material';
// ✅ CORRECTION: Import correct de Legend depuis recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ProjectionQualityIndicator from './indicators/ProjectionQualityIndicator';

const OptimizationDetailPanel = ({ optimization, onClose, optimizationData }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [expandedSection, setExpandedSection] = useState('historique');
    const [selectedMetric, setSelectedMetric] = useState('marge');

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

    // Formatage K€
    const formatCurrencyK = (value) => {
        if (!value) return '0';
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K€`;
        return `${value}€`;
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

    // ✅ Fonction d'export
    const handleExport = (format) => {
        const exportData = {
            groupe: optimization.grouping_crn,
            qualite: optimization.qualite,
            gainImmediat: optimization.gain_potentiel,
            gain6m: optimization.gain_potentiel_6m,
            margeActuelle6m: optimization.marge_actuelle_6m,
            margeOptimisee6m: optimization.marge_optimisee_6m,
            refsAConserver: optimization.refs_to_keep,
            refsFaiblesVentes: optimization.refs_to_delete_low_sales,
            refsSansVentes: optimization.refs_to_delete_no_sales,
            historique: optimization.historique_6m,
            projection: optimization.projection_6m,
            metadata: optimization.projection_6m?.metadata
        };

        if (format === 'excel') {
            //console.log('📥 Export Excel demandé pour:', exportData);

            // Créer un CSV simple pour simulation
            const csvContent = [
                ['Période', 'Quantité', 'CA', 'Marge', 'Marge Opt', 'Type'],
                ...timelineData.map(item => [
                    item.periode,
                    item.qte,
                    item.ca,
                    item.marge || item.marge_actuelle || 0,
                    item.marge_optimisee || 0,
                    item.type
                ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `optimisation_${optimization.grouping_crn}_${optimization.qualite}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Export CSV généré avec succès');
        }
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
                                        Gain immédiat
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {optimization.taux_croissance >= 0 ? (
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
                            {/* ✅ FIABILITÉ PROJECTION CORRIGÉE */}
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    {optimization.projection_6m?.metadata?.quality_score ? (
                                        <ProjectionQualityIndicator
                                            projection={optimization.projection_6m}
                                            compact={true}
                                        />
                                    ) : (
                                        <Chip size="small" label="N/A" color="default" variant="outlined" />
                                    )}
                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
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

                    {/* Content */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        {/* Tab 0: Vue d'ensemble */}
                        {activeTab === 0 && (
                            <Stack spacing={3}>
                                {/* ✅ Métriques économiques avec nouveaux champs */}
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            💰 Métriques Économiques
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Prix achat min:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {formatCurrency(optimization.px_achat_min)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Prix vente pond.:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {formatCurrency(optimization.px_vente_pondere)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Gain immédiat:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                        {formatCurrency(optimization.gain_potentiel)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Gain 6 mois:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                        {formatCurrency(optimization.gain_potentiel_6m)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            {/* ✅ NOUVEAUX CHAMPS */}
                                            <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Marge actuelle 6M:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {formatCurrency(optimization.marge_actuelle_6m)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Marge optimisée 6M:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                                        {formatCurrency(optimization.marge_optimisee_6m)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* ✅ Qualité de projection détaillée */}
                                {optimization.projection_6m?.metadata && (
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                🎯 Qualité de la Projection
                                            </Typography>

                                            <Stack spacing={2}>
                                                <Box>
                                                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                        <Chip
                                                            label={`Score: ${(optimization.projection_6m.metadata.quality_score * 100).toFixed(0)}%`}
                                                            color={
                                                                optimization.projection_6m.metadata.quality_score >= 0.7 ? 'success' :
                                                                    optimization.projection_6m.metadata.quality_score >= 0.4 ? 'warning' : 'error'
                                                            }
                                                        />
                                                        <Chip
                                                            label={optimization.projection_6m.metadata.method}
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            label={`${optimization.projection_6m.metadata.data_points} points`}
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                    </Stack>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {optimization.projection_6m.metadata.summary}
                                                    </Typography>
                                                </Box>

                                                {optimization.projection_6m.metadata.warnings?.length > 0 && (
                                                    <Alert severity="warning" size="small">
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Avertissements:
                                                        </Typography>
                                                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                                            {optimization.projection_6m.metadata.warnings.map((warning, index) => (
                                                                <li key={index}>
                                                                    <Typography variant="body2">
                                                                        {warning}
                                                                    </Typography>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Alert>
                                                )}

                                                {optimization.projection_6m.metadata.recommendations?.length > 0 && (
                                                    <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                                                            💡 Recommandations:
                                                        </Typography>
                                                        <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                                            {optimization.projection_6m.metadata.recommendations.map((rec, index) => (
                                                                <li key={index}>
                                                                    <Typography variant="body2" color="info.dark">
                                                                        {rec}
                                                                    </Typography>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Répartition des références */}
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            📦 Répartition des Références
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                                                        ✅ À Conserver ({optimization.refs_to_keep?.length || 0})
                                                    </Typography>
                                                    {optimization.refs_to_keep?.slice(0, 3).map(ref => (
                                                        <Typography key={ref.cod_pro} variant="caption" sx={{ display: 'block' }}>
                                                            {ref.refint} - {formatCurrency(ref.ca)}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main', mb: 1 }}>
                                                        ⚠️ Faibles Ventes ({optimization.refs_to_delete_low_sales?.length || 0})
                                                    </Typography>
                                                    {optimization.refs_to_delete_low_sales?.slice(0, 3).map(ref => (
                                                        <Typography key={ref.cod_pro} variant="caption" sx={{ display: 'block' }}>
                                                            {ref.refint} - {formatCurrency(ref.ca)}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main', mb: 1 }}>
                                                        ❌ Sans Ventes ({optimization.refs_to_delete_no_sales?.length || 0})
                                                    </Typography>
                                                    {optimization.refs_to_delete_no_sales?.slice(0, 3).map(ref => (
                                                        <Typography key={ref.cod_pro} variant="caption" sx={{ display: 'block' }}>
                                                            {ref.refint} - Stock mort
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Stack>
                        )}

                        {/* ✅ Tab 1: Références détaillées CORRIGÉES */}
                        {activeTab === 1 && (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    📋 Détail des Références
                                </Typography>

                                {/* Références à conserver */}
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                ✅ Références à conserver ({optimization.refs_to_keep?.length || 0})
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleSectionToggle('keep')}>
                                                {expandedSection === 'keep' ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        </Box>

                                        <Collapse in={expandedSection === 'keep'}>
                                            {optimization.refs_to_keep && optimization.refs_to_keep.length > 0 ? (
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Réf. Interne</TableCell>
                                                                <TableCell align="right">Prix Achat</TableCell>
                                                                <TableCell align="right">CA</TableCell>
                                                                <TableCell align="right">Qté</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {optimization.refs_to_keep.map(ref => (
                                                                <TableRow key={ref.cod_pro}>
                                                                    <TableCell>{ref.refint}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ref.px_achat)}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ref.ca)}</TableCell>
                                                                    <TableCell align="right">{ref.qte}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Aucune référence à conserver
                                                </Typography>
                                            )}
                                        </Collapse>
                                    </CardContent>
                                </Card>

                                {/* Références faibles ventes */}
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                                ⚠️ Références faibles ventes ({optimization.refs_to_delete_low_sales?.length || 0})
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleSectionToggle('low')}>
                                                {expandedSection === 'low' ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        </Box>

                                        <Collapse in={expandedSection === 'low'}>
                                            {optimization.refs_to_delete_low_sales && optimization.refs_to_delete_low_sales.length > 0 ? (
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Réf. Interne</TableCell>
                                                                <TableCell align="right">Prix Achat</TableCell>
                                                                <TableCell align="right">CA</TableCell>
                                                                <TableCell align="right">Qté</TableCell>
                                                                <TableCell align="right">Gain Potentiel</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {optimization.refs_to_delete_low_sales.map(ref => (
                                                                <TableRow key={ref.cod_pro}>
                                                                    <TableCell>{ref.refint}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ref.px_achat)}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ref.ca)}</TableCell>
                                                                    <TableCell align="right">{ref.qte}</TableCell>
                                                                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                                                                        {formatCurrency(ref.gain_potentiel_par_ref || 0)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Aucune référence à faibles ventes
                                                </Typography>
                                            )}
                                        </Collapse>
                                    </CardContent>
                                </Card>

                                {/* Références sans ventes */}
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                                                ❌ Références sans ventes ({optimization.refs_to_delete_no_sales?.length || 0})
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleSectionToggle('no')}>
                                                {expandedSection === 'no' ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        </Box>

                                        <Collapse in={expandedSection === 'no'}>
                                            {optimization.refs_to_delete_no_sales && optimization.refs_to_delete_no_sales.length > 0 ? (
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Réf. Interne</TableCell>
                                                                <TableCell align="right">Prix Achat</TableCell>
                                                                <TableCell>Statut</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {optimization.refs_to_delete_no_sales.map(ref => (
                                                                <TableRow key={ref.cod_pro}>
                                                                    <TableCell>{ref.refint}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ref.px_achat)}</TableCell>
                                                                    <TableCell>
                                                                        <Chip label="Stock mort" color="error" size="small" />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Aucune référence sans ventes
                                                </Typography>
                                            )}
                                        </Collapse>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* ✅ Tab 2: Chronologie avec sélecteur de métrique - CORRIGÉ */}
                        {activeTab === 2 && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        📈 Évolution Temporelle
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={selectedMetric}
                                        exclusive
                                        onChange={(e, newValue) => newValue && setSelectedMetric(newValue)}
                                        size="small"
                                    >
                                        <ToggleButton value="qte">Quantité</ToggleButton>
                                        <ToggleButton value="ca">CA</ToggleButton>
                                        <ToggleButton value="marge">Marge</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                            {selectedMetric === 'qte' ? 'Quantités' :
                                                selectedMetric === 'ca' ? 'Chiffre d\'Affaires' : 'Marges'} - Historique + Projection
                                        </Typography>

                                        <ResponsiveContainer width="100%" height={350}>
                                            <LineChart data={timelineData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="periode"
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={selectedMetric === 'qte' ? undefined : formatCurrencyK}
                                                />
                                                <Tooltip
                                                    formatter={(value, name) => [
                                                        selectedMetric === 'qte' ? value : formatCurrency(value),
                                                        name
                                                    ]}
                                                    labelFormatter={(label) => `Période: ${label}`}
                                                />
                                                <Legend />

                                                {/* Affichage selon la métrique sélectionnée */}
                                                {selectedMetric === 'qte' && (
                                                    <Line
                                                        type="monotone"
                                                        dataKey="qte"
                                                        stroke="#2196F3"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#2196F3', strokeWidth: 2, r: 4 }}
                                                        name="Quantité"
                                                    />
                                                )}

                                                {selectedMetric === 'ca' && (
                                                    <Line
                                                        type="monotone"
                                                        dataKey="ca"
                                                        stroke="#FF9800"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#FF9800', strokeWidth: 2, r: 4 }}
                                                        name="Chiffre d'Affaires"
                                                    />
                                                )}

                                                {selectedMetric === 'marge' && (
                                                    <>
                                                        <Line
                                                            type="monotone"
                                                            dataKey="marge"
                                                            stroke="#4CAF50"
                                                            strokeWidth={2}
                                                            dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
                                                            name="Marge Historique"
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="marge_actuelle"
                                                            stroke="#F44336"
                                                            strokeWidth={2}
                                                            strokeDasharray="5 5"
                                                            dot={{ fill: '#F44336', strokeWidth: 2, r: 4 }}
                                                            name="Marge Actuelle Projetée"
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="marge_optimisee"
                                                            stroke="#2E7D32"
                                                            strokeWidth={2}
                                                            strokeDasharray="5 5"
                                                            dot={{ fill: '#2E7D32', strokeWidth: 2, r: 4 }}
                                                            name="Marge Optimisée Projetée"
                                                        />
                                                    </>
                                                )}
                                            </LineChart>
                                        </ResponsiveContainer>

                                        {/* ✅ Informations sur la projection */}
                                        {optimization.projection_6m?.metadata && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                                    📊 Informations sur la projection:
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Méthode: {optimization.projection_6m.metadata.method} •
                                                    R²: {(optimization.projection_6m.metadata.r_squared * 100).toFixed(1)}% •
                                                    Confiance: {optimization.projection_6m.metadata.confidence_level}
                                                </Typography>
                                                {optimization.projection_6m.metadata.slope && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Tendance: {optimization.projection_6m.metadata.slope > 0 ? '↗️' : '↘️'}
                                                        {optimization.projection_6m.metadata.slope.toFixed(2)} unités/mois
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Tableau des données détaillées */}
                                <Card sx={{ mt: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                            📋 Données Détaillées
                                        </Typography>

                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Période</TableCell>
                                                        <TableCell align="right">Quantité</TableCell>
                                                        <TableCell align="right">CA</TableCell>
                                                        <TableCell align="right">Marge</TableCell>
                                                        <TableCell align="right">Marge Opt.</TableCell>
                                                        <TableCell align="center">Type</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {timelineData.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.periode}</TableCell>
                                                            <TableCell align="right">{item.qte}</TableCell>
                                                            <TableCell align="right">{formatCurrency(item.ca)}</TableCell>
                                                            <TableCell align="right">
                                                                {formatCurrency(item.marge || item.marge_actuelle || 0)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {formatCurrency(item.marge_optimisee || 0)}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Chip
                                                                    label={item.type}
                                                                    size="small"
                                                                    color={item.type === 'historique' ? 'primary' : 'secondary'}
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* Tab 3: Simulation */}
                        {activeTab === 3 && (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    🎮 Simulation d'Optimisation
                                </Typography>

                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                            Scénario de Rationalisation
                                        </Typography>

                                        <Grid container spacing={3}>
                                            {/* Avant optimisation */}
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main', mb: 2 }}>
                                                        📊 Situation Actuelle
                                                    </Typography>
                                                    <Stack spacing={1}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2">Références totales:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {optimization.refs_total}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2">Marge 6M actuelle:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {formatCurrency(optimization.marge_actuelle_6m)}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2">Coût de gestion:</Typography>
                                                            <Typography variant="body2" sx={{ color: 'error.main' }}>
                                                                Élevé (dispersé)
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Grid>

                                            {/* Après optimisation */}
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', mb: 2 }}>
                                                        🎯 Après Optimisation
                                                    </Typography>
                                                    <Stack spacing={1}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2">Références conservées:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {optimization.refs_to_keep?.length || 0}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2">Marge 6M optimisée:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                {formatCurrency(optimization.marge_optimisee_6m)}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2">Coût de gestion:</Typography>
                                                            <Typography variant="body2" sx={{ color: 'success.main' }}>
                                                                Réduit (focalisé)
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        {/* Impact de l'optimisation */}
                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                                                💰 Impact Financier
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" color="text.secondary">Gain immédiat</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                        {formatCurrency(optimization.gain_potentiel)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" color="text.secondary">Gain projeté 6M</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                        {formatCurrency(optimization.gain_potentiel_6m)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="caption" color="text.secondary">Amélioration marge</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                                        {formatCurrency(optimization.marge_optimisee_6m - optimization.marge_actuelle_6m)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Actions recommandées */}
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                                                🎯 Actions Recommandées:
                                            </Typography>
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CheckCircle color="success" fontSize="small" />
                                                    <Typography variant="body2">
                                                        Conserver {optimization.refs_to_keep?.length || 0} références principales
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Warning color="warning" fontSize="small" />
                                                    <Typography variant="body2">
                                                        Évaluer {optimization.refs_to_delete_low_sales?.length || 0} références à faibles ventes
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Cancel color="error" fontSize="small" />
                                                    <Typography variant="body2">
                                                        Supprimer {optimization.refs_to_delete_no_sales?.length || 0} références sans ventes
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                    </Box>

                    {/* ✅ Footer avec actions et export */}
                    <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                        <Stack direction="row" spacing={2} justifyContent="space-between">
                            <Button
                                variant="outlined"
                                startIcon={<GetApp />}
                                onClick={() => handleExport('excel')}
                            >
                                Export CSV
                            </Button>
                            <Stack direction="row" spacing={2}>
                                <Button variant="outlined" onClick={onClose}>
                                    Fermer
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<PlayArrowOutlined />}
                                    color="primary"
                                >
                                    Simuler cette Optimisation
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            </motion.div>
        </AnimatePresence>
    );
};

export default OptimizationDetailPanel;