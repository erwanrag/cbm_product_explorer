// ============================================================================
// 📁 src/shared/components/GlobalLoader.jsx 
// ============================================================================

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * 🔥 COMPOSANT MANQUANT - GlobalLoader
 */
const GlobalLoader = ({ message = "Chargement..." }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: 2,
            }}
        >
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
};

export default GlobalLoader;