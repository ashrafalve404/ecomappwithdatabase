import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';
import { API_CONFIG } from '../config';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_KEY);

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.login(username, password);

      const { access, refresh, user: userData } = response;

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);

      // If user data is not in response, fetch it
      if (userData) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
      } else {
        // Fetch user profile after login
        try {
          const userResponse = await fetch(`${API_CONFIG.BASE_URL}profile/`, {
            headers: { Authorization: `Bearer ${access}` },
          });
          if (userResponse.ok) {
            const userDataFromApi = await userResponse.json();
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userDataFromApi));
            setUser(userDataFromApi);
          }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Register request data:', data);

      const response = await authAPI.register(data);
      console.log('Register response:', response);

      // Auto-login after registration if tokens are returned
      if (response.access && response.refresh) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, response.access);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refresh);
        if (response.user) {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
          setUser(response.user);
        }
      } else if (response.id) {
        // If only user data is returned, try to login
        // The user needs to login manually after registration
        console.log('Registration successful, please login');
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
