// ===================================
// 📁 frontend/src/features/matrix/pages/MatrixPage.jsx - AMÉLIORATIONS
// ===================================

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Alert
} from '@mui/material';
import {
    GridView,
    Help,
    Visibility,
    VisibilityOff,
    Settings,
    FileDownload
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import MatrixFilters from '../components/MatrixFilters';
import MatrixView from '../components/MatrixView';
import MatrixLegend from '../components/MatrixLegend';
import MatrixExport from '../components/MatrixExport';

const MatrixPage = () => {
    const [filters, setFilters] = useState({});
    const [showHelp, setShowHelp] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
        details: true,      // Masquer/afficher les colonnes détails
        stock: false,       // Stock ne sert à rien selon vos commentaires
        designation: true,
        qualite: true,
        famille: true,
        statut: true,
        fournisseur: true
    });
    const [matrixData, setMatrixData] = useState(null);
    const [showExport, setShowExport] = useState(false);

    // ===== GESTION DES FILTRES =====
    // La logique des filtres vient maintenant du FiltersPanel et non de la barre de recherche
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        // Déclencher le rechargement des données de la matrice
        console.log('Nouveaux filtres appliqués:', newFilters);
    };

    // ===== GESTION DE LA VISIBILITÉ DES COLONNES =====
    const handleColumnVisibilityChange = (columnKey, isVisible) => {
        setColumnVisibility(prev => ({
            ...prev,
            [columnKey]: isVisible
        }));
    };

    const toggleAllDetails = () => {
        const newDetailsState = !columnVisibility.details;
        setColumnVisibility(prev => ({
            ...prev,
            details: newDetailsState,
            designation: newDetailsState,
            qualite: newDetailsState,
            famille: newDetailsState,
            statut: newDetailsState,
            fournisseur: newDetailsState
            // stock reste toujours false car "ne sert à rien"
        }));
    };

    // ===== DONNÉES ENRICHIES AVEC DÉTAILS =====
    const enrichedMatrixData = matrixData ? {
        ...matrixData,
        products: matrixData.products?.map(product => ({
            ...product,
            // Ajouter tous les champs détails demandés
            ref_ext: product.ref_ext || '',
            nom_fou: product.nom_fou || '',  // Nom fournisseur
            cod_fou_principal: product.cod_fou_principal || null,
            nom_pro: product.nom_pro || product.designation || '',
            s_famille: product.s_famille || null
        })) || []
    } : null;

    return (
        <Box sx={{ p: 3 }}>
            {/* En-tête avec aide */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        🎯 Matrice de Correspondance
                        {/* Bouton d'aide en haut vers le titre */}
                        <Tooltip title="Comment utiliser la matrice">
                            <IconButton
                                size="small"
                                onClick={() => setShowHelp(true)}
                                sx={{ ml: 1 }}
                            >
                                <Help fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Visualisation croisée des correspondances entre références internes CBM,
                        références constructeur (CRN) et références externes (GRC).
                    </Typography>
                </Box>

                {/* Contrôles de la page */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Afficher/masquer les colonnes détails">
                        <IconButton onClick={toggleAllDetails}>
                            {columnVisibility.details ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Exporter les données">
                        <IconButton onClick={() => setShowExport(true)}>
                            <FileDownload />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Filtres principaux (remplace la barre de recherche inutile) */}
            <MatrixFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                // Ajout des filtres ref_grc et ref_ext
                showAdvancedFilters={true}
            />

            {/* Contrôles des colonnes */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }}>
                <Typography variant="subtitle2" gutterBottom>
                    🔧 Contrôles d'affichage
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={columnVisibility.details}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        handleColumnVisibilityChange('details', checked);
                                        // Activer/désactiver toutes les colonnes détails
                                        setColumnVisibility(prev => ({
                                            ...prev,
                                            details: checked,
                                            designation: checked,
                                            qualite: checked,
                                            famille: checked,
                                            statut: checked,
                                            fournisseur: checked
                                        }));
                                    }}
                                />
                            }
                            label="Afficher les colonnes détails"
                        />
                    </Grid>

                    {columnVisibility.details && (
                        <>
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={columnVisibility.designation}
                                            onChange={(e) => handleColumnVisibilityChange('designation', e.target.checked)}
                                        />
                                    }
                                    label="Désignation"
                                    size="small"
                                />
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={columnVisibility.qualite}
                                            onChange={(e) => handleColumnVisibilityChange('qualite', e.target.checked)}
                                        />
                                    }
                                    label="Qualité"
                                    size="small"
                                />
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={columnVisibility.fournisseur}
                                            onChange={(e) => handleColumnVisibilityChange('fournisseur', e.target.checked)}
                                        />
                                    }
                                    label="Fournisseur"
                                    size="small"
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>

            {/* Légende compacte */}
            <MatrixLegend
                compact={true}  // Version plus compacte de la légende
                sx={{ mb: 2 }}
            />

            {/* Vue matricielle */}
            <MatrixView
                filters={filters}
                columnVisibility={columnVisibility}
                onDataChange={setMatrixData}
                enhancedProductDetails={true}  // Activer les détails enrichis
            />

            {/* Dialog d'aide */}
            <Dialog
                open={showHelp}
                onClose={() => setShowHelp(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    💡 Comment utiliser la Matrice de Correspondance
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="primary">
                                🔍 1. Filtrage des données
                            </Typography>
                            <Typography variant="body2" paragraph>
                                Utilisez le panneau de filtres pour cibler vos recherches :
                            </Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                                <li>Code produit (cod_pro)</li>
                                <li>Référence interne (refint)</li>
                                <li>Référence constructeur (ref_crn)</li>
                                <li><strong>Référence GRC (ref_grc)</strong></li>
                                <li><strong>Référence externe (ref_ext)</strong></li>
                                <li>Qualité, famille, statut</li>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom color="primary">
                                🎨 2. Lecture de la matrice
                            </Typography>
                            <Typography variant="body2" paragraph>
                                Chaque cellule indique une correspondance :
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 20, height: 20, bgcolor: '#a5d6a7', borderRadius: 0.5 }} />
                                    <Typography variant="body2">Correspondance CRN</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 20, height: 20, bgcolor: '#90caf9', borderRadius: 0.5 }} />
                                    <Typography variant="body2">Correspondance EXT</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 20, height: 20, bgcolor: '#d1c4e9', borderRadius: 0.5 }} />
                                    <Typography variant="body2">CRN + EXT</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom color="primary">
                                ⚙️ 3. Personnalisation de l'affichage
                            </Typography>
                            <Typography variant="body2" paragraph>
                                Adaptez la vue selon vos besoins :
                            </Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                                <li>Affichez/masquez les colonnes détails pour voir le tableau dans son ensemble</li>
                                <li>La colonne Stock est masquée par défaut (non pertinente)</li>
                                <li>Exportez vos données aux formats CSV, Excel, ou JSON</li>
                                <li>Utilisez les filtres avancés pour affiner vos résultats</li>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHelp(false)} variant="contained">
                        Compris !
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog d'export */}
            <MatrixExport
                open={showExport}
                onClose={() => setShowExport(false)}
                data={enrichedMatrixData}
                filters={filters}
                columnVisibility={columnVisibility}
            />
        </Box>
    );
};

export default MatrixPage;