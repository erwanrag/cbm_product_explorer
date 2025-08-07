// ===================================
// 📁 frontend/src/shared/components/layout/PageLayout.jsx
// ===================================

import React from 'react';
import {
    Container, Box, Typography, Breadcrumbs,
    Link, Alert, Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import { NavigateNext, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Layout standardisé pour toutes les pages CBM
 * Remplace la structure répétitive Container + motion.div + Typography
 */
export default function PageLayout({
    // Contenu principal
    children,

    // En-tête de page
    title,
    subtitle,
    icon,

    // Navigation
    breadcrumbs = [],

    // Actions dans le header  
    actions,

    // Filtres
    filters,

    // États
    loading = false,
    error = null,
    empty = null,

    // Options d'affichage
    showBreadcrumbs = true,
    maxWidth = "xl",

    // Animation
    enableAnimation = true,
    animationDelay = 0,

    // Styles
    containerSx = {},
    headerSx = {},
    contentSx = {}
}) {
    const navigate = useNavigate();

    // Animation variants
    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: animationDelay }
        }
    };

    // Rendu des breadcrumbs
    const renderBreadcrumbs = () => {
        if (!showBreadcrumbs || breadcrumbs.length === 0) return null;

        const allCrumbs = [
            { label: 'Accueil', path: '/dashboard', icon: <Home sx={{ fontSize: 16 }} /> },
            ...breadcrumbs
        ];

        return (
            <Box sx={{ mb: 2 }}>
                <Breadcrumbs
                    separator={<NavigateNext fontSize="small" />}
                    sx={{
                        '& .MuiBreadcrumbs-separator': { mx: 1 },
                        '& .MuiBreadcrumbs-li': {
                            display: 'flex',
                            alignItems: 'center'
                        }
                    }}
                >
                    {allCrumbs.map((crumb, index) => {
                        const isLast = index === allCrumbs.length - 1;

                        if (isLast) {
                            return (
                                <Typography
                                    key={index}
                                    color="text.primary"
                                    sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}
                                >
                                    {crumb.icon && <Box sx={{ mr: 0.5 }}>{crumb.icon}</Box>}
                                    {crumb.label}
                                </Typography>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                color="inherit"
                                href={crumb.path}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(crumb.path);
                                }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                {crumb.icon && <Box sx={{ mr: 0.5 }}>{crumb.icon}</Box>}
                                {crumb.label}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            </Box>
        );
    };

    // Rendu du header
    const renderHeader = () => {
        if (!title && !subtitle && !actions) return null;

        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 4,
                    ...headerSx
                }}
            >
                <Box sx={{ flex: 1 }}>
                    {loading ? (
                        <>
                            <Skeleton width="300px" height={40} sx={{ mb: 1 }} />
                            <Skeleton width="200px" height={24} />
                        </>
                    ) : (
                        <>
                            {title && (
                                <Typography
                                    variant="h4"
                                    component="h1"
                                    sx={{
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: subtitle ? 1 : 0
                                    }}
                                >
                                    {icon && <Box sx={{ mr: 2 }}>{icon}</Box>}
                                    {title}
                                </Typography>
                            )}

                            {subtitle && (
                                <Typography
                                    variant="subtitle1"
                                    color="text.secondary"
                                    sx={{ lineHeight: 1.6 }}
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </>
                    )}
                </Box>

                {actions && !loading && (
                    <Box sx={{ ml: 3, flexShrink: 0 }}>
                        {actions}
                    </Box>
                )}
            </Box>
        );
    };

    // Rendu des états d'erreur/vide
    const renderStateMessages = () => {
        if (error) {
            return (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={actions}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Une erreur est survenue
                    </Typography>
                    <Typography variant="body2">
                        {typeof error === 'string' ? error : error.message || 'Erreur inconnue'}
                    </Typography>
                </Alert>
            );
        }

        if (empty && !loading) {
            return (
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                    action={actions}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Aucune donnée disponible
                    </Typography>
                    <Typography variant="body2">
                        {typeof empty === 'string' ? empty : 'Essayez de modifier vos filtres ou vérifiez vos paramètres.'}
                    </Typography>
                </Alert>
            );
        }

        return null;
    };

    // Contenu principal
    const content = (
        <Container maxWidth={maxWidth} sx={{ py: 3, ...containerSx }}>
            {renderBreadcrumbs()}
            {renderHeader()}

            {/* Section Filtres */}
            {filters && (
                <Box sx={{ mb: 4 }}>
                    {filters}
                </Box>
            )}

            {/* Messages d'état */}
            {renderStateMessages()}

            {/* Contenu principal */}
            {!error && (
                <Box sx={contentSx}>
                    {children}
                </Box>
            )}
        </Container>
    );

    // Avec ou sans animation
    if (enableAnimation) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={variants}
            >
                {content}
            </motion.div>
        );
    }

    return content;
}