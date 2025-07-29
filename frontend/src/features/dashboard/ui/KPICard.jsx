// frontend/src/features/dashboard/components/ui/KPICard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import {
    Inventory,
    Euro,
    TrendingUp,
    TrendingDown,
    Warning,
    ShowChart,
    AccountBalanceWallet,
    Inventory2
} from '@mui/icons-material';

/**
 * Carte KPI réutilisable - Composant atomique
 */
const ICONS = {
    inventory: Inventory,
    euro: Euro,
    trending_up: ShowChart,
    inventory_2: Inventory2,
    account_balance_wallet: AccountBalanceWallet,
    warning: Warning
};

const COLOR_MAP = {
    primary: '#1976d2',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    info: '#0288d1',
    secondary: '#7b1fa2'
};

export default function KPICard({
    id,
    title,
    value,
    format,
    icon,
    color,
    trend,
    clickable,
    onClick
}) {
    const IconComponent = ICONS[icon] || Inventory;
    const colorValue = COLOR_MAP[color] || COLOR_MAP.primary;

    const formatValue = (val, fmt) => {
        switch (fmt) {
            case 'currency':
                return new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(val || 0);
            case 'percentage':
                return `${(val || 0).toFixed(1)}%`;
            case 'number':
                return (val || 0).toLocaleString('fr-FR');
            default:
                return val || 0;
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: clickable ? 'translateY(-4px)' : 'none',
                    boxShadow: clickable ? 6 : 1
                },
                borderLeft: `4px solid ${colorValue}`
            }}
            onClick={onClick}
        >
            <CardContent>
                {/* Header avec icône et trend */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            bgcolor: `${colorValue}20`,
                            color: colorValue,
                            p: 1,
                            borderRadius: 2,
                            mr: 2
                        }}
                    >
                        <IconComponent fontSize="medium" />
                    </Box>
                    {trend !== null && trend !== undefined && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: trend >= 0 ? '#2e7d32' : '#d32f2f'
                        }}>
                            {trend >= 0 ? (
                                <TrendingUp fontSize="small" />
                            ) : (
                                <TrendingDown fontSize="small" />
                            )}
                            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>
                                {Math.abs(trend).toFixed(1)}%
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Valeur principale */}
                <Typography variant="h4" sx={{
                    fontWeight: 700,
                    color: colorValue,
                    mb: 0.5,
                    lineHeight: 1.2
                }}>
                    {formatValue(value, format)}
                </Typography>

                {/* Titre */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {title}
                </Typography>

                {/* Alerte spéciale pour stock faible */}
                {id === 'lowStock' && value > 0 && (
                    <Chip
                        label="Attention requise"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ mt: 1 }}
                    />
                )}

                {/* Indicateur de performance */}
                {id === 'margin' && (
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: '#f0f0f0',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                height: '100%',
                                width: `${Math.min((value || 0) / 30 * 100, 100)}%`,
                                bgcolor: colorValue,
                                transition: 'width 0.5s ease'
                            }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Objectif: 20%
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
