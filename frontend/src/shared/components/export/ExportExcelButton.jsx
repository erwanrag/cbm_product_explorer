// ===================================
// 📁 frontend/src/shared/components/export/ExportExcelButton.jsx - AMÉLIORER
// ===================================

import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { Download, TableChart, Code, PictureAsPdf } from '@mui/icons-material';
import { toast } from 'react-toastify';

// Import utilitaires CBM
import { exportToCSV, exportToJSON, exportToHTML } from '@/lib/exportUtils';

/**
 * Bouton d'export multi-format CBM
 */
export default function ExportExcelButton({
    data = [],
    filename = 'export_cbm',
    formats = ['csv', 'json', 'html'],
    disabled = false,
    variant = 'outlined',
    size = 'medium',
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

    const handleExport = async (format) => {
        setLoading(true);
        setAnchorEl(null);

        try {
            switch (format) {
                case 'csv':
                    exportToCSV(data, filename);
                    toast.success('Données exportées en CSV');
                    break;
                case 'json':
                    exportToJSON(data, filename);
                    toast.success('Données exportées en JSON');
                    break;
                case 'html':
                    exportToHTML({
                        title: 'Rapport CBM GRC Matcher',
                        data,
                        summary: `Export de ${data.length} éléments`
                    }, filename);
                    toast.success('Rapport généré en HTML');
                    break;
                default:
                    throw new Error(`Format ${format} non supporté`);
            }
        } catch (error) {
            console.error('Erreur export:', error);
            toast.error('Erreur lors de l\'export');
        } finally {
            setLoading(false);
        }
    };

    const formatConfig = {
        csv: { label: 'Excel (CSV)', icon: TableChart, description: 'Compatible Excel' },
        json: { label: 'JSON', icon: Code, description: 'Format développeur' },
        html: { label: 'Rapport HTML', icon: PictureAsPdf, description: 'Rapport imprimable' }
    };

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
                    fontWeight: 600
                }}
                {...props}
            >
                {loading ? 'Export...' : 'Exporter'}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        minWidth: 200,
                        mt: 1,
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }
                }}
            >
                {formats.map((format) => {
                    const config = formatConfig[format];
                    if (!config) return null;

                    const Icon = config.icon;

                    return (
                        <MenuItem
                            key={format}
                            onClick={() => handleExport(format)}
                            sx={{
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText'
                                }
                            }}
                        >
                            <ListItemIcon>
                                <Icon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary={config.label}
                                secondary={config.description}
                                primaryTypographyProps={{ fontWeight: 600 }}
                            />
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
