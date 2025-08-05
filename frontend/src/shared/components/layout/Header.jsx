import React from 'react';
import {
    AppBar, Toolbar, Typography, IconButton, Box,
    useMediaQuery, useTheme, Select, MenuItem,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useLayout } from '@/store/hooks/useLayout';
import { useTranslation } from '@/store/contexts/LanguageContext';

const Header = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { toggleSidebar, toggleMobileSidebar } = useLayout();
    const { t, language, changeLanguage } = useTranslation();

    

    const handleMenuClick = () => {
        if (isMobile) {
            toggleMobileSidebar();
        } else {
            toggleSidebar();
        }
    };

    const handleLanguageChange = (event) => {
        
        changeLanguage(event.target.value);
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
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {t('app.title', 'CBM GRC Matcher')}
                        
                    </Typography>
                    {!isMobile && (
                        <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                            {t('app.subtitle', 'Système d\'analyse et matching produits')}
                        </Typography>
                    )}
                </Box>

                <Select
                    size="small"
                    value={language}
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
