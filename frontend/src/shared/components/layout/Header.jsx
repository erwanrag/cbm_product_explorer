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
    Select,
    MenuItem,
} from '@mui/material';
import {
    Menu as MenuIcon,
} from '@mui/icons-material';
import { useLayout } from '@/store/hooks/useLayout';
import { useTranslation } from 'react-i18next';

/**
 * Header de l'application CBM
 */
const Header = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { toggleSidebar, toggleMobileSidebar } = useLayout();
    const { t, i18n } = useTranslation(); // ✅ CORRECT ici

    const handleMenuClick = () => {
        if (isMobile) {
            toggleMobileSidebar();
        } else {
            toggleSidebar();
        }
    };

    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value);
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
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {t('app.title')}
                    </Typography>
                    {!isMobile && (
                        <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                            {t('app.subtitle')}
                        </Typography>
                    )}
                </Box>

                {/* Sélecteur de langue */}
                <Select
                    size="small"
                    value={i18n.language}
                    onChange={handleLanguageChange}
                    sx={{ minWidth: 100 }}
                >
                    <MenuItem value="fr">Français 🇫🇷</MenuItem>
                    <MenuItem value="en">English 🇬🇧</MenuItem>
                </Select>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
