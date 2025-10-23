// ===================================
// 📁 DashboardErrorState.jsx - AVEC TRADUCTIONS
// ===================================

import React from 'react';
import { Alert, Button } from '@mui/material';
import { useTranslation } from '@/store/contexts/LanguageContext';

/**
 * État d'erreur du dashboard - Composant dédié
 */
export default function DashboardErrorState({ error, onRetry }) {
    const { t } = useTranslation();

    return (
        <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
                onRetry && (
                    <Button color="inherit" size="small" onClick={onRetry}>
                        {t('common.retry', 'Réessayer')}
                    </Button>
                )
            }
        >
            {t('dashboard.error.loading', 'Erreur lors du chargement des données')}: {error?.message || t('common.unknown_error', 'Erreur inconnue')}
        </Alert>
    );
}