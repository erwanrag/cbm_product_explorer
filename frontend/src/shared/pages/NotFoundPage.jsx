// frontend/src/shared/pages/NotFoundPage.jsx
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
        >
            <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                <Typography variant="h1" color="primary" sx={{ fontSize: '4rem', mb: 2 }}>
                    404
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Page non trouvée
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{ mt: 2 }}
                >
                    Retour au Dashboard
                </Button>
            </Paper>
        </Box>
    );
};

export default NotFoundPage;
