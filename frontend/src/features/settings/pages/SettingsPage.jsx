// ===================================
// 📁 frontend/src/features/settings/pages/SettingsPage.jsx - COMPLET
// ===================================

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Card, CardContent,
    Switch, FormControlLabel, TextField, Button, Divider,
    Alert, Chip, Stack, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, List, ListItem, ListItemText,
    ListItemIcon, Accordion, AccordionSummary, AccordionDetails,
    FormControl, InputLabel, Select, MenuItem, Slider,
    Tooltip, Badge, Avatar
} from '@mui/material';
import {
    Settings as SettingsIcon, Save, Refresh, Download, Upload,
    Notifications, Security, Speed, Palette, Language,
    Storage, Api, BugReport, Info, ExpandMore, Visibility,
    VisibilityOff, CheckCircle, Warning, Error, InfoOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAppState } from '@/store/contexts/AppStateContext';
import config from '@/config/environment';

const SettingsPage = () => {
    // États locaux
    const [settings, setSettings] = useState({
        // Interface utilisateur
        theme: 'light',
        language: 'fr',
        animations: true,
        compactMode: false,
        showTooltips: true,
        autoSave: true,

        // Performance
        pageSize: 50,
        cacheTimeout: 300,
        requestTimeout: 30,
        retryAttempts: 3,
        enableDebugMode: false,

        // Notifications
        emailNotifications: true,
        pushNotifications: false,
        soundEnabled: true,
        notificationFrequency: 'immediate',

        // Affichage
        showKPICards: true,
        showCharts: true,
        defaultView: 'table',
        exportFormat: 'excel',
        dateFormat: 'dd/MM/yyyy',

        // API & Sécurité
        apiTimeout: 30000,
        enableCache: true,
        logLevel: 'info',
        sessionTimeout: 60,
    });

    const [activeSection, setActiveSection] = useState('ui');
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    const { updateConfig } = useAppState();

    // Chargement des paramètres depuis le localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('cbm-settings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Erreur chargement paramètres:', error);
                toast.error('Erreur lors du chargement des paramètres');
            }
        }
    }, []);

    // Handlers
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setUnsavedChanges(true);
    };

    const handleSave = () => {
        try {
            localStorage.setItem('cbm-settings', JSON.stringify(settings));
            updateConfig(settings);
            setUnsavedChanges(false);
            toast.success('Paramètres sauvegardés avec succès');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    const handleReset = () => {
        if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
            localStorage.removeItem('cbm-settings');
            window.location.reload();
        }
    };

    const handleExportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cbm-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setShowExportDialog(false);
        toast.success('Paramètres exportés');
    };

    const handleImportSettings = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    setSettings(importedSettings);
                    setUnsavedChanges(true);
                    toast.success('Paramètres importés');
                    setShowImportDialog(false);
                } catch (error) {
                    toast.error('Fichier de paramètres invalide');
                }
            };
            reader.readAsText(file);
        }
    };

    const sections = [
        { id: 'ui', label: 'Interface Utilisateur', icon: <Palette /> },
        { id: 'performance', label: 'Performance', icon: <Speed /> },
        { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
        { id: 'display', label: 'Affichage', icon: <Visibility /> },
        { id: 'api', label: 'API & Sécurité', icon: <Security /> },
        { id: 'system', label: 'Système', icon: <InfoOutlined /> },
    ];

    const renderSection = () => {
        switch (activeSection) {
            case 'ui':
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6">🎨 Interface Utilisateur</Typography>

                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Thème</InputLabel>
                                            <Select
                                                value={settings.theme}
                                                onChange={(e) => handleSettingChange('theme', e.target.value)}
                                            >
                                                <MenuItem value="light">Clair</MenuItem>
                                                <MenuItem value="dark">Sombre</MenuItem>
                                                <MenuItem value="auto">Automatique</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Langue</InputLabel>
                                            <Select
                                                value={settings.language}
                                                onChange={(e) => handleSettingChange('language', e.target.value)}
                                            >
                                                <MenuItem value="fr">Français</MenuItem>
                                                <MenuItem value="en">English</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.animations}
                                                    onChange={(e) => handleSettingChange('animations', e.target.checked)}
                                                />
                                            }
                                            label="Activer les animations"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.compactMode}
                                                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                                                />
                                            }
                                            label="Mode compact"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.showTooltips}
                                                    onChange={(e) => handleSettingChange('showTooltips', e.target.checked)}
                                                />
                                            }
                                            label="Afficher les infobulles"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                );

            case 'performance':
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6">⚡ Performance</Typography>

                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography gutterBottom>
                                            Taille de page par défaut: {settings.pageSize}
                                        </Typography>
                                        <Slider
                                            value={settings.pageSize}
                                            onChange={(e, value) => handleSettingChange('pageSize', value)}
                                            min={10}
                                            max={200}
                                            step={10}
                                            marks
                                            valueLabelDisplay="auto"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography gutterBottom>
                                            Timeout cache (minutes): {settings.cacheTimeout}
                                        </Typography>
                                        <Slider
                                            value={settings.cacheTimeout}
                                            onChange={(e, value) => handleSettingChange('cacheTimeout', value)}
                                            min={30}
                                            max={3600}
                                            step={30}
                                            marks
                                            valueLabelDisplay="auto"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Timeout requête (secondes)"
                                            value={settings.requestTimeout}
                                            onChange={(e) => handleSettingChange('requestTimeout', parseInt(e.target.value))}
                                            inputProps={{ min: 5, max: 120 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Tentatives de retry"
                                            value={settings.retryAttempts}
                                            onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
                                            inputProps={{ min: 0, max: 10 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.enableDebugMode}
                                                    onChange={(e) => handleSettingChange('enableDebugMode', e.target.checked)}
                                                />
                                            }
                                            label="Mode debug (logs détaillés)"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                );

            case 'notifications':
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6">🔔 Notifications</Typography>

                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.emailNotifications}
                                                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                                />
                                            }
                                            label="Notifications par email"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.pushNotifications}
                                                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                                                />
                                            }
                                            label="Notifications push"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.soundEnabled}
                                                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                                                />
                                            }
                                            label="Sons de notification"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Fréquence</InputLabel>
                                            <Select
                                                value={settings.notificationFrequency}
                                                onChange={(e) => handleSettingChange('notificationFrequency', e.target.value)}
                                            >
                                                <MenuItem value="immediate">Immédiate</MenuItem>
                                                <MenuItem value="hourly">Toutes les heures</MenuItem>
                                                <MenuItem value="daily">Quotidienne</MenuItem>
                                                <MenuItem value="weekly">Hebdomadaire</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                );

            case 'display':
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6">👁️ Affichage</Typography>

                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.showKPICards}
                                                    onChange={(e) => handleSettingChange('showKPICards', e.target.checked)}
                                                />
                                            }
                                            label="Afficher les cartes KPI"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.showCharts}
                                                    onChange={(e) => handleSettingChange('showCharts', e.target.checked)}
                                                />
                                            }
                                            label="Afficher les graphiques"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Vue par défaut</InputLabel>
                                            <Select
                                                value={settings.defaultView}
                                                onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                                            >
                                                <MenuItem value="table">Tableau</MenuItem>
                                                <MenuItem value="cards">Cartes</MenuItem>
                                                <MenuItem value="charts">Graphiques</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Format d'export</InputLabel>
                                            <Select
                                                value={settings.exportFormat}
                                                onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                                            >
                                                <MenuItem value="excel">Excel (XLSX)</MenuItem>
                                                <MenuItem value="csv">CSV</MenuItem>
                                                <MenuItem value="pdf">PDF</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Format de date</InputLabel>
                                            <Select
                                                value={settings.dateFormat}
                                                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                                            >
                                                <MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem>
                                                <MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem>
                                                <MenuItem value="yyyy-MM-dd">YYYY-MM-DD</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                );

            case 'api':
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
                                            label="Timeout API (ms)"
                                            value={settings.apiTimeout}
                                            onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                                            inputProps={{ min: 5000, max: 120000 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Timeout de session (minutes)"
                                            value={settings.sessionTimeout}
                                            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                                            inputProps={{ min: 5, max: 480 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.enableCache}
                                                    onChange={(e) => handleSettingChange('enableCache', e.target.checked)}
                                                />
                                            }
                                            label="Activer le cache"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Niveau de log</InputLabel>
                                            <Select
                                                value={settings.logLevel}
                                                onChange={(e) => handleSettingChange('logLevel', e.target.value)}
                                            >
                                                <MenuItem value="error">Erreurs seulement</MenuItem>
                                                <MenuItem value="warn">Avertissements</MenuItem>
                                                <MenuItem value="info">Informations</MenuItem>
                                                <MenuItem value="debug">Debug</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                );

            case 'system':
                return (
                    <Stack spacing={3}>
                        <Typography variant="h6">🖥️ Informations Système</Typography>

                        <Card>
                            <CardContent>
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
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {config.apiBaseUrl}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Navigateur
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {navigator.userAgent.split(' ').slice(-2)[0]}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Features actives
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {Object.entries(config.features)
                                                .filter(([, enabled]) => enabled)
                                                .map(([name]) => (
                                                    <Chip
                                                        key={name}
                                                        label={name}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Stack>
                );

            default:
                return null;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1">
                            Paramètres
                        </Typography>
                        {unsavedChanges && (
                            <Badge color="warning" variant="dot" sx={{ ml: 2 }}>
                                <Chip label="Modifications non sauvegardées" color="warning" size="small" />
                            </Badge>
                        )}
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                        Configuration et personnalisation de l'application CBM GRC Matcher
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Navigation */}
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Sections
                            </Typography>
                            <List>
                                {sections.map((section) => (
                                    <ListItem
                                        key={section.id}
                                        button
                                        selected={activeSection === section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        sx={{
                                            borderRadius: 1,
                                            mb: 1,
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.50',
                                                color: 'primary.main',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: 'inherit' }}>
                                            {section.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={section.label} />
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ my: 2 }} />

                            {/* Actions */}
                            <Stack spacing={1}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={() => setShowExportDialog(true)}
                                    fullWidth
                                >
                                    Exporter
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Upload />}
                                    onClick={() => setShowImportDialog(true)}
                                    fullWidth
                                >
                                    Importer
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<Refresh />}
                                    onClick={handleReset}
                                    fullWidth
                                >
                                    Réinitialiser
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Contenu */}
                    <Grid item xs={12} md={9}>
                        <Paper sx={{ p: 3 }}>
                            {renderSection()}
                        </Paper>

                        {/* Actions principales */}
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => window.location.reload()}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSave}
                                disabled={!unsavedChanges}
                            >
                                Sauvegarder
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Dialogs */}
                <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
                    <DialogTitle>Exporter les paramètres</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Vous allez télécharger un fichier JSON contenant tous vos paramètres.
                            Ce fichier peut être utilisé pour restaurer votre configuration.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowExportDialog(false)}>Annuler</Button>
                        <Button onClick={handleExportSettings} variant="contained">
                            Télécharger
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)}>
                    <DialogTitle>Importer les paramètres</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            Sélectionnez un fichier JSON de paramètres précédemment exporté.
                        </Typography>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportSettings}
                            style={{ width: '100%' }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowImportDialog(false)}>Annuler</Button>
                    </DialogActions>
                </Dialog>

                {/* Alert d'info */}
                {config.isDevelopment && (
                    <Alert severity="info" sx={{ mt: 3 }}>
                        <Typography variant="body2">
                            <strong>Mode développement actif</strong> - Certaines modifications
                            nécessitent un rechargement de la page pour prendre effet.
                        </Typography>
                    </Alert>
                )}
            </motion.div>
        </Container>
    );
};

export default SettingsPage;