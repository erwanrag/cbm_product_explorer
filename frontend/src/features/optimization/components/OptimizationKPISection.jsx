// ===================================
// 📁 frontend/src/features/optimization/components/OptimizationKPISection.jsx
// ✅ VERSION CORRIGÉE - Séparateurs de milliers
// ===================================

import React from 'react';
import { Box, Grid, Typography, Stack, Chip } from '@mui/material';
import { TrendingUp, ShowChart, AccountBalance, Warning } from '@mui/icons-material';
import { KPICard } from '@/shared/components';
import { useTranslation } from '@/store/contexts/LanguageContext';
import { getQualiteColor, getQualiteLabel } from '@/constants/colors';

export default function OptimizationKPISection({ data, loading }) {
  const { t } = useTranslation();

  // ✅ Formatage avec séparateurs de milliers
  const formatCurrency = (value) => {
    if (!value) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const kpiConfig = [
    {
      title: t('optimization.kpis.total_groups', 'Groupes Analysés'),
      value: data?.totalGroups || 0,
      icon: <ShowChart />,
      color: '#1976d2',
      format: 'number',
      delay: 0,
      subtitle: `${data?.totalRefs || 0} références totales`
    },
    {
      title: t('optimization.kpis.gain_historique', 'Manque à Gagner 12M'),
      value: formatCurrency(data?.totalGainHistorique || 0),
      icon: <Warning />,
      color: '#ed6c02',
      format: 'auto', // ✅ Passe la valeur déjà formatée
      delay: 0.1,
      subtitle: 'Gains manqués (passé)'
    },
    {
      title: t('optimization.kpis.gain_projection', 'Gain Potentiel 6M'),
      value: formatCurrency(data?.totalGainProjection || 0),
      icon: <TrendingUp />,
      color: '#2e7d32',
      format: 'auto', // ✅ Passe la valeur déjà formatée
      delay: 0.2,
      subtitle: 'Gains futurs possibles'
    },
    {
      title: t('optimization.kpis.gain_total', 'GAIN TOTAL 18M'),
      value: formatCurrency(data?.totalGain18m || 0),
      icon: <AccountBalance />,
      color: '#0288d1',
      format: 'auto', // ✅ Passe la valeur déjà formatée
      delay: 0.3,
      subtitle: `Qualité moy: ${((data?.avgQuality || 0) * 100).toFixed(0)}%`
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {kpiConfig.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard {...kpi} loading={loading} />
          </Grid>
        ))}
      </Grid>
      {/* Références clés conservées */}
      <Box
        sx={{
          mt: 2.5,
          px: 2,
          py: 1.5,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          🔍 Références clés conservées
        </Typography>

        {data?.refsByQualite && Object.keys(data.refsByQualite).length > 0 ? (
          <Stack
            direction="row"
            spacing={4}
            sx={{
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {Object.entries(data.refsByQualite).map(([qualite, refs]) => {
              const color = getQualiteColor(qualite);
              const label = getQualiteLabel(qualite);

              return (
                <Stack
                  key={qualite}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ flexWrap: 'wrap' }}
                >
                  {/* Badge qualité (comme dans le tableau) */}
                  <Chip
                    label={label}
                    size="small"
                    sx={{
                      bgcolor: color + '20',
                      color,
                      fontWeight: 600,
                      border: `1px solid ${color}`,
                    }}
                  />

                  {/* Références associées */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 0.5,
                    }}
                  >
                    {refs.slice(0, 2).map((ref, idx) => (
                      <Box
                        key={idx}
                        component="span"
                        sx={{
                          bgcolor: 'white',
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          border: '1px solid #ddd',
                          fontSize: '0.85rem',
                        }}
                      >
                        {ref.refint || 'N/A'}
                      </Box>
                    ))}
                    {refs.length > 2 && (
                      <Box
                        component="span"
                        sx={{
                          color: 'grey.600',
                          ml: 0.5,
                          fontWeight: 500,
                        }}
                      >
                        +{refs.length - 2}
                      </Box>
                    )}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            Aucune référence disponible
          </Typography>
        )}
      </Box>

    </Box>
  );
}