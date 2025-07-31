// frontend/src/features/matrix/pages/MatrixPage.jsx

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Alert,
    Button,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    Search,
    ViewModule,
    TrendingUp,
    Analytics,
    Home,
    GridView
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MatrixView from '../components/MatrixView';
import IdentifierSearch from '@/shared/components/search/IdentifierSearch';

/**
 * Page principale de la vue matricielle
 */
const MatrixPage = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState(null);
    const [showDemo, setShowDemo] = useState(false);

    const handleSearch = (searchPayload) => {
        console.log('🔍 Recherche matrice:', searchPayload);
        setIdentifier(searchPayload);
        setShowDemo(false);
    };

    const handleProductClick = (product) => {
        console.log('📊 Clic produit:', product);
        // Navigation vers dashboard avec le produit sélectionné
        navigate('/dashboard', {
            state: {
                initialSearch: { cod_pro: product.cod_pro }
            }
        });
    };

    const loadDemoData = () => {
        // Charge des données de démonstration
        setIdentifier({ cod_pro: 23412, grouping_crn: 1 });
        setShowDemo(true);
    };

    const clearSearch = () => {
        setIdentifier(null);
        setShowDemo(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link
                        underline="hover"
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        color="inherit"
                        onClick={() => navigate('/dashboard')}
                    >
                        <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                        Dashboard
                    </Link>
                    <Typography
                        color="text.primary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <GridView sx={{ mr: 0.5 }} fontSize="inherit" />
                        Matrice
                    </Typography>
                </Breadcrumbs>

                {/* En-tête de la page */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        🎯 Matrice de Correspondance
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Visualisation croisée des correspondances entre références internes CBM,
                        références constructeur (CRN) et références externes (GRC).
                    </Typography>
                </Box>

                {/* Zone de recherche */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Paper
                        elevation={1}
                        sx={{
                            p: 3,
                            mb: 3,
                            bgcolor: '#f8f9fa',
                            border: '1px solid #e0e0e0'
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <Search />
                            Recherche de Produits
                        </Typography>

                        <IdentifierSearch
                            onSearch={handleSearch}
                            placeholder="Code produit, référence interne, CRN..."
                            helperText="Saisissez un identifiant pour générer la matrice de correspondance"
                        />

                        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {!identifier && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={loadDemoData}
                                    startIcon={<ViewModule />}
                                >
                                    Voir un exemple
                                </Button>
                            )}
                            {identifier && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={clearSearch}
                                    color="secondary"
                                >
                                    Nouvelle recherche
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </motion.div>

                {/* Cards explicatives (uniquement si pas de résultats) */}
                {!identifier && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={4}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        border: '1px solid #e3f2fd',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 2
                                        }
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                        <ViewModule
                                            sx={{
                                                fontSize: 48,
                                                color: 'primary.main',
                                                mb: 2
                                            }}
                                        />
                                        <Typography variant="h6" gutterBottom>
                                            Vue Matricielle
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Correspondances croisées entre références internes et externes
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        border: '1px solid #e8f5e8',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 2
                                        }
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                        <TrendingUp
                                            sx={{
                                                fontSize: 48,
                                                color: 'success.main',
                                                mb: 2
                                            }}
                                        />
                                        <Typography variant="h6" gutterBottom>
                                            Analyse Dynamique
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Colonnes coloriées selon l'origine des références
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        border: '1px solid #fff3e0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 2
                                        }
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                        <Analytics
                                            sx={{
                                                fontSize: 48,
                                                color: 'warning.main',
                                                mb: 2
                                            }}
                                        />
                                        <Typography variant="h6" gutterBottom>
                                            Export & Analyse
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Export professionnel et analyses automatiques
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Guide d'utilisation */}
                        <Paper
                            sx={{
                                p: 3,
                                mb: 3,
                                bgcolor: '#fafafa',
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                                💡 Comment utiliser la Matrice ?
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        🔍 1. Recherche
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Saisissez un code produit, une référence interne ou CRN.
                                        Le système trouvera automatiquement tous les produits liés.
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        🎨 2. Lecture des couleurs
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Les colonnes sont coloriées : bleu (CRN only),
                                        vert (CRN+EXT), orange (EXT only).
                                        Les cellules indiquent les correspondances.
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        🔧 3. Filtrage
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Utilisez les filtres avancés pour affiner par qualité,
                                        famille, statut ou recherche textuelle.
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        📊 4. Export & Analyse
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Exportez en CSV/Excel et consultez les analyses
                                        automatiques pour optimiser vos correspondances.
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </motion.div>
                )}

                {/* Vue matricielle */}
                {identifier && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <MatrixView
                            identifier={identifier}
                            onProductClick={handleProductClick}
                        />
                    </motion.div>
                )}

                {/* Mode démonstration */}
                {showDemo && identifier && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Alert
                            severity="info"
                            sx={{ mt: 2 }}
                            onClose={() => setShowDemo(false)}
                        >
                            <strong>Mode Démonstration</strong> - Vous visualisez un exemple de matrice avec le produit {identifier.cod_pro}.
                            Les données incluent le grouping complet ({identifier.grouping_crn}).
                            Utilisez la recherche ci-dessus pour explorer vos propres données.
                        </Alert>
                    </motion.div>
                )}
            </Box>
        </motion.div>
    );
};

export default MatrixPage;