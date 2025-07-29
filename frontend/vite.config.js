// frontend/vite.config.js - VERSION CORRIGÉE
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react({
                fastRefresh: true,
                babel: {
                    plugins: mode === 'development' ? [] : [
                        ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]
                    ]
                }
            })
        ],

        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },

        // Configuration serveur CORRIGÉE
        server: {
            port: 5181, // ✅ PORT FIXÉ
            host: '0.0.0.0', // ✅ ÉCOUTE SUR TOUTES LES INTERFACES
            open: false,
            cors: true,
            proxy: mode === 'development' ? {
                '/api': {
                    target: env.VITE_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5180',
                    changeOrigin: true,
                    secure: false,
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, _res) => {
                            console.log('🔴 Proxy error:', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            console.log('🔵 Proxying request:', req.method, req.url);
                        });
                    }
                }
            } : undefined
        },

        build: {
            sourcemap: mode === 'development',
            minify: mode === 'production' ? 'terser' : false,
            target: 'es2020',
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                        mui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
                        charts: ['plotly.js', 'react-plotly.js'],
                        utils: ['axios', 'dayjs', 'lodash.debounce'],
                        animations: ['framer-motion']
                    }
                }
            }
        },

        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                '@mui/material',
                '@mui/icons-material',
                '@tanstack/react-query',
                'axios',
                'framer-motion'
            ]
        },

        define: {
            __DEV__: mode === 'development',
            __PROD__: mode === 'production'
        }
    };
});