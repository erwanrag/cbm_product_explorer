// frontend/src/components/ui/Filters/AdvancedFilterPanel.jsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Fade,
} from '@mui/material';
import { ExpandMore, FilterList, Clear, Save, Restore, History } from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * Panneau de filtres avancé avec sauvegarde et historique
 */
export default function AdvancedFilterPanel({
  children,
  title = 'Filtres Avancés',
  onApply,
  onClear,
  onSave,
  onRestore,
  savedFilters = [],
  currentFilters = {},
  loading = false,
  expandedByDefault = true,
}) {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const [showHistory, setShowHistory] = useState(false);

  // Compteur de filtres actifs
  const activeFiltersCount = useMemo(() => {
    return Object.values(currentFilters).filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    ).length;
  }, [currentFilters]);

  const handleApply = useCallback(() => {
    onApply?.(currentFilters);
  }, [onApply, currentFilters]);

  const handleClear = useCallback(() => {
    onClear?.();
  }, [onClear]);

  const handleSave = useCallback(() => {
    const filterName = prompt('Nom pour cette configuration de filtres:');
    if (filterName && filterName.trim()) {
      onSave?.({
        name: filterName.trim(),
        filters: currentFilters,
        timestamp: new Date().toISOString(),
      });
    }
  }, [onSave, currentFilters]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Historique des filtres">
              <IconButton color="inherit" size="small" onClick={() => setShowHistory(!showHistory)}>
                <History />
              </IconButton>
            </Tooltip>
            <Tooltip title="Réduire/Développer">
              <IconButton color="inherit" size="small" onClick={() => setExpanded(!expanded)}>
                <ExpandMore
                  sx={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Historique des filtres sauvegardés */}
        <Fade in={showHistory}>
          <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Filtres Sauvegardés
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {savedFilters.length > 0 ? (
                savedFilters.map((saved, index) => (
                  <Chip
                    key={index}
                    label={saved.name}
                    variant="outlined"
                    size="small"
                    onClick={() => onRestore?.(saved.filters)}
                    sx={{ mb: 1 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun filtre sauvegardé
                </Typography>
              )}
            </Stack>
          </Box>
        </Fade>

        {/* Contenu des filtres */}
        <Fade in={expanded}>
          <Box sx={{ p: 2 }}>
            {children}

            <Divider sx={{ my: 2 }} />

            {/* Actions */}
            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleApply}
                  disabled={loading}
                  sx={{ fontWeight: 600 }}
                >
                  Appliquer les Filtres
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClear}
                    disabled={loading}
                  >
                    Effacer
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeFiltersCount > 0 && (
                  <Tooltip title="Sauvegarder cette configuration">
                    <IconButton onClick={handleSave} disabled={loading} size="small">
                      <Save />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Stack>
          </Box>
        </Fade>
      </Paper>
    </motion.div>
  );
}
