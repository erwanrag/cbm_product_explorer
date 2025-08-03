// ===================================
// 📁 frontend/src/features/optimization/hooks/useOptimizationData.js
// ===================================
//test
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { OptimizationService } from '@/api/services/optimizationService';

// ✅ Hook principal pour les données d'optimisation
export const useOptimizationData = (filters) => {
    return useQuery({
        queryKey: ['optimization', 'data', filters],
        queryFn: () => OptimizationService.getOptimization(filters),
        enabled: Boolean(filters && Object.keys(filters).length > 0),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        onError: (error) => {
            console.error('Erreur useOptimizationData:', error);
            toast.error('Erreur lors du chargement des données d\'optimisation');
        }
    });
};

// ✅ Hook pour la simulation d'optimisation
export const useOptimizationSimulation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (optimizationData) => OptimizationService.simulateOptimization(optimizationData),
        onSuccess: (data) => {
            toast.success('Simulation réalisée avec succès');
            // Invalider les caches liés à l'optimisation
            queryClient.invalidateQueries(['optimization']);
        },
        onError: (error) => {
            console.error('Erreur simulation:', error);
            toast.error('Erreur lors de la simulation');
        }
    });
};

// ✅ Hook pour appliquer les optimisations
export const useApplyOptimizations = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (optimizations) => OptimizationService.applyOptimizations(optimizations),
        onSuccess: (data) => {
            toast.success(`${data.applied_count || 0} optimisation(s) appliquée(s) avec succès`);
            // Invalider toutes les données car elles ont changé
            queryClient.invalidateQueries(['optimization']);
            queryClient.invalidateQueries(['dashboard']); // Impact sur le dashboard aussi
        },
        onError: (error) => {
            console.error('Erreur application optimisations:', error);
            toast.error('Erreur lors de l\'application des optimisations');
        }
    });
};

// ✅ Hook pour l'historique des optimisations
export const useOptimizationHistory = (filters = {}) => {
    return useQuery({
        queryKey: ['optimization', 'history', filters],
        queryFn: () => OptimizationService.getOptimizationHistory(filters),
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        onError: (error) => {
            console.error('Erreur historique optimisations:', error);
            toast.error('Erreur lors du chargement de l\'historique');
        }
    });
};

// ✅ Hook pour les statistiques d'optimisation
export const useOptimizationStats = (dateRange = {}) => {
    return useQuery({
        queryKey: ['optimization', 'stats', dateRange],
        queryFn: () => OptimizationService.getOptimizationStats(dateRange),
        staleTime: 15 * 60 * 1000, // 15 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        onError: (error) => {
            console.error('Erreur stats optimisations:', error);
            toast.error('Erreur lors du chargement des statistiques');
        }
    });
};

// ✅ Hook pour l'export des données
export const useExportOptimization = () => {
    return useMutation({
        mutationFn: (exportParams) => OptimizationService.exportOptimization(exportParams),
        onSuccess: () => {
            toast.success('Export réalisé avec succès');
        },
        onError: (error) => {
            console.error('Erreur export:', error);
            toast.error('Erreur lors de l\'export');
        }
    });
};