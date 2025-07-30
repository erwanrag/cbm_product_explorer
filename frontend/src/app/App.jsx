/ ===================================
// 📁 frontend/src/app/App.jsx - POINT D'ENTRÉE PRINCIPAL
// ===================================

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';

// Configuration et providers
import { config } from '@/config/environment';
import { theme } from '@/shared/theme';
import { AppStateProvider } from '@/store/contexts/AppStateContext';

// Router principal
import AppRouter from './router';

// Styles globaux
import 'react-toastify/dist/ReactToastify.css';

/**
 * Configuration React Query
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: config.performance.cacheTimeout,
            cacheTime: config.performance.longCacheTimeout,
            retry: config.performance.retryAttempts,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 1,
        },
    },
});

/**
 * Composant App principal - Orchestration des providers
 */
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AppStateProvider>
                        <AppRouter />

                        {/* Toast notifications */}
                        <ToastContainer
                            position={config.ui.notificationPosition}
                            autoClose={config.ui.notificationDuration}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme={config.ui.theme}
                        />
                    </AppStateProvider>
                </ThemeProvider>
            </BrowserRouter>

            {/* DevTools en développement uniquement */}
            {config.features.enableReactQueryDevTools && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

export default App;