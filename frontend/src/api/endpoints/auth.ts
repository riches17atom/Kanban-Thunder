import api from '../client';
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  User,
} from '../types';

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login/', data);
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/google/', { id_token: idToken });
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register/', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse>('/auth/logout/');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me/');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post<ApiResponse<{ user: User; tokens: { access: string } }>>(
      '/auth/refresh/'
    );
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await api.get<ApiResponse<User[]>>(`/auth/users/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};