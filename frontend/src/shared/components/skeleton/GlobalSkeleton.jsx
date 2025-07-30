// ===================================
// 📁 frontend/src/shared/components/skeleton/GlobalSkeleton.jsx - AMÉLIORER
// ===================================

import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

/**
 * Skeleton CBM pour différents types de contenu
 */
export default function GlobalSkeleton({
  variant = 'dashboard', // 'dashboard', 'table', 'card', 'form'
  rows = 5,
  animate = true,
  ...props
}) {
  const skeletonProps = {
    animation: animate ? 'wave' : false,
    sx: { borderRadius: 1 },
  };

  switch (variant) {
    case 'dashboard':
      return (
        <Box sx={{ p: 2 }} {...props}>
          {/* Header */}
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} {...skeletonProps} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 4 }} {...skeletonProps} />

          {/* KPI Cards */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} sx={{ minWidth: 200, flex: 1 }}>
                <CardContent>
                  <Skeleton variant="text" width="70%" height={20} {...skeletonProps} />
                  <Skeleton variant="text" width="50%" height={32} {...skeletonProps} />
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Chart */}
          <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} {...skeletonProps} />

          {/* Table */}
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1 }} {...skeletonProps} />
          ))}
        </Box>
      );

    case 'table':
      return (
        <Box sx={{ p: 2 }} {...props}>
          {/* Table Header */}
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} {...skeletonProps} />

          {/* Table Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1 }} {...skeletonProps} />
          ))}
        </Box>
      );

    case 'card':
      return (
        <Card sx={{ p: 2 }} {...props}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} {...skeletonProps} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mb: 2 }} {...skeletonProps} />
            <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} {...skeletonProps} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={80} height={32} {...skeletonProps} />
              <Skeleton variant="rectangular" width={80} height={32} {...skeletonProps} />
            </Box>
          </CardContent>
        </Card>
      );

    case 'form':
      return (
        <Box sx={{ p: 2 }} {...props}>
          {Array.from({ length: rows }).map((_, i) => (
            <Box key={i} sx={{ mb: 3 }}>
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} {...skeletonProps} />
              <Skeleton variant="rectangular" height={40} {...skeletonProps} />
            </Box>
          ))}
        </Box>
      );

    default:
      return (
        <Box sx={{ p: 2 }} {...props}>
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1 }} {...skeletonProps} />
          ))}
        </Box>
      );
  }
}
