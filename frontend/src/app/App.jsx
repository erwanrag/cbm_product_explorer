// frontend/src / app / App.jsx - VERSION FINALE
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuration et providers
import config from '@/config/environment';
import theme from '@/shared/theme/theme';
import { AppStateProvider } from '@/store/contexts/AppStateContext';
import { PerformanceProvider } from '@/providers/PerformanceProvider';
import ErrorBoundary from '@/shared/components/error/ErrorBoundary';

// Routing
import AppRouter from './routes/AppRouter';

/**
 * Configuration React Query enterprise
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: config.performance.cacheTimeout,
            cacheTime: config.performance.cacheTimeout * 2,
            retry: (failureCount, error) => {
                // Stratégie de retry intelligente
                if (error?.response?.status === 404) return false;
                if (error?.response?.status >= 500) return failureCount < 3;
                return failureCount < 1;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: config.isDevelopment,
            networkMode: 'online'
        },
        mutations: {
            retry: 1,
            networkMode: 'online'
        }
    }
});

/**
 * Application principale - Architecture enterprise
 */
function App() {
    return (
        <ErrorBoundary fallback="❌ Une erreur critique s'est produite">
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AppStateProvider>
                        <PerformanceProvider>
                            <AppRouter />

                            {/* Toast notifications */}
                            <ToastContainer
                                position="bottom-right"
                                autoClose={5000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme="light"
                            />

                            {/* DevTools conditionnels */}
                            {config.features.enableDevTools && (
                                <ReactQueryDevtools
                                    initialIsOpen={false}
                                    position="bottom-left"
                                />
                            )}
                        </PerformanceProvider>
                    </AppStateProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;