// frontend/src/shared/components/cards/KPICard.jsx
import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatUtils';

/**
 * Carte KPI réutilisable - Mutualise les KPI cards de dashboard/matrix/optimization
 * 
 * @param {string} title - Titre du KPI
 * @param {number|string} value - Valeur principale
 * @param {React.ReactNode} icon - Icône Material-UI
 * @param {string} color - Couleur principale ('primary' | 'success' | 'error' | 'warning' | 'info')
 * @param {object} trend - {value: number, direction: 'up' | 'down'}
 * @param {boolean} loading - État de chargement
 * @param {string} subtitle - Sous-titre optionnel
 * @param {function} onClick - Handler de clic optionnel
 * @param {string} format - Format de la valeur ('currency' | 'number' | 'percentage' | 'text')
 * @param {number} decimals - Nombre de décimales (pour currency/number)
 * @param {boolean} compact - Mode compact (petite taille)
 */
export default function KPICard({
    title,
    value,
    icon,
    color = 'primary',
    trend = null,
    loading = false,
    subtitle = null,
    onClick = null,
    format = 'number',
    decimals = 0,
    compact = false
}) {
    // Formatage de la valeur selon le type
    const formatValue = () => {
        if (value == null || value === '') return 'N/A';
        
        switch (format) {
            case 'currency':
                return formatCurrency(value);
            case 'percentage':
                return formatPercentage(value, decimals);
            case 'number':
                return formatNumber(value, decimals);
            case 'text':
            default:
                return value;
        }
    };

    // Couleurs selon le theme MUI
    const getColorConfig = () => {
        const configs = {
            primary: { bg: 'primary.main', light: 'primary.light', dark: 'primary.dark' },
            success: { bg: 'success.main', light: 'success.light', dark: 'success.dark' },
            error: { bg: 'error.main', light: 'error.light', dark: 'error.dark' },
            warning: { bg: 'warning.main', light: 'warning.light', dark: 'warning.dark' },
            info: { bg: 'info.main', light: 'info.light', dark: 'info.dark' },
        };
        return configs[color] || configs.primary;
    };

    const colorConfig = getColorConfig();

    // Animation framer-motion
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.3, ease: 'easeOut' }
        },
        hover: {
            y: -4,
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            transition: { duration: 0.2 }
        }
    };

    // Rendu du trend (croissance/baisse)
    const renderTrend = () => {
        if (!trend || trend.value == null) return null;

        const isPositive = trend.direction === 'up';
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        const trendColor = isPositive ? 'success.main' : 'error.main';

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <TrendIcon sx={{ fontSize: 16, color: trendColor, mr: 0.5 }} />
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: trendColor,
                        fontWeight: 600 
                    }}
                >
                    {formatPercentage(Math.abs(trend.value), 1)}
                </Typography>
            </Box>
        );
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={onClick ? "hover" : undefined}
        >
            <Card
                onClick={onClick}
                sx={{
                    height: '100%',
                    cursor: onClick ? 'pointer' : 'default',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': onClick ? {
                        '& .icon-background': {
                            transform: 'scale(1.1) rotate(5deg)',
                        }
                    } : {}
                }}
            >
                {/* Background décoratif */}
                <Box
                    className="icon-background"
                    sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
                        transition: 'transform 0.3s ease',
                    }}
                />

                <CardContent sx={{ position: 'relative', p: compact ? 2 : 3 }}>
                    {loading ? (
                        <>
                            <Skeleton width={60} height={60} variant="circular" sx={{ mb: 2 }} />
                            <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                            <Skeleton width="100%" height={40} />
                        </>
                    ) : (
                        <>
                            {/* Header avec icône */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: compact ? 40 : 48,
                                        height: compact ? 40 : 48,
                                        borderRadius: 2,
                                        bgcolor: (theme) => alpha(theme.palette[color].main, 0.15),
                                        color: colorConfig.bg,
                                        mr: 2,
                                    }}
                                >
                                    {icon}
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant={compact ? "body2" : "subtitle2"}
                                        color="text.secondary"
                                        sx={{ 
                                            fontWeight: 500,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {title}
                                    </Typography>
                                    {subtitle && (
                                        <Typography 
                                            variant="caption" 
                                            color="text.disabled"
                                            sx={{ display: 'block', mt: 0.5 }}
                                        >
                                            {subtitle}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Valeur principale */}
                            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                                <Typography
                                    variant={compact ? "h5" : "h4"}
                                    sx={{
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {formatValue()}
                                </Typography>

                                {renderTrend()}
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}