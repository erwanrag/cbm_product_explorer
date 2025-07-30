// frontend/src/shared/pages/ErrorPage.jsx
import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">Erreur d'application</Typography>
        </Alert>

        <Typography variant="h5" gutterBottom>
          Une erreur s'est produite
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          L'application a rencontré une erreur inattendue. Veuillez rafraîchir la page ou retourner
          au dashboard.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
            Rafraîchir
          </Button>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ErrorPage;
