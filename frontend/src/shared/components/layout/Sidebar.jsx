// frontend/src/shared/components/layout/Sidebar.jsx - SIDEBAR NAVIGATION
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  GridOn as MatrixIcon,
  TrendingUp as OptimizationIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '@/store/hooks/useLayout';

/**
 * Items de navigation
 */
const navigationItems = [
  {
    text: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    description: "Vue d'ensemble et KPIs",
  },
  {
    text: 'Matrice',
    path: '/matrix',
    icon: <MatrixIcon />,
    description: 'Analyse des correspondances',
  },
  {
    text: 'Optimisation',
    path: '/optimization',
    icon: <OptimizationIcon />,
    description: "Outils d'optimisation",
  },
];

const secondaryItems = [
  {
    text: 'Paramètres',
    path: '/settings',
    icon: <SettingsIcon />,
  },
  {
    text: 'Aide',
    path: '/help',
    icon: <HelpIcon />,
  },
];

/**
 * Composant Sidebar
 */
const Sidebar = ({ width, open, variant = 'persistent' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleMobileSidebar } = useLayout();

  const handleNavigation = (path) => {
    navigate(path);
    // Fermer la sidebar mobile après navigation
    if (variant === 'temporary') {
      toggleMobileSidebar();
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Espace pour le header */}
      <Box sx={{ height: theme.mixins.toolbar.minHeight }} />

      {/* Logo/Titre de la sidebar */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          CBM GRC
        </Typography>
        <Typography variant="caption" color="text.secondary">
          v2.0.0
        </Typography>
      </Box>

      {/* Navigation principale */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActivePath(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '20',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontWeight: isActivePath(item.path) ? 600 : 400,
                    fontSize: '0.9rem',
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    sx: {
                      display: { xs: 'none', sm: 'block' },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Navigation secondaire */}
        <List sx={{ px: 1 }}>
          {secondaryItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActivePath(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer de la sidebar */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2025 CBM GRC Matcher
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={variant === 'temporary' ? toggleMobileSidebar : undefined}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          ...(variant === 'temporary' && {
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
