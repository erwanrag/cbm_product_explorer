// frontend/src/components/debug/CacheDebugPanel.jsx

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { Close, DeleteOutline, Refresh } from '@mui/icons-material';
import { localCache } from '@/lib/cache';

export default function CacheDebugPanel({ open, onClose }) {
  const [stats, setStats] = useState(localCache.getStats());

  const refreshStats = () => {
    setStats(localCache.getStats());
  };

  useEffect(() => {
    if (open) {
      refreshStats();
      const interval = setInterval(refreshStats, 2000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const handleClearAll = () => {
    localCache.clear();
    refreshStats();
  };

  const handleDeleteKey = (key) => {
    localCache.delete(key);
    refreshStats();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">🗄️ Cache Debug</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Stats */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Entrées en cache : <strong>{stats.size}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mémoire : <strong>{stats.memory?.kb} KB</strong>
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={refreshStats}
            fullWidth
          >
            Rafraîchir
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutline />}
            onClick={handleClearAll}
            fullWidth
          >
            Tout vider
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Cache Entries */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Clés en cache ({stats.keys.length})
        </Typography>

        <List sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          {stats.keys.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune entrée en cache
            </Typography>
          ) : (
            stats.keys.map((key) => (
              <ListItem
                key={key}
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => handleDeleteKey(key)}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                }
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {key}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Drawer>
  );
}