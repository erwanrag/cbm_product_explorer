// ===================================
// 📁 frontend/src/app/router.jsx - ROUTEUR PRINCIPAL
// ===================================

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout principal
import Layout from '@/shared/layout/Layout';

// Pages avec lazy loading
import { createLazyPage } from '@/utils/lazy-loading';

// Fallback de chargement
import GlobalLoader from '@/shared/components/GlobalLoader';

// Pages principales
const DashboardPage = createLazyPage(() => import('@/features/dashboard/DashboardPage'));
const MatrixPage = createLazyPage(() => import('@/features/matrix/MatrixPage'));
const OptimizationPage = createLazyPage(() => import('@/features/optimization/OptimizationPage'));
const AnalyticsPage = createLazyPage(() => import('@/features/analytics/AnalyticsPage'));

// Pages d'erreur
const NotFoundPage = createLazyPage(() => import('@/shared/pages/NotFound'));
const ErrorPage = createLazyPage(() => import('@/shared/pages/Error'));

/**
 * Configuration des routes
 */
const routes = [
    { path: '/dashboard', element: DashboardPage, title: 'Dashboard' },
    { path: '/matrix', element: MatrixPage, title: 'Matrice' },
    { path: '/optimization', element: OptimizationPage, title: 'Optimisation' },
    { path: '/analytics', element: AnalyticsPage, title: 'Analytics' },
];

/**
 * Routeur principal de l'application
 */
export default function AppRouter() {
    return (
        <Suspense fallback={<GlobalLoader />}>
            <Routes>
                {/* Layout principal avec nested routes */}
                <Route path="/" element={<Layout />}>
                    {/* Redirection racine */}
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Routes principales */}
                    {routes.map(({ path, element: Component, title }) => (
                        <Route
                            key={path}
                            path={path}
                            element={<Component title={title} />}
                        />
                    ))}

                    {/* Routes d'erreur */}
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}