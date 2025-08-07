// ===================================
// 📁 frontend/src/features/matrix/pages/MatrixPage.jsx - VERSION FINALE REACT QUERY
// ===================================

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    TextField,
    InputAdornment,
    Switch,
    FormControlLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    GridView,
    Help,
    Analytics,
    FileDownload,
    Settings,
    Search,
    Refresh
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

// ✅ NOUVEAU HOOK REACT QUERY
import { useMatrixData } from '../hooks/useMatrixData';

// Composants
import MatrixTable from '../components/MatrixTable';
import MatrixLegend from '../components/MatrixLegend';
import MatrixInsights from '../components/MatrixInsights';
import MatrixExport from '../components/MatrixExport';

const MatrixPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // ✅ ÉTATS LOCAUX
    const [showHelp, setShowHelp] = useState(false);
    const [showInsights, setShowInsights] = useState(true);
    const [showExport, setShowExport] = useState(false);
    const [showLocalFilters, setShowLocalFilters] = useState(false); // Renommé pour éviter le conflit

    // Contrôles de visibilité des colonnes avec toggle général
    const [columnVisibility, setColumnVisibility] = useState({
        details: true,
        designation: true,
        qualite: true,
        statut: true,
        famille: true,
        fournisseur: true
    });

    // Filtres locaux (recherche et référence) - MASQUÉS PAR DÉFAUT
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRefFilter, setSelectedRefFilter] = useState('');

    // ✅ CONSTRUCTION DES FILTRES DEPUIS URL
    const filtersFromUrl = useMemo(() => {
        const codProParam = searchParams.get('cod_pro');
        const refCrnParam = searchParams.get('ref_crn');
        const refExtParam = searchParams.get('ref_ext');
        const refIntParam = searchParams.get('refint');
        const groupingParam = searchParams.get('grouping_crn');

        // Si on a des paramètres URL, les utiliser
        if (codProParam || refCrnParam || refExtParam || refIntParam) {
            return {
                cod_pro: codProParam ? parseInt(codProParam) : null,
                ref_crn: refCrnParam || null,
                ref_ext: refExtParam || null,
                refint: refIntParam || null,
                grouping_crn: groupingParam === '1' ? 1 : 0,
            };
        }

        return null;
    }, [
        searchParams.get('cod_pro'),
        searchParams.get('ref_crn'),
        searchParams.get('ref_ext'),
        searchParams.get('refint'),
        searchParams.get('grouping_crn')
    ]);

    // ✅ HOOK REACT QUERY
    const {
        matrixData,
        isLoading,
        isError,
        error,
        refreshData,
        isFetching,
        hasData,
        productsCount,
        columnsCount,
        correspondencesCount
    } = useMatrixData(filtersFromUrl);

    // ✅ DONNÉES FILTRÉES LOCALEMENT
    const filteredData = useMemo(() => {
        if (!matrixData) return null;

        let filteredProducts = matrixData.products || [];
        let filteredColumnRefs = matrixData.columnRefs || [];
        let filteredCorrespondences = matrixData.correspondences || [];

        // Filtrage par terme de recherche
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(product =>
                (product.refint && product.refint.toLowerCase().includes(term)) ||
                (product.nom_pro && product.nom_pro.toLowerCase().includes(term)) ||
                (product.cod_pro && product.cod_pro.toString().includes(term)) ||
                (product.famille && product.famille.toString().toLowerCase().includes(term)) ||
                (product.nom_fou && product.nom_fou.toLowerCase().includes(term))
            );
        }

        // Filtrage par référence sélectionnée
        if (selectedRefFilter) {
            filteredColumnRefs = filteredColumnRefs.filter(col => col.ref === selectedRefFilter);
            filteredCorrespondences = filteredCorrespondences.filter(corr =>
                corr.ref_crn === selectedRefFilter || corr.ref_ext === selectedRefFilter
            );
        }

        return {
            products: filteredProducts,
            columnRefs: filteredColumnRefs,
            correspondences: filteredCorrespondences
        };
    }, [matrixData, searchTerm, selectedRefFilter]);

    // ✅ INSIGHTS CALCULÉS
    const insights = useMemo(() => {
        if (!filteredData || !filteredData.products.length) return null;

        const { products, correspondences, columnRefs } = filteredData;

        // Distribution par qualité (ordre CBM correct)
        const qualityOrder = ['OE', 'OEM', 'PMQ', 'PMV'];
        const qualityDistribution = qualityOrder.reduce((acc, quality) => {
            acc[quality] = products.filter(p => p.qualite === quality).length;
            return acc;
        }, {});

        // Distribution des statuts
        const statusDistribution = {
            active: products.filter(p => p.statut === 0).length,
            inactive: products.filter(p => p.statut !== 0).length
        };

        // Taux de matching global
        const totalCells = products.length * columnRefs.length;
        const matchRate = totalCells > 0 ? (correspondences.length / totalCells) * 100 : 0;

        // Matching par produit
        const productMatching = products.map(product => {
            const productCorrespondences = correspondences.filter(c => c.cod_pro === product.cod_pro);
            const matchPercent = columnRefs.length > 0 ? (productCorrespondences.length / columnRefs.length) * 100 : 0;
            return {
                ...product,
                matchPercent,
                matchCount: productCorrespondences.length
            };
        }).sort((a, b) => b.matchPercent - a.matchPercent);

        return {
            matchRate,
            qualityDistribution,
            statusDistribution,
            productMatching,
            bestMatches: productMatching.slice(0, 5),
            avgMatchPercent: productMatching.reduce((sum, p) => sum + p.matchPercent, 0) / productMatching.length || 0
        };
    }, [filteredData]);

    // ✅ GESTIONNAIRES
    const handleInspectProduct = (product) => {
        //console.log('🔍 Inspection produit:', product);
        // TODO: Ouvrir modal ou naviguer vers détail produit
    };

    const handleColumnVisibilityChange = (column, visible) => {
        setColumnVisibility(prev => ({
            ...prev,
            [column]: visible
        }));
    };

    // Toggle général pour toutes les colonnes de détails
    const handleToggleAllDetails = () => {
        const newDetailsState = !columnVisibility.details;
        setColumnVisibility(prev => ({
            ...prev,
            details: newDetailsState,
            designation: newDetailsState,
            qualite: newDetailsState,
            statut: newDetailsState,
            famille: newDetailsState,
            fournisseur: newDetailsState
        }));
    };

    const handleFiltersChange = (newFilters) => {
        // Mettre à jour l'URL avec les nouveaux filtres
        const newParams = new URLSearchParams();

        if (newFilters.cod_pro) newParams.set('cod_pro', newFilters.cod_pro);
        if (newFilters.ref_crn) newParams.set('ref_crn', newFilters.ref_crn);
        if (newFilters.ref_ext) newParams.set('ref_ext', newFilters.ref_ext);
        if (newFilters.refint) newParams.set('refint', newFilters.refint);
        if (newFilters.grouping_crn) newParams.set('grouping_crn', '1');

        setSearchParams(newParams);
    };

    const handleExportData = () => {
        if (!filteredData) return;

        setShowExport(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* ✅ EN-TÊTE */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Grid item>
                    <GridView color="primary" sx={{ fontSize: 32 }} />
                </Grid>
                <Grid item xs>
                    <Typography variant="h4" fontWeight={600}>
                        Matrice de Correspondance CBM
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Visualisation croisée des correspondances produits constructeur/externe
                        {hasData && (
                            <span> • {productsCount} produits • {columnsCount} références constructeurs/externes• {correspondencesCount} correspondances</span>
                        )}
                    </Typography>
                </Grid>
                <Grid item>
                    <Tooltip title="Afficher/masquer filtres locaux">
                        <IconButton
                            onClick={() => setShowLocalFilters(!showLocalFilters)}
                            color={showLocalFilters ? "primary" : "default"}
                        >
                            <Search />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Analyses et insights">
                        <IconButton
                            onClick={() => setShowInsights(!showInsights)}
                            color={showInsights ? "primary" : "default"}
                        >
                            <Analytics />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Actualiser les données">
                        <IconButton
                            onClick={refreshData}
                            disabled={isLoading || isFetching}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Exporter les données">
                        <span>
                            <IconButton
                                onClick={handleExportData}
                                color="secondary"
                                disabled={!hasData}
                            >
                                <FileDownload />
                            </IconButton>
                        </span>
                    </Tooltip>

                </Grid>
                <Grid item>
                    <Tooltip title="Aide complète">
                        <IconButton onClick={() => setShowHelp(true)}>
                            <Help />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>

            {/* ✅ GESTION DES ERREURS */}
            {isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>Erreur:</strong> {error?.message || 'Erreur inconnue'}
                    <Button size="small" onClick={refreshData} sx={{ ml: 2 }}>
                        Réessayer
                    </Button>
                </Alert>
            )}

            {/* ✅ FILTRES LOCAUX (CONDITIONNELS - PAS D'AVANCÉS) */}
            {showLocalFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            🔍 Filtres Locaux
                        </Typography>
                        <Grid container spacing={3} alignItems="center">
                            {/* Recherche locale */}
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Rechercher dans les produits..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            {/* Filtre par référence - CORRIGÉ */}
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    select
                                    SelectProps={{ native: true }}
                                    value={selectedRefFilter}
                                    onChange={(e) => setSelectedRefFilter(e.target.value)}
                                    placeholder="Sélectionner une référence"
                                >
                                    <option value="">Toutes les références</option>
                                    {matrixData?.columnRefs?.map(col => (
                                        <option key={col.ref} value={col.ref}>
                                            [{col.type}] {col.ref}
                                        </option>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Contrôles colonnes améliorés */}
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {/* Toggle général */}
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={columnVisibility.details}
                                                onChange={handleToggleAllDetails}
                                            />
                                        }
                                        label="Toutes les colonnes détails"
                                        componentsProps={{ typography: { variant: 'caption', fontWeight: 600 } }}
                                    />

                                    {/* Contrôles individuels si détails activés */}
                                    {columnVisibility.details && (
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size="small"
                                                        checked={columnVisibility.famille}
                                                        onChange={(e) => handleColumnVisibilityChange('famille', e.target.checked)}
                                                    />
                                                }
                                                label="Famille"
                                                componentsProps={{ typography: { variant: 'caption' } }}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size="small"
                                                        checked={columnVisibility.fournisseur}
                                                        onChange={(e) => handleColumnVisibilityChange('fournisseur', e.target.checked)}
                                                    />
                                                }
                                                label="Fournisseur"
                                                componentsProps={{ typography: { variant: 'caption' } }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </motion.div>
            )}

            {/* ✅ INSIGHTS CONDITIONNELS */}
            {showInsights && hasData && insights && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <MatrixInsights
                        data={{
                            products: filteredData.products,
                            column_refs: filteredData.columnRefs,
                            correspondences: filteredData.correspondences
                        }}
                        filters={filtersFromUrl}
                        sx={{ mb: 3 }}
                    />
                </motion.div>
            )}

            {/* Légende compacte */}
            <MatrixLegend compact={true} sx={{ mb: 2 }} />

            {/* ✅ AFFICHAGE PRINCIPAL */}
            {isLoading ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        Chargement de la matrice...
                    </Typography>
                </Paper>
            ) : hasData ? (
                <MatrixTable
                    products={filteredData?.products || []}
                    matches={filteredData?.correspondences || []}
                    columnRefs={filteredData?.columnRefs || []}
                    columnVisibility={columnVisibility}
                    insights={insights}
                    onInspectProduct={handleInspectProduct}
                />
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucune donnée à afficher
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Utilisez le panneau de filtres pour rechercher des produits
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Exemple: <code>/matrix?cod_pro=23412&grouping_crn=1</code>
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => setShowFilters(true)}
                        sx={{ mt: 2 }}
                    >
                        Ouvrir les filtres
                    </Button>
                </Paper>
            )}

            {/* ✅ DIALOG D'EXPORT */}
            {showExport && (
                <MatrixExport
                    open={showExport}
                    onClose={() => setShowExport(false)}
                    data={filteredData}
                    filters={filtersFromUrl}
                    columnVisibility={columnVisibility}
                />
            )}

            {/* ✅ DIALOG D'AIDE */}
            <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="lg" fullWidth>
                <DialogTitle>💡 Guide Complet - Matrice de Correspondance CBM</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="primary">
                                🔍 Utilisation des Filtres
                            </Typography>
                            <Typography variant="body2" paragraph>
                                <strong>Filtres principaux (URL) :</strong>
                            </Typography>
                            <ul>
                                <li>Code produit (cod_pro) - Recherche exacte</li>
                                <li>Référence interne (refint) - CBM interne</li>
                                <li>Référence constructeur (ref_crn) - Constructeur</li>
                                <li>Référence externe (ref_ext) - GRC externe</li>
                                <li>Grouping CRN - Récupère tous les produits liés</li>
                            </ul>

                            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                                <strong>Filtres locaux :</strong>
                            </Typography>
                            <ul>
                                <li>Recherche produit - Dans refint, nom_pro, cod_pro, famille, fournisseur</li>
                                <li>Filtre référence - Affiche seulement une ref CRN/EXT</li>
                                <li>Colonnes visibles - Masque/affiche famille et fournisseur</li>
                            </ul>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="primary">
                                🎨 Code Couleur CBM
                            </Typography>

                            <Typography variant="body2" gutterBottom>
                                <strong>Qualités produits (ordre CBM) :</strong>
                            </Typography>
                            <Box sx={{ ml: 2, mb: 2 }}>
                                <Typography variant="body2">• <span style={{ color: '#2196f3' }}>●</span> OE - Origine Équipementier</Typography>
                                <Typography variant="body2">• <span style={{ color: '#4caf50' }}>●</span> OEM - Original Equipment Manufacturer</Typography>
                                <Typography variant="body2">• <span style={{ color: '#ff9800' }}>●</span> PMQ - Pièce Marché Qualité</Typography>
                                <Typography variant="body2">• <span style={{ color: '#9c27b0' }}>●</span> PMV - Pièce Marché Véhicule</Typography>
                            </Box>

                            <Typography variant="body2" gutterBottom>
                                <strong>Correspondances matrice :</strong>
                            </Typography>
                            <Box sx={{ ml: 2 }}>
                                <Typography variant="body2">• <strong>C</strong> - Correspondance CRN uniquement</Typography>
                                <Typography variant="body2">• <strong>E</strong> - Correspondance EXT uniquement</Typography>
                                <Typography variant="body2">• <strong>⚡</strong> - Double correspondance CRN + EXT</Typography>
                                <Typography variant="body2">• <strong>✗</strong> - Aucune correspondance</Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Alert severity="info">
                                <strong>URL directe :</strong><br />
                                <code>/matrix?cod_pro=23412&grouping_crn=1</code><br />
                                Charge directement la matrice pour le produit 23412 avec grouping.
                            </Alert>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHelp(false)} variant="contained">
                        Parfait ! 🚀
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MatrixPage;