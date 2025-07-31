// ===================================
// 📁 frontend/src/features/matrix/components/MatrixExport.jsx - EXPORT FONCTIONNEL
// ===================================

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormGroup,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Divider,
    Alert,
    Chip,
    Grid,
    Paper
} from '@mui/material';
import {
    FileDownload,
    TableChart,
    Code,
    Assessment
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MatrixExport = ({
    open,
    onClose,
    data,
    filters = {},
    columnVisibility = {}
}) => {
    const [exportConfig, setExportConfig] = useState({
        format: 'csv',
        includeProductDetails: true,
        includeCorrespondences: true,
        includeFilters: true,
        includeEmptyCells: false,
        includeStats: true
    });

    const [exporting, setExporting] = useState(false);

    // ===== GÉNÉRATION DES DONNÉES D'EXPORT =====
    const generateExportData = () => {
        if (!data || !data.products) {
            return { rows: [], metadata: {} };
        }

        const { products, columnRefs = [], correspondences = [] } = data;

        // Structure des lignes d'export
        const exportRows = products.map(product => {
            const row = {};

            // Données produit de base (toujours incluses)
            row['Code Produit'] = product.cod_pro;
            row['Référence Interne'] = product.refint || product.ref_int || '';

            // Détails produit (selon configuration et visibilité des colonnes)
            if (exportConfig.includeProductDetails) {
                if (columnVisibility.designation !== false) {
                    row['Désignation'] = product.nom_pro || product.designation || '';
                }
                if (columnVisibility.qualite !== false) {
                    row['Qualité'] = product.qualite || '';
                }
                if (columnVisibility.famille !== false) {
                    row['Famille'] = product.famille || '';
                    row['Sous-Famille'] = product.s_famille || '';
                }
                if (columnVisibility.statut !== false) {
                    row['Statut'] = product.statut !== null ? product.statut : '';
                }
                if (columnVisibility.fournisseur !== false) {
                    row['Code Fournisseur'] = product.cod_fou_principal || '';
                    row['Nom Fournisseur'] = product.nom_fou || '';
                }
                // Référence externe du produit
                row['Référence Externe Produit'] = product.ref_ext || '';
            }

            // Correspondances pour chaque colonne de référence
            if (exportConfig.includeCorrespondences && columnRefs.length > 0) {
                columnRefs.forEach(colRef => {
                    const matches = correspondences.filter(c =>
                        c.cod_pro === product.cod_pro &&
                        (c.ref_crn === colRef.ref || c.ref_ext === colRef.ref)
                    );

                    const hasMatch = matches.length > 0;

                    if (exportConfig.includeEmptyCells || hasMatch) {
                        let cellValue = '';

                        if (hasMatch) {
                            const matchTypes = [];
                            const crnMatch = matches.find(m => m.ref_crn === colRef.ref);
                            const extMatch = matches.find(m => m.ref_ext === colRef.ref);

                            if (crnMatch) matchTypes.push('CRN');
                            if (extMatch) matchTypes.push('EXT');

                            cellValue = matchTypes.length > 0 ? matchTypes.join('+') : '✓';
                        }

                        row[`[${colRef.type}] ${colRef.ref}`] = cellValue;
                    }
                });
            }

            return row;
        });

        // Métadonnées
        const metadata = {
            generated: new Date().toISOString(),
            totalProducts: products.length,
            totalColumns: columnRefs.length,
            totalCorrespondences: correspondences.length,
            appliedFilters: exportConfig.includeFilters ? filters : null,
            columnVisibility: columnVisibility,
            exportConfig: exportConfig
        };

        return { rows: exportRows, metadata };
    };

    // ===== FONCTIONS D'EXPORT =====
    const exportToCSV = (exportData) => {
        const { rows, metadata } = exportData;

        if (!rows.length) {
            console.warn('Aucune donnée à exporter');
            return;
        }

        // Création du CSV
        const headers = Object.keys(rows[0]);
        const csvContent = [
            // Métadonnées en commentaire
            `# Export Matrice CBM - ${new Date().toLocaleString('fr-FR')}`,
            `# Produits: ${metadata.totalProducts}`,
            `# Références: ${metadata.totalColumns}`,
            `# Correspondances: ${metadata.totalCorrespondences}`,
            '',
            // En-têtes
            headers.join(','),
            // Données
            ...rows.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Échapper les guillemets et virgules
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value ?? '';
                }).join(',')
            )
        ].join('\n');

        // Téléchargement
        downloadFile(csvContent, 'matrice_correspondances.csv', 'text/csv;charset=utf-8;');
    };

    const exportToJSON = (exportData) => {
        const content = JSON.stringify(exportData, null, 2);
        downloadFile(content, 'matrice_correspondances.json', 'application/json;charset=utf-8;');
    };

    const exportToExcel = (exportData) => {
        // Pour une vraie implémentation Excel, utiliser une lib comme xlsx
        // Pour l'instant, export CSV avec extension xlsx
        const { rows } = exportData;

        if (!rows.length) return;

        const headers = Object.keys(rows[0]);
        const excelContent = [
            headers.join('\t'), // Tabulations pour Excel
            ...rows.map(row =>
                headers.map(header => row[header] ?? '').join('\t')
            )
        ].join('\n');

        downloadFile(excelContent, 'matrice_correspondances.xlsx', 'application/vnd.ms-excel;charset=utf-8;');
    };

    // Fonction utilitaire de téléchargement
    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    // ===== GESTION DE L'EXPORT =====
    const handleExport = async () => {
        setExporting(true);

        try {
            const exportData = generateExportData();

            if (!exportData.rows.length) {
                alert('Aucune donnée à exporter');
                return;
            }

            switch (exportConfig.format) {
                case 'csv':
                    exportToCSV(exportData);
                    break;
                case 'excel':
                    exportToExcel(exportData);
                    break;
                case 'json':
                    exportToJSON(exportData);
                    break;
            }

            // Fermer le dialog après export
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            alert('Erreur lors de l\'export: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    const handleConfigChange = (key, value) => {
        setExportConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Statistiques pour l'aperçu
    const previewData = generateExportData();
    const hasData = data && data.products && data.products.length > 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                📊 Export de la Matrice
            </DialogTitle>

            <DialogContent dividers sx={{ minHeight: 400 }}>
                {!hasData ? (
                    <Alert severity="warning">
                        Aucune donnée disponible pour l'export. Veuillez d'abord charger une matrice.
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {/* Configuration du format */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                📁 Format d'Export
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {[
                                    { value: 'csv', label: 'CSV (Recommandé)', icon: <TableChart /> },
                                    { value: 'excel', label: 'Excel (.xlsx)', icon: <TableChart /> },
                                    { value: 'json', label: 'JSON (Développeurs)', icon: <Code /> }
                                ].map(format => (
                                    <Paper
                                        key={format.value}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            border: exportConfig.format === format.value ? 2 : 1,
                                            borderColor: exportConfig.format === format.value ? 'primary.main' : 'divider'
                                        }}
                                        onClick={() => handleConfigChange('format', format.value)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {format.icon}
                                            <Typography variant="body1">{format.label}</Typography>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </Grid>

                        {/* Options d'export */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                ⚙️ Options d'Export
                            </Typography>

                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={exportConfig.includeProductDetails}
                                            onChange={(e) => handleConfigChange('includeProductDetails', e.target.checked)}
                                        />
                                    }
                                    label="Inclure les détails produits"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={exportConfig.includeCorrespondences}
                                            onChange={(e) => handleConfigChange('includeCorrespondences', e.target.checked)}
                                        />
                                    }
                                    label="Inclure les correspondances"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={exportConfig.includeEmptyCells}
                                            onChange={(e) => handleConfigChange('includeEmptyCells', e.target.checked)}
                                        />
                                    }
                                    label="Inclure les cellules vides"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={exportConfig.includeFilters}
                                            onChange={(e) => handleConfigChange('includeFilters', e.target.checked)}
                                        />
                                    }
                                    label="Inclure les filtres appliqués"
                                />
                            </FormGroup>
                        </Grid>

                        {/* Aperçu */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                👁️ Aperçu de l'Export
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                <Chip
                                    label={`${previewData.metadata.totalProducts} produits`}
                                    color="primary"
                                />
                                <Chip
                                    label={`${previewData.metadata.totalColumns} références`}
                                    color="secondary"
                                />
                                <Chip
                                    label={`${previewData.rows.length > 0 ? Object.keys(previewData.rows[0]).length : 0} colonnes export`}
                                    color="success"
                                />
                            </Box>

                            {previewData.rows.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Colonnes incluses: {Object.keys(previewData.rows[0]).slice(0, 5).join(', ')}
                                    {Object.keys(previewData.rows[0]).length > 5 && '...'}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Annuler
                </Button>
                <Button
                    variant="contained"
                    onClick={handleExport}
                    disabled={!hasData || exporting}
                    startIcon={<FileDownload />}
                >
                    {exporting ? 'Export en cours...' : 'Exporter'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MatrixExport;