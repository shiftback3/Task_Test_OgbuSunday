import apiClient from './client';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User,
  ApiResponse 
} from '../types';

export const authApi = {
  // Authentication endpoints
  login: (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post('/v1/auth/login', credentials),

  register: (data: RegisterData): Promise<ApiResponse<User>> =>
    apiClient.post('/v1/auth/register', data),

  logout: (): Promise<ApiResponse> =>
    apiClient.post('/v1/auth/logout'),

  refresh: (refreshToken: string): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post('/v1/auth/refresh', { refresh_token: refreshToken }),

  me: (): Promise<ApiResponse<User>> =>
    apiClient.get('/v1/auth/me'),

  // Password reset (when implemented)
  forgotPassword: (email: string): Promise<ApiResponse> =>
    apiClient.post('/v1/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }): Promise<ApiResponse> =>
    apiClient.post('/v1/auth/reset-password', data),
};