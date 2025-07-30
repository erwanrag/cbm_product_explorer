// frontend/src/shared/components/layout/Header.jsx - HEADER APPLICATION
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useLayout } from '@/store/hooks/useLayout';

/**
 * Header de l'application CBM
 */
const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { toggleSidebar, toggleMobileSidebar } = useLayout();

  const handleMenuClick = () => {
    if (isMobile) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: '#fff',
        color: '#333',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar>
        {/* Menu burger */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo et titre */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            CBM GRC Matcher
          </Typography>
          {!isMobile && (
            <Typography
              variant="body2"
              sx={{
                ml: 2,
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              Système d'analyse et matching produits
            </Typography>
          )}
        </Box>

        {/* Actions à droite */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Notifications */}
          <IconButton color="inherit" aria-label="notifications" sx={{ mr: 1 }}>
            <NotificationsIcon />
          </IconButton>

          {/* Paramètres */}
          <IconButton color="inherit" aria-label="settings">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
