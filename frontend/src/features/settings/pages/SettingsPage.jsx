// ===================================
// 📁 frontend/src/features/settings/pages/SettingsPage.jsx - AVEC STORE UNIFIÉ
// ===================================

import React, { useState } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Button,
    Stack, List, ListItem, ListItemText, ListItemIcon,
    Divider, Badge, Chip, Alert
} from '@mui/material';
import {
    Settings as SettingsIcon, Save, Palette, Speed, Visibility, Security, InfoOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAppState } from '@/store/contexts/AppStateContext'; // 🔥 Store unifié
import config from '@/config/environment';

// Import des sections
import UISection from '../components/UISection';
import PerformanceSection from '../components/PerformanceSection';
import DisplaySection from '../components/DisplaySection';
import APISection from '../components/APISection';
import SystemSection from '../components/SystemSection';
import SettingsExportImport from '../components/SettingsExportImport';

const SettingsPage = () => {
    const { settings, updateAllSettings } = useAppState(); // 🔥 Store unifié

    const [activeSection, setActiveSection] = useState('ui');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [localSettings, setLocalSettings] = useState(settings); // Copie locale pour la page

    // ===================================
    // 🔧 HANDLERS FONCTIONNELS
    // ===================================

    const handleSettingChange = (key, value) => {
        // Mettre à jour les settings locaux de la page
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setUnsavedChanges(true);
        // Note: le vrai changement se fait dans chaque composant via updateSetting()
    };

    const handleSave = () => {
        try {
            // Sauvegarder tous les paramètres
            updateAllSettings(localSettings);
            setUnsavedChanges(false);
            toast.success('✅ Paramètres sauvegardés avec succès');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            toast.error('❌ Erreur lors de la sauvegarde');
        }
    };

    const handleReset = () => {
        if (window.confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
            // Supprimer tous les paramètres CBM du localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('cbm-')) {
                    localStorage.removeItem(key);
                }
            });

            toast.success('Paramètres réinitialisés');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    const sections = [
        { id: 'ui', label: 'Interface Utilisateur', icon: <Palette /> },
        { id: 'performance', label: 'Performance', icon: <Speed /> },
        { id: 'display', label: 'Affichage', icon: <Visibility /> },
        { id: 'api', label: 'API & Sécurité', icon: <Security /> },
        { id: 'system', label: 'Système', icon: <InfoOutlined /> },
    ];

    const renderSection = () => {
        switch (activeSection) {
            case 'ui':
                return <UISection onSettingChange={handleSettingChange} />;
            case 'performance':
                return <PerformanceSection onSettingChange={handleSettingChange} />;
            case 'display':
                return <DisplaySection onSettingChange={handleSettingChange} />;
            case 'api':
                return <APISection onSettingChange={handleSettingChange} />;
            case 'system':
                return <SystemSection />;
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
                                <Chip label="Des changements ont été appliqués" color="success" size="small" />
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

                            {/* Export/Import */}
                            <SettingsExportImport
                                settings={settings}
                                onImport={setLocalSettings}
                                onReset={handleReset}
                            />
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
                                Recharger
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSave}
                                disabled={!unsavedChanges}
                            >
                                Tout sauvegarder
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Alert d'info */}
                <Alert severity="success" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        <strong>✨ Paramètres en temps réel :</strong> La plupart des changements s'appliquent immédiatement !
                        {config.isDevelopment && ' Mode développement actif - Logs dans la console.'}
                    </Typography>
                </Alert>
            </motion.div>
        </Container>
    );
};

export default SettingsPage;