// src/shared/components/layout/Layout.jsx - VERSION CORRIGÉE
import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

// Composants layout
import Header from '@/shared/components/layout/Header';
import Sidebar from '@/shared/components/layout/Sidebar';
import ContentContainer from '@/shared/components/layout/ContentContainer';

/**
 * Layout principal CBM - Version qui fonctionne
 */
const Layout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // État local simple pour la sidebar
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    // Largeur de la sidebar
    const sidebarWidth = 280;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Header fixe en haut */}
            <Header />

            {/* Sidebar */}
            <Sidebar
                width={sidebarWidth}
                open={isMobile ? sidebarMobileOpen : sidebarOpen}
                variant={isMobile ? 'temporary' : 'persistent'}
            />

            {/* Zone de contenu principal */}
            <ContentContainer
                sidebarWidth={sidebarWidth}
                sidebarOpen={isMobile ? false : sidebarOpen}
            >
                {children}
            </ContentContainer>
        </Box>
    );
};

export default Layout;