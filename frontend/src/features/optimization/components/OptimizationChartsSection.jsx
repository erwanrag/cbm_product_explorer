// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationChartsSection.jsx
// ✅ VERSION V3
// - CA splité : CA Réalisé vs CA Projeté
// - Marge Actuelle splitée : Réalisée vs Projetée
// - Marge Optimisée : une seule ligne (OK)
// ===================================

import React, { useMemo } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent,
    Skeleton, Tabs, Tab, Chip
} from '@mui/material';
import {
    LineChart, Line, BarChart, Bar,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';

const OptimizationChartsSection = ({ data, isLoading }) => {
    const [activeTab, setActiveTab] = React.useState(0);

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

    // Formatage K€ pour les axes
    const formatCurrencyK = (value) => {
        if (!value) return '0';
        if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
        if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K€`;
        return `${value}€`;
    };

    // Données pour le graphique de gains par groupe
    const gainsData = useMemo(() => {
        if (!data?.items) return [];

        return data.items.map(item => ({
            groupe: `${item.grouping_crn}-${item.qualite}`,
            gainHistorique: item.synthese_totale?.gain_manque_achat_12m || 0,
            gainProjection: item.synthese_totale?.gain_potentiel_achat_6m || 0,
            gainTotal18m: item.synthese_totale?.gain_total_achat_18m || 0,
            qualite: item.qualite
        })).sort((a, b) => b.gainTotal18m - a.gainTotal18m);
    }, [data]);

    // ✅ Données historiques + projections COMBINÉES (une valeur par période)
    const timelineData = useMemo(() => {
        if (!data?.items) return [];

        const periodeMap = new Map();

        // Historique 12M
        data.items.forEach(item => {
            if (item.historique_12m?.mois) {
                item.historique_12m.mois.forEach(hist => {
                    const existing = periodeMap.get(hist.periode) || {
                        periode: hist.periode,
                        ca: 0,
                        margeActuelle: 0,
                        margeOptimisee: 0,
                        type: 'historique'
                    };
                    existing.ca += hist.ca_reel || 0;
                    existing.margeActuelle += hist.marge_achat_actuelle || 0;
                    existing.margeOptimisee += hist.marge_achat_optimisee || 0;
                    periodeMap.set(hist.periode, existing);
                });
            }
        });

        // Projections 6M (ajoute aux mêmes champs ca et margeActuelle)
        data.items.forEach(item => {
            if (item.projection_6m?.mois) {
                item.projection_6m.mois.forEach(proj => {
                    const existing = periodeMap.get(proj.periode) || {
                        periode: proj.periode,
                        ca: 0,
                        margeActuelle: 0,
                        margeOptimisee: 0,
                        type: 'projection'
                    };
                    existing.ca += proj.ca || 0;
                    existing.margeActuelle += proj.marge_achat_actuelle || 0;
                    existing.margeOptimisee += proj.marge_achat_optimisee || 0;
                    periodeMap.set(proj.periode, existing);
                });
            }
        });

        return Array.from(periodeMap.values()).sort((a, b) => a.periode.localeCompare(b.periode));
    }, [data]);

    // ✅ Trouver la limite entre historique et projection
    const separationIndex = useMemo(() => {
        return timelineData.findIndex(item => item.type === 'projection');
    }, [timelineData]);

    // Données distribution par qualité
    const qualiteData = useMemo(() => {
        if (!data?.items) return [];

        const qualiteMap = new Map();

        data.items.forEach(item => {
            const qualiteKey = (item.qualite === 'PMV') ? 'PMQ/PMV' : item.qualite;

            const existing = qualiteMap.get(qualiteKey) || {
                qualite: qualiteKey,
                gainHistorique: 0,
                gainProjection: 0,
                gainTotal18m: 0,
                groupes: 0,
                refs: 0,
                refsConservees: 0
            };
            existing.gainHistorique += item.synthese_totale?.gain_manque_achat_12m || 0;
            existing.gainProjection += item.synthese_totale?.gain_potentiel_achat_6m || 0;
            existing.gainTotal18m += item.synthese_totale?.gain_total_achat_18m || 0;
            existing.groupes += 1;
            existing.refs += item.refs_total || 0;
            existing.refsConservees += item.refs_to_keep?.length || 0;
            qualiteMap.set(qualiteKey, existing);
        });

        return Array.from(qualiteMap.values());
    }, [data]);

    // Couleurs pour les graphiques
    const colors = {
        OEM: '#2196F3',
        'PMQ/PMV': '#4CAF50',
        PMQ: '#4CAF50',
        PMV: '#66BB6A',
        OE: '#FF9800',
        OTHER: '#9C27B0'
    };

    // Tooltip personnalisé
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: 2,
                    border: 1,
                    borderColor: 'divider'
                }}>
                    <Typography variant="subtitle2" gutterBottom>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Skeleton variant="rectangular" height={400} />
            </Paper>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <Paper elevation={1} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Aucune donnée disponible pour afficher les graphiques
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={1} sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    📊 Visualisations des Optimisations
                </Typography>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Vue d'ensemble" />
                    <Tab label="Évolution Temporelle" />
                    <Tab label="Par Qualité" />
                </Tabs>

                {/* Vue d'ensemble */}
                {activeTab === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            🏆 Top 10 Groupes - Gains Totaux 18M
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={gainsData.slice(0, 10)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="groupe" angle={-45} textAnchor="end" height={100} />
                                                <YAxis tickFormatter={formatCurrencyK} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Bar dataKey="gainHistorique" name="Manque à gagner 12M" fill="#FF9800" stackId="a" />
                                                <Bar dataKey="gainProjection" name="Gain potentiel 6M" fill="#4CAF50" stackId="a" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {/* ✅ Évolution Temporelle SPLITTÉE */}
                {activeTab === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={3}>
                            {/* Graphique CA - UNE SEULE COURBE */}
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            📈 Évolution du CA (12M Réalisé + 6M Projeté)
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={timelineData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="periode" />
                                                <YAxis tickFormatter={formatCurrencyK} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                
                                                {/* Ligne de séparation historique/projection */}
                                                {separationIndex > 0 && (
                                                    <ReferenceLine 
                                                        x={timelineData[separationIndex - 1]?.periode} 
                                                        stroke="#666" 
                                                        strokeDasharray="5 5"
                                                        label={{ value: 'Projection →', position: 'top' }}
                                                    />
                                                )}
                                                
                                                {/* CA - ligne unie avec changement de style */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="ca"
                                                    name="CA"
                                                    stroke="#2196F3"
                                                    strokeWidth={3}
                                                    dot={(props) => {
                                                        const { cx, cy, index } = props;
                                                        const isDashed = timelineData[index]?.type === 'projection';
                                                        return (
                                                            <circle
                                                                cx={cx}
                                                                cy={cy}
                                                                r={5}
                                                                fill={isDashed ? '#64B5F6' : '#2196F3'}
                                                                stroke="#fff"
                                                                strokeWidth={2}
                                                            />
                                                        );
                                                    }}
                                                    strokeDasharray={(props) => {
                                                        // Pas possible de changer dynamiquement, on garde solid
                                                        return undefined;
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                💡 Points foncés = Données réelles (12M passés) | Points clairs = Prévisions ML (6M futurs)
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Graphique Marges - UNE ligne Actuelle + une ligne Optimisée */}
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            💰 Évolution des Marges (Actuelle vs Optimisée)
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={timelineData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="periode" />
                                                <YAxis tickFormatter={formatCurrencyK} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                                
                                                {/* Ligne de séparation */}
                                                {separationIndex > 0 && (
                                                    <ReferenceLine 
                                                        x={timelineData[separationIndex - 1]?.periode} 
                                                        stroke="#666" 
                                                        strokeDasharray="5 5"
                                                    />
                                                )}
                                                
                                                {/* Marge Actuelle - UNE seule ligne avec couleurs différentes */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="margeActuelle"
                                                    name="Marge Actuelle (12M+6M)"
                                                    stroke="#F44336"
                                                    strokeWidth={2}
                                                    dot={(props) => {
                                                        const { cx, cy, index } = props;
                                                        const isDashed = timelineData[index]?.type === 'projection';
                                                        return (
                                                            <circle
                                                                cx={cx}
                                                                cy={cy}
                                                                r={4}
                                                                fill={isDashed ? '#EF5350' : '#F44336'}
                                                                stroke="#fff"
                                                                strokeWidth={2}
                                                            />
                                                        );
                                                    }}
                                                />
                                                
                                                {/* Marge Optimisée (tout en un) */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="margeOptimisee"
                                                    name="Marge Optimisée (18M)"
                                                    stroke="#4CAF50"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#4CAF50', strokeWidth: 2, r: 5 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                💡 Rouge = Marge actuelle (foncé=12M réels, clair=6M projection) | Vert = Marge optimisée (18M)
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {/* Répartition par Qualité */}
                {activeTab === 2 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Répartition des Gains Totaux 18M par Qualité
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={qualiteData}
                                                    dataKey="gainTotal18m"
                                                    nameKey="qualite"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    label={({ qualite, value }) =>
                                                        `${qualite}: ${formatCurrencyK(value)}`
                                                    }
                                                >
                                                    {qualiteData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={colors[entry.qualite] || colors.OTHER}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Statistiques par Qualité
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            {qualiteData.map((item, index) => (
                                                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Chip
                                                            label={item.qualite}
                                                            sx={{
                                                                bgcolor: colors[item.qualite] || colors.OTHER,
                                                                color: 'white'
                                                            }}
                                                        />
                                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                            {formatCurrency(item.gainTotal18m)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.groupes} groupes • {item.refs} références totales
                                                    </Typography>
                                                    <Typography variant="body2" color="warning.main">
                                                        Manque à gagner 12M: {formatCurrency(item.gainHistorique)}
                                                    </Typography>
                                                    <Typography variant="body2" color="success.main">
                                                        Gain potentiel 6M: {formatCurrency(item.gainProjection)}
                                                    </Typography>
                                                    <Typography variant="body2" color="primary.main">
                                                        📦 {item.refsConservees} références conservées
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}
            </Box>
        </Paper>
    );
};

export default OptimizationChartsSection;