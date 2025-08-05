// ===================================
// 📁 src/store/contexts/LanguageContext.jsx
// ===================================

import React, { createContext, useContext } from 'react';
import { useTranslation as useTranslationHook } from '@/hooks/useTranslation';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const translation = useTranslationHook();

    return (
        <LanguageContext.Provider value={translation}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within LanguageProvider');
    }
    return context;
};