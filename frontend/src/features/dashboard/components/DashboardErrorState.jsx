// frontend/src/features/dashboard/components/DashboardErrorState.jsx
import React from 'react';
import { Alert, Button } from '@mui/material';

/**
 * État d'erreur du dashboard - Composant dédié
 */
export default function DashboardErrorState({ error, onRetry }) {
  return (
    <Alert
      severity="error"
      sx={{ m: 2 }}
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Réessayer
        </Button>
      }
    >
      Erreur lors du chargement des données: {error?.message || 'Erreur inconnue'}
    </Alert>
  );
}
