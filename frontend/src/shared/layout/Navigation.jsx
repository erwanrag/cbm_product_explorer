import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

import AnalyticsIcon from "@mui/icons-material/Analytics";
import TableViewIcon from "@mui/icons-material/TableView";

const Navigation = () => {
    const location = useLocation();

    const navItems = [
        { label: "Analyse Produit", to: ROUTES.dashboard, icon: <AnalyticsIcon /> },
        { label: "Matrice Produits", to: ROUTES.matrix, icon: <TableViewIcon /> },
    ];

    return (
        <List sx={{ width: "100%" }}>
            {navItems.map(({ label, to, icon }) => {
                const isActive = location.pathname === to;

                return (
                    <ListItemButton
                        key={to}
                        component={Link}
                        to={to}
                        selected={isActive}
                        sx={{
                            borderLeft: isActive ? "4px solid #1b365d" : "4px solid transparent",
                            backgroundColor: isActive ? "#f0f4f8" : "transparent",
                            color: isActive ? "primary.main" : "inherit",
                            px: 2,
                            py: 1.5,
                            "&:hover": {
                                backgroundColor: "#f5faff",
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: isActive ? "primary.main" : "#757575", minWidth: 36 }}>
                            {icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={label}
                            primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
                        />
                    </ListItemButton>
                );
            })}
        </List>
    );
};

export default Navigation;
