// ===================================
// 📁 frontend/src/features/settings/components/PerformanceSection.jsx - FONCTIONNEL
// ===================================

import React from 'react';
import {
    Typography, Card, CardContent, Grid, TextField,
    FormControlLabel, Switch, Box, Slider, Alert, Stack
} from '@mui/material';
import { BugReport } from '@mui/icons-material';
import { useAppState } from '@/store/contexts/AppStateContext';
import { toast } from 'react-toastify';

const PerformanceSection = ({ onSettingChange }) => {
    const { settings, updateSetting } = useAppState();

    // Handler pour les changements qui agissent VRAIMENT
    const handleChange = (key, value) => {
        // Mettre à jour le store unifié (effet immédiat)
        updateSetting(key, value);

        // Mettre à jour aussi les settings locaux
        if (onSettingChange) {
            onSettingChange(key, value);
        }

        // Notifications et effets spécifiques
        switch (key) {
            case 'pageSize':
                toast.info(`📄 Taille de page: ${value} éléments`);
                break;
            case 'cacheTimeout':
                toast.info(`⏱️ Cache: ${Math.floor(value / 60)} minutes`);
                break;
            case 'enableDebugMode':
                if (value) {
                    toast.warning('🔧 Mode debug activé - Voir la console');
                } else {
                    toast.info('🔧 Mode debug désactivé');
                }
                break;
        }
    };

    return (
        <Stack spacing={3}>
            <Typography variant="h6">⚡ Performance & Réactivité</Typography>

            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography gutterBottom sx={{ fontWeight: 600 }}>
                                Taille de page: {settings.pageSize} éléments
                            </Typography>
                            <Slider
                                value={settings.pageSize}
                                onChange={(e, value) => handleChange('pageSize', value)}
                                min={10}
                                max={200}
                                step={10}
                                marks={[
                                    { value: 25, label: '25' },
                                    { value: 50, label: '50' },
                                    { value: 100, label: '100' },
                                    { value: 200, label: '200' }
                                ]}
                                valueLabelDisplay="auto"
                            />
                            <Typography variant="caption" color="text.secondary">
                                Plus de données = chargement plus lent
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography gutterBottom sx={{ fontWeight: 600 }}>
                                Cache: {Math.floor(settings.cacheTimeout / 60)} minutes
                            </Typography>
                            <Slider
                                value={settings.cacheTimeout}
                                onChange={(e, value) => handleChange('cacheTimeout', value)}
                                min={30}
                                max={3600}
                                step={30}
                                marks={[
                                    { value: 300, label: '5min' },
                                    { value: 1800, label: '30min' },
                                    { value: 3600, label: '1h' }
                                ]}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${Math.floor(value / 60)}min`}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Cache plus long = moins de requêtes serveur
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Timeout requête (secondes)"
                                value={settings.requestTimeout}
                                onChange={(e) => handleChange('requestTimeout', parseInt(e.target.value))}
                                inputProps={{ min: 5, max: 120 }}
                                helperText="Temps d'attente maximum pour les requêtes"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Tentatives de retry"
                                value={settings.retryAttempts}
                                onChange={(e) => handleChange('retryAttempts', parseInt(e.target.value))}
                                inputProps={{ min: 0, max: 10 }}
                                helperText="Nombre de tentatives en cas d'échec"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableDebugMode}
                                        onChange={(e) => handleChange('enableDebugMode', e.target.checked)}
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography color={settings.enableDebugMode ? 'warning.main' : 'inherit'}>
                                            Mode debug (logs détaillés)
                                        </Typography>
                                        <BugReport fontSize="small" color={settings.enableDebugMode ? 'warning' : 'action'} />
                                    </Box>
                                }
                            />
                            {settings.enableDebugMode && (
                                <Alert severity="warning" sx={{ mt: 1 }}>
                                    Le mode debug peut ralentir l'application et exposer des informations sensibles dans la console.
                                    <br />
                                    <strong>Variables disponibles:</strong> window.cbmDebug, window.cbmSettings
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Indicateur de performance en temps réel */}
            <Card sx={{ bgcolor: 'info.50' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        📊 Impact Performance Estimé
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">Vitesse chargement</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {settings.pageSize <= 50 ? '🟢 Rapide' :
                                    settings.pageSize <= 100 ? '🟡 Moyen' : '🔴 Lent'}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">Utilisation cache</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {settings.cacheTimeout >= 600 ? '🟢 Optimale' : '🟡 Limitée'}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">Consommation réseau</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {settings.retryAttempts <= 3 ? '🟢 Normale' : '🟡 Élevée'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Test du debug mode */}
            {settings.enableDebugMode && (
                <Card sx={{ bgcolor: 'warning.50' }}>
                    <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'warning.main' }}>
                            🔧 Mode Debug Actif
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Ouvrez la console pour voir les logs détaillés.
                        </Typography>
                        <Box sx={{ p: 1, bgcolor: 'grey.900', borderRadius: 1, fontFamily: 'monospace', color: 'white' }}>
                            <Typography variant="caption">
                                window.cbmDebug = {settings.enableDebugMode.toString()}<br />
                                window.cbmLogLevel = "{settings.logLevel}"<br />
                                window.cbmSettings = {JSON.stringify(settings, null, 2).slice(0, 100)}...
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Stack>
    );
};

export default PerformanceSection;