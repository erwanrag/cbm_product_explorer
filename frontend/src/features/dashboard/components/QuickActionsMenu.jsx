import React from 'react';
import {
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Refresh,
    FileDownload,
    ViewList,
    ViewModule,
    Settings,
    MoreVert,
} from '@mui/icons-material';

/**
 * Menu d'actions rapides du Dashboard
 */
export default function QuickActionsMenu({
    onRefresh,
    onExport,
    onViewModeChange,
    currentViewMode,
    loading,
}) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleChangeView = (mode) => {
        onViewModeChange?.(mode);
        handleClose();
    };

    return (
        <>
            <Tooltip title="Actions rapides">
                <IconButton onClick={handleOpen} disabled={loading}>
                    <MoreVert />
                </IconButton>
            </Tooltip>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={onRefresh}>
                    <ListItemIcon>
                        <Refresh />
                    </ListItemIcon>
                    <ListItemText primary="Actualiser les données" />
                </MenuItem>

                <MenuItem onClick={onExport}>
                    <ListItemIcon>
                        <FileDownload />
                    </ListItemIcon>
                    <ListItemText primary="Exporter (.csv)" />
                </MenuItem>

                <Divider />

                <MenuItem
                    selected={currentViewMode === 'overview'}
                    onClick={() => handleChangeView('overview')}
                >
                    <ListItemIcon>
                        <ViewModule />
                    </ListItemIcon>
                    <ListItemText primary="Vue synthétique" />
                </MenuItem>

                <MenuItem
                    selected={currentViewMode === 'revenue-focus'}
                    onClick={() => handleChangeView('revenue-focus')}
                >
                    <ListItemIcon>
                        <ViewList />
                    </ListItemIcon>
                    <ListItemText primary="Focus CA" />
                </MenuItem>

                <MenuItem
                    selected={currentViewMode === 'margin-analysis'}
                    onClick={() => handleChangeView('margin-analysis')}
                >
                    <ListItemIcon>
                        <Settings />
                    </ListItemIcon>
                    <ListItemText primary="Analyse marge" />
                </MenuItem>
            </Menu>
        </>
    );
}
