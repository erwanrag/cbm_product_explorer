// src/features/optimization/pages/OptimizationPage.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const OptimizationPage = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Optimisation
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Outils d'optimisation et d'analyse
            </Typography>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">Module Optimisation</Typography>
                <Typography variant="body2" color="text.secondary">
                    En cours de développement...
                </Typography>
            </Paper>
        </Box>
    );
};

export default OptimizationPage;