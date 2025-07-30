// ===================================
// 📁 frontend/src/shared/components/cards/CBMCard.jsx - AMÉLIORER
// ===================================

import React from 'react';
import { Card, CardContent, CardActions, CardHeader, Box, IconButton, Divider } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * Carte CBM enterprise avec animations et actions
 */
export default function CBMCard({
    title,
    subtitle,
    children,
    actions,
    headerAction,
    elevation = 1,
    interactive = false,
    onClick,
    loading = false,
    variant = 'default', // 'default', 'outlined', 'gradient'
    sx = {},
    ...props
}) {
    const getCardStyles = () => {
        const baseStyles = {
            borderRadius: 3,
            transition: 'all 0.3s ease-in-out',
            cursor: interactive || onClick ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden'
        };

        switch (variant) {
            case 'outlined':
                return {
                    ...baseStyles,
                    border: '2px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    '&:hover': interactive ? {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    } : {}
                };
            case 'gradient':
                return {
                    ...baseStyles,
                    background: 'linear-gradient(135deg, rgba(27, 54, 93, 0.05) 0%, rgba(0, 91, 150, 0.05) 100%)',
                    border: '1px solid',
                    borderColor: 'primary.light',
                    '&:hover': interactive ? {
                        background: 'linear-gradient(135deg, rgba(27, 54, 93, 0.1) 0%, rgba(0, 91, 150, 0.1) 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(27, 54, 93, 0.15)'
                    } : {}
                };
            default:
                return {
                    ...baseStyles,
                    '&:hover': interactive ? {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    } : {}
                };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={interactive ? { scale: 1.02 } : {}}
        >
            <Card
                elevation={elevation}
                onClick={onClick}
                sx={{
                    ...getCardStyles(),
                    ...sx
                }}
                {...props}
            >
                {/* Loading overlay */}
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}
                    >
                        <CircularProgress size={32} />
                    </Box>
                )}

                {/* Header */}
                {(title || subtitle || headerAction) && (
                    <>
                        <CardHeader
                            title={title}
                            subheader={subtitle}
                            action={
                                headerAction || (
                                    <IconButton size="small">
                                        <MoreVert />
                                    </IconButton>
                                )
                            }
                            titleTypographyProps={{
                                variant: 'h6',
                                fontWeight: 600,
                                color: 'primary.main'
                            }}
                            subheaderTypographyProps={{
                                variant: 'body2',
                                color: 'text.secondary'
                            }}
                        />
                        <Divider />
                    </>
                )}

                {/* Content */}
                <CardContent>
                    {children}
                </CardContent>

                {/* Actions */}
                {actions && (
                    <>
                        <Divider />
                        <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                            {actions}
                        </CardActions>
                    </>
                )}
            </Card>
        </motion.div>
    );
}