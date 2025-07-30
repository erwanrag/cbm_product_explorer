// frontend/src/shared/components/layout/Layout.jsx - LAYOUT PRINCIPAL
import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useLayout } from '@/store/hooks/useLayout';

// Composants layout
import Header from '@/shared/components/layout/Header';
import Sidebar from '@/shared/components/layout/Sidebar';
import ContentContainer from '@/shared/components/layout/ContentContainer';

/**
 * Layout principal de l'application CBM
 * Gère la structure générale avec header, sidebar et contenu
 */
const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen, sidebarMobileOpen } = useLayout();

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
      <ContentContainer sidebarWidth={sidebarWidth} sidebarOpen={isMobile ? false : sidebarOpen}>
        {children}
      </ContentContainer>
    </Box>
  );
};

export default Layout;
