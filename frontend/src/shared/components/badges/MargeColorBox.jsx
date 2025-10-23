// frontend/src/shared/components/badges/MargeColorBox.jsx

import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { getMargeColor, getMargeLabel } from '@/lib/colors';

// ✅ Fonction utilitaire locale (pas besoin d'import)
const safeFixed = (val, decimals = 1) => {
  if (val == null || isNaN(val)) return '0.0';
  return Number(val).toFixed(decimals);
};

export default function MargeColorBox({ value, qualite }) {
  const color = getMargeColor(value, qualite);
  const label = getMargeLabel(value, qualite);

  return (
    <Tooltip title={label}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 60,
          height: 24,
          px: 1,
          borderRadius: 1,
          bgcolor: color,
          color: 'white',
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      >
        {safeFixed(value)}%
      </Box>
    </Tooltip>
  );
}