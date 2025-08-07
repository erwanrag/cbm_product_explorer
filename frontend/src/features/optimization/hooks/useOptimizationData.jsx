// ===================================
// 📁 frontend/src/features/optimization/hooks/useOptimizationData.js - COMPLET
// ===================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { OptimizationService } from '@/api/services/optimizationService';

// Hook principal pour les données d'optimisation
export const useOptimizationData = (filters, enabled = true) => {
    return useQuery({
        queryKey: ['optimization', 'data', filters],
        queryFn: () => OptimizationService.getOptimization(filters),
        enabled: Boolean(enabled && filters && Object.keys(filters).length > 0),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        onError: (error) => {
            console.error('❌ Erreur useOptimizationData:', error);
            toast.error('Erreur lors du chargement des données d\'optimisation');
        }
    });
};

// Hook pour la simulation d'optimisation (placeholder)
export const useOptimizationSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (optimizationData) => {
            // Pour l'instant, juste un console.log car pas d'endpoint backend
            //console.log('🎮 Simulation demandée pour:', optimizationData);
            return Promise.resolve({
                success: true,
                message: 'Simulation effectuée (placeholder)'
            });
        },
        onSuccess: (data, variables) => {
            //console.log('✅ Simulation réussie:', data);
            toast.success('Simulation effectuée avec succès');
            // Invalider les caches liés à l'optimisation
            queryClient.invalidateQueries(['optimization']);
        },
        onError: (error, variables) => {
            console.error('❌ Erreur simulation:', error);
            toast.error('Erreur lors de la simulation');
        }
    });
};

// Hook pour appliquer les optimisations (placeholder)
export const useApplyOptimizations = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (optimizations) => {
            // Pour l'instant, juste un console.log car pas d'endpoint backend
            //console.log('🔧 Application demandée pour:', optimizations);
            return Promise.resolve({
                success: true,
                applied_count: optimizations.length,
                message: 'Optimisations appliquées (placeholder)'
            });
        },
        onSuccess: (data) => {
            const appliedCount = data.applied_count || 0;
            toast.success(`${appliedCount} optimisation(s) appliquée(s) avec succès (simulation)`);

            // Invalider toutes les données car elles ont changé
            queryClient.invalidateQueries(['optimization']);
            queryClient.invalidateQueries(['dashboard']);
        },
        onError: (error) => {
            console.error('❌ Erreur application optimisations:', error);
            toast.error('Erreur lors de l\'application des optimisations');
        }
    });
};

// Hook pour l'historique des optimisations (placeholder)
export const useOptimizationHistory = (filters = {}, enabled = true) => {
    return useQuery({
        queryKey: ['optimization', 'history', filters],
        queryFn: () => {
            // Placeholder - retourne des données vides
            //console.log('📋 Historique demandé avec filtres:', filters);
            return Promise.resolve([]);
        },
        enabled: Boolean(enabled),
        staleTime: 5 * 60 * 1000,
        cacheTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        onError: (error) => {
            console.error('❌ Erreur useOptimizationHistory:', error);
            toast.error('Erreur lors du chargement de l\'historique');
        }
    });
};

// Hook pour les statistiques d'optimisation (placeholder)
export const useOptimizationStats = (dateRange = {}, enabled = true) => {
    return useQuery({
        queryKey: ['optimization', 'stats', dateRange],
        queryFn: () => {
            // Placeholder - retourne des stats vides
            //console.log('📊 Stats demandées pour:', dateRange);
            return Promise.resolve({
                totalOptimizations: 0,
                totalGains: 0,
                avgQualityScore: 0
            });
        },
        enabled: Boolean(enabled),
        staleTime: 2 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        onError: (error) => {
            console.error('❌ Erreur useOptimizationStats:', error);
            toast.error('Erreur lors du chargement des statistiques');
        }
    });
};

// Hook pour l'export des données (placeholder)
export const useOptimizationExport = () => {
    return useMutation({
        mutationFn: (exportParams) => {
            // Placeholder - simule un export
            //console.log('📥 Export demandé:', exportParams);
            toast.info('Export non implémenté (placeholder)');
            return Promise.resolve({ success: true });
        },
        onSuccess: (data, variables) => {
            //console.log('✅ Export simulé réussi');
        },
        onError: (error, variables) => {
            console.error('❌ Erreur export:', error);
            toast.error('Erreur lors de l\'export');
        }
    });
};