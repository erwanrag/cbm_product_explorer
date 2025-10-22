// frontend/src/shared/components/panels/DetailPanel.jsx
import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Tabs,
    Tab,
    Divider,
    Button,
    Stack,
    Paper,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Close, ArrowBack } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Panel de détail réutilisable (Drawer)
 * Remplace DashboardDetailPanel, MatrixDetailPanel, OptimizationDetailPanel
 * 
 * @param {boolean} open - État ouvert/fermé
 * @param {function} onClose - Callback de fermeture
 * @param {string} title - Titre principal
 * @param {string} subtitle - Sous-titre
 * @param {Array} tabs - [{label, content, icon}]
 * @param {Array} actions - [{label, onClick, color, variant, icon, disabled}]
 * @param {string|number} width - Largeur du drawer (px ou %)
 * @param {string} position - Position ('right' | 'left' | 'bottom')
 * @param {React.ReactNode} headerExtra - Contenu additionnel dans le header
 * @param {boolean} loading - État de chargement
 */
export default function DetailPanel({
    open,
    onClose,
    title,
    subtitle = null,
    tabs = [],
    actions = [],
    width = 800,
    position = 'right',
    headerExtra = null,
    loading = false
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // État de l'onglet actif
    const [activeTab, setActiveTab] = useState(0);

    // Gestion du changement d'onglet
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Déterminer la largeur selon le device
    const getDrawerWidth = () => {
        if (position === 'bottom') return '100%';
        if (isMobile) return '100%';
        if (typeof width === 'string') return width;
        return `${width}px`;
    };

    // Animation variants
    const contentVariants = {
        hidden: { opacity: 0, x: position === 'right' ? 20 : -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.3, ease: 'easeOut' }
        }
    };

    return (
        <Drawer
            anchor={position}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: getDrawerWidth(),
                    maxWidth: '100vw',
                    height: position === 'bottom' ? 'auto' : '100%',
                    maxHeight: position === 'bottom' ? '90vh' : '100%',
                }
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        borderRadius: 0,
                        bgcolor: 'background.paper',
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}
                >
                    {/* Bouton fermer + Titre */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="body2" color="text.secondary">
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>

                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{
                                ml: 2,
                                bgcolor: 'action.hover',
                                '&:hover': { bgcolor: 'action.selected' }
                            }}
                        >
                            {isMobile ? <ArrowBack /> : <Close />}
                        </IconButton>
                    </Box>

                    {/* Contenu extra header */}
                    {headerExtra && (
                        <Box sx={{ mt: 2 }}>
                            {headerExtra}
                        </Box>
                    )}

                    {/* Tabs */}
                    {tabs.length > 0 && (
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant={isMobile ? 'scrollable' : 'standard'}
                            scrollButtons="auto"
                            sx={{ mt: 2 }}
                        >
                            {tabs.map((tab, index) => (
                                <Tab
                                    key={index}
                                    label={tab.label}
                                    icon={tab.icon}
                                    iconPosition="start"
                                    sx={{
                                        minHeight: 48,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                />
                            ))}
                        </Tabs>
                    )}
                </Paper>

                {/* Contenu principal */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 3,
                        bgcolor: 'background.default'
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            {loading ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        Chargement...
                                    </Typography>
                                </Box>
                            ) : tabs.length > 0 ? (
                                tabs[activeTab]?.content
                            ) : (
                                <Typography color="text.secondary">
                                    Aucun contenu disponible
                                </Typography>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Box>

                {/* Footer avec actions */}
                {actions.length > 0 && (
                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            borderRadius: 0,
                            borderTop: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Stack
                            direction={isMobile ? 'column' : 'row'}
                            spacing={2}
                            justifyContent="flex-end"
                        >
                            {actions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant={action.variant || 'contained'}
                                    color={action.color || 'primary'}
                                    onClick={action.onClick}
                                    disabled={action.disabled || loading}
                                    startIcon={action.icon}
                                    fullWidth={isMobile}
                                    sx={{
                                        minWidth: isMobile ? '100%' : 120
                                    }}
                                >
                                    {action.label}
                                </Button>
                            ))}
                        </Stack>
                    </Paper>
                )}
            </Box>
        </Drawer>
    );
}