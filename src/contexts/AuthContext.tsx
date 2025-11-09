import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { apiClient } from '../api/client';

interface User {
  id: number;
  name: string;
  email: string;
  type: 'client' | 'inspector';
  auth_token: string;
  company_name?: string;
  phone?: string;
  country_id?: number;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: 'client' | 'inspector', isMobile?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.warn('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, userType: 'client' | 'inspector', isMobile: boolean = false) => {
    try {
      setIsLoading(true);
      
      const endpoint = userType === 'client' ? '/client-login' : '/inspector-login';
      const requestData = isMobile ? {
        phone: email, // In mobile login, email parameter contains phone number
        type: userType,
      } : {
        email,
        password,
      };
      
      console.log('Login request:', { endpoint, requestData });
      const response = await apiClient.post(endpoint, requestData);
      console.log('Login response:', JSON.stringify(response.data, null, 2));

      // Check if response has success flag or user data directly
      const hasSuccess = response.data.success === true || response.data.success === 1;
      const userData = response.data.user || response.data;
      
      // Consider login successful if:
      // 1. success flag is true, OR
      // 2. response contains auth_token (indicating successful authentication)
      if (hasSuccess || userData.auth_token) {
        
        if (!userData.auth_token) {
          throw new Error('Authentication token not found in response');
        }
        
        // Store authentication data with full nested details
        await AsyncStorage.setItem('auth_token', userData.auth_token);
        const userDataToStore = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          type: userType,
          auth_token: userData.auth_token,
          company_name: userData.company_name,
          phone: userData.phone,
          country_id: userData.country_id,
          country: userData.country,
          // Store full nested details for clients/inspectors
          client_details: userType === 'client' ? userData.client_details : undefined,
          inspector_details: userType === 'inspector' ? userData.inspector_details : undefined,
        };
        
        await AsyncStorage.setItem('user_data', JSON.stringify(userDataToStore));
        console.log('✅ Stored to AsyncStorage - user_data with type:', userType);
        console.log('✅ Stored data:', JSON.stringify(userDataToStore, null, 2));

        const newUser = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          type: userType,
          auth_token: userData.auth_token,
          company_name: userData.company_name,
          phone: userData.phone,
          country_id: userData.country_id,
          country : userData.country,
        };
        
        console.log('✅ Setting user state with type:', userType);
        console.log('✅ Full user object:', JSON.stringify(newUser, null, 2));
        setUser(newUser);
        
        // Small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ Navigating to:', userType === 'client' ? '/(tabs)/client' : '/(tabs)/inspector');

        // Navigate to appropriate tab based on user type
        if (userType === 'client') {
          router.replace('/(tabs)/client');
        } else {
          router.replace('/(tabs)/inspector');
        }
      } else {
        // If login failed, throw error with message from API
        const errorMessage = response.data.message || response.data.error || 'Login failed. Please check your credentials.';
        console.error('Login failed - Response:', response.data);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
