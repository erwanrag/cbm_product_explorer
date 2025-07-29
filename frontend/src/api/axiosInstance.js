// src/api/axiosInstance.js
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import qs from "qs";

const api = axios.create({
    baseURL: API_BASE_URL, // ✅ depuis env.js
    timeout: 30000,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }), // ✅ important pour FastAPI
});

// ✅ Pas d'intercepteurs auth ou redirection

export default api;
