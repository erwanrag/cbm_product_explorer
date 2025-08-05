// ===================================
// 📁 frontend/src/features/settings/components/SystemSection.jsx
// ===================================

import React from 'react';
import {
    Typography, Card, CardContent, Grid, Chip, Stack
} from '@mui/material';
import config from '@/config/environment';

const SystemSection = () => {
    const getNavigatorInfo = () => {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Autre';
    };

    const getMemoryInfo = () => {
        if ('memory' in performance) {
            const memory = performance.memory;
            return {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    };

    const memoryInfo = getMemoryInfo();

    return (
        <Stack spacing={3}>
            <Typography variant="h6">🖥️ Informations Système</Typography>

            <Card>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Application
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Version de l'application
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                CBM GRC Matcher v1.0.0
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Environnement
                            </Typography>
                            <Chip
                                label={config.env}
                                color={config.isDevelopment ? 'warning' : 'success'}
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                URL API
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                {config.apiBaseUrl}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Build Date
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {new Date().toLocaleDateString('fr-FR')}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Navigateur & Système
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Navigateur
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {getNavigatorInfo()}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Résolution d'écran
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {window.screen.width} × {window.screen.height}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Fuseau horaire
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Langue du navigateur
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {navigator.language}
                            </Typography>
                        </Grid>

                        {memoryInfo && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Mémoire utilisée
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {memoryInfo.used} MB / {memoryInfo.total} MB
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Limite mémoire
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {memoryInfo.limit} MB
                                    </Typography>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Features Actives
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {Object.entries(config.features)
                            .filter(([, enabled]) => enabled)
                            .map(([name]) => (
                                <Chip
                                    key={name}
                                    label={name.replace(/([A-Z])/g, ' $1').trim()}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                />
                            ))}
                    </Stack>
                </CardContent>
            </Card>

            {/* Statistiques de performance */}
            <Card sx={{ bgcolor: 'info.50' }}>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'info.main' }}>
                        📊 Performance
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Connection</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {'connection' in navigator ?
                                    navigator.connection?.effectiveType || 'Inconnue' :
                                    'Non supportée'
                                }
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Cores CPU</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {navigator.hardwareConcurrency || 'Inconnu'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Device Memory</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {'deviceMemory' in navigator ?
                                    `${navigator.deviceMemory} GB` :
                                    'Non supporté'
                                }
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Online</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {navigator.onLine ? '🟢 En ligne' : '🔴 Hors ligne'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Stack>
    );
};

export default SystemSection;