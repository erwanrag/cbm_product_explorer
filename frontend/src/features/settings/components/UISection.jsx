import React from 'react';
import {
    Typography, Card, CardContent, Grid, FormControl,
    InputLabel, Select, MenuItem, FormControlLabel, Switch,
    Box, Stack
} from '@mui/material';
import { DarkMode, LightMode, AutoMode } from '@mui/icons-material';
import { useTranslation } from '@/store/contexts/LanguageContext';

const UISection = ({ settings, onSettingChange }) => {
    const { t } = useTranslation();

    const handleChange = (key, value) => {
        onSettingChange(key, value);
    };

    return (
        <Stack spacing={3}>
            <Typography variant="h6">{t('settings.sections.ui', '👁️ Interface Utilisateur')}</Typography>

            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{t('settings.ui.theme', 'Thème')}</InputLabel>
                                <Select
                                    value={settings.theme}
                                    onChange={(e) => handleChange('theme', e.target.value)}
                                >
                                    <MenuItem value="light">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LightMode fontSize="small" />
                                            {t('settings.ui.theme_light', 'Clair')}
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="dark">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DarkMode fontSize="small" />
                                            {t('settings.ui.theme_dark', 'Sombre')}
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="auto">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AutoMode fontSize="small" />
                                            {t('settings.ui.theme_auto', 'Automatique')}
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>{t('settings.ui.language', 'Langue')}</InputLabel>
                                <Select
                                    value={settings.language}
                                    onChange={(e) => handleChange('language', e.target.value)}
                                >
                                    <MenuItem value="fr">
                                        🇫🇷 {t('settings.ui.language_french', 'Français')}
                                    </MenuItem>
                                    <MenuItem value="en">
                                        🇺🇸 {t('settings.ui.language_english', 'English')}
                                    </MenuItem>
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
                                        <Typography>
                                            {t('settings.ui.animations_enabled', 'Activer les animations')}
                                        </Typography>
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
                                        <Typography>
                                            {t('settings.ui.compact_mode_enabled', 'Mode compact')}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Stack>
    );
};

export default UISection;