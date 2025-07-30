// frontend/src/features/matrix/pages/MatrixPage.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MatrixPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Matrice de Correspondance
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Analyse des correspondances entre produits
      </Typography>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Module Matrice</Typography>
        <Typography variant="body2" color="text.secondary">
          Interface de matrice en cours de développement...
        </Typography>
      </Paper>
    </Box>
  );
};

export default MatrixPage;
