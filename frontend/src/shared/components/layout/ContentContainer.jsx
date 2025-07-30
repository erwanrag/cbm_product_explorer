// frontend/src/shared/components/layout/ContentContainer.jsx - CONTAINER CONTENU
import React from 'react';
import { Box, Container, useTheme } from '@mui/material';

/**
 * Container pour le contenu principal
 * S'adapte automatiquement à la largeur de la sidebar
 */
const ContentContainer = ({ children, sidebarWidth, sidebarOpen }) => {
  const theme = useTheme();

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        width: {
          md: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%',
        },
        ml: {
          xs: 0,
          md: sidebarOpen ? `${sidebarWidth}px` : 0,
        },
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Espace pour le header fixe */}
      <Box sx={{ height: theme.mixins.toolbar.minHeight }} />

      {/* Contenu avec padding */}
      <Container
        maxWidth="xl"
        sx={{
          py: 3,
          px: { xs: 2, sm: 3 },
          minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default ContentContainer;
