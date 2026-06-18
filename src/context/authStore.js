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
      isHydrated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const { data } = await authApi.login(credentials);

          TokenStore.set(data.accessToken);
          TokenStore.setRefresh(data.refreshToken);

          set({
            user: data.user,
            isAuthenticated: true,
            isHydrated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (err) {
          const msg =
            err?.response?.data?.message ||
            'Login failed. Check your credentials.';

          set({
            error: msg,
            isLoading: false,
          });

          return { success: false, error: msg };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const res = await authApi.register(data);

          set({
            isLoading: false,
          });

          return {
            success: true,
            data: res.data,
          };
        } catch (err) {
          const msg =
            err?.response?.data?.message ||
            'Registration failed.';

          set({
            error: msg,
            isLoading: false,
          });

          return {
            success: false,
            error: msg,
          };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (_) {
          // ignore
        }

        TokenStore.clear();

        set({
          user: null,
          isAuthenticated: false,
          isHydrated: true,
          isLoading: false,
          error: null,
        });
      },

      // Validate token and refresh user data
      fetchMe: async () => {
        set({
          isLoading: true,
        });

        try {
          const token = TokenStore.get();

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isHydrated: true,
              isLoading: false,
            });
            return;
          }

          const { data } = await authApi.me();

          set({
            user: data.user,
            isAuthenticated: true,
            isHydrated: true,
            isLoading: false,
            error: null,
          });
        } catch (_) {
          TokenStore.clear();

          set({
            user: null,
            isAuthenticated: false,
            isHydrated: true,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'winners-auth',

      // Persist only user information
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;