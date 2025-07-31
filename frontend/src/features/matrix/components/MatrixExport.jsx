// frontend/src/features/matrix/components/MatrixExport.jsx

import React, { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Chip
} from '@mui/material';
import {
    FileDownload,
    TableChart,
    Description,
    Settings
} from '@mui/icons-material';

/**
 * Composant d'export pour la matrice
 */
export default function MatrixExport({ data, filters, onExport, disabled = false }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [configDialog, setConfigDialog] = useState(false);
    const [exportConfig, setExportConfig] = useState({
        format: 'csv',
        includeEmptyCells: false,
        includeProductDetails: true,
        includeFilters: true
    });

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleQuickExport = (format) => {
        const config = { ...exportConfig, format };
        handleExport(config);
        handleMenuClose();
    };

    const handleConfiguredExport = () => {
        setConfigDialog(true);
        handleMenuClose();
    };

    const handleExport = (config) => {
        const exportData = generateExportData(config);
        onExport?.(exportData, config);
    };

    const generateExportData = (config) => {
        const { products, columnRefs, correspondences } = data;

        // Structure des données pour export
        const exportRows = products.map(product => {
            const row = {};

            // Données produit de base
            if (config.includeProductDetails) {
                row['Code Produit'] = product.cod_pro;
                row['Référence Interne'] = product.ref_int;
                row['Désignation'] = product.designation;
                row['Qualité'] = product.qualite;
                row['Stock'] = product.stock;
                row['Famille'] = product.famille;
                row['Statut'] = product.statut;
            } else {
                row['Code Produit'] = product.cod_pro;
                row['Référence Interne'] = product.ref_int;
            }

            // Correspondances pour chaque colonne
            columnRefs.forEach(colRef => {
                const matches = correspondences.filter(c =>
                    c.cod_pro === product.cod_pro &&
                    (c.ref_crn === colRef.ref || c.ref_ext === colRef.ref)
                );

                const hasMatch = matches.length > 0;

                if (config.includeEmptyCells || hasMatch) {
                    const matchDetails = matches.map(m => {
                        const parts = [];
                        if (m.ref_crn === colRef.ref) parts.push('CRN');
                        if (m.ref_ext === colRef.ref) parts.push('EXT');
                        return parts.join('+');
                    }).join(', ');

                    row[colRef.ref] = hasMatch ? (matchDetails || '✓') : '';
                }
            });

            return row;
        });

        const metadata = {
            generated: new Date().toISOString(),
            totalProducts: products.length,
            totalColumns: columnRefs.length,
            totalCorrespondences: correspondences.length,
            appliedFilters: config.includeFilters ? filters : null
        };

        return {
            rows: exportRows,
            metadata,
            config
        };
    };

    const getExportStats = () => {
        if (!data.products.length) return null;

        const stats = {
            products: data.products.length,
            columns: data.columnRefs.length,
            correspondences: data.correspondences.length,
            matches: data.correspondences.filter(c => c.ref_crn || c.ref_ext).length
        };

        return stats;
    };

    const stats = getExportStats();

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleMenuOpen}
                disabled={disabled || !data.products.length}
                sx={{ minWidth: 120 }}
            >
                Export
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleQuickExport('csv')}>
                    <ListItemIcon>
                        <TableChart fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export CSV</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => handleQuickExport('xlsx')}>
                    <ListItemIcon>
                        <Description fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export Excel</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleConfiguredExport}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export configuré...</ListItemText>
                </MenuItem>
            </Menu>

            {/* Dialog de configuration d'export */}
            <Dialog
                open={configDialog}
                onClose={() => setConfigDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Configuration d'Export
                </DialogTitle>

                <DialogContent>
                    {stats && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Données à exporter :
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    label={`${stats.products} produits`}
                                    size="small"
                                    color="primary"
                                />
                                <Chip
                                    label={`${stats.columns} colonnes`}
                                    size="small"
                                    color="secondary"
                                />
                                <Chip
                                    label={`${stats.matches} correspondances`}
                                    size="small"
                                    color="success"
                                />
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={exportConfig.includeProductDetails}
                                    onChange={(e) => setExportConfig(prev => ({
                                        ...prev,
                                        includeProductDetails: e.target.checked
                                    }))}
                                />
                            }
                            label="Inclure tous les détails produits"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={exportConfig.includeEmptyCells}
                                    onChange={(e) => setExportConfig(prev => ({
                                        ...prev,
                                        includeEmptyCells: e.target.checked
                                    }))}
                                />
                            }
                            label="Inclure les cellules vides"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={exportConfig.includeFilters}
                                    onChange={(e) => setExportConfig(prev => ({
                                        ...prev,
                                        includeFilters: e.target.checked
                                    }))}
                                />
                            }
                            label="Inclure les filtres appliqués dans les métadonnées"
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setConfigDialog(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={() => {
                            handleExport({ ...exportConfig, format: 'csv' });
                            setConfigDialog(false);
                        }}
                        variant="outlined"
                        startIcon={<TableChart />}
                    >
                        Export CSV
                    </Button>
                    <Button
                        onClick={() => {
                            handleExport({ ...exportConfig, format: 'xlsx' });
                            setConfigDialog(false);
                        }}
                        variant="contained"
                        startIcon={<Description />}
                    >
                        Export Excel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}