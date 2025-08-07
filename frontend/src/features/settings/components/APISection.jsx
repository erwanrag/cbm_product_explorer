// ===================================
// 📁 frontend/src/features/settings/components/APISection.jsx - FONCTIONNEL
// ===================================

import React from 'react';
import {
    Typography, Card, CardContent, Grid, TextField,
    FormControl, InputLabel, Select, MenuItem, FormControlLabel,
    Switch, Box, Stack, Button
} from '@mui/material';
import { Storage, DeleteSweep, Security } from '@mui/icons-material';
import { useAppState } from '@/store/contexts/AppStateContext';
import { toast } from 'react-toastify';

const APISection = ({ onSettingChange }) => {
    const { settings, updateSetting, cache, clearCache } = useAppState();

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
            case 'apiTimeout':
                toast.info(`⏱️ Timeout API: ${value / 1000}s`);
                break;
            case 'sessionTimeout':
                toast.info(`🔐 Session: ${value} minutes`);
                break;
            case 'enableCache':
                if (value) {
                    toast.success('💾 Cache activé');
                } else {
                    toast.warning('🗑️ Cache désactivé et vidé');
                }
                break;
            case 'logLevel':
                toast.info(`📊 Logs: ${value}`);
                break;
        }
    };

    const handleClearCache = () => {
        clearCache();
        toast.success('🗑️ Cache vidé avec succès');
    };

    return (
        <Stack spacing={3}>
            <Typography variant="h6">🔒 API & Sécurité</Typography>

            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Timeout API (millisecondes)"
                                value={settings.apiTimeout}
                                onChange={(e) => handleChange('apiTimeout', parseInt(e.target.value))}
                                inputProps={{ min: 5000, max: 120000, step: 1000 }}
                                helperText={`${settings.apiTimeout / 1000} secondes`}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Timeout de session (minutes)"
                                value={settings.sessionTimeout}
                                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                inputProps={{ min: 5, max: 480 }}
                                helperText="Déconnexion automatique après inactivité"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableCache}
                                        onChange={(e) => handleChange('enableCache', e.target.checked)}
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>Activer le cache des données</Typography>
                                        <Storage fontSize="small" color="action" />
                                    </Box>
                                }
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                                Améliore les performances mais peut afficher des données moins récentes
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Niveau de logging</InputLabel>
                                <Select
                                    value={settings.logLevel}
                                    onChange={(e) => handleChange('logLevel', e.target.value)}
                                >
                                    <MenuItem value="error">🔴 Erreurs seulement</MenuItem>
                                    <MenuItem value="warn">🟡 Avertissements</MenuItem>
                                    <MenuItem value="info">🔵 Informations</MenuItem>
                                    <MenuItem value="debug">🟣 Debug (tout)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Gestion du cache */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2">
                                    Cache: {cache.size} entrées
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<DeleteSweep />}
                                    onClick={handleClearCache}
                                    disabled={!settings.enableCache}
                                >
                                    Vider le cache
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Status de sécurité */}
            <Card sx={{ bgcolor: 'success.50' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.main' }}>
                        🛡️ Status de sécurité
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Connexion HTTPS</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {window.location.protocol === 'https:' ? '🟢 Sécurisée' : '🟡 Non sécurisée'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Cache activé</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {settings.enableCache ? '🟢 Actif' : '🔴 Désactivé'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Timeout API</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {settings.apiTimeout >= 30000 ? '🟢 Correct' : '🟡 Court'} ({settings.apiTimeout / 1000}s)
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Logging</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {settings.logLevel === 'error' ? '🟢 Minimal' :
                                    settings.logLevel === 'debug' ? '🟡 Complet' : '🔵 Standard'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Test de sécurité */}
            <Card sx={{ bgcolor: 'info.50' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'info.main' }}>
                        🧪 Test des paramètres de sécurité
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Security />}
                                onClick={() => {
                                    //console.log('🔐 Test timeout API:', settings.apiTimeout);
                                    //toast.info(`🔐 Test timeout: ${settings.apiTimeout / 1000}s`);
                                }}
                            >
                                Tester Timeout API
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Storage />}
                                onClick={() => {
                                    if (settings.enableCache) {
                                        console.log('💾 Cache actif, taille:', cache.size);
                                        toast.success(`💾 Cache actif: ${cache.size} entrées`);
                                    } else {
                                        toast.warning('🚫 Cache désactivé');
                                    }
                                }}
                            >
                                Tester Cache
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Stack>
    );
};

export default APISection;