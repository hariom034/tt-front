import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { refreshToken } from "./authApi";

const baseUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: baseUrl,
});

// Add access token
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle expired access token
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                console.log("Access token expired. Refreshing...");

                const res = await refreshToken();

                const { accessToken, user } =
                    res.data.data;

                // Update Zustand
                useAuthStore.getState().login(
                    user,
                    accessToken
                );

                // Update original request
                originalRequest.headers.Authorization =
                    `Bearer ${accessToken}`;

                // Retry request
                return api(originalRequest);

            } catch (refreshError) {
                console.error(
                    "Refresh token failed:",
                    refreshError
                );

                useAuthStore.getState().logout();

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const apiGet = (url, params = {}) => {
    return api.get(url, { params });
};

export const apiPost = (url, data = {}) => {
    return api.post(url, data);
};

export const apiPut = (url, data = {}) => {
    return api.put(url, data);
};

export const apiDelete = (url, data = {}) => {
    return api.delete(url, { data });
};

export default api;