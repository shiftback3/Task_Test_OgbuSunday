import { useAuthStore } from '../stores/authStore';

// Custom hook for authentication actions
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    loadUser,
    clearError,
    hasPermission,
    hasAnyPermission,
    hasRole,
  } = useAuthStore();

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    loadUser,
    clearError,

    // Helpers
    hasPermission,
    hasAnyPermission,
    hasRole,
  };
};