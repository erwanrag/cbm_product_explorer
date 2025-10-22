import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, Grid, Card, CardContent,
    Stepper, Step, StepLabel, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip
} from '@mui/material';
import {
    PlayArrow, CheckCircle, Warning, Assessment
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizationService } from '@/api/services/optimizationService';

const OptimizationSimulationModal = ({ open, onClose, data }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [simulationResults, setSimulationResults] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationError, setSimulationError] = useState(null);

    const formatCurrency = (value) => {
        if (!value) return '0 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const steps = [
        { label: 'Préparation', description: 'Vérification des données' },
        { label: 'Simulation', description: 'Calcul des impacts' },
        { label: 'Résultats', description: 'Analyse des gains' }
    ];

    useEffect(() => {
        if (open) {
            setActiveStep(0);
            setSimulationResults(null);
            setSimulationError(null);
        }
    }, [open]);

    const aggregatedStats = React.useMemo(() => {
        if (!data || !Array.isArray(data)) return null;

        return data.reduce((acc, optimization) => {
            acc.totalGain += optimization.gain_potentiel || 0;
            acc.totalGain6m += optimization.gain_potentiel_6m || 0;
            acc.totalRefs += optimization.refs_total || 0;
            acc.refsToDelete += (optimization.refs_to_delete_low_sales?.length || 0) +
                (optimization.refs_to_delete_no_sales?.length || 0);
            acc.refsToKeep += optimization.refs_to_keep?.length || 0;
            acc.groupes += 1;
            return acc;
        }, {
            totalGain: 0,
            totalGain6m: 0,
            totalRefs: 0,
            refsToDelete: 0,
            refsToKeep: 0,
            groupes: 0
        });
    }, [data]);

    const handleRunSimulation = async () => {
        try {
            setIsSimulating(true);
            setSimulationError(null);
            setActiveStep(1);

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulation simple - Mock data
            const mockResults = data.map(optimization => ({
                grouping_crn: optimization.grouping_crn,
                qualite: optimization.qualite,
                projected_gain: (optimization.gain_potentiel || 0) * 1.15, // +15% simulé
                confidence: 'high',
                status: 'success'
            }));

            setSimulationResults(mockResults);
            setActiveStep(2);

        } catch (error) {
            console.error('Erreur simulation:', error);
            setSimulationError(error.message || 'Erreur lors de la simulation');
        } finally {
            setIsSimulating(false);
        }
    };

    const comparisonData = React.useMemo(() => {
        if (!data || !simulationResults) return [];

        return data.map((optimization, index) => ({
            groupe: `${optimization.grouping_crn}-${optimization.qualite}`,
            gainActuel: optimization.gain_potentiel || 0,
            gainSimule: simulationResults[index]?.projected_gain || 0,
            difference: (simulationResults[index]?.projected_gain || 0) - (optimization.gain_potentiel || 0)
        }));
    }, [data, simulationResults]);

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { minHeight: '70vh' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Assessment color="primary" />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Simulation d'Optimisation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {data?.length || 0} groupe(s) sélectionné(s) pour simulation
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepLabel>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {step.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {step.description}
                                    </Typography>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* ÉTAPE 0: PRÉPARATION */}
                {activeStep === 0 && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ mb: 3 }}>
                                        <Typography variant="body2">
                                            Vous êtes sur le point de simuler l'impact de {data?.length || 0} optimisation(s).
                                        </Typography>
                                    </Alert>
                                </Grid>

                                {aggregatedStats && (
                                    <Grid item xs={12}>
                                        <Card elevation={2}>
                                            <CardContent>
                                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                    Vue d'ensemble de la Simulation
                                                </Typography>
                                                <Grid container spacing={3} sx={{ mt: 1 }}>
                                                    <Grid item xs={6} md={3}>
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                                {aggregatedStats.groupes}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Groupes
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} md={3}>
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                                                {aggregatedStats.refsToDelete}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Refs à supprimer
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} md={3}>
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                                {formatCurrency(aggregatedStats.totalGain)}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Gain Immédiat
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} md={3}>
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                                                                {formatCurrency(aggregatedStats.totalGain6m)}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Gain 6 Mois
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                                Détail des Optimisations à Simuler
                                            </Typography>
                                            <TableContainer>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Groupe</TableCell>
                                                            <TableCell>Qualité</TableCell>
                                                            <TableCell align="right">Refs Total</TableCell>
                                                            <TableCell align="right">À Supprimer</TableCell>
                                                            <TableCell align="right">Gain Estimé</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {data?.map((optimization, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{optimization.grouping_crn}</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        size="small"
                                                                        label={optimization.qualite}
                                                                        color={
                                                                            optimization.qualite === 'OEM' ? 'success' :
                                                                                optimization.qualite === 'PMQ' ? 'primary' : 'warning'
                                                                        }
                                                                        variant="outlined"
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">{optimization.refs_total}</TableCell>
                                                                <TableCell align="right">
                                                                    {(optimization.refs_to_delete_low_sales?.length || 0) +
                                                                        (optimization.refs_to_delete_no_sales?.length || 0)}
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                    {formatCurrency(optimization.gain_potentiel)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* ÉTAPE 1: SIMULATION EN COURS */}
                {activeStep === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <CircularProgress size={60} sx={{ mb: 3 }} />
                            <Typography variant="h6" gutterBottom>
                                Simulation en cours...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Calcul des impacts et projections pour {data?.length || 0} groupe(s)
                            </Typography>

                            {simulationError && (
                                <Alert severity="error" sx={{ mt: 3, maxWidth: 500, mx: 'auto' }}>
                                    <Typography variant="body2">
                                        {simulationError}
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    </motion.div>
                )}

                {/* ÉTAPE 2: RÉSULTATS */}
                {activeStep === 2 && simulationResults && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Alert severity="success" sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        Simulation terminée avec succès !
                                    </Typography>
                                </Alert>
                            </Grid>

                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                            Comparaison Gains Estimés vs Simulés
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={comparisonData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="groupe" />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value) => formatCurrency(value)}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="gainActuel"
                                                    stroke="#2196F3"
                                                    name="Gain Estimé"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="gainSimule"
                                                    stroke="#4CAF50"
                                                    name="Gain Simulé"
                                                    strokeWidth={2}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                            Résultats Détaillés
                                        </Typography>
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Groupe</TableCell>
                                                        <TableCell>Qualité</TableCell>
                                                        <TableCell align="right">Gain Estimé</TableCell>
                                                        <TableCell align="right">Gain Simulé</TableCell>
                                                        <TableCell align="right">Différence</TableCell>
                                                        <TableCell align="center">Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {comparisonData.map((result, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{result.groupe.split('-')[0]}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    label={result.groupe.split('-')[1]}
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {formatCurrency(result.gainActuel)}
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                                {formatCurrency(result.gainSimule)}
                                                            </TableCell>
                                                            <TableCell
                                                                align="right"
                                                                sx={{
                                                                    color: result.difference >= 0 ? 'success.main' : 'error.main',
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {result.difference >= 0 ? '+' : ''}{formatCurrency(result.difference)}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {result.difference >= 0 ? (
                                                                    <CheckCircle fontSize="small" color="success" />
                                                                ) : (
                                                                    <Warning fontSize="small" color="warning" />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={onClose} variant="outlined">
                    {activeStep === 2 ? 'Fermer' : 'Annuler'}
                </Button>

                {activeStep === 0 && (
                    <Button
                        onClick={handleRunSimulation}
                        variant="contained"
                        startIcon={<PlayArrow />}
                        disabled={!data || data.length === 0 || isSimulating}
                    >
                        Lancer la Simulation
                    </Button>
                )}

                {activeStep === 2 && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                    >
                        Appliquer
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default OptimizationSimulationModal;