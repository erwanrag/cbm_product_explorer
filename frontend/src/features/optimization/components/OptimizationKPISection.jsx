// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationKPISection.jsx
// ===================================

import React from 'react';
import {
    Box, Grid, Card, CardContent, Typography,
    Skeleton, Chip, LinearProgress, 
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
    TrendingUp, TrendingDown, Assessment,
    Insights, MonetizationOn, Inventory
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';

const OptimizationKPISection = ({ data, totals, isLoading }) => {
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

    const kpiData = [
        {
            title: 'Qualités Analysées',
            value: totals?.totalGroups || 0,
            icon: Assessment,
            color: 'primary',
            bgColor: 'primary.light',
            suffix: '',
            description: 'Groupes d\'optimisation identifiés'
        },
        {
            title: 'Gain Immédiat',
            value: formatCurrency(totals?.totalGainImmediat || 0),
            icon: MonetizationOn,
            color: 'success',
            bgColor: 'success.light',
            suffix: '',
            description: 'Gain potentiel immédiat',
            trend: totals?.totalGainImmediat > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Gain 6 Mois',
            value: formatCurrency(totals?.totalGain6m || 0),
            icon: TrendingUp,
            color: 'info',
            bgColor: 'info.light',
            suffix: '',
            description: 'Projection à 6 mois',
            trend: totals?.totalGain6m > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Références Total',
            value: totals?.totalRefs || 0,
            icon: Inventory,
            color: 'warning',
            bgColor: 'warning.light',
            suffix: '',
            description: 'Références dans l\'analyse'
        },
        {
            title: 'Croissance Moyenne',
            value: formatPercentage(totals?.avgTauxCroissance || 0),
            icon: totals?.avgTauxCroissance > 0 ? TrendingUp : TrendingDown,
            color: totals?.avgTauxCroissance > 0 ? 'success' : 'error',
            bgColor: totals?.avgTauxCroissance > 0 ? 'success.light' : 'error.light',
            suffix: '',
            description: 'Taux de croissance moyen',
            trend: totals?.avgTauxCroissance > 0 ? 'up' : 'down'
        },
        {
            title: 'Potentiel ROI',
            value: totals?.totalGainImmediat && totals?.totalRefs > 0
                ? `${Math.round(totals.totalGainImmediat / totals.totalRefs)}€/ref`
                : '0€/ref',
            icon: Insights,
            color: 'secondary',
            bgColor: 'secondary.light',
            suffix: '',
            description: 'Gain moyen par référence'
        }
    ];

    if (isLoading) {
        return (
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={3}>
                    {Array.from({ length: 6 }, (_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <Box sx={{ ml: 2, flex: 1 }}>
                                            <Skeleton variant="text" width="80%" />
                                            <Skeleton variant="text" width="60%" />
                                        </Box>
                                    </Box>
                                    <Skeleton variant="text" height={32} width="100%" />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Indicateurs Clés d'Optimisation
            </Typography>

            <Grid container spacing={3}>
                {kpiData.map((kpi, index) => {
                    const Icon = kpi.icon;

                    return (
                        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        position: 'relative',
                                        overflow: 'visible',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            elevation: 4,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ pb: 2 }}>
                                        {/* Header avec icône */}
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                            position: 'relative'
                                        }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    bgcolor: kpi.bgColor,
                                                    color: kpi.color + '.main'
                                                }}
                                            >
                                                <Icon fontSize="small" />
                                            </Box>

                                            <Box sx={{ ml: 2, flex: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                                                >
                                                    {kpi.title}
                                                </Typography>
                                            </Box>

                                            {/* Indicateur de tendance */}
                                            {kpi.trend && (
                                                <Box sx={{ position: 'absolute', top: -8, right: -8 }}>
                                                    <Chip
                                                        size="small"
                                                        icon={kpi.trend === 'up' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                                                        label=""
                                                        sx={{
                                                            bgcolor: kpi.trend === 'up' ? 'success.main' : 'error.main',
                                                            color: 'white',
                                                            width: 24,
                                                            height: 24,
                                                            '& .MuiChip-icon': {
                                                                margin: 0,
                                                                fontSize: '0.875rem'
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Valeur principale */}
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{
                                                fontWeight: 700,
                                                color: kpi.color + '.main',
                                                mb: 1,
                                                fontSize: '1.5rem'
                                            }}
                                        >
                                            {kpi.value}
                                            {kpi.suffix && (
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ ml: 0.5 }}
                                                >
                                                    {kpi.suffix}
                                                </Typography>
                                            )}
                                        </Typography>

                                        {/* Description */}
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display: 'block',
                                                fontSize: '0.7rem',
                                                lineHeight: 1.2
                                            }}
                                        >
                                            {kpi.description}
                                        </Typography>

                                        {/* Barre de progression pour certains KPI */}
                                        {(kpi.title === 'Potentiel ROI' && totals?.totalGainImmediat > 0) && (
                                            <Box sx={{ mt: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min((totals.totalGainImmediat / 100000) * 100, 100)}
                                                    sx={{
                                                        height: 4,
                                                        borderRadius: 2,
                                                        bgcolor: 'grey.200',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: kpi.color + '.main'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Résumé textuel */}
            {totals && totals.totalGroups > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        <strong>{totals.totalGroups}</strong> qualités analysées avec un potentiel de gain de{' '}
                        <strong>{formatCurrency(totals.totalGainImmediat)}</strong> immédiatement et{' '}
                        <strong>{formatCurrency(totals.totalGain6m)}</strong> sur 6 mois.
                        {totals.avgTauxCroissance > 0 && (
                            <> Croissance moyenne : <strong>{formatPercentage(totals.avgTauxCroissance)}</strong>.</>
                        )}
                    </Typography>
                </Box>
            )}
            {data?.items?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Références à conserver par qualité :
                    </Typography>

                    <Box sx={{ mt: 1 }}>

                        {['OEM', 'PMQ', 'PMV'].map((qualite) => {
                            const groupes = data.items.filter(item => item.qualite === qualite);
                            const refs = groupes.flatMap(g => g.refs_to_keep || []);
                            if (refs.length === 0) return null;

                            return (
                                <Box key={qualite} sx={{ mb: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}
                                    >
                                        {qualite} • {refs.length} référence{refs.length > 1 ? 's' : ''}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                            alignItems: 'center'
                                        }}
                                    >
                                        {refs.map((ref, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    px: 1.2,
                                                    py: 0.4,
                                                    borderRadius: 1,
                                                    bgcolor: 'grey.100',
                                                    border: '1px solid',
                                                    borderColor: 'grey.300',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {ref.refint ?? '?'} ({ref.cod_pro})
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                </Box>
            )}





        </Box>

    );
};

export default OptimizationKPISection;