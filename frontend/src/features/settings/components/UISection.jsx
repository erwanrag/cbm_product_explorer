// ===================================
// 📁 frontend/src/features/settings/components/UISection.jsx - CORRIGÉ
// ===================================

import React, { useState } from 'react';
import {
    Typography, Card, CardContent, Grid, FormControl,
    InputLabel, Select, MenuItem, FormControlLabel, Switch,
    Box, Button, Stack, Chip, Tooltip, Alert
} from '@mui/material';
import {
    LightMode, DarkMode, Computer, Visibility, VisibilityOff, InfoOutlined
} from '@mui/icons-material';
import { useAppState } from '@/store/contexts/AppStateContext';
import { toast } from 'react-toastify';

const UISection = ({ onSettingChange }) => {
    const [previewMode, setPreviewMode] = useState(false);
    const { settings, isDarkMode, updateSetting } = useAppState();

    const handlePreviewToggle = () => {
        setPreviewMode(!previewMode);
    };

    // Handler pour les changements qui agissent VRAIMENT
    const handleChange = (key, value) => {
        // Mettre à jour le store unifié (effet immédiat)
        updateSetting(key, value);

        // Mettre à jour aussi les settings locaux pour la page de paramètres
        if (onSettingChange) {
            onSettingChange(key, value);
        }

        // Notification
        switch (key) {
            case 'theme':
                toast.success(`🎨 Thème changé: ${value}`);
                break;
            case 'language':
                toast.success(`🌍 Langue changée: ${value === 'fr' ? 'Français' : 'English'}`);
                break;
            case 'animations':
                toast.info(`✨ Animations ${value ? 'activées' : 'désactivées'}`);
                break;
            case 'compactMode':
                toast.info(`📐 Mode ${value ? 'compact' : 'normal'} activé`);
                break;
        }
    };

    return (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">🎨 Interface Utilisateur</Typography>
                <Button
                    size="small"
                    startIcon={previewMode ? <VisibilityOff /> : <Visibility />}
                    onClick={handlePreviewToggle}
                    variant={previewMode ? 'contained' : 'outlined'}
                >
                    Aperçu temps réel
                </Button>
            </Box>

            {/* Alert pour expliquer le fonctionnement */}
            <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                    <strong>🎨 Thème en temps réel :</strong> Les changements s'appliquent immédiatement !
                    Mode actuel : <strong>{isDarkMode ? 'Sombre' : 'Clair'}</strong>
                </Typography>
            </Alert>

            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Thème</InputLabel>
                                <Select
                                    value={settings.theme}
                                    onChange={(e) => handleChange('theme', e.target.value)}
                                >
                                    <MenuItem value="light">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LightMode fontSize="small" />
                                            Clair
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="dark">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DarkMode fontSize="small" />
                                            Sombre
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="auto">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Computer fontSize="small" />
                                            Automatique
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Langue</InputLabel>
                                <Select
                                    value={settings.language}
                                    onChange={(e) => handleChange('language', e.target.value)}
                                >
                                    <MenuItem value="fr">🇫🇷 Français</MenuItem>
                                    <MenuItem value="en">🇺🇸 English</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.animations}
                                        onChange={(e) => handleChange('animations', e.target.checked)}
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>Activer les animations</Typography>
                                        <Tooltip title="Contrôle les transitions et animations Material-UI">
                                            <InfoOutlined fontSize="small" color="action" />
                                        </Tooltip>
                                    </Box>
                                }
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.compactMode}
                                        onChange={(e) => handleChange('compactMode', e.target.checked)}
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>Mode compact</Typography>
                                        <Tooltip title="Réduit l'espacement des composants Material-UI">
                                            <InfoOutlined fontSize="small" color="action" />
                                        </Tooltip>
                                    </Box>
                                }
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showTooltips}
                                        onChange={(e) => handleChange('showTooltips', e.target.checked)}
                                    />
                                }
                                label="Afficher les infobulles d'aide"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.autoSave}
                                        onChange={(e) => handleChange('autoSave', e.target.checked)}
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>Sauvegarde automatique</Typography>
                                        <Chip label="Recommandé" color="success" size="small" />
                                    </Box>
                                }
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Aperçu en temps réel */}
            {previewMode && (
                <Card sx={{
                    border: '2px solid',
                    borderColor: 'primary.main',
                    bgcolor: isDarkMode ? 'grey.900' : 'grey.50'
                }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            👀 Aperçu des paramètres actuels
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                                label={`Thème: ${settings.theme} (${isDarkMode ? 'Sombre' : 'Clair'})`}
                                variant="outlined"
                                color="primary"
                            />
                            <Chip
                                label={`Langue: ${settings.language === 'fr' ? 'Français' : 'English'}`}
                                variant="outlined"
                                color="secondary"
                            />
                            <Chip
                                label={`Animations: ${settings.animations ? 'ON' : 'OFF'}`}
                                color={settings.animations ? 'success' : 'default'}
                            />
                            <Chip
                                label={`Mode compact: ${settings.compactMode ? 'ON' : 'OFF'}`}
                                color={settings.compactMode ? 'warning' : 'default'}
                            />
                        </Stack>

                        {/* Exemple de composants pour tester le thème */}
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                🧪 <strong>Test des couleurs:</strong>
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Button size="small" variant="contained">Primary</Button>
                                <Button size="small" variant="outlined" color="secondary">Secondary</Button>
                                <Button size="small" variant="text" color="success">Success</Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Bouton de test pour vérifier que ça marche */}
            <Card sx={{ bgcolor: 'warning.50' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'warning.main' }}>
                        🧪 Test du thème
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            onClick={() => handleChange('theme', 'dark')}
                            disabled={settings.theme === 'dark'}
                        >
                            Forcer Sombre
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => handleChange('theme', 'light')}
                            disabled={settings.theme === 'light'}
                        >
                            Forcer Clair
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => handleChange('theme', 'auto')}
                            disabled={settings.theme === 'auto'}
                        >
                            Auto
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
};

export default UISection;