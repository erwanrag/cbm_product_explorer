// ===================================
// 📁 2. TRADUCTION ProjectionQualityIndicator.jsx
// ===================================

import React from 'react';
import {
    Chip, Tooltip, Box, Typography, LinearProgress, Alert
} from '@mui/material';
import {
    CheckCircle, Warning, Cancel, Info, TrendingUp, HelpOutline
} from '@mui/icons-material';
import { useTranslation } from '@/store/contexts/LanguageContext'; // ✅ AJOUT

const ProjectionQualityIndicator = ({ projection, compact = false }) => {
    const { t, language } = useTranslation(); // ✅ AJOUT

    // Sécurité : gestion des cas où projection ou metadata sont undefined
    if (!projection || !projection.metadata) {
        return compact ? (
            <Chip size="small" label={t('projection.quality.na', 'N/A')} color="default" variant="outlined" />
        ) : null;
    }

    const metadata = projection.metadata;
    const method = metadata.method || 'unknown';
    const modelQuality = metadata.model_quality || 'unknown';
    const score = metadata.quality_score || 0;
    const confidence = metadata.confidence_level || 'unknown';
    const warnings = metadata.warnings || [];
    const summary = metadata.summary || t('projection.quality.available', 'Projection disponible');

    // ✅ Configuration des indicateurs TRADUITE
    const getQualityConfig = (quality) => {
        const configs = {
            excellent: {
                color: 'success',
                icon: <CheckCircle fontSize="small" />,
                label: t('projection.quality.excellent', 'Excellente'),
                description: t('projection.quality.excellent_desc', 'Modèle très fiable avec historique riche')
            },
            good: {
                color: 'primary',
                icon: <TrendingUp fontSize="small" />,
                label: t('projection.quality.good', 'Bonne'),
                description: t('projection.quality.good_desc', 'Modèle fiable avec données suffisantes')
            },
            fair: {
                color: 'warning',
                icon: <Info fontSize="small" />,
                label: t('projection.quality.fair', 'Correcte'),
                description: t('projection.quality.fair_desc', 'Modèle basique, données limitées')
            },
            basic: {
                color: 'default',
                icon: <Info fontSize="small" />,
                label: t('projection.quality.basic', 'Basique'),
                description: t('projection.quality.basic_desc', 'Projection simple sans modélisation avancée')
            },
            poor: {
                color: 'error',
                icon: <Warning fontSize="small" />,
                label: t('projection.quality.poor', 'Faible'),
                description: t('projection.quality.poor_desc', 'Modèle peu fiable, données insuffisantes')
            }
        };

        return configs[quality] || {
            color: 'default',
            icon: <HelpOutline fontSize="small" />,
            label: t('projection.quality.unknown', 'Inconnue'),
            description: t('projection.quality.unknown_desc', 'Qualité de projection indéterminée')
        };
    };

    // ✅ Configuration des méthodes TRADUITE
    const getMethodConfig = (method) => {
        const configs = {
            linear_regression: {
                label: t('projection.methods.linear_regression', 'Régression Linéaire'),
                description: t('projection.methods.linear_regression_desc', 'Projection basée sur une tendance linéaire')
            },
            seasonal_decomposition: {
                label: t('projection.methods.seasonal_decomposition', 'Décomposition Saisonnière'),
                description: t('projection.methods.seasonal_decomposition_desc', 'Projection tenant compte de la saisonnalité')
            },
            moving_average: {
                label: t('projection.methods.moving_average', 'Moyenne Mobile'),
                description: t('projection.methods.moving_average_desc', 'Projection basée sur une moyenne mobile')
            },
            exponential_smoothing: {
                label: t('projection.methods.exponential_smoothing', 'Lissage Exponentiel'),
                description: t('projection.methods.exponential_smoothing_desc', 'Projection avec lissage exponentiel')
            },
            linear_fallback: {
                label: t('projection.methods.linear_fallback', 'Linéaire Simple'),
                description: t('projection.methods.linear_fallback_desc', 'Projection linéaire de base (fallback)')
            },
            empty_forced: {
                label: t('projection.methods.empty_forced', 'Ventes Nulles'),
                description: t('projection.methods.empty_forced_desc', 'Pas de ventes détectées')
            },
            constant_fallback: {
                label: t('projection.methods.constant_fallback', 'Constante'),
                description: t('projection.methods.constant_fallback_desc', 'Projection constante basée sur 1 point')
            }
        };

        return configs[method] || {
            label: t('projection.methods.unknown', 'Méthode Inconnue'),
            description: t('projection.methods.unknown_desc', 'Méthode de projection non spécifiée')
        };
    };

    const qualityConfig = getQualityConfig(modelQuality);
    const methodConfig = getMethodConfig(method);

    // Version compacte pour tableaux
    if (compact) {
        return (
            <Tooltip title={
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {summary}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {t('projection.quality.quality', 'Qualité')}: {qualityConfig.label} • {methodConfig.label}
                    </Typography>
                    {score > 0 && (
                        <Typography variant="body2">
                            Score: {(score * 100).toFixed(0)}%
                        </Typography>
                    )}
                    {warnings.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="warning.main">
                                ⚠️ {warnings.slice(0, 2).join(', ')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            } arrow>
                <Chip
                    size="small"
                    color={qualityConfig.color}
                    icon={qualityConfig.icon}
                    label={qualityConfig.label}
                    variant="outlined"
                />
            </Tooltip>
        );
    }

    // Version complète pour panneaux de détail
    return (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                {t('projection.quality.title', 'Qualité de la Projection')}
            </Typography>

            {/* Résumé principal */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {summary}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        color={qualityConfig.color}
                        icon={qualityConfig.icon}
                        label={qualityConfig.label}
                        size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                        via {methodConfig.label}
                    </Typography>
                </Box>
            </Box>

            {/* Score de qualité */}
            {score > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('projection.quality.reliability_score', 'Score de Fiabilité')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {(score * 100).toFixed(0)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={score * 100}
                        color={score > 0.7 ? 'success' : score > 0.4 ? 'warning' : 'error'}
                        sx={{ height: 6, borderRadius: 1 }}
                    />
                </Box>
            )}

            {/* Informations techniques */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {t('projection.quality.technical_details', 'Détails Techniques')}
                </Typography>
                <Typography variant="body2">
                    {t('projection.quality.data_points', '{{count}} points de données').replace('{{count}}', metadata.data_points || 0)} •
                    {t('projection.quality.confidence', 'Confiance: {{level}}').replace('{{level}}', confidence)}
                </Typography>
                {metadata.method_used && (
                    <Typography variant="caption" color="text.secondary">
                        {methodConfig.description}
                    </Typography>
                )}
            </Box>

            {/* Avertissements */}
            {warnings.length > 0 && (
                <Alert severity="warning" size="small" sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        {t('projection.quality.warnings_title', 'Points d\'attention:')}
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {warnings.slice(0, 3).map((warning, index) => (
                            <li key={index}>
                                <Typography variant="body2">
                                    {warning}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                </Alert>
            )}

            {/* Recommandations */}
            {metadata.recommendations && metadata.recommendations.length > 0 && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'info.50', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                        {t('projection.quality.recommendations_title', '💡 Recommandations:')}
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {metadata.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index}>
                                <Typography variant="body2" color="info.dark">
                                    {rec}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                </Box>
            )}

            {/* Debug info en développement */}
            {process.env.NODE_ENV === 'development' && metadata.evaluation_timestamp && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {t('projection.quality.debug_info', 'Debug: {{timestamp}}').replace('{{timestamp}}', new Date(metadata.evaluation_timestamp).toLocaleString(language === 'en' ? 'en-US' : 'fr-FR'))}
                        {metadata.validator_available ?
                            ` • ${t('projection.quality.validator_ok', 'Validator OK')}` :
                            ` • ${t('projection.quality.validator_missing', 'Validator manquant')}`
                        }
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default ProjectionQualityIndicator;
