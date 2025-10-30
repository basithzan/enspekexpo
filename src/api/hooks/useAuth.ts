import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    auth_token: string;
    company_name?: string;
    phone?: string;
    country_id?: number;
  };
  message?: string;
}

export const useClientLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post('/client-login', credentials);
      return response.data;
    },
  });
};

export const useInspectorLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const response = await apiClient.post('/inspector-login', credentials);
      return response.data;
    },
  });
};

export const useClientRegister = () => {
  return useMutation<any, Error, any>({
    mutationFn: async (userData) => {
      const response = await apiClient.post('/client-register', userData);
      return response.data;
    },
  });
};

export const useInspectorRegister = () => {
  return useMutation<any, Error, any>({
    mutationFn: async (userData) => {
      const response = await apiClient.post('/inspector-register', userData);
      return response.data;
    },
  });
};
