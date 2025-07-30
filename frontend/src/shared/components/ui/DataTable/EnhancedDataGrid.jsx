// ===================================
// 📁 frontend/src/shared/components/ui/DataTable/EnhancedDataGrid.jsx - NOUVEAU
// ===================================

import React, { memo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { Download, Refresh, FilterList } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Import utilitaires
import { exportToCSV } from '@/lib/exportUtils';
import { formatPrix, formatNumber } from '@/lib/formatUtils';
import { getQualiteColor } from '@/lib/colors';

/**
 * DataGrid CBM enterprise avec fonctionnalités avancées
 */
const EnhancedDataGrid = memo(
  ({
    data = [],
    columns = [],
    title,
    loading = false,
    onRefresh,
    onExport,
    enableExport = true,
    enableRefresh = true,
    pageSize = 50,
    ...dataGridProps
  }) => {
    // Colonnes enrichies avec formatage CBM
    const enhancedColumns = columns.map((col) => {
      // Formatage automatique selon le nom de colonne
      if (
        col.field.includes('prix') ||
        col.field.includes('ca_') ||
        col.field.includes('stock_valorise')
      ) {
        return {
          ...col,
          renderCell: ({ value }) => (
            <Box sx={{ fontWeight: 500, color: value < 0 ? 'error.main' : 'inherit' }}>
              {formatPrix(value)}
            </Box>
          ),
          align: 'right',
          headerAlign: 'right',
        };
      }

      if (col.field.includes('quantite') || col.field.includes('stock_total')) {
        return {
          ...col,
          renderCell: ({ value }) => (
            <Box sx={{ color: value <= 0 ? 'error.main' : 'inherit' }}>{formatNumber(value)}</Box>
          ),
          align: 'right',
          headerAlign: 'right',
        };
      }

      if (col.field === 'qualite') {
        return {
          ...col,
          renderCell: ({ value }) => (
            <Chip
              label={value}
              size="small"
              sx={{
                bgcolor: getQualiteColor(value),
                color: 'white',
                fontWeight: 600,
                minWidth: 50,
              }}
            />
          ),
        };
      }

      if (col.field.includes('percent') || col.field.includes('marge')) {
        return {
          ...col,
          renderCell: ({ value }) => (
            <Box
              sx={{
                color: value < 10 ? 'error.main' : value < 20 ? 'warning.main' : 'success.main',
                fontWeight: 500,
              }}
            >
              {value != null ? `${value.toFixed(1)}%` : 'N/A'}
            </Box>
          ),
          align: 'right',
          headerAlign: 'right',
        };
      }

      return col;
    });

    const handleExport = () => {
      if (onExport) {
        onExport(data);
      } else {
        exportToCSV(data, `export_${title || 'donnees'}_cbm`);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          elevation={1}
          sx={{
            height: 600,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header avec actions */}
          {(title || enableRefresh || enableExport) && (
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {enableRefresh && (
                  <Tooltip title="Actualiser">
                    <IconButton onClick={onRefresh} size="small">
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                )}

                {enableExport && data.length > 0 && (
                  <Tooltip title="Exporter en CSV">
                    <IconButton onClick={handleExport} size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          )}

          {/* DataGrid */}
          <Box sx={{ flexGrow: 1 }}>
            <DataGrid
              rows={data}
              columns={enhancedColumns}
              loading={loading}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize } },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.default',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  fontWeight: 600,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
                '& .MuiDataGrid-cell': {
                  borderColor: 'divider',
                },
              }}
              localeText={{
                // Traduction française
                columnMenuSortAsc: 'Trier par ordre croissant',
                columnMenuSortDesc: 'Trier par ordre décroissant',
                columnMenuFilter: 'Filtrer',
                columnMenuHideColumn: 'Masquer la colonne',
                columnMenuManageColumns: 'Gérer les colonnes',
                // ... autres traductions selon besoins
              }}
              {...dataGridProps}
            />
          </Box>
        </Paper>
      </motion.div>
    );
  }
);

EnhancedDataGrid.displayName = 'EnhancedDataGrid';

export default EnhancedDataGrid;
