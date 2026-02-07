import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  email: string;
  userId: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

/**
 * Custom hook for authentication state management
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated by calling /auth/me
   */
  const checkAuth = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.user) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: response.user,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      // Not authenticated or error occurred
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };

  /**
   * Initiate Google OAuth login
   */
  const login = () => {
    authAPI.login();
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authAPI.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      window.location.href = '/login';
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}


