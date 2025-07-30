// frontend/src/features/dashboard/hooks/useProductTableColumns.js
import { useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import { formatCurrency } from '@/lib/formatUtils';

/**
 * Hook pour les colonnes du tableau produits - Logique réutilisable
 */
export function useProductTableColumns() {
  return useMemo(
    () => [
      {
        field: 'cod_pro',
        headerName: 'Code Produit',
        width: 120,
        type: 'number',
      },
      {
        field: 'refint',
        headerName: 'Référence Interne',
        width: 160,
        flex: 1,
      },
      {
        field: 'ref_ext',
        headerName: 'Réf. Externe',
        width: 140,
        renderCell: ({ value }) =>
          value ? (
            <Chip
              label={value}
              size="small"
              sx={{
                bgcolor: '#e3f2fd',
                color: '#1565c0',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            />
          ) : (
            '-'
          ),
      },
      {
        field: 'qualite',
        headerName: 'Qualité',
        width: 100,
        renderCell: ({ value }) => (
          <Chip
            label={value || 'N/A'}
            size="small"
            sx={{
              bgcolor: getQualityColor(value),
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          />
        ),
      },
      {
        field: 'nom_fou',
        headerName: 'Fournisseur',
        width: 200,
        flex: 1,
      },
      {
        field: 'ca_total',
        headerName: 'CA Total (€)',
        width: 130,
        type: 'number',
        align: 'right',
        renderCell: ({ value }) => (
          <Box sx={{ fontWeight: value > 0 ? 600 : 400 }}>{formatCurrency(value)}</Box>
        ),
      },
      {
        field: 'marge_percent_total',
        headerName: 'Marge (%)',
        width: 110,
        type: 'number',
        align: 'right',
        renderCell: ({ value }) => (
          <Box
            sx={{
              color: getMarginColor(value),
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 1,
              bgcolor: `${getMarginColor(value)}15`,
            }}
          >
            {value ? `${value.toFixed(1)}%` : '-'}
          </Box>
        ),
      },
      {
        field: 'stock_total',
        headerName: 'Stock',
        width: 100,
        type: 'number',
        align: 'right',
        renderCell: ({ value }) => (
          <Box
            sx={{
              color: value <= 10 ? '#d32f2f' : 'inherit',
              fontWeight: value <= 10 ? 600 : 400,
            }}
          >
            {value || 0}
          </Box>
        ),
      },
      {
        field: 'performance_score',
        headerName: 'Score',
        width: 80,
        align: 'center',
        renderCell: ({ value }) => (
          <Box
            sx={{
              width: 40,
              height: 20,
              borderRadius: 1,
              bgcolor: getScoreColor(value),
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {value || 0}
          </Box>
        ),
      },
    ],
    []
  );
}

// Fonctions utilitaires pour les couleurs
function getQualityColor(quality) {
  const colors = {
    OE: '#1976d2',
    OEM: '#388e3c',
    PMQ: '#f57c00',
    PMV: '#7b1fa2',
  };
  return colors[quality] || '#757575';
}

function getMarginColor(margin) {
  if (margin == null || isNaN(margin)) return '#757575';
  if (margin < 10) return '#d32f2f';
  if (margin < 20) return '#f57c00';
  return '#388e3c';
}

function getScoreColor(score) {
  if (score >= 80) return '#388e3c';
  if (score >= 60) return '#f57c00';
  if (score >= 40) return '#ff9800';
  return '#d32f2f';
}
