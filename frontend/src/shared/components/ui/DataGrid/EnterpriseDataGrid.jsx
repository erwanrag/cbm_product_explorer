// frontend/src/components/ui/DataGrid/EnterpriseDataGrid.jsx
import React, { useMemo, useState, useCallback } from 'react';
import {
    DataGrid,
    GridToolbar,
    GridActionsCellItem,
    useGridApiRef
} from '@mui/x-data-grid';
import {
    Box,
    Paper,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Visibility,
    MoreVert,
    FileDownload,
    Refresh,
    FilterList,
    ViewColumn
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DataGrid enterprise avec fonctionnalités avancées
 * - Export intelligent
 * - Colonnes dynamiques
 * - Actions contextuelles
 * - Performance optimisée
 */
export default function EnterpriseDataGrid({
    rows = [],
    columns = [],
    title,
    subtitle,
    loading = false,
    onRowClick,
    onExport,
    onRefresh,
    onRowAction,
    customActions = [],
    density = 'standard',
    enableExport = true,
    enableRefresh = true,
    enableColumnToggle = true,
    pageSize = 25,
    pageSizeOptions = [25, 50, 100, 200],
    sx = {},
    ...props
}) {
    const apiRef = useGridApiRef();
    const [columnVisibility, setColumnVisibility] = useState({});
    const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);

    // Actions personnalisées pour chaque ligne
    const enhancedColumns = useMemo(() => {
        if (!customActions.length && !onRowAction) return columns;

        const actionsColumn = {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            getActions: (params) => {
                const actions = [
                    <GridActionsCellItem
                        key="view"
                        icon={<Visibility />}
                        label="Voir détails"
                        onClick={() => onRowAction?.(params.row, 'view')}
                        showInMenu
                    />
                ];

                // Ajout des actions personnalisées
                customActions.forEach(action => {
                    actions.push(
                        <GridActionsCellItem
                            key={action.key}
                            icon={action.icon}
                            label={action.label}
                            onClick={() => action.onClick(params.row)}
                            showInMenu={action.showInMenu}
                            disabled={action.disabled?.(params.row)}
                        />
                    );
                });

                return actions;
            }
        };

        return [...columns, actionsColumn];
    }, [columns, customActions, onRowAction]);

    // Gestionnaire d'export intelligent
    const handleExport = useCallback(async () => {
        if (!onExport) return;

        try {
            const visibleRows = apiRef.current.getVisibleRowModels();
            const visibleColumns = apiRef.current.getVisibleColumns();

            await onExport({
                rows: Array.from(visibleRows.values()),
                columns: visibleColumns,
                filters: apiRef.current.state.filter,
                sorting: apiRef.current.state.sorting
            });
        } catch (error) {
            console.error('Erreur export:', error);
        }
    }, [onExport, apiRef]);

    // Menu actions personnalisé
    const renderActionsMenu = () => (
        <Menu
            anchorEl={actionsMenuAnchor}
            open={Boolean(actionsMenuAnchor)}
            onClose={() => setActionsMenuAnchor(null)}
        >
            {enableExport && (
                <MenuItem onClick={() => { handleExport(); setActionsMenuAnchor(null); }}>
                    <ListItemIcon><FileDownload /></ListItemIcon>
                    <ListItemText>Exporter les données</ListItemText>
                </MenuItem>
            )}
            {enableRefresh && (
                <MenuItem onClick={() => { onRefresh?.(); setActionsMenuAnchor(null); }}>
                    <ListItemIcon><Refresh /></ListItemIcon>
                    <ListItemText>Actualiser</ListItemText>
                </MenuItem>
            )}
            {enableColumnToggle && (
                <MenuItem onClick={() => setActionsMenuAnchor(null)}>
                    <ListItemIcon><ViewColumn /></ListItemIcon>
                    <ListItemText>Gérer les colonnes</ListItemText>
                </MenuItem>
            )}
        </Menu>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Paper
                    elevation={2}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        ...sx
                    }}
                >
                    {/* Header avec titre et actions */}
                    {(title || enableExport || enableRefresh) && (
                        <Box sx={{
                            p: 2,
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: '#fafafa'
                        }}>
                            <Box>
                                {title && (
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {title}
                                    </Typography>
                                )}
                                {subtitle && (
                                    <Typography variant="body2" color="text.secondary">
                                        {subtitle}
                                    </Typography>
                                )}
                                <Chip
                                    label={`${rows.length} ligne${rows.length > 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {enableRefresh && (
                                    <Tooltip title="Actualiser les données">
                                        <IconButton
                                            onClick={onRefresh}
                                            disabled={loading}
                                            size="small"
                                        >
                                            <Refresh />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                <Tooltip title="Plus d'actions">
                                    <IconButton
                                        onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                                        size="small"
                                    >
                                        <MoreVert />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    )}

                    {/* DataGrid avec configuration enterprise */}
                    <DataGrid
                        {...props}
                        apiRef={apiRef}
                        rows={rows}
                        columns={enhancedColumns}
                        loading={loading}
                        density={density}
                        pageSize={pageSize}
                        rowsPerPageOptions={pageSizeOptions}
                        onRowClick={onRowClick}
                        columnVisibilityModel={columnVisibility}
                        onColumnVisibilityModelChange={setColumnVisibility}

                        // Configuration enterprise
                        disableSelectionOnClick
                        disableColumnMenu={false}
                        filterMode="client"
                        sortingMode="client"
                        paginationMode="client"

                        // Toolbar personnalisé
                        components={{
                            Toolbar: GridToolbar
                        }}
                        componentsProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: {
                                    debounceMs: 300,
                                    placeholder: 'Rechercher...'
                                },
                                printOptions: { disableToolbarButton: true },
                                csvOptions: {
                                    fileName: `export-${new Date().toISOString().split('T')[0]}`,
                                    delimiter: ';',
                                    utf8WithBom: true
                                }
                            }
                        }}

                        // Styles avancés
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-main': {
                                borderRadius: 0
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8f9fa',
                                borderBottom: '2px solid #e9ecef',
                                fontSize: '0.875rem',
                                fontWeight: 600
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                                '&:focus': {
                                    outline: '2px solid #1976d2',
                                    outlineOffset: '-2px'
                                }
                            },
                            '& .MuiDataGrid-row': {
                                '&:hover': {
                                    backgroundColor: '#f8f9fa',
                                    cursor: onRowClick ? 'pointer' : 'default'
                                },
                                '&.Mui-selected': {
                                    backgroundColor: '#e3f2fd !important',
                                    '&:hover': {
                                        backgroundColor: '#bbdefb !important'
                                    }
                                }
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '2px solid #e9ecef',
                                backgroundColor: '#f8f9fa'
                            }
                        }}
                    />

                    {renderActionsMenu()}
                </Paper>
            </motion.div>
        </AnimatePresence>
    );
}
