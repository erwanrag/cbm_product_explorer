import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Badge,
    Select,
    MenuItem,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Menu as MenuIcon, Storage } from '@mui/icons-material';
import { useLayout } from '@/store/hooks/useLayout';
import { useTranslation } from '@/store/contexts/LanguageContext';
import CacheDebugPanel from '@/components/debug/CacheDebugPanel';
import { localCache } from '@/lib/cache';

const Header = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { toggleSidebar, toggleMobileSidebar } = useLayout();
    const { t, language, changeLanguage } = useTranslation();

    const [cacheDebugOpen, setCacheDebugOpen] = useState(false);
    const cacheSize = localCache.getStats().size;

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
        <>
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
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                        >
                            {t('app.title', 'CBM Product Explorer')}
                        </Typography>
                        {!isMobile && (
                            <Typography
                                variant="body2"
                                sx={{ ml: 2, color: 'text.secondary', fontSize: '0.875rem' }}
                            >
                                {t('app.subtitle', "Système d'analyse et matching produits")}
                            </Typography>
                        )}
                    </Box>

                    {/* Bouton Cache Debug */}
                    <IconButton
                        onClick={() => setCacheDebugOpen(true)}
                        sx={{ mr: 2 }}
                        title="Cache Debug"
                    >
                        <Badge badgeContent={cacheSize} color="primary">
                            <Storage />
                        </Badge>
                    </IconButton>

                    {/* Sélecteur de langue */}
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

            {/* Panel de debug du cache */}
            <CacheDebugPanel
                open={cacheDebugOpen}
                onClose={() => setCacheDebugOpen(false)}
            />
        </>
    );
};

export default Header;