// frontend/src/shared/components/filters/FilterPanel.jsx
import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Collapse,
    IconButton,
    Stack,
    Divider,
    Menu,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Badge
} from '@mui/material';
import {
    ExpandMore,
    ExpandLess,
    FilterList,
    Clear,
    Save,
    BookmarkBorder,
    Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useFilters } from '@/shared/hooks/useFilters';

/**
 * Panel de filtres réutilisable avec presets
 * Remplace DashboardFiltersSection, MatrixFilters, OptimizationFiltersSection
 * 
 * @param {React.ReactNode} children - Composants de filtrage (autocompletes, selects, etc.)
 * @param {object} initialFilters - Filtres initiaux
 * @param {string} storageKey - Clé localStorage pour persistence
 * @param {function} onFiltersChange - Callback appelé quand les filtres changent
 * @param {string} title - Titre du panel
 * @param {boolean} collapsible - Panel collapsible ou non
 * @param {boolean} defaultExpanded - Panel ouvert par défaut
 * @param {boolean} showPresets - Afficher les presets
 * @param {boolean} showClearButton - Afficher le bouton reset
 */
export default function FilterPanel({
    children,
    initialFilters = {},
    storageKey = 'default',
    onFiltersChange = null,
    title = "🔍 Filtres de recherche",
    collapsible = true,
    defaultExpanded = true,
    showPresets = true,
    showClearButton = true
}) {
    // Hook de gestion des filtres
    const {
        filters,
        updateFilter,
        updateFilters,
        resetFilters,
        savePreset,
        loadPreset,
        deletePreset,
        presets,
        getActiveFiltersCount
    } = useFilters(initialFilters, storageKey, onFiltersChange);

    // États locaux
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [presetsMenuAnchor, setPresetsMenuAnchor] = useState(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    // Nombre de filtres actifs
    const activeFiltersCount = getActiveFiltersCount();

    // Toggle collapse
    const handleToggle = () => {
        if (collapsible) {
            setExpanded(!expanded);
        }
    };

    // Reset filtres
    const handleClear = () => {
        resetFilters();
        toast.info('🗑️ Filtres réinitialisés');
    };

    // Menu presets
    const handlePresetsMenuOpen = (event) => {
        setPresetsMenuAnchor(event.currentTarget);
    };

    const handlePresetsMenuClose = () => {
        setPresetsMenuAnchor(null);
    };

    // Charger preset
    const handleLoadPreset = (presetName) => {
        loadPreset(presetName);
        handlePresetsMenuClose();
        toast.success(`✅ Filtres "${presetName}" chargés`);
    };

    // Supprimer preset
    const handleDeletePreset = (presetName, event) => {
        event.stopPropagation();
        deletePreset(presetName);
        toast.info(`🗑️ Preset "${presetName}" supprimé`);
    };

    // Dialog sauvegarde preset
    const handleSaveDialogOpen = () => {
        setSaveDialogOpen(true);
        setNewPresetName('');
    };

    const handleSaveDialogClose = () => {
        setSaveDialogOpen(false);
        setNewPresetName('');
    };

    const handleSavePreset = () => {
        if (!newPresetName.trim()) {
            toast.error('⚠️ Veuillez entrer un nom pour le preset');
            return;
        }

        savePreset(newPresetName.trim());
        handleSaveDialogClose();
        toast.success(`✅ Filtres sauvegardés sous "${newPresetName}"`);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { 
            opacity: 1, 
            height: 'auto',
            transition: { duration: 0.3, ease: 'easeInOut' }
        }
    };

    return (
        <>
            <Paper
                component={motion.div}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{
                    p: 3,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: collapsible ? 'pointer' : 'default',
                        mb: expanded ? 2 : 0
                    }}
                    onClick={handleToggle}
                >
                    {/* Titre avec badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Badge badgeContent={activeFiltersCount} color="primary">
                            <FilterList color="action" />
                        </Badge>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {title}
                        </Typography>
                        {activeFiltersCount > 0 && (
                            <Chip
                                size="small"
                                label={`${activeFiltersCount} actif${activeFiltersCount > 1 ? 's' : ''}`}
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                        {/* Bouton Clear */}
                        {showClearButton && activeFiltersCount > 0 && (
                            <Button
                                size="small"
                                startIcon={<Clear />}
                                onClick={handleClear}
                                variant="outlined"
                                color="error"
                            >
                                Réinitialiser
                            </Button>
                        )}

                        {/* Menu Presets */}
                        {showPresets && (
                            <>
                                <Button
                                    size="small"
                                    startIcon={<BookmarkBorder />}
                                    onClick={handlePresetsMenuOpen}
                                    variant="outlined"
                                >
                                    Presets ({Object.keys(presets).length})
                                </Button>

                                <Button
                                    size="small"
                                    startIcon={<Save />}
                                    onClick={handleSaveDialogOpen}
                                    variant="outlined"
                                    color="primary"
                                    disabled={activeFiltersCount === 0}
                                >
                                    Sauvegarder
                                </Button>
                            </>
                        )}

                        {/* Toggle collapse */}
                        {collapsible && (
                            <IconButton size="small" onClick={handleToggle}>
                                {expanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        )}
                    </Stack>
                </Box>

                {/* Contenu des filtres */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <Divider sx={{ my: 2 }} />
                            <Box>
                                {/* Injecter les filtres via children avec context */}
                                {React.Children.map(children, child => {
                                    if (React.isValidElement(child)) {
                                        return React.cloneElement(child, {
                                            filters,
                                            updateFilter,
                                            updateFilters
                                        });
                                    }
                                    return child;
                                })}
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Paper>

            {/* Menu Presets */}
            <Menu
                anchorEl={presetsMenuAnchor}
                open={Boolean(presetsMenuAnchor)}
                onClose={handlePresetsMenuClose}
            >
                {Object.keys(presets).length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            Aucun preset sauvegardé
                        </Typography>
                    </MenuItem>
                ) : (
                    Object.keys(presets).map((presetName) => (
                        <MenuItem
                            key={presetName}
                            onClick={() => handleLoadPreset(presetName)}
                            sx={{ justifyContent: 'space-between', minWidth: 200 }}
                        >
                            <Typography variant="body2">{presetName}</Typography>
                            <IconButton
                                size="small"
                                onClick={(e) => handleDeletePreset(presetName, e)}
                                sx={{ ml: 2 }}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </MenuItem>
                    ))
                )}
            </Menu>

            {/* Dialog sauvegarde preset */}
            <Dialog open={saveDialogOpen} onClose={handleSaveDialogClose} maxWidth="xs" fullWidth>
                <DialogTitle>💾 Sauvegarder les filtres</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nom du preset"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSavePreset();
                            }
                        }}
                        placeholder="Ex: Filtres produits OEM"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveDialogClose}>Annuler</Button>
                    <Button onClick={handleSavePreset} variant="contained">
                        Sauvegarder
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}