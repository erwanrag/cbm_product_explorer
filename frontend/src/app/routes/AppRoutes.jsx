// frontend/src/app/routes/AppRouter.jsx - REMPLACER TOUT LE CONTENU

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout principal
import Layout from '@/shared/components/layout/Layout';

// Pages avec lazy loading
import { createLazyPage } from '@/utils/lazy-loading';

// Fallback de chargement
import GlobalLoader from '@/shared/components/GlobalLoader';

// Pages principales - lazy loading intelligent
const DashboardPage = createLazyPage(() => import('@/features/dashboard/DashboardPage'));
const MatrixPage = createLazyPage(() => import('@/features/matrix/MatrixPage'));
const OptimizationPage = createLazyPage(() => import('@/features/optimization/OptimizationPage'));
const AnalyticsPage = createLazyPage(() => import('@/features/analytics/AnalyticsPage'));

// Pages d'erreur
const NotFoundPage = createLazyPage(() => import('@/shared/pages/NotFound'));
const ErrorPage = createLazyPage(() => import('@/shared/pages/Error'));

/**
 * Configuration des routes principales
 */
const routes = [
  {
    path: '/dashboard',
    element: DashboardPage,
    title: 'Dashboard',
    description: "Vue d'ensemble des produits et KPIs",
  },
  {
    path: '/matrix',
    element: MatrixPage,
    title: 'Matrice',
    description: 'Matrice de correspondance produits',
  },
  {
    path: '/optimization',
    element: OptimizationPage,
    title: 'Optimisation',
    description: 'Analyses et optimisations business',
  },
  {
    path: '/analytics',
    element: AnalyticsPage,
    title: 'Analytics',
    description: 'Tableaux de bord et métriques',
  },
];

/**
 * Routeur principal de l'application CBM GRC Matcher
 */
export default function AppRouter() {
  return (
    <Suspense fallback={<GlobalLoader message="Chargement de l'application..." />}>
      <Routes>
        {/* Layout principal avec nested routes */}
        <Route path="/" element={<Layout />}>
          {/* Redirection racine vers dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Routes principales */}
          {routes.map(({ path, element: Component, title, description }) => (
            <Route
              key={path}
              path={path}
              element={<Component title={title} description={description} />}
            />
          ))}

          {/* Routes système */}
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

// Export des routes pour navigation programmatique
export { routes };
