// frontend/vite.config.js - CONFIGURATION VITE CORRIGÉE
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    // Chargement des variables d'environnement
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react({
                // Fast Refresh pour le développement
                fastRefresh: true,
                // Configuration Babel simplifiée (sans plugin manquant)
                babel: {
                    plugins: mode === 'development' ? [] : []
                }
            })
        ],

        // Résolution des imports avec alias @
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },

        // ===== SERVEUR DE DÉVELOPPEMENT =====
        server: {
            port: 5181,                     // ✅ Port frontend fixé
            host: '0.0.0.0',               // ✅ Écoute toutes interfaces
            open: false,                   // N'ouvre pas automatiquement le navigateur
            cors: true,

            // ✅ PROXY VERS BACKEND (port 5180)
            proxy: mode === 'development' ? {
                '/api': {
                    target: env.VITE_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5180',
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path, // Garde le préfixe /api
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, _res) => {
                            console.log('🔴 Proxy error:', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            console.log('🔵 Proxying:', req.method, req.url);
                        });
                    }
                }
            } : undefined
        },

        // ===== BUILD OPTIMISÉ =====
        build: {
            target: 'es2020',
            sourcemap: mode === 'development',
            minify: mode === 'production' ? 'terser' : false,

            // Code splitting intelligent
            rollupOptions: {
                output: {
                    manualChunks: {
                        // Vendor chunks pour cache optimal
                        'vendor-react': ['react', 'react-dom'],
                        'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
                        'vendor-charts': ['plotly.js', 'react-plotly.js'],
                        'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
                        'vendor-router': ['react-router-dom'],
                        'vendor-animation': ['framer-motion'],
                        'utils': ['axios', 'dayjs', 'lodash.debounce', 'react-toastify']
                    },

                    // Noms de fichiers avec hash pour cache busting
                    entryFileNames: 'assets/[name].[hash].js',
                    chunkFileNames: 'assets/[name].[hash].js',
                    assetFileNames: 'assets/[name].[hash].[ext]'
                }
            },

            // Limite de taille des chunks
            chunkSizeWarningLimit: 1000
        },

        // ===== OPTIMISATION DÉPENDANCES =====
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                '@mui/material',
                '@mui/icons-material',
                '@tanstack/react-query',
                'axios',
                'framer-motion',
                'plotly.js'
            ],
            exclude: [
                // Exclusions si nécessaire
            ]
        },

        // ===== VARIABLES GLOBALES =====
        define: {
            __DEV__: mode === 'development',
            __PROD__: mode === 'production',
            __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0')
        },

        // ===== CSS =====
        css: {
            devSourcemap: mode === 'development',
            modules: {
                localsConvention: 'camelCase'
            }
        },

        // ===== ENVIRONNEMENT =====
        envPrefix: 'VITE_',
        envDir: '.',

        // ===== PERFORMANCE =====
        esbuild: {
            // Supprime console.log en production
            drop: mode === 'production' ? ['console', 'debugger'] : [],
            logOverride: { 'this-is-undefined-in-esm': 'silent' }
        }
    };
});