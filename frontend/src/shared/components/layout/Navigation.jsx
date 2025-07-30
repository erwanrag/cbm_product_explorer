// ===================================
// 📁 frontend/src/shared/components/layout/Navigation.jsx - CORRIGER
// ===================================

import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Dashboard, GridView, TrendingUp, Analytics } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// ✅ IMPORTS CORRIGÉS
import { MAIN_NAVIGATION } from '@/constants/routes';

/**
 * Navigation CBM - Version corrigée
 */
const Navigation = () => {
    const location = useLocation();

    const iconMap = {
        Dashboard,
        GridView,
        TrendingUp,
        Analytics
    };

    return (
        <List sx={{ px: 1 }}>
            {MAIN_NAVIGATION.map((item, index) => {
                const Icon = iconMap[item.icon] || Dashboard;
                const isActive = location.pathname === item.path;

                return (
                    <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={isActive}
                                sx={{
                                    borderRadius: 2,
                                    mx: 0.5,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'primary.contrastText',
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: isActive ? 'primary.dark' : 'action.hover',
                                        transform: 'translateX(4px)',
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Icon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    secondary={item.description}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '0.9rem'
                                    }}
                                    secondaryTypographyProps={{
                                        fontSize: '0.75rem',
                                        sx: { opacity: isActive ? 0.9 : 0.7 }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </motion.div>
                );
            })}
        </List>
    );
};

export default Navigation;