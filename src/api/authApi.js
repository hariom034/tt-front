import axios from "axios";
import { useAuthStore } from "../store/authStore";
const baseUrl = import.meta.env.VITE_API_URL;

function sendOtp(email) {
    return axios.post(
        `${baseUrl}/auth/send-otp`,
        {
            email,
        },
 
        {
            withCredentials: true,
        },
    );
}

function verifyOtp(email, otp) {

    return axios.post(
        `${baseUrl}/auth/verify-otp`,
        {
            email,
            otp,
        },
        {
            withCredentials: true,
        },
    );
}


function refreshToken() {
    return axios.post(
        `${baseUrl}/auth/refresh-token`,
        {},
        {
            withCredentials: true,
        },
    );
} 

function userLogout() {
    axios.interceptors.request.use((config) => {
        const token = useAuthStore.getState().accessToken;
    
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    
        return config;
    });

    return axios.post(
        `${baseUrl}/auth/logout`,
        
        {},
        {
            withCredentials: true,
        },
    );

}

export { sendOtp, verifyOtp, refreshToken, userLogout };