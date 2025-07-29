import axiosInstance from "./axiosInstance";

export const fetchCodProMatchList = async (payload) => {
    const res = await axiosInstance.post("/products/match", payload);
    return res.data.matches || [];
};
