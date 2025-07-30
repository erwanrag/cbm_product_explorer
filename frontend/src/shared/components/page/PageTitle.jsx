// ===================================
// 📁 frontend/src/shared/components/page/PageTitle.jsx - AMÉLIORER
// ===================================

import React from 'react';
import { Typography, Box, Breadcrumbs, Link, Chip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import constantes
import { ROUTE_TITLES } from '@/constants/routes';

/**
 * Titre de page CBM avec breadcrumbs et actions
 */
export default function PageTitle({
  title,
  subtitle,
  actions,
  showBreadcrumbs = true,
  badge,
  icon,
  sx = {},
  ...props
}) {
  const location = useLocation();

  // Génération automatique des breadcrumbs
  const breadcrumbs = React.useMemo(() => {
    if (!showBreadcrumbs) return [];

    const segments = location.pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const isLast = index === segments.length - 1;

      return {
        path,
        label: ROUTE_TITLES[path] || segment.replace(/-/g, ' '),
        isLast,
      };
    });
  }, [location.pathname, showBreadcrumbs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          mb: 4,
          ...sx,
        }}
        {...props}
      >
        {/* Breadcrumbs */}
        {showBreadcrumbs && breadcrumbs.length > 1 && (
          <Breadcrumbs sx={{ mb: 2, fontSize: '0.875rem' }} separator="›">
            <Link
              component={RouterLink}
              to="/"
              color="inherit"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              Accueil
            </Link>
            {breadcrumbs.map(({ path, label, isLast }) =>
              isLast ? (
                <Typography key={path} color="text.primary" sx={{ fontWeight: 500 }}>
                  {label}
                </Typography>
              ) : (
                <Link
                  key={path}
                  component={RouterLink}
                  to={path}
                  color="inherit"
                  underline="hover"
                  sx={{ textTransform: 'capitalize' }}
                >
                  {label}
                </Link>
              )
            )}
          </Breadcrumbs>
        )}

        {/* Title Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            {/* Icon */}
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                {icon}
              </Box>
            )}

            {/* Title & Subtitle */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </Typography>

                {badge && (
                  <Chip
                    label={badge}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>

              {subtitle && (
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Actions */}
          {actions && <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{actions}</Box>}
        </Box>
      </Box>
    </motion.div>
  );
}
