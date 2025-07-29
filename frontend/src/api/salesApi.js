import axiosInstance from "./axiosInstance";

export const fetchSalesHistory = async (payload, last_n_months = 12) => {
    const res = await axiosInstance.post(`/sales/history?last_n_months=${last_n_months}`, payload);
    return res.data;
};
