/**
 * Auth Store — Zustand with localStorage persistence
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth as authApi, TokenStore } from '@/api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login(credentials);
          TokenStore.set(data.accessToken);
          TokenStore.setRefresh(data.refreshToken);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg =
            err?.response?.data?.message || 'Login failed. Check your credentials.';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register(data);
          set({ isLoading: false });
          return { success: true, data: res.data };
        } catch (err) {
          const msg = err?.response?.data?.message || 'Registration failed.';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (_) {
          // Ignore — clear local state regardless
        }
        TokenStore.clear();
        set({ user: null, isAuthenticated: false, error: null });
      },

      fetchMe: async () => {
        if (!TokenStore.get()) return;
        try {
          const { data } = await authApi.me();
          set({ user: data.user, isAuthenticated: true });
        } catch (_) {
          TokenStore.clear();
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'winners-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
