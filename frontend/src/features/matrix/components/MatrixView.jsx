import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Tooltip,
    IconButton,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Info,
    Refresh,
    FileDownload
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useMatrixData } from '../hooks/useMatrixData';
import MatrixFilters from './MatrixFilters';
import MatrixLegend from './MatrixLegend';

/**
 * Composant principal de la vue matricielle
 */
export default function MatrixView({ identifier, onProductClick }) {
    const {
        data,
        loading,
        error,
        loadMatrixDataWithFilters,
        refresh,
        hasData,
        productsCount,
        columnsCount
    } = useMatrixData(identifier);

    const [filters, setFilters] = useState({
        qualite: null,
        famille: null,
        statut: null,
        search_term: null
    });

    // ===== COLONNES DYNAMIQUES =====
    const columns = useMemo(() => {
        const baseColumns = [
            {
                field: 'cod_pro',
                headerName: 'Code Produit',
                width: 130,
                pinned: 'left',
                renderCell: ({ row }) => (
                    <Typography
                        variant="body2"
                        sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => onProductClick?.(row)}
                    >
                        {row.cod_pro}
                    </Typography>
                )
            },
            {
                field: 'ref_int',
                headerName: 'Référence Interne',
                width: 180,
                pinned: 'left'
            },
            {
                field: 'designation',
                headerName: 'Désignation',
                width: 250,
                pinned: 'left'
            },
            {
                field: 'qualite',
                headerName: 'Qualité',
                width: 100,
                pinned: 'left',
                renderCell: ({ value }) => (
                    <Chip
                        label={value}
                        size="small"
                        variant="outlined"
                        color={value === 'OEM' ? 'primary' : 'default'}
                    />
                )
            },
            {
                field: 'stock',
                headerName: 'Stock',
                width: 100,
                pinned: 'left',
                type: 'number'
            }
        ];

        // Colonnes dynamiques pour chaque référence
        const dynamicColumns = data.columnRefs.map((colRef) => ({
            field: `ref_${colRef.ref}`,
            headerName: colRef.ref,
            width: 140,
            renderHeader: () => (
                <Tooltip title={`Type: ${colRef.type} | ${_getColumnTypeLabel(colRef.type)}`}>
                    <Chip
                        label={colRef.ref}
                        size="small"
                        sx={{
                            bgcolor: colRef.color_code,
                            color: '#000',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            maxWidth: '130px'
                        }}
                    />
                </Tooltip>
            ),
            renderCell: ({ row }) => {
                const cellData = _getCellData(row.cod_pro, colRef.ref, data.correspondences);
                return (
                    <MatrixCell
                        cellData={cellData}
                        onCellClick={() => _handleCellClick(row, colRef, cellData)}
                    />
                );
            },
            sortable: false,
            filterable: false
        }));

        return [...baseColumns, ...dynamicColumns];
    }, [data.columnRefs, data.correspondences, onProductClick]);

    // ===== DONNÉES POUR LE DATAGRID =====
    const rows = useMemo(() => {
        return data.products.map((product, index) => ({
            id: index,
            ...product,
            // Ajout des champs dynamiques pour chaque référence (optionnel, utilisé par le rendering)
            ...data.columnRefs.reduce((acc, colRef) => {
                acc[`ref_${colRef.ref}`] = colRef.ref;
                return acc;
            }, {})
        }));
    }, [data.products, data.columnRefs]);

    // ===== GESTIONNAIRES D'ÉVÉNEMENTS =====
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        if (identifier) {
            loadMatrixDataWithFilters(identifier, newFilters);
        }
    };

    const _handleCellClick = (product, columnRef, cellData) => {
        console.log('🔍 Clic cellule:', { product, columnRef, cellData });
        // TODO: Implémenter drill-down ou modal détails
    };

    // ===== FONCTIONS UTILITAIRES =====
    const _getCellData = (codPro, ref, correspondences) => {
        const matches = correspondences.filter(c => c.cod_pro === codPro);
        const crnMatch = matches.find(c => c.ref_crn === ref);
        const extMatch = matches.find(c => c.ref_ext === ref);

        const hasCorrespondence = !!(crnMatch || extMatch);

        let matchType = 'none';
        if (crnMatch && extMatch) matchType = 'both';
        else if (crnMatch) matchType = 'crn';
        else if (extMatch) matchType = 'ext';

        return {
            codPro,
            ref,
            hasCorrespondence,
            refCrnMatch: crnMatch?.ref_crn || null,
            refExtMatch: extMatch?.ref_ext || null,
            matchType
        };
    };

    const _getColumnTypeLabel = (type) => {
        switch (type) {
            case 'crn_only': return 'Référence Constructeur uniquement';
            case 'ext_only': return 'Référence Externe uniquement';
            case 'both': return 'Présente dans CRN et EXT';
            default: return 'Type inconnu';
        }
    };

    // ===== RENDU =====
    if (error) {
        return (
            <Alert
                severity="error"
                action={
                    <IconButton size="small" onClick={refresh}>
                        <Refresh />
                    </IconButton>
                }
            >
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            {/* En-tête avec stats */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        🎯 Vue Matricielle
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {hasData ? (
                            `${productsCount} produits × ${columnsCount} références`
                        ) : (
                            'Aucune donnée à afficher'
                        )}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                    <IconButton onClick={refresh} disabled={loading}>
                        <Refresh />
                    </IconButton>
                    <IconButton disabled>
                        <FileDownload />
                    </IconButton>
                </Grid>
            </Grid>

            {/* Filtres */}
            <MatrixFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                disabled={loading}
            />

            {/* Légende */}
            <MatrixLegend sx={{ mb: 2 }} />

            {/* Tableau principal */}
            <Paper elevation={1}>
                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight={400}
                    >
                        <CircularProgress />
                    </Box>
                ) : hasData ? (
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={25}
                        rowsPerPageOptions={[25, 50, 100]}
                        disableSelectionOnClick
                        autoHeight
                        density="compact"
                        sx={{
                            '& .MuiDataGrid-cell': {
                                fontSize: '0.875rem'
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f5f5f5',
                                fontWeight: 600
                            }
                        }}
                    />
                ) : (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight={300}
                        flexDirection="column"
                    >
                        <Info color="disabled" sx={{ fontSize: 64, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Aucune donnée trouvée
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Vérifiez vos critères de recherche
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

/**
 * Composant pour une cellule de la matrice
 */
const MatrixCell = ({ cellData, onCellClick }) => {
    const { hasCorrespondence, matchType } = cellData;

    const getCellStyle = () => {
        if (!hasCorrespondence) {
            return {
                bgcolor: '#ffcdd2', // Rouge clair
                color: '#000'
            };
        }

        switch (matchType) {
            case 'both':
                return { bgcolor: '#d1c4e9', color: '#000' }; // Violet
            case 'crn':
                return { bgcolor: '#a5d6a7', color: '#000' }; // Vert
            case 'ext':
                return { bgcolor: '#90caf9', color: '#000' }; // Bleu
            default:
                return { bgcolor: '#f5f5f5', color: '#000' };
        }
    };

    const getIcon = () => {
        return hasCorrespondence ? (
            <CheckCircle sx={{ fontSize: 16 }} />
        ) : (
            <Cancel sx={{ fontSize: 16 }} />
        );
    };

    const getTooltipText = () => {
        if (!hasCorrespondence) {
            return 'Aucune correspondance';
        }

        const parts = [];
        if (cellData.refCrnMatch) parts.push(`CRN: ${cellData.refCrnMatch}`);
        if (cellData.refExtMatch) parts.push(`EXT: ${cellData.refExtMatch}`);

        return parts.join(' | ') || 'Correspondance trouvée';
    };

    return (
        <Tooltip title={getTooltipText()}>
            <Box
                sx={{
                    ...getCellStyle(),
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    textAlign: 'center',
                    cursor: hasCorrespondence ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': hasCorrespondence ? {
                        transform: 'scale(1.05)',
                        boxShadow: 1
                    } : {}
                }}
                onClick={hasCorrespondence ? onCellClick : undefined}
            >
                {getIcon()}
            </Box>
        </Tooltip>
    );
};