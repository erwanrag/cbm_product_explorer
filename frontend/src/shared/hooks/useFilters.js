// frontend/src/shared/hooks/useFilters.js
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook centralisé pour la gestion des filtres
 * Remplace la logique dupliquée dans dashboard/matrix/optimization
 * 
 * @param {object} initialFilters - Filtres initiaux
 * @param {string} storageKey - Clé localStorage pour persistence (optionnel)
 * @param {function} onChange - Callback appelé à chaque changement
 * @returns {object} { filters, updateFilter, updateFilters, resetFilters, savePreset, loadPreset, presets }
 */
export function useFilters(initialFilters = {}, storageKey = null, onChange = null) {
    // État des filtres
    const [filters, setFilters] = useState(() => {
        // Charger depuis localStorage si disponible
        if (storageKey) {
            try {
                const saved = localStorage.getItem(`cbm-filters-${storageKey}`);
                if (saved) {
                    return { ...initialFilters, ...JSON.parse(saved) };
                }
            } catch (error) {
                console.warn('Erreur chargement filtres:', error);
            }
        }
        return initialFilters;
    });

    // État des presets sauvegardés
    const [presets, setPresets] = useState(() => {
        if (storageKey) {
            try {
                const saved = localStorage.getItem(`cbm-presets-${storageKey}`);
                return saved ? JSON.parse(saved) : {};
            } catch (error) {
                console.warn('Erreur chargement presets:', error);
                return {};
            }
        }
        return {};
    });

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        if (storageKey) {
            try {
                localStorage.setItem(`cbm-filters-${storageKey}`, JSON.stringify(filters));
            } catch (error) {
                console.warn('Erreur sauvegarde filtres:', error);
            }
        }

        // Callback onChange
        if (onChange) {
            onChange(filters);
        }
    }, [filters, storageKey]);

    /**
     * Met à jour un seul filtre
     */
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    /**
     * Met à jour plusieurs filtres en une fois
     */
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    }, []);

    /**
     * Réinitialise tous les filtres
     */
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
        
        // Supprimer du localStorage
        if (storageKey) {
            try {
                localStorage.removeItem(`cbm-filters-${storageKey}`);
            } catch (error) {
                console.warn('Erreur suppression filtres:', error);
            }
        }
    }, [initialFilters, storageKey]);

    /**
     * Sauvegarde les filtres actuels comme preset
     */
    const savePreset = useCallback((presetName) => {
        if (!presetName || !storageKey) return;

        const newPresets = {
            ...presets,
            [presetName]: {
                filters: { ...filters },
                savedAt: new Date().toISOString()
            }
        };

        setPresets(newPresets);

        try {
            localStorage.setItem(`cbm-presets-${storageKey}`, JSON.stringify(newPresets));
        } catch (error) {
            console.warn('Erreur sauvegarde preset:', error);
        }
    }, [filters, presets, storageKey]);

    /**
     * Charge un preset sauvegardé
     */
    const loadPreset = useCallback((presetName) => {
        if (!presetName || !presets[presetName]) return;

        setFilters(presets[presetName].filters);
    }, [presets]);

    /**
     * Supprime un preset
     */
    const deletePreset = useCallback((presetName) => {
        if (!presetName || !storageKey) return;

        const newPresets = { ...presets };
        delete newPresets[presetName];

        setPresets(newPresets);

        try {
            localStorage.setItem(`cbm-presets-${storageKey}`, JSON.stringify(newPresets));
        } catch (error) {
            console.warn('Erreur suppression preset:', error);
        }
    }, [presets, storageKey]);

    /**
     * Vérifie si les filtres sont vides (tous égaux aux valeurs initiales)
     */
    const areFiltersEmpty = useCallback(() => {
        return Object.keys(filters).every(key => {
            const current = filters[key];
            const initial = initialFilters[key];
            
            // Gestion des tableaux vides
            if (Array.isArray(current) && Array.isArray(initial)) {
                return current.length === 0 && initial.length === 0;
            }
            
            // Gestion des valeurs null/undefined
            if (current == null && initial == null) return true;
            
            return current === initial;
        });
    }, [filters, initialFilters]);

    /**
     * Compte le nombre de filtres actifs (différents des valeurs initiales)
     */
    const getActiveFiltersCount = useCallback(() => {
        return Object.keys(filters).filter(key => {
            const current = filters[key];
            const initial = initialFilters[key];
            
            // Ignorer les filtres vides/null
            if (current == null || current === '' || (Array.isArray(current) && current.length === 0)) {
                return false;
            }
            
            return current !== initial;
        }).length;
    }, [filters, initialFilters]);

    return {
        filters,
        updateFilter,
        updateFilters,
        resetFilters,
        savePreset,
        loadPreset,
        deletePreset,
        presets,
        areFiltersEmpty,
        getActiveFiltersCount,
    };
}