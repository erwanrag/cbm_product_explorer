// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationSimulationModal.jsx
// ===================================

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Stepper, Step, StepLabel,
    Card, CardContent, Grid, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Paper, Alert, CircularProgress, Divider, Stack
} from '@mui/material';
import {
    PlayArrow, CheckCircle, Cancel, Timeline,
    TrendingUp, Warning, Info
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useOptimizationSimulation, useApplyOptimizations } from '@/features/optimization/hooks/useOptimizationData';

const OptimizationSimulationModal = ({ open, onClose, data }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [simulationResults, setSimulationResults] = useState(null);

    // Hooks pour les mutations
    const simulationMutation = useOptimizationSimulation();
    const applyMutation = useApplyOptimizations();

    const steps = ['Configuration', 'Simulation', 'Résultats', 'Application'];

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

    // Reset au changement de données
    useEffect(() => {
        if (open && data) {
            setActiveStep(0);
            setSimulationResults(null);
        }
    }, [open, data]);

    // Calculs pour les données sélectionnées
    const optimizationsToSimulate = Array.isArray(data) ? data : (data ? [data] : []);
    const totalGainImmediat = optimizationsToSimulate.reduce((sum, opt) => sum + (opt.gain_potentiel || 0), 0);
    const totalGain6m = optimizationsToSimulate.reduce((sum, opt) => sum + (opt.gain_potentiel_6m || 0), 0);
    const totalRefsToDelete = optimizationsToSimulate.reduce((sum, opt) =>
        sum + (opt.refs_to_delete_low_sales?.length || 0) + (opt.refs_to_delete_no_sales?.length || 0), 0
    );

    // Lancer la simulation
    const handleRunSimulation = async () => {
        setActiveStep(1);

        try {
            const results = await Promise.all(
                optimizationsToSimulate.map(opt =>
                    simulationMutation.mutateAsync(opt)
                )
            );

            setSimulationResults(results);
            setActiveStep(2);
        } catch (error) {
            console.error('Erreur simulation:', error);
            setActiveStep(0);
        }
    };

    // Appliquer les optimisations
    const handleApplyOptimizations = async () => {
        setActiveStep(3);

        try {
            await applyMutation.mutateAsync(optimizationsToSimulate);
            onClose();
        } catch (error) {
            console.error('Erreur application:', error);
            setActiveStep(2);
        }
    };

    // Données pour les graphiques de simulation
    const simulationChartData = simulationResults ?
        simulationResults[0]?.projection_data?.map((item, index) => ({
            mois: `M${index + 1}`,
            avant: item.marge_avant || 0,
            apres: item.marge_apres || 0,
            gain: (item.marge_apres || 0) - (item.marge_avant || 0)
        })) || [] : [];

    if (!open || !data) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { height: '90vh' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5" fontWeight={600}>
                        Simulation d'Optimisation
                    </Typography>
                    <Chip
                        label={`${optimizationsToSimulate.length} groupe${optimizationsToSimulate.length > 1 ? 's' : ''}`}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Stepper */}
                <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label, index) => (
                            <Step key={label}>
                                <StepLabel
                                    error={
                                        (index === 1 && simulationMutation.isError) ||
                                        (index === 3 && applyMutation.isError)
                                    }
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                    {/* Étape 0: Configuration */}
                    {activeStep === 0 && (
                        <Stack spacing={3}>
                            <Alert severity="info" icon={<Info />}>
                                Vérifiez les paramètres de simulation avant de continuer
                            </Alert>

                            {/* Résumé des optimisations */}
                            <Card elevation={1}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Résumé des optimisations
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={3}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" color="primary.main" fontWeight={600}>
                                                    {optimizationsToSimulate.length}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Groupes sélectionnés
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" color="success.main" fontWeight={600}>
                                                    {formatCurrency(totalGainImmediat)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Gain immédiat estimé
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" color="info.main" fontWeight={600}>
                                                    {formatCurrency(totalGain6m)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Gain 6 mois estimé
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" color="warning.main" fontWeight={600}>
                                                    {totalRefsToDelete}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Références à supprimer
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Détail par groupe */}
                            <Card elevation={1}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Détail par groupe
                                    </Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Groupe</TableCell>
                                                    <TableCell>Qualité</TableCell>
                                                    <TableCell align="right">Gain Immédiat</TableCell>
                                                    <TableCell align="right">Refs à Suppr.</TableCell>
                                                    <TableCell align="right">Croissance</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {optimizationsToSimulate.map((opt, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{opt.grouping_crn}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={opt.qualite}
                                                                color={
                                                                    opt.qualite === 'OEM' ? 'success' :
                                                                        opt.qualite === 'PMQ' ? 'primary' : 'warning'
                                                                }
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography color="success.main" fontWeight={500}>
                                                                {formatCurrency(opt.gain_potentiel)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {(opt.refs_to_delete_low_sales?.length || 0) +
                                                                (opt.refs_to_delete_no_sales?.length || 0)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                                {opt.taux_croissance > 0 ? (
                                                                    <TrendingUp fontSize="small" color="success" />
                                                                ) : (
                                                                    <Warning fontSize="small" color="warning" />
                                                                )}
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ ml: 0.5 }}
                                                                    color={opt.taux_croissance > 0 ? 'success.main' : 'warning.main'}
                                                                >
                                                                    {((opt.taux_croissance || 0) * 100).toFixed(1)}%
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Stack>
                    )}

                    {/* Étape 1: Simulation en cours */}
                    {activeStep === 1 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress size={60} sx={{ mb: 3 }} />
                            <Typography variant="h6" gutterBottom>
                                Simulation en cours...
                            </Typography>
                            <Typography color="text.secondary">
                                Calcul des impacts et projections sur 6 mois
                            </Typography>
                        </Box>
                    )}

                    {/* Étape 2: Résultats */}
                    {activeStep === 2 && simulationResults && (
                        <Stack spacing={3}>
                            <Alert severity="success" icon={<CheckCircle />}>
                                Simulation terminée avec succès !
                            </Alert>

                            {/* Résultats globaux */}
                            <Card elevation={1}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Résultats de la simulation
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                                                <Typography variant="h4" color="success.dark" fontWeight={600}>
                                                    {formatCurrency(simulationResults.reduce((sum, r) => sum + (r.gain_simule || 0), 0))}
                                                </Typography>
                                                <Typography variant="body2" color="success.dark">
                                                    Gain simulé total
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                                                <Typography variant="h4" color="info.dark" fontWeight={600}>
                                                    {simulationResults.reduce((sum, r) => sum + (r.refs_impactees || 0), 0)}
                                                </Typography>
                                                <Typography variant="body2" color="info.dark">
                                                    Références impactées
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                                                <Typography variant="h4" color="warning.dark" fontWeight={600}>
                                                    {Math.round(simulationResults.reduce((sum, r) => sum + (r.impact_score || 0), 0))}%
                                                </Typography>
                                                <Typography variant="body2" color="warning.dark">
                                                    Score d'impact
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Graphique de projection */}
                            {simulationChartData.length > 0 && (
                                <Card elevation={1}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Projection des gains sur 6 mois
                                        </Typography>
                                        <Box sx={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={simulationChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="mois" />
                                                    <YAxis tickFormatter={formatCurrency} />
                                                    <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                                                    <Bar dataKey="avant" name="Avant optimisation" fill="#ff9800" />
                                                    <Bar dataKey="apres" name="Après optimisation" fill="#4caf50" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Alertes et recommandations */}
                            <Stack spacing={2}>
                                {simulationResults.some(r => r.risque_niveau > 2) && (
                                    <Alert severity="warning" icon={<Warning />}>
                                        <Typography variant="body2">
                                            <strong>Attention :</strong> Certaines optimisations présentent un risque élevé.
                                            Vérifiez les impacts avant d'appliquer.
                                        </Typography>
                                    </Alert>
                                )}

                                <Alert severity="info" icon={<Info />}>
                                    <Typography variant="body2">
                                        La simulation est basée sur les données historiques et les projections.
                                        Les résultats réels peuvent varier selon les conditions de marché.
                                    </Typography>
                                </Alert>
                            </Stack>
                        </Stack>
                    )}

                    {/* Étape 3: Application */}
                    {activeStep === 3 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            {applyMutation.isLoading ? (
                                <>
                                    <CircularProgress size={60} sx={{ mb: 3 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Application des optimisations...
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Mise à jour du catalogue en cours
                                    </Typography>
                                </>
                            ) : applyMutation.isSuccess ? (
                                <>
                                    <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 3 }} />
                                    <Typography variant="h6" gutterBottom color="success.main">
                                        Optimisations appliquées avec succès !
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Le catalogue a été mis à jour selon les paramètres d'optimisation
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Cancel sx={{ fontSize: 60, color: 'error.main', mb: 3 }} />
                                    <Typography variant="h6" gutterBottom color="error.main">
                                        Erreur lors de l'application
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Une erreur s'est produite. Veuillez réessayer.
                                    </Typography>
                                </>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={simulationMutation.isLoading || applyMutation.isLoading}>
                    {activeStep === 3 && applyMutation.isSuccess ? 'Fermer' : 'Annuler'}
                </Button>

                {activeStep === 0 && (
                    <Button
                        variant="contained"
                        onClick={handleRunSimulation}
                        startIcon={<PlayArrow />}
                        disabled={optimizationsToSimulate.length === 0}
                    >
                        Lancer la simulation
                    </Button>
                )}

                {activeStep === 2 && simulationResults && (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleApplyOptimizations}
                        startIcon={<CheckCircle />}
                        disabled={applyMutation.isLoading}
                    >
                        Appliquer les optimisations
                    </Button>
                )}

                {activeStep === 2 && (
                    <Button
                        variant="outlined"
                        onClick={() => setActiveStep(0)}
                    >
                        Modifier la configuration
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default OptimizationSimulationModal;