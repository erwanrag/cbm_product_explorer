import axiosInstance from "./axiosInstance";

/**
 * Récupère la fiche complète d’un produit (détails ventes, stock, achat, etc.)
 * @param {Object} payload - { cod_pro, ref_crn, ref_ext, grouping_crn }
 * @returns {Promise<Object>} DashboardFicheResponse
 */
export const fetchDashboardFiche = async (payload) => {
    const response = await axiosInstance.post("/dashboard/fiche", payload);
    return response.data;
};
