import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
  } = useAuthStore();

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
  };
};