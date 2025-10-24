// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationDetailPanel.jsx
// ✅ VERSION AVEC ONGLETS - Historique / Projection / Synthèse / Références
// ===================================

import React, { useState } from 'react';
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
    Divider,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Card,
    CardContent,
    Tabs,
    Tab
} from '@mui/material';
import {
    Close,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Warning,
    Cancel,
    GetApp,
    PlayArrowOutlined,
    BarChart,
    Assessment,
    ListAlt
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import HistoriqueCard from './HistoriqueCard';
import ProjectionCard from './ProjectionCard';
import SyntheseCard from './SyntheseCard';

const OptimizationDetailPanel = ({ optimization, open, onClose }) => {
    const [activeTab, setActiveTab] = useState(0);

    // Guard clause
    if (!optimization) return null;

    // Format helpers
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '0 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatPercent = (value) => {
        if (!value && value !== 0) return '0%';
        return `${(value * 100).toFixed(1)}%`;
    };

    // Export handler
    const handleExport = (format) => {
        console.log(`Export ${format} pour grouping_crn ${optimization.grouping_crn}`);
        // TODO: Implémenter export
    };

    // Simulation handler
    const handleSimulate = () => {
        console.log('Simulation pour', optimization);
        // TODO: Ouvrir modal simulation
    };

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        component: motion.div,
                        initial: { opacity: 0, y: 50 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: 50 },
                        transition: { duration: 0.3 }
                    }}
                >
                    {/* =============== HEADER =============== */}
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    🎯 Détails Optimisation - Groupe {optimization.grouping_crn}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Chip
                                        label={optimization.qualite}
                                        color={
                                            optimization.qualite === 'OEM' ? 'primary' :
                                            optimization.qualite === 'PMQ' ? 'secondary' : 'default'
                                        }
                                        size="small"
                                    />
                                    <Chip
                                        label={`${optimization.refs_total} références`}
                                        variant="outlined"
                                        size="small"
                                    />
                                    {optimization.projection_6m?.metadata && (
                                        <Chip
                                            label={`Qualité: ${(optimization.projection_6m.metadata.quality_score * 100).toFixed(0)}%`}
                                            color={
                                                optimization.projection_6m.metadata.quality_score >= 0.7 ? 'success' :
                                                optimization.projection_6m.metadata.quality_score >= 0.4 ? 'warning' : 'error'
                                            }
                                            size="small"
                                        />
                                    )}
                                </Stack>
                            </Box>
                            <IconButton onClick={onClose} size="small">
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <Divider />

                    {/* =============== TABS NAVIGATION =============== */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            variant="fullWidth"
                            sx={{ px: 3 }}
                        >
                            <Tab
                                icon={<BarChart />}
                                label="Historique 12M"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<TrendingUp />}
                                label="Projection 6M"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<Assessment />}
                                label="Synthèse 18M"
                                iconPosition="start"
                            />
                            <Tab
                                icon={<ListAlt />}
                                label="Références"
                                iconPosition="start"
                            />
                        </Tabs>
                    </Box>

                    {/* =============== CONTENT =============== */}
                    <DialogContent sx={{ p: 3, minHeight: 500 }}>
                        {/* TAB 0: Historique 12 mois */}
                        {activeTab === 0 && optimization.historique_12m && (
                            <Box>
                                <HistoriqueCard data={optimization.historique_12m} />
                                
                                {/* Détail mensuel */}
                                {optimization.historique_12m.mois?.length > 0 && (
                                    <Card sx={{ mt: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                📅 Détail mensuel (12 derniers mois)
                                            </Typography>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Période</TableCell>
                                                            <TableCell align="right">Qté</TableCell>
                                                            <TableCell align="right">CA Réel</TableCell>
                                                            <TableCell align="right">Marge PA</TableCell>
                                                            <TableCell align="right">Marge Opt.</TableCell>
                                                            <TableCell align="right">Manque à gagner</TableCell>
                                                            <TableCell align="right">Coverage</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {optimization.historique_12m.mois.map((mois) => (
                                                            <TableRow key={mois.periode}>
                                                                <TableCell>{mois.periode}</TableCell>
                                                                <TableCell align="right">{mois.qte_reelle}</TableCell>
                                                                <TableCell align="right">{formatCurrency(mois.ca_reel)}</TableCell>
                                                                <TableCell align="right">{formatCurrency(mois.marge_achat_actuelle)}</TableCell>
                                                                <TableCell align="right">{formatCurrency(mois.marge_achat_optimisee)}</TableCell>
                                                                <TableCell align="right">
                                                                    <Typography color="warning.dark" fontWeight={600}>
                                                                        {formatCurrency(mois.gain_manque_achat)}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {(mois.facteur_couverture * 100).toFixed(1)}%
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </CardContent>
                                    </Card>
                                )}
                            </Box>
                        )}

                        {/* TAB 1: Projection 6 mois */}
                        {activeTab === 1 && optimization.projection_6m && (
                            <Box>
                                <ProjectionCard data={optimization.projection_6m} />
                                
                                {/* Détail mensuel projection */}
                                {optimization.projection_6m.mois?.length > 0 && (
                                    <Card sx={{ mt: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                📅 Projection mensuelle (6 prochains mois)
                                            </Typography>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Période</TableCell>
                                                            <TableCell align="right">Qté Projetée</TableCell>
                                                            <TableCell align="right">CA Projeté</TableCell>
                                                            <TableCell align="right">Marge PA Act.</TableCell>
                                                            <TableCell align="right">Marge Opt.</TableCell>
                                                            <TableCell align="right">Gain Potentiel</TableCell>
                                                            <TableCell align="right">Coverage</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {optimization.projection_6m.mois.map((mois) => (
                                                            <TableRow key={mois.periode}>
                                                                <TableCell>{mois.periode}</TableCell>
                                                                <TableCell align="right">{mois.qte}</TableCell>
                                                                <TableCell align="right">{formatCurrency(mois.ca)}</TableCell>
                                                                <TableCell align="right">{formatCurrency(mois.marge_achat_actuelle)}</TableCell>
                                                                <TableCell align="right">{formatCurrency(mois.marge_achat_optimisee)}</TableCell>
                                                                <TableCell align="right">
                                                                    <Typography color="success.dark" fontWeight={600}>
                                                                        {formatCurrency(mois.gain_potentiel_achat)}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {(mois.facteur_couverture * 100).toFixed(1)}%
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            {/* Metadata qualité */}
                                            {optimization.projection_6m.metadata && (
                                                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        🔍 Qualité de la projection
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption">Méthode</Typography>
                                                            <Typography>{optimization.projection_6m.metadata.method}</Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption">Confiance</Typography>
                                                            <Typography>{optimization.projection_6m.metadata.confidence_level}</Typography>
                                                        </Grid>
                                                        {optimization.projection_6m.metadata.warnings?.length > 0 && (
                                                            <Grid item xs={12}>
                                                                <Typography variant="caption" color="warning.main">
                                                                    ⚠️ Avertissements:
                                                                </Typography>
                                                                {optimization.projection_6m.metadata.warnings.map((w, i) => (
                                                                    <Typography key={i} variant="body2" color="text.secondary">
                                                                        • {w}
                                                                    </Typography>
                                                                ))}
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </Box>
                        )}

                        {/* TAB 2: Synthèse totale 18 mois */}
                        {activeTab === 2 && optimization.synthese_totale && (
                            <Box>
                                <SyntheseCard data={optimization.synthese_totale} />
                                
                                {/* Comparaison marges */}
                                <Card sx={{ mt: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📊 Comparaison Marges 18 Mois
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                                                    <Typography variant="caption" color="error.dark">
                                                        Marge Actuelle (PA)
                                                    </Typography>
                                                    <Typography variant="h4" color="error.dark">
                                                        {formatCurrency(optimization.synthese_totale.marge_achat_actuelle_18m)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                                                    <Typography variant="caption" color="success.dark">
                                                        Marge Optimisée (PA)
                                                    </Typography>
                                                    <Typography variant="h4" color="success.dark">
                                                        {formatCurrency(optimization.synthese_totale.marge_achat_optimisee_18m)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 3 }} />

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="caption">Manque à gagner (12m passés)</Typography>
                                                <Typography variant="h6" color="warning.dark">
                                                    {formatCurrency(optimization.synthese_totale.gain_manque_achat_12m)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="caption">Gain potentiel (6m futurs)</Typography>
                                                <Typography variant="h6" color="success.dark">
                                                    {formatCurrency(optimization.synthese_totale.gain_potentiel_achat_6m)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="caption">Amélioration totale</Typography>
                                                <Typography variant="h6" color="primary.main">
                                                    {formatPercent(optimization.synthese_totale.amelioration_pct)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* TAB 3: Références (EXISTANT) */}
                        {activeTab === 3 && (
                            <Box>
                                <Grid container spacing={3}>
                                    {/* Refs à conserver */}
                                    <Grid item xs={12}>
                                        <Card>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <CheckCircle color="success" sx={{ mr: 1 }} />
                                                    <Typography variant="h6">
                                                        Références à Conserver ({optimization.refs_to_keep?.length || 0})
                                                    </Typography>
                                                </Box>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>COD_PRO</TableCell>
                                                                <TableCell>REFINT</TableCell>
                                                                <TableCell align="right">Prix Achat</TableCell>
                                                                <TableCell align="right">CA</TableCell>
                                                                <TableCell align="right">Quantité</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {optimization.refs_to_keep?.map((ref) => (
                                                                <TableRow key={ref.cod_pro}>
                                                                    <TableCell>{ref.cod_pro}</TableCell>
                                                                    <TableCell>{ref.refint}</TableCell>
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
                                    </Grid>

                                    {/* Refs faibles ventes */}
                                    {optimization.refs_to_delete_low_sales?.length > 0 && (
                                        <Grid item xs={12}>
                                            <Card>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Warning color="warning" sx={{ mr: 1 }} />
                                                        <Typography variant="h6">
                                                            Références à Faibles Ventes ({optimization.refs_to_delete_low_sales.length})
                                                        </Typography>
                                                    </Box>
                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>COD_PRO</TableCell>
                                                                    <TableCell>REFINT</TableCell>
                                                                    <TableCell align="right">CA</TableCell>
                                                                    <TableCell align="right">Quantité</TableCell>
                                                                    <TableCell align="right">Gain Potentiel</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {optimization.refs_to_delete_low_sales.map((ref) => (
                                                                    <TableRow key={ref.cod_pro}>
                                                                        <TableCell>{ref.cod_pro}</TableCell>
                                                                        <TableCell>{ref.refint}</TableCell>
                                                                        <TableCell align="right">{formatCurrency(ref.ca)}</TableCell>
                                                                        <TableCell align="right">{ref.qte}</TableCell>
                                                                        <TableCell align="right">
                                                                            {formatCurrency(ref.gain_potentiel_par_ref)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )}

                                    {/* Refs sans ventes */}
                                    {optimization.refs_to_delete_no_sales?.length > 0 && (
                                        <Grid item xs={12}>
                                            <Card>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Cancel color="error" sx={{ mr: 1 }} />
                                                        <Typography variant="h6">
                                                            Références Sans Ventes ({optimization.refs_to_delete_no_sales.length})
                                                        </Typography>
                                                    </Box>
                                                    <TableContainer>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>COD_PRO</TableCell>
                                                                    <TableCell>REFINT</TableCell>
                                                                    <TableCell align="right">Prix Achat</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {optimization.refs_to_delete_no_sales.map((ref) => (
                                                                    <TableRow key={ref.cod_pro}>
                                                                        <TableCell>{ref.cod_pro}</TableCell>
                                                                        <TableCell>{ref.refint}</TableCell>
                                                                        <TableCell align="right">{formatCurrency(ref.px_achat)}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>

                    {/* =============== FOOTER ACTIONS =============== */}
                    <Divider />
                    <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Button
                            variant="outlined"
                            startIcon={<GetApp />}
                            onClick={() => handleExport('csv')}
                        >
                            Export CSV
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        <Button variant="outlined" onClick={onClose}>
                            Fermer
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PlayArrowOutlined />}
                            onClick={handleSimulate}
                        >
                            Simuler cette Optimisation
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default OptimizationDetailPanel;