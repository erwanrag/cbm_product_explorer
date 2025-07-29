import axiosInstance from "./axiosInstance";

export const fetchStockHistory = async (payload, last_n_months = 12) => {
    const res = await axiosInstance.post(`/stock/history?last_n_months=${last_n_months}`, payload);
    return res.data;
};
