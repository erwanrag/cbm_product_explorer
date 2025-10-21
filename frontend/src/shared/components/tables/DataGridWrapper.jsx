import React, { useMemo } from 'react';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarExport,
    frFR
} from '@mui/x-data-grid';
import { Box, Typography, CircularProgress } from '@mui/material';

/**
 * DataGridWrapper - Table mutualisée CBM (tri, pagination, export, render cell custom)
 * 
 * Props :
 * - columns: array de configs colonnes (voir ci-dessous)
 * - rows: array de données
 * - loading: bool
 * - page/pageSize/onPageChange/onPageSizeChange : pagination server/client
 * - getRowId: function(row) => id
 * - checkboxSelection: bool
 * - onRowClick: func
 * - slots: custom slots (toolbar, footer, etc.)
 * - emptyMessage: string ou ReactNode
 */
export default function DataGridWrapper({
    columns = [],
    rows = [],
    loading = false,
    page,
    pageSize,
    rowCount,
    onPageChange,
    onPageSizeChange,
    getRowId,
    checkboxSelection = false,
    onRowClick,
    slots = {},
    sx = {},
    emptyMessage = "Aucune donnée à afficher",
    localeText = frFR.components.MuiDataGrid.defaultProps.localeText,
    ...props
}) {
    // Id auto (cod_pro, id, etc.)
    const autoGetRowId = getRowId || ((row) => row.id || row.cod_pro || row.refint || Math.random());

    // Message empty state custom
    const NoRowsOverlay = () => (
        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h6" gutterBottom>
                {emptyMessage}
            </Typography>
        </Box>
    );

    // Toolbar customisée (export, etc.)
    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarExport csvOptions={{ delimiter: ";" }} />
                {slots.toolbar}
            </GridToolbarContainer>
        );
    }

    // Columns = ajout mapping pro (cf. badges plus bas)
    const renderedColumns = useMemo(() => columns.map(col => ({
        ...col,
        renderCell: col.renderCell ? col.renderCell : undefined,
        // Optionnel: centralise badges (voir plus bas)
    })), [columns]);

    return (
        <Box sx={{ width: '100%', height: '100%', ...sx }}>
            <DataGrid
                columns={renderedColumns}
                rows={rows}
                getRowId={autoGetRowId}
                loading={loading}
                page={page}
                pageSize={pageSize}
                rowCount={rowCount}
                paginationMode={onPageChange ? "server" : "client"}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                checkboxSelection={checkboxSelection}
                onRowClick={onRowClick}
                localeText={localeText}
                disableColumnFilter={false}
                slots={{
                    ...slots,
                    noRowsOverlay: NoRowsOverlay,
                    toolbar: slots.toolbar || CustomToolbar
                }}
                sx={{
                    minHeight: 340,
                    fontSize: 14,
                    borderRadius: 2,
                    bgcolor: "white",
                    '& .MuiDataGrid-columnHeaders': { fontWeight: 700, bgcolor: "#f5f5f5" },
                    ...sx
                }}
                {...props}
            />
            {loading && (
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
}
