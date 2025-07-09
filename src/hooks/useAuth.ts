import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { authApi, setAccessToken } from '@/services/api';
import type { User, LoginCredentials, RegisterCredentials } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = (): AuthContextType => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authApi.login(credentials);
      setAccessToken(response.accessToken);
      
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${response.user.email}`,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authApi.register(credentials);
      setAccessToken(response.accessToken);
      
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
      
      toast({
        title: 'Account created!',
        description: 'Welcome to Reveal.me',
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await authApi.refresh();
      setAccessToken(response.accessToken);
      
      const user = await authApi.me();
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      setAccessToken(null);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    login,
    register,
    logout,
    refresh,
  };
};

export { AuthContext };