// frontend/src/app/routes/AppRouter.jsx - ROUTING ENTERPRISE
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Layout principal
import Layout from '@/shared/layout/Layout';

// Pages avec lazy loading intelligent
import { createLazyComponent } from '@/utils/performance';

const DashboardPage = createLazyComponent(
    () => import('@/features/dashboard/DashboardPage')
);

const MatrixPage = createLazyComponent(
    () => import('@/features/matrix/MatrixPage')
);

const OptimizationPage = createLazyComponent(
    () => import('@/features/optimization/OptimizationPage')
);

const AnalyticsPage = createLazyComponent(
    () => import('@/features/analytics/AnalyticsPage')
);

const NotFoundPage = createLazyComponent(
    () => import('@/pages/NotFound')
);

/**
 * Fallback de chargement global
 */
const GlobalLoadingFallback = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            flexDirection: 'column',
            gap: 2
        }}
    >
        <CircularProgress size={40} />
        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Chargement de l'application...
        </Box>
    </Box>
);

/**
 * Configuration des routes enterprise
 */
const routes = [
    { path: '/', element: DashboardPage, exact: true },
    { path: '/dashboard', element: DashboardPage },
    { path: '/matrix', element: MatrixPage },
    { path: '/optimization', element: OptimizationPage },
    { path: '/analytics', element: AnalyticsPage }
];

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<GlobalLoadingFallback />}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {/* Redirection racine vers dashboard */}
                        <Route index element={<Navigate to="/dashboard" replace />} />

                        {/* Routes principales */}
                        {routes.map(({ path, element: Component }) => (
                            <Route
                                key={path}
                                path={path}
                                element={<Component />}
                            />
                        ))}

                        {/* Route 404 */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}