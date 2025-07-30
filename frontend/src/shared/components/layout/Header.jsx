// ===================================
// 📁 frontend/src/shared/layout/Header.jsx - CORRIGER LES IMPORTS
// ===================================

import React, { useMemo } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Breadcrumbs,
    Link as MUILink,
} from "@mui/material";
import { Menu, PushPin } from "@mui/icons-material";
import { useLocation, Link as RouterLink } from "react-router-dom";

// ✅ IMPORTS CORRIGÉS
import { useLayout } from "@/store/hooks/useLayout";
import { ROUTE_TITLES } from "@/constants/routes";

/**
 * Header CBM - Version corrigée
 */
const Header = () => {
    const { toggleSidebar, togglePin, isSidebarPinned } = useLayout();
    const location = useLocation();

    const breadcrumbs = useMemo(() => {
        const segments = location.pathname.split("/").filter(Boolean);
        const pathSegments = segments.slice(0, -1);

        return pathSegments.map((seg, idx) => {
            const to = "/" + segments.slice(0, idx + 1).join("/");
            return (
                <MUILink
                    key={to}
                    component={RouterLink}
                    to={to}
                    underline="hover"
                    color="inherit"
                    sx={{ textTransform: "capitalize", fontSize: 14 }}
                >
                    {ROUTE_TITLES[to] || seg.replace(/-/g, " ")}
                </MUILink>
            );
        });
    }, [location.pathname]);

    const pageTitle = useMemo(() => {
        return ROUTE_TITLES[location.pathname] || "CBM GRC Matcher";
    }, [location.pathname]);

    return (
        <AppBar
            position="fixed"
            color="inherit"
            elevation={0}
            sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {/* Toggle Buttons */}
                    <IconButton
                        onClick={togglePin}
                        color={isSidebarPinned ? "primary" : "default"}
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1
                        }}
                        aria-label="Épingler la sidebar"
                    >
                        <PushPin />
                    </IconButton>

                    <IconButton
                        onClick={toggleSidebar}
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1
                        }}
                        aria-label="Toggle sidebar"
                    >
                        <Menu />
                    </IconButton>

                    {/* Page Title & Breadcrumbs */}
                    <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {pageTitle}
                        </Typography>
                        {breadcrumbs.length > 0 && (
                            <Breadcrumbs
                                separator="›"
                                sx={{ fontSize: 13, color: "text.secondary" }}
                            >
                                <MUILink component={RouterLink} to="/" color="inherit">
                                    Accueil
                                </MUILink>
                                {breadcrumbs}
                            </Breadcrumbs>
                        )}
                    </Box>
                </Box>

                {/* Actions futures (profil, notifications, etc.) */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Espace pour futures actions */}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
