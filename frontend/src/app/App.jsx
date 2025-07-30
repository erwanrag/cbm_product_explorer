import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';

// Configuration et thèmes
import { config } from '@/config/environment';
import { createAppTheme } from '@/shared/theme';

// Context providers et layout
import { AppStateProvider } from '@/store/contexts/AppStateContext';
import { LayoutProvider } from '@/store/contexts/LayoutContext';
import Layout from '@/shared/components/layout/Layout';

// Routing
import AppRoutes from '@/app/routes/AppRoutes';

// Styles globaux
import 'react-toastify/dist/ReactToastify.css';

/**
 * Configuration React Query
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: config.performance.cacheTimeout,
            retry: config.performance.retryAttempts,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnMount: true,
        },
        mutations: {
            retry: 1,
        },
    },
});

/**
 * Application principale CBM GRC Matcher
 */
function App() {
    const theme = createAppTheme(config.ui.theme);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <AppStateProvider>
                        <LayoutProvider>
                            <Layout>
                                <AppRoutes />
                            </Layout>
                        </LayoutProvider>
                    </AppStateProvider>
                </BrowserRouter>

                {/* Notifications */}
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme={config.ui.theme}
                />

                {/* React Query DevTools */}
                {config.features.enableDevTools && <ReactQueryDevtools initialIsOpen={false} />}
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
