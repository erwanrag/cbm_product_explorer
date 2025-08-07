// ===================================
// 📁 src/hooks/useTranslation.js 
// ===================================

import { useState, useEffect } from 'react';

// Traductions critiques (header et éléments essentiels)
const coreTranslations = {
    "app.title": "CBM Product Explorer",
    "app.subtitle": "Product analysis and matching system",

    // Help
    "help.title": "Help & Documentation",
    "help.subtitle": "Complete guide to using CBM Product Explorer",

    // OPTIMIZATION 
    "optimization.title": "Catalog Optimization",
    "optimization.subtitle": "Analysis of potential savings through range rationalization",
    "optimization.loading": "Loading optimization analysis...",
    "optimization.no_data": "No optimization data available for the selected filters.",
    "optimization.error.title": "Error loading optimization data",
};

export const useTranslation = () => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('cbm-language') || 'fr';
    });

    const [jsonTranslations, setJsonTranslations] = useState({});
    const [isJsonLoaded, setIsJsonLoaded] = useState(false);

    // Charger les traductions JSON
    useEffect(() => {
        const loadJsonTranslations = async () => {
            if (language === 'en' && !isJsonLoaded) {
                try {
                    let data = {};

                    try {
                        // Import direct
                        const module = await import('../locales/en.json');
                        data = module.default || module;
                    } catch (error) {
                        // Fallback fetch
                        const response = await fetch('/locales/en.json');
                        if (response.ok) {
                            data = await response.json();
                        }
                    }

                    setJsonTranslations(data);
                    setIsJsonLoaded(true);

                } catch (error) {
                    // Échec silencieux, utilisation des fallbacks
                    setJsonTranslations({});
                    setIsJsonLoaded(true);
                }
            }
        };

        loadJsonTranslations();
        localStorage.setItem('cbm-language', language);
    }, [language, isJsonLoaded]);

    // Fonction de traduction
    const t = (key, frenchDefault = null) => {
        if (language === 'en') {
            // Priorité 1 : Traductions critiques
            if (coreTranslations[key]) {
                return coreTranslations[key];
            }

            // Priorité 2 : JSON chargé
            if (isJsonLoaded && Object.keys(jsonTranslations).length > 0) {
                const keys = key.split('.');
                let value = jsonTranslations;

                for (const k of keys) {
                    value = value?.[k];
                    if (value === undefined) break;
                }

                if (value !== undefined) {
                    return value;
                }
            }
        }

        // Fallback français
        return frenchDefault || key.split('.').pop();
    };

    const changeLanguage = (newLang) => {
        if (['fr', 'en'].includes(newLang)) {
            setLanguage(newLang);
            if (newLang === 'fr') {
                setIsJsonLoaded(false);
            }
        }
    };

    return {
        t,
        language,
        changeLanguage,
        i18n: { language, changeLanguage }
    };
};