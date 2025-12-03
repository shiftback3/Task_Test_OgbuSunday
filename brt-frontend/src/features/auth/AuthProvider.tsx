import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import type { User } from '../../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    loadUser, 
    hasPermission, 
    hasAnyPermission, 
    hasRole 
  } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app startup
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // We have a token, but check if we need to load user data
        if (!user) {
          try {
            await loadUser();
          } catch (error) {
            // If loadUser fails, it will clear the auth state
            console.error('Failed to load user:', error);
          }
        } else {
          // We have both token and user, just ensure we're not loading
          useAuthStore.setState({ isLoading: false, isAuthenticated: true });
        }
      } else {
        // No token, ensure we're logged out
        useAuthStore.setState({ 
          isLoading: false, 
          isAuthenticated: false, 
          user: null, 
          token: null 
        });
      }
    };

    initializeAuth();
  }, []); // Run only once on mount

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};