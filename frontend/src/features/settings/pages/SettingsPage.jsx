// src/features/settings/pages/SettingsPage.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

const SettingsPage = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" component="h1">
                    Paramètres
                </Typography>
            </Box>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Configuration de l'Application
                </Typography>
                <Typography color="text.secondary">
                    Page de paramètres en cours de développement...
                </Typography>
            </Paper>
        </Box>
    );
};

export default SettingsPage;