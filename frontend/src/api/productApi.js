import axiosInstance from "./axiosInstance";

export const fetchProductDetails = async (payload) => {
    const res = await axiosInstance.post("/products/details", payload);
    return res.data;
};

export const getSingleProductDetail = async (cod_pro) => {
    const res = await axiosInstance.get(`/products/detail/${cod_pro}`);
    return res.data;
};
