// ===================================
// 📁 frontend/src/shared/hooks/useModal.js
// Hook générique pour gestion des modals
// ===================================

import { useState, useCallback } from 'react';

/**
 * Hook centralisé pour gérer l'état des modals
 * Supporte les modals avec ou sans données associées
 * 
 * @param {object} config - Configuration du modal
 * @returns {object} État et handlers du modal
 */
export function useModal(config = {}) {
    const {
        defaultOpen = false,
        onOpen = null,
        onClose = null,
        onToggle = null,
    } = config;

    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [data, setData] = useState(null);

    /**
     * Ouvre le modal avec données optionnelles
     */
    const open = useCallback((modalData = null) => {
        setData(modalData);
        setIsOpen(true);
        if (onOpen) {
            onOpen(modalData);
        }
    }, [onOpen]);

    /**
     * Ferme le modal et reset les données
     */
    const close = useCallback(() => {
        setIsOpen(false);
        setData(null);
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    /**
     * Toggle l'état du modal
     */
    const toggle = useCallback((modalData = null) => {
        if (isOpen) {
            close();
        } else {
            open(modalData);
        }
        if (onToggle) {
            onToggle(!isOpen, modalData);
        }
    }, [isOpen, open, close, onToggle]);

    /**
     * Update les données sans fermer le modal
     */
    const updateData = useCallback((newData) => {
        setData(newData);
    }, []);

    return {
        isOpen,
        data,
        open,
        close,
        toggle,
        updateData,
        setIsOpen,
        setData,
    };
}

/**
 * Hook pour gérer plusieurs modals dans un même composant
 * Utile quand on a detail modal, confirm modal, export modal, etc.
 * 
 * @example
 * const modals = useMultipleModals({
 *   detail: { onClose: () => console.log('Detail closed') },
 *   confirm: {},
 *   export: {}
 * });
 * 
 * modals.detail.open(productData);
 * modals.confirm.open({ action: 'delete', id: 123 });
 */
export function useMultipleModals(config = {}) {
    const modals = {};

    for (const [key, modalConfig] of Object.entries(config)) {
        modals[key] = useModal(modalConfig);
    }

    /**
     * Ferme tous les modals d'un coup
     */
    const closeAll = useCallback(() => {
        Object.values(modals).forEach(modal => modal.close());
    }, [modals]);

    /**
     * Vérifie si au moins un modal est ouvert
     */
    const hasOpenModal = useCallback(() => {
        return Object.values(modals).some(modal => modal.isOpen);
    }, [modals]);

    return {
        ...modals,
        closeAll,
        hasOpenModal,
    };
}

export default useModal;


