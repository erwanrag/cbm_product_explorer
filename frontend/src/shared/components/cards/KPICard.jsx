// frontend/src/shared/components/cards/KPICard.jsx

import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function KPICard({
    title,
    value,
    subtitle,
    icon, // ✅ Garder le nom "icon" (minuscule)
    color = '#1976d2',
    trend,
    loading = false,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
        >
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        backgroundColor: color,
                    },
                }}
            >
                <CardContent sx={{ flex: 1, p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}
                            >
                                {title}
                            </Typography>

                            {loading ? (
                                <Typography variant="h5" sx={{ mb: 0.5 }}>
                                    --
                                </Typography>
                            ) : (
                                <Typography
                                    variant="h4"
                                    component="div"
                                    sx={{
                                        mb: 0.5,
                                        fontWeight: 700,
                                        color: color,
                                        fontSize: '1.75rem',
                                    }}
                                >
                                    {value}
                                </Typography>
                            )}

                            {subtitle && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                    {subtitle}
                                </Typography>
                            )}

                            {trend && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: trend.value >= 0 ? '#2e7d32' : '#d32f2f',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                                        {trend.label && ` ${trend.label}`}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* ✅ CORRECTION : utiliser "icon" (minuscule) partout */}
                        {icon && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 56,
                                    height: 56,
                                    borderRadius: '12px',
                                    backgroundColor: `${color}15`,
                                    ml: 2,
                                }}
                            >
                                {/* ✅ Gère JSX element ou component */}
                                {React.isValidElement(icon) ? (
                                    React.cloneElement(icon, { sx: { fontSize: 32, color } })
                                ) : typeof icon === 'function' ? (
                                    React.createElement(icon, { sx: { fontSize: 32, color } })
                                ) : (
                                    icon
                                )}
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
}