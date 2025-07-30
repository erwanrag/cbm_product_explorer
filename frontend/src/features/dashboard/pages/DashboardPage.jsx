// frontend/src/features/dashboard/pages/DashboardPage.jsx
import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const DashboardPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard CBM GRC Matcher
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Vue d'ensemble des métriques et KPIs
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Module Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              En cours de développement...
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">Statistiques</Typography>
            <Typography variant="body2" color="text.secondary">
              Données à venir...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
