// ===================================
// 📁 frontend/src/shared/components/export/ExportExcelButton.jsx - COMPOSANT MUTUALISÉ
// ===================================

import React, { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Typography,
    Divider,
} from '@mui/material';
import { Download, TableChart, Code, Description } from '@mui/icons-material';
import { toast } from 'react-toastify';

// Import utilitaires CBM existants
import { exportToCSV, exportToJSON } from '@/lib/exportUtils';

/**
 * Bouton d'export multi-format CBM - Composant mutualisé
 */
export default function ExportExcelButton({
    data = [],
    filename = 'export_cbm',
    formats = ['csv', 'json', 'html'],
    disabled = false,
    variant = 'outlined',
    size = 'medium',
    title = 'Exporter',
    ...props
}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        if (data.length === 0) {
            toast.warn('Aucune donnée à exporter');
            return;
        }
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Export HTML avec formatage CBM
    const exportToHTML = (data, filename) => {
        if (!data || data.length === 0) {
            throw new Error('Aucune donnée à exporter');
        }

        const headers = Object.keys(data[0]);
        const title = `Rapport CBM - Export`;

        const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
        .header { border-bottom: 3px solid #1976d2; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { color: #1976d2; margin: 0; font-size: 24px; }
        .header .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2; }
        .summary h2 { margin-top: 0; color: #1976d2; font-size: 18px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #1976d2; color: white; font-weight: bold; position: sticky; top: 0; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        tr:hover { background-color: #e3f2fd; }
        .number { text-align: right; font-weight: 500; }
        .currency { text-align: right; font-weight: 500; color: #1976d2; }
        .percentage { text-align: right; font-weight: 500; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        .export-info { text-align: center; }
        @media print {
            body { margin: 0; }
            .header { page-break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="subtitle">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
    </div>
    
    <div class="summary">
        <h2>📊 Résumé</h2>
        <p><strong>Nombre de lignes :</strong> ${data.length.toLocaleString('fr-FR')}</p>
        <p><strong>Colonnes :</strong> ${headers.length}</p>
        <p><strong>Fichier source :</strong> ${filename}</p>
    </div>
    
    <h2>📋 Données détaillées</h2>
    <table>
        <thead>
            <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    ${headers.map(header => {
            const value = row[header];
            let cellClass = '';
            let formattedValue = value ?? '';

            // Formatage spécial pour certains types de données
            if (header.includes('€') || header.toLowerCase().includes('prix') || header.toLowerCase().includes('ca')) {
                cellClass = 'currency';
            } else if (header.includes('%') || header.toLowerCase().includes('marge') || header.toLowerCase().includes('percent')) {
                cellClass = 'percentage';
            } else if (typeof value === 'number') {
                cellClass = 'number';
                formattedValue = value.toLocaleString('fr-FR');
            }

            return `<td class="${cellClass}">${formattedValue}</td>`;
        }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <div class="export-info">
            <p><strong>CBM Product Explorer</strong> - Rapport généré automatiquement</p>
            <p>Pour toute question, contactez l'équipe technique</p>
        </div>
    </div>
</body>
</html>`;

        // Téléchargement avec BOM pour le français
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.html`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    const handleExport = async (format) => {
        setLoading(true);
        setAnchorEl(null);

        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const filenameWithDate = `${filename}-${timestamp}`;

            switch (format) {
                case 'csv':
                    exportToCSV(data, filenameWithDate);
                    toast.success(`✅ Export CSV réussi (${data.length} lignes)`);
                    break;

                case 'json':
                    exportToJSON(data, filenameWithDate);
                    toast.success(`✅ Export JSON réussi (${data.length} éléments)`);
                    break;

                case 'html':
                    exportToHTML(data, filenameWithDate);
                    toast.success(`✅ Rapport HTML généré (${data.length} lignes)`);
                    break;

                default:
                    throw new Error(`Format ${format} non supporté`);
            }
        } catch (error) {
            console.error('Erreur export:', error);
            toast.error(`❌ Erreur lors de l'export: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatConfig = {
        csv: {
            label: 'Excel (CSV)',
            icon: TableChart,
            description: 'Compatible Excel/LibreOffice',
            color: '#4caf50'
        },
        json: {
            label: 'JSON',
            icon: Code,
            description: 'Format développeur/API',
            color: '#ff9800'
        },
        html: {
            label: 'Rapport HTML',
            icon: Description,
            description: 'Rapport imprimable/web',
            color: '#2196f3'
        },
    };

    // Filtrer les formats disponibles
    const availableFormats = formats.filter(format => formatConfig[format]);

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={handleClick}
                disabled={disabled || loading || data.length === 0}
                startIcon={loading ? <CircularProgress size={16} /> : <Download />}
                sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 120,
                }}
                {...props}
            >
                {loading ? 'Export...' : title}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        minWidth: 220,
                        mt: 1
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem disabled sx={{ opacity: 1 }}>
                    <Typography variant="subtitle2" color="primary" fontWeight={600}>
                        📊 Exporter {data.length} lignes
                    </Typography>
                </MenuItem>
                <Divider />

                {availableFormats.map((format) => {
                    const config = formatConfig[format];
                    return (
                        <MenuItem
                            key={format}
                            onClick={() => handleExport(format)}
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                '&:hover': {
                                    backgroundColor: `${config.color}10`,
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: config.color }}>
                                <config.icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={config.label}
                                secondary={config.description}
                                primaryTypographyProps={{ fontWeight: 500 }}
                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                            />
                        </MenuItem>
                    );
                })}

                <Divider />
                <MenuItem onClick={handleClose} sx={{ justifyContent: 'center', py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        Annuler
                    </Typography>
                </MenuItem>
            </Menu>
        </>
    );
}