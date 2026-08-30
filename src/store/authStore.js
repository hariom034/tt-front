import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loading: true,

      login: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
          loading: false,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          loading: false,
        }),

      setLoading: (loading) =>
        set({
          loading,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);