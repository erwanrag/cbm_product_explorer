// ===================================
// 📁 frontend/src/features/optimization/components/indicators/ProjectionQualityIndicator.jsx
// ===================================

import React from 'react';
import {
    Chip, Tooltip, Box, Typography, LinearProgress, Alert
} from '@mui/material';
import {
    CheckCircle, Warning, Cancel, Info, TrendingUp, HelpOutline
} from '@mui/icons-material';

const ProjectionQualityIndicator = ({ projection, compact = false }) => {
    // Sécurité : gestion des cas où projection ou metadata sont undefined
    if (!projection || !projection.metadata) {
        return compact ? (
            <Chip size="small" label="N/A" color="default" variant="outlined" />
        ) : null;
    }

    const metadata = projection.metadata;
    const method = metadata.method || 'unknown';
    const modelQuality = metadata.model_quality || 'unknown';
    const score = metadata.quality_score || 0;
    const confidence = metadata.confidence_level || 'unknown';
    const warnings = metadata.warnings || [];
    const summary = metadata.summary || 'Projection disponible';

    // Configuration des indicateurs de qualité selon le backend
    const getQualityConfig = (quality) => {
        switch (quality) {
            case 'excellent':
                return {
                    color: 'success',
                    icon: <CheckCircle fontSize="small" />,
                    label: 'Excellente',
                    description: 'Modèle très fiable avec historique riche'
                };
            case 'good':
                return {
                    color: 'primary',
                    icon: <TrendingUp fontSize="small" />,
                    label: 'Bonne',
                    description: 'Modèle fiable avec données suffisantes'
                };
            case 'fair':
                return {
                    color: 'warning',
                    icon: <Info fontSize="small" />,
                    label: 'Correcte',
                    description: 'Modèle basique, données limitées'
                };
            case 'basic':
                return {
                    color: 'default',
                    icon: <Info fontSize="small" />,
                    label: 'Basique',
                    description: 'Projection simple sans modélisation avancée'
                };
            case 'poor':
            case 'none':
                return {
                    color: 'error',
                    icon: <Warning fontSize="small" />,
                    label: 'Faible',
                    description: 'Modèle peu fiable, données insuffisantes'
                };
            default:
                return {
                    color: 'default',
                    icon: <HelpOutline fontSize="small" />,
                    label: 'Inconnue',
                    description: 'Qualité de projection indéterminée'
                };
        }
    };

    // Configuration des méthodes de projection selon le backend
    const getMethodConfig = (method) => {
        switch (method) {
            case 'linear_regression':
                return {
                    label: 'Régression Linéaire',
                    description: 'Projection basée sur une tendance linéaire'
                };
            case 'seasonal_decomposition':
                return {
                    label: 'Décomposition Saisonnière',
                    description: 'Projection tenant compte de la saisonnalité'
                };
            case 'moving_average':
                return {
                    label: 'Moyenne Mobile',
                    description: 'Projection basée sur une moyenne mobile'
                };
            case 'exponential_smoothing':
                return {
                    label: 'Lissage Exponentiel',
                    description: 'Projection avec lissage exponentiel'
                };
            case 'linear_fallback':
                return {
                    label: 'Linéaire Simple',
                    description: 'Projection linéaire de base (fallback)'
                };
            case 'empty_forced':
                return {
                    label: 'Ventes Nulles',
                    description: 'Pas de ventes détectées'
                };
            case 'constant_fallback':
                return {
                    label: 'Constante',
                    description: 'Projection constante basée sur 1 point'
                };
            default:
                return {
                    label: 'Méthode Inconnue',
                    description: 'Méthode de projection non spécifiée'
                };
        }
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
                        Qualité: {qualityConfig.label} • {methodConfig.label}
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
                Qualité de la Projection
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
                            Score de Fiabilité
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
                    Détails Techniques
                </Typography>
                <Typography variant="body2">
                    {metadata.data_points || 0} points de données • Confiance: {confidence}
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
                        Points d'attention:
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
                        💡 Recommandations:
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
                        Debug: {new Date(metadata.evaluation_timestamp).toLocaleString('fr-FR')}
                        {metadata.validator_available ? ' • Validator OK' : ' • Validator manquant'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default ProjectionQualityIndicator;