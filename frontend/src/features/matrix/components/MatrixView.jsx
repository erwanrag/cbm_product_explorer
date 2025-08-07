// ===================================
// 📁 frontend/src/features/matrix/components/MatrixView.jsx - VERSION COMPLÈTE
// ===================================

import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Tooltip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Info,
    Refresh
} from '@mui/icons-material';

/**
 * Composant principal de la vue matricielle
 */
export default function MatrixView({
    data,
    columnVisibility = {},
    onProductClick
}) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);

    // ✅ VÉRIFICATION DES DONNÉES
    const hasData = useMemo(() => {
        return data &&
            data.products &&
            data.products.length > 0 &&
            data.column_refs &&
            data.correspondences;
    }, [data]);

    // ✅ COLONNES VISIBLES
    const visibleColumns = useMemo(() => {
        const baseColumns = [
            { key: 'cod_pro', label: 'Code', width: 100, sticky: true },
            { key: 'ref_int', label: 'Réf. Interne', width: 150, sticky: true }
        ];

        // Colonnes détails conditionnelles
        if (columnVisibility.details !== false) {
            if (columnVisibility.designation !== false) {
                baseColumns.push({ key: 'designation', label: 'Désignation', width: 200 });
            }
            if (columnVisibility.qualite !== false) {
                baseColumns.push({ key: 'qualite', label: 'Qualité', width: 80 });
            }
            if (columnVisibility.famille !== false) {
                baseColumns.push({ key: 'famille', label: 'Famille', width: 80 });
            }
            if (columnVisibility.statut !== false) {
                baseColumns.push({ key: 'statut', label: 'Statut', width: 80 });
            }
            if (columnVisibility.stock !== false) {
                baseColumns.push({ key: 'stock', label: 'Stock', width: 80 });
            }
        }

        return baseColumns;
    }, [columnVisibility]);

    // ✅ DONNÉES PAGINÉES
    const paginatedProducts = useMemo(() => {
        if (!hasData) return [];
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return data.products.slice(start, end);
    }, [data.products, page, rowsPerPage, hasData]);

    // ✅ GESTIONNAIRES D'ÉVÉNEMENTS
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // ✅ RENDU CONDITIONNEL
    if (!hasData) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Info color="disabled" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Aucune donnée à afficher
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Utilisez le panneau de filtres pour rechercher des produits
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={1}>
            <TableContainer sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader size="small">
                    {/* ✅ EN-TÊTE AVEC COLONNES FIXES + COLONNES DYNAMIQUES */}
                    <TableHead>
                        <TableRow>
                            {/* Colonnes fixes (produits) */}
                            {visibleColumns.map((col) => (
                                <TableCell
                                    key={col.key}
                                    sx={{
                                        width: col.width,
                                        minWidth: col.width,
                                        position: col.sticky ? 'sticky' : 'static',
                                        left: col.sticky ? (col.key === 'cod_pro' ? 0 : 100) : 'auto',
                                        zIndex: col.sticky ? 3 : 1,
                                        bgcolor: '#f5f5f5',
                                        fontWeight: 600,
                                        borderRight: col.sticky ? '1px solid #e0e0e0' : 'none'
                                    }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}

                            {/* Colonnes dynamiques (références) */}
                            {data.column_refs.map((colRef) => (
                                <TableCell
                                    key={colRef.ref}
                                    align="center"
                                    sx={{
                                        width: 120,
                                        minWidth: 120,
                                        bgcolor: '#f5f5f5',
                                        fontWeight: 600
                                    }}
                                >
                                    <Tooltip title={`Type: ${colRef.type} | ${getColumnTypeLabel(colRef.type)}`}>
                                        <Chip
                                            label={colRef.ref}
                                            size="small"
                                            sx={{
                                                bgcolor: colRef.color_code,
                                                color: '#000',
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                                maxWidth: '110px',
                                                cursor: 'help'
                                            }}
                                        />
                                    </Tooltip>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* ✅ CORPS DU TABLEAU */}
                    <TableBody>
                        {paginatedProducts.map((product, index) => (
                            <TableRow
                                key={product.cod_pro}
                                hover
                                sx={{
                                    '&:hover': { bgcolor: '#f8f9fa' },
                                    height: 48
                                }}
                            >
                                {/* Colonnes fixes */}
                                {visibleColumns.map((col) => (
                                    <TableCell
                                        key={col.key}
                                        sx={{
                                            position: col.sticky ? 'sticky' : 'static',
                                            left: col.sticky ? (col.key === 'cod_pro' ? 0 : 100) : 'auto',
                                            zIndex: col.sticky ? 2 : 1,
                                            bgcolor: col.sticky ? '#fff' : 'transparent',
                                            borderRight: col.sticky ? '1px solid #e0e0e0' : 'none',
                                            cursor: col.key === 'cod_pro' ? 'pointer' : 'default'
                                        }}
                                        onClick={col.key === 'cod_pro' ? () => onProductClick?.(product) : undefined}
                                    >
                                        {renderCellContent(product, col.key)}
                                    </TableCell>
                                ))}

                                {/* Cellules de correspondance */}
                                {data.column_refs.map((colRef) => (
                                    <TableCell
                                        key={colRef.ref}
                                        align="center"
                                        sx={{ p: 0.5 }}
                                    >
                                        <MatrixCell
                                            cellData={getCellData(product.cod_pro, colRef.ref, data.correspondences)}
                                            onCellClick={() => handleCellClick(product, colRef)}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ✅ PAGINATION */}
            <TablePagination
                component="div"
                count={data.products.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[25, 50, 100]}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                }
            />
        </Paper>
    );

    // ✅ FONCTIONS UTILITAIRES
    function renderCellContent(product, columnKey) {
        const value = product[columnKey];

        switch (columnKey) {
            case 'cod_pro':
                return (
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        {value}
                    </Typography>
                );
            case 'qualite':
                return (
                    <Chip
                        label={value}
                        size="small"
                        variant="outlined"
                        color={value === 'OEM' ? 'primary' : 'default'}
                    />
                );
            case 'statut':
                return (
                    <Chip
                        label={value === 0 ? 'Actif' : 'Inactif'}
                        size="small"
                        color={value === 0 ? 'success' : 'default'}
                        variant="outlined"
                    />
                );
            default:
                return (
                    <Typography variant="body2" noWrap>
                        {value || '-'}
                    </Typography>
                );
        }
    }

    function getCellData(codPro, ref, correspondences) {
        const matches = correspondences.filter(c => c.cod_pro === codPro);
        const crnMatch = matches.find(c => c.ref_crn === ref);
        const extMatch = matches.find(c => c.ref_ext === ref);

        const hasCorrespondence = !!(crnMatch || extMatch);

        let matchType = 'none';
        if (crnMatch && extMatch) {
            matchType = 'both';
        } else if (crnMatch) {
            matchType = 'crn';
        } else if (extMatch) {
            matchType = 'ext';
        }

        return {
            hasCorrespondence,
            matchType,
            crnMatch: crnMatch?.ref_crn,
            extMatch: extMatch?.ref_ext
        };
    }

    function handleCellClick(product, columnRef) {
        //console.log('🔍 Clic cellule:', {
            product: product.cod_pro,
            ref: columnRef.ref
        });
        // TODO: Implémenter drill-down ou modal détails
    }

    function getColumnTypeLabel(type) {
        switch (type) {
            case 'crn_only': return 'Référence constructeur uniquement';
            case 'ext_only': return 'Référence externe uniquement';
            case 'both': return 'Constructeur + Externe';
            default: return 'Type inconnu';
        }
    }
}

/**
 * ✅ COMPOSANT CELLULE DE LA MATRICE
 */
const MatrixCell = ({ cellData, onCellClick }) => {
    const { hasCorrespondence, matchType } = cellData;

    const getCellStyle = () => {
        if (!hasCorrespondence) {
            return {
                bgcolor: '#ffcdd2', // Rouge clair
                color: '#000',
                border: '1px solid #f5c6cb'
            };
        }

        switch (matchType) {
            case 'both':
                return {
                    bgcolor: '#d1c4e9', // Violet
                    color: '#000',
                    border: '1px solid #b39ddb'
                };
            case 'crn':
                return {
                    bgcolor: '#a5d6a7', // Vert
                    color: '#000',
                    border: '1px solid #81c784'
                };
            case 'ext':
                return {
                    bgcolor: '#90caf9', // Bleu
                    color: '#000',
                    border: '1px solid #64b5f6'
                };
            default:
                return {
                    bgcolor: '#f5f5f5',
                    color: '#000',
                    border: '1px solid #e0e0e0'
                };
        }
    };

    const getIcon = () => {
        return hasCorrespondence ?
            <CheckCircle sx={{ fontSize: 16 }} /> :
            <Cancel sx={{ fontSize: 16 }} />;
    };

    const getTooltipText = () => {
        if (!hasCorrespondence) {
            return 'Aucune correspondance';
        }

        switch (matchType) {
            case 'both':
                return `Correspondance CRN + EXT\nCRN: ${cellData.crnMatch}\nEXT: ${cellData.extMatch}`;
            case 'crn':
                return `Correspondance CRN: ${cellData.crnMatch}`;
            case 'ext':
                return `Correspondance EXT: ${cellData.extMatch}`;
            default:
                return 'Correspondance trouvée';
        }
    };

    return (
        <Tooltip title={getTooltipText()} arrow>
            <Box
                onClick={onCellClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    margin: 'auto',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: 2
                    },
                    ...getCellStyle()
                }}
            >
                {getIcon()}
            </Box>
        </Tooltip>
    );
};