import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData } from '../types';
import { authApi } from '../api';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  
  // Helpers
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, // Will be set to true during initialization if token exists
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.login(credentials);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // Store token in localStorage for axios interceptor
            localStorage.setItem('auth_token', token);
            
            set({
              user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authApi.register(data);
          
          if (response.success) {
            // After successful registration, automatically login
            await get().login({
              email: data.email,
              password: data.password,
            });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Call logout API in background (don't wait for response)
        authApi.logout().catch(() => {
          // Ignore logout API errors - we're logging out anyway
        });

        // Clear local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Reset state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshToken: async () => {
        try {
          const currentToken = get().token;
          if (!currentToken) return;

          const response = await authApi.refresh(currentToken);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            localStorage.setItem('auth_token', token);
            
            set({
              user,
              token: token,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          // If refresh fails, logout the user
          get().logout();
        }
      },

      loadUser: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          set({ isLoading: true });

          const response = await authApi.me();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('Invalid response');
          }
        } catch (error) {
          // If loading user fails, clear auth state
          localStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Helper methods
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user?.roles) return false;

        return user.roles.some(role => 
          role.permissions?.some(perm => perm.name === permission)
        );
      },

      hasAnyPermission: (permissions: string[]) => {
        return permissions.some(permission => get().hasPermission(permission));
      },

      hasRole: (roleName: string) => {
        const { user } = get();
        if (!user?.roles) return false;

        return user.roles.some(role => role.name === roleName);
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user and token, not isAuthenticated or isLoading
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      // Handle hydration properly
      onRehydrateStorage: () => (state) => {
        if (state) {
          // After rehydration, check if we have a token and user
          const hasValidAuth = !!(state.token && state.user);
          state.isAuthenticated = hasValidAuth;
          state.isLoading = false;
          
          // If we have a token, validate it by loading user
          if (state.token && !state.user) {
            state.isLoading = true;
            // loadUser will be called by AuthProvider
          }
        }
      },
    }
  )
);