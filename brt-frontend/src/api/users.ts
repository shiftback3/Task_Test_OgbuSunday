import apiClient from './client';
import type { 
  User, 
  CreateUserForm, 
  UpdateUserForm, 
  ApiResponse 
} from '../types';

export const usersApi = {
  // Get all users with pagination
  getUsers: (params?: { page?: number; per_page?: number }): Promise<ApiResponse<{ users: User[]; pagination: { current_page: number; per_page: number; total: number; last_page: number; } }>> =>
    apiClient.get('/v1/users', params),

  // Get single user
  getUser: (id: string): Promise<ApiResponse<{ user: User }>> =>
    apiClient.get(`/v1/users/${id}`),

  // Create new user
  createUser: (data: CreateUserForm): Promise<ApiResponse<User>> =>
    apiClient.post('/v1/users', data),

  // Update user
  updateUser: (id: string, data: UpdateUserForm): Promise<ApiResponse<{ user: User }>> =>
    apiClient.put(`/v1/users/${id}`, data),

  // Delete user
  deleteUser: (id: string): Promise<ApiResponse> =>
    apiClient.delete(`/v1/users/${id}`),

  // Role assignment
  assignRoles: (userId: string, roleIds: number[]): Promise<ApiResponse> =>
    apiClient.post(`/v1/users/${userId}/roles`, { role_ids: roleIds }),

  removeRole: (userId: string, roleId: number): Promise<ApiResponse> =>
    apiClient.delete(`/v1/users/${userId}/roles/${roleId}`),
};