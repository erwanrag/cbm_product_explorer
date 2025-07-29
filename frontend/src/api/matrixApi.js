import axiosInstance from "./axiosInstance";

/**
 * Récupère la matrice des produits (cod_pro, ref_crn, ref_ext…)
 * @param {Object} payload - { cod_pro, ref_crn, ref_ext, grouping_crn, qualite }
 * @param {number} page - pagination (0-based)
 * @param {number} limit - taille de page
 * @returns {Promise<Object>} { total, rows: [...] }
 */
export const fetchProductMatrix = async (payload, page = 0, limit = 50) => {
    const response = await axiosInstance.post("/products/matrix", payload, {
        params: { page, limit },
    });
    return response.data;
};
