// ===================================
// 📁 frontend/src/app/App.jsx - AVEC STORE UNIFIÉ
// ===================================

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AppStateProvider } from '@/store/contexts/AppStateContext'; // 🔥 Déjà avec ThemeProvider intégré
import { LayoutProvider } from '@/store/contexts/LayoutContext';

// Components
import Layout from '@/shared/components/layout/Layout';
import AppRoutes from '@/app/routes/AppRoutes';
import config from '@/config/environment';

// Configuration React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: config.performance.cacheTimeout,
            cacheTime: config.performance.longCacheTimeout,
            retry: config.performance.retryAttempts,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

function App() {
    return (
        <AppStateProvider> {/* 🔥 Déjà avec ThemeProvider + CssBaseline intégré */}
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <LayoutProvider>
                        <Layout>
                            <AppRoutes />
                        </Layout>
                    </LayoutProvider>
                </BrowserRouter>

                {/* Toast notifications */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />

                {/* React Query DevTools */}
                {config.features.enableReactQueryDevTools && (
                    <ReactQueryDevtools initialIsOpen={false} />
                )}
            </QueryClientProvider>
        </AppStateProvider>
    );
}

export default App;