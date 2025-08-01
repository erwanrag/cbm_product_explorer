// ===================================
// 📁 frontend/src/features/matrix/components/MatrixTable.jsx - VERSION CORRIGÉE
// ===================================

import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    TextField,
    InputAdornment,
    Paper,
    IconButton,
    Tooltip,
    Switch,
    FormControlLabel,
    Grid
} from '@mui/material';
import { Search, Visibility, VisibilityOff, FileDownload } from '@mui/icons-material';

// ✅ IMPORT DES COULEURS CBM
import {
    getQualiteColor,
    getStatutColor,
    getQualiteLabel,
    getStatutLabel,
    QUALITE_COLORS,
    STATUT_COLORS
} from '@/constants/colors';

export default function MatrixTable({
    products = [],
    matches = [],
    columnRefs = [],
    columnVisibility = {},
    insights = null,
    onInspectProduct
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRefFilter, setSelectedRefFilter] = useState('');
    const [localColumnVisibility, setLocalColumnVisibility] = useState({
        details: true,
        designation: true,
        qualite: true,
        statut: true,
        famille: true,
        fournisseur: true,
        ...columnVisibility
    });

    // === 1. FILTRAGE DES PRODUITS ===
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const term = searchTerm.toLowerCase();
        return products.filter(product =>
            (product.refint && product.refint.toLowerCase().includes(term)) ||
            (product.nom_pro && product.nom_pro.toLowerCase().includes(term)) ||
            (product.cod_pro && product.cod_pro.toString().includes(term)) ||
            (product.famille && product.famille.toLowerCase().includes(term)) ||
            (product.nom_fou && product.nom_fou.toLowerCase().includes(term))
        );
    }, [products, searchTerm]);

    // === 2. FILTRAGE DES COLONNES PAR RÉFÉRENCE ===
    const filteredColumnRefs = useMemo(() => {
        if (!selectedRefFilter) return columnRefs;
        return columnRefs.filter(col => col.ref === selectedRefFilter);
    }, [columnRefs, selectedRefFilter]);

    // === 3. MAPPING PRODUIT → CORRESPONDANCES OPTIMISÉ ===
    const productRefsMap = useMemo(() => {
        const map = {};
        filteredProducts.forEach((p) => {
            const prodMatches = matches.filter((m) => m.cod_pro === p.cod_pro);
            map[p.cod_pro] = {
                crn: new Set(prodMatches.map((m) => m.ref_crn).filter(Boolean)),
                ext: new Set(prodMatches.map((m) => m.ref_ext).filter(Boolean)),
            };
        });
        return map;
    }, [filteredProducts, matches]);

    // === 4. CALCUL % MATCHING PAR PRODUIT ===
    const productMatchingStats = useMemo(() => {
        const stats = {};
        filteredProducts.forEach(product => {
            const productCorrespondences = matches.filter(c => c.cod_pro === product.cod_pro);
            const matchPercent = filteredColumnRefs.length > 0 ?
                (productCorrespondences.length / filteredColumnRefs.length) * 100 : 0;
            stats[product.cod_pro] = {
                matchPercent: matchPercent.toFixed(1),
                matchCount: productCorrespondences.length,
                totalRefs: filteredColumnRefs.length
            };
        });
        return stats;
    }, [filteredProducts, matches, filteredColumnRefs]);

    // === 5. EXPORT CSV FONCTIONNEL ===
    const handleExportCSV = () => {
        if (!filteredProducts.length) {
            alert('Aucune donnée à exporter');
            return;
        }

        const headers = [
            'Code Produit', 'Référence Interne', 'Désignation', 'Qualité', 'Statut',
            'Famille', 'Fournisseur', 'Pourcentage Match', 'Correspondances'
        ];

        // Ajouter les colonnes dynamiques
        filteredColumnRefs.forEach(col => {
            headers.push(`[${col.type}] ${col.ref}`);
        });

        const csvData = [headers.join(',')];

        filteredProducts.forEach(product => {
            const stats = productMatchingStats[product.cod_pro] || {};
            const row = [
                product.cod_pro,
                product.refint || '',
                `"${(product.nom_pro || '').replace(/"/g, '""')}"`, // Escape quotes
                product.qualite || '',
                getStatutLabel(product.statut),
                product.famille || '',
                product.nom_fou || '',
                stats.matchPercent || '0',
                `${stats.matchCount || 0}/${stats.totalRefs || 0}`
            ];

            // Ajouter les correspondances
            filteredColumnRefs.forEach(col => {
                const refType = productRefsMap[product.cod_pro] || { crn: new Set(), ext: new Set() };
                const inCrn = refType.crn.has(col.ref);
                const inExt = refType.ext.has(col.ref);

                if (inCrn && inExt) row.push('CRN+EXT');
                else if (inCrn) row.push('CRN');
                else if (inExt) row.push('EXT');
                else row.push('NON');
            });

            csvData.push(row.join(','));
        });

        // Téléchargement
        const blob = new Blob([csvData.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `matrice_correspondances_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box>
            
            {/* En-tête avec stats */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    🗂️ Matrice Produits – <strong>{filteredProducts.length}</strong> produit(s)
                    {searchTerm && ` (filtré sur "${searchTerm}")`}
                    {selectedRefFilter && ` • Référence: ${selectedRefFilter}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {filteredColumnRefs.length} colonne(s) • {matches.length} correspondance(s)
                </Typography>
            </Box>

            {/* ✅ TABLE AVEC COULEURS CBM CORRECTES */}
            <Box sx={{
                height: 600,
                width: '100%',
                overflow: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 1
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                }}>
                    <thead style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            {/* Colonnes fixes */}
                            <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #ddd', minWidth: '120px' }}>
                                Code Produit
                            </th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #ddd', minWidth: '160px' }}>
                                Référence Interne
                            </th>
                            {localColumnVisibility.designation && (
                                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #ddd', minWidth: '200px' }}>
                                    Désignation
                                </th>
                            )}
                            <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd', minWidth: '100px' }}>
                                Qualité
                            </th>
                            <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd', minWidth: '80px' }}>
                                Statut
                            </th>
                            {localColumnVisibility.famille && (
                                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #ddd', minWidth: '120px' }}>
                                    Famille
                                </th>
                            )}
                            {localColumnVisibility.fournisseur && (
                                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #ddd', minWidth: '150px' }}>
                                    Fournisseur
                                </th>
                            )}
                            <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd', minWidth: '100px' }}>
                                % Match
                            </th>

                            {/* Colonnes dynamiques avec couleurs CBM backend */}
                            {filteredColumnRefs.map((col) => (
                                <th
                                    key={col.ref}
                                    style={{
                                        padding: '8px',
                                        textAlign: 'center',
                                        borderBottom: '2px solid #ddd',
                                        backgroundColor: col.color_code || (
                                            col.type === 'both' ? '#c8e6c9' :
                                                col.type === 'crn_only' ? '#bbdefb' :
                                                    '#ffcc80'
                                        ),
                                        minWidth: '120px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 9
                                    }}
                                    title={
                                        col.type === 'both' ? 'Présent dans CRN ET EXT' :
                                            col.type === 'crn_only' ? 'Présent uniquement dans CRN' :
                                                'Présent uniquement dans EXT'
                                    }
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                        <span>{col.ref}</span>
                                        <Chip
                                            label={col.type === 'both' ? 'C+E' : col.type === 'crn_only' ? 'CRN' : 'EXT'}
                                            size="small"
                                            sx={{
                                                fontSize: '0.6rem',
                                                height: '16px',
                                                bgcolor: 'rgba(255,255,255,0.7)'
                                            }}
                                        />
                                    </Box>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product, index) => {
                            const stats = productMatchingStats[product.cod_pro] || {};

                            return (
                                <tr
                                    key={product.cod_pro}
                                    style={{
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                                    }}
                                >
                                    {/* Colonnes fixes avec toutes les infos */}
                                    <td style={{ padding: '8px', fontWeight: 'bold', color: '#1976d2' }}>
                                        {product.cod_pro}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        {product.refint || '-'}
                                    </td>
                                    {localColumnVisibility.designation && (
                                        <td style={{ padding: '8px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {product.nom_pro || product.refint || '-'}
                                        </td>
                                    )}

                                    {/* ✅ QUALITÉ AVEC COULEURS CBM */}
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <Chip
                                            label={getQualiteLabel(product.qualite)}
                                            size="small"
                                            sx={{
                                                bgcolor: getQualiteColor(product.qualite),
                                                color: '#fff',
                                                fontWeight: 600,
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </td>

                                    {/* ✅ STATUT AVEC COULEURS CBM */}
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <Chip
                                            label={getStatutLabel(product.statut)}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatutColor(product.statut),
                                                color: '#fff',
                                                fontWeight: 600,
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </td>

                                    {localColumnVisibility.famille && (
                                        <td style={{ padding: '8px' }}>
                                            {product.famille || '-'}
                                        </td>
                                    )}
                                    {localColumnVisibility.fournisseur && (
                                        <td style={{ padding: '8px' }}>
                                            {product.nom_fou || '-'}
                                        </td>
                                    )}

                                    {/* % Matching avec couleur */}
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <Chip
                                            label={`${stats.matchPercent || 0}%`}
                                            size="small"
                                            sx={{
                                                bgcolor:
                                                    parseFloat(stats.matchPercent || 0) >= 80 ? '#4caf50' :
                                                        parseFloat(stats.matchPercent || 0) >= 50 ? '#ff9800' : '#f44336',
                                                color: '#fff',
                                                fontWeight: 600
                                            }}
                                        />
                                    </td>

                                    {/* Cellules correspondances avec symboles CBM */}
                                    {filteredColumnRefs.map((col) => {
                                        const refType = productRefsMap[product.cod_pro] || { crn: new Set(), ext: new Set() };
                                        const inCrn = refType.crn.has(col.ref);
                                        const inExt = refType.ext.has(col.ref);

                                        let color = '#ffcdd2'; // rouge clair par défaut
                                        let symbol = '✗';
                                        let tooltip = 'Aucune correspondance';

                                        if (inCrn && inExt) {
                                            color = '#d1c4e9'; // violet
                                            symbol = '⚡';
                                            tooltip = `Double correspondance CRN + EXT: ${col.ref}`;
                                        } else if (inCrn) {
                                            color = '#a5d6a7'; // vert
                                            symbol = 'C';
                                            tooltip = `Correspondance CRN: ${col.ref}`;
                                        } else if (inExt) {
                                            color = '#90caf9'; // bleu
                                            symbol = 'E';
                                            tooltip = `Correspondance EXT: ${col.ref}`;
                                        }

                                        return (
                                            <td key={col.ref} style={{ padding: '8px', textAlign: 'center' }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: color,
                                                        borderRadius: '4px',
                                                        padding: '4px 8px',
                                                        fontWeight: 600,
                                                        cursor: inCrn || inExt ? 'pointer' : 'default',
                                                        display: 'inline-block',
                                                        minWidth: '24px',
                                                        fontSize: symbol === '⚡' ? '1.1rem' : '0.875rem',
                                                        '&:hover': inCrn || inExt ? {
                                                            bgcolor: color.replace(')', ', 0.8)').replace('rgb', 'rgba'),
                                                            transform: 'scale(1.1)'
                                                        } : {}
                                                    }}
                                                    onClick={() => {
                                                        if (inCrn || inExt) {
                                                            onInspectProduct({
                                                                ...product,
                                                                selectedRef: col.ref,
                                                                matchType: inCrn && inExt ? 'both' : inCrn ? 'crn' : 'ext'
                                                            });
                                                        }
                                                    }}
                                                    title={tooltip}
                                                >
                                                    {symbol}
                                                </Box>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography variant="h6" gutterBottom>Aucun produit à afficher</Typography>
                        <Typography variant="body2">
                            {searchTerm ? 'Aucun résultat pour votre recherche' : 'Utilisez les filtres pour charger des données'}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ✅ LÉGENDE SYMBOLES */}
            <Paper sx={{ p: 2, mt: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="subtitle2" gutterBottom>📍 Légende des correspondances :</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ bgcolor: '#d1c4e9', borderRadius: '4px', p: 0.5, fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>⚡</Box>
                        <Typography variant="caption">Double correspondance (CRN + EXT)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ bgcolor: '#a5d6a7', borderRadius: '4px', p: 0.5, fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>C</Box>
                        <Typography variant="caption">Correspondance CRN uniquement</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ bgcolor: '#90caf9', borderRadius: '4px', p: 0.5, fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>E</Box>
                        <Typography variant="caption">Correspondance EXT uniquement</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ bgcolor: '#ffcdd2', borderRadius: '4px', p: 0.5, fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>✗</Box>
                        <Typography variant="caption">Aucune correspondance</Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}