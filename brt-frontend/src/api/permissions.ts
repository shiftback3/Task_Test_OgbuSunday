import apiClient from './client';
import type { 
  Permission, 
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const permissionsApi = {
  // Get all permissions
  getPermissions: (params?: { page?: number; per_page?: number }): Promise<ApiResponse<PaginatedResponse<Permission>>> =>
    apiClient.get('/v1/permissions', params),

  // Get single permission
  getPermission: (id: number): Promise<ApiResponse<{ permission: Permission }>> =>
    apiClient.get(`/v1/permissions/${id}`),

  // Create new permission
  createPermission: (data: { name: string; description?: string }): Promise<ApiResponse<Permission>> =>
    apiClient.post('/v1/permissions', data),

  // Update permission
  updatePermission: (id: number, data: { name?: string; description?: string }): Promise<ApiResponse<{ permission: Permission }>> =>
    apiClient.put(`/v1/permissions/${id}`, data),

  // Delete permission
  deletePermission: (id: number): Promise<ApiResponse> =>
    apiClient.delete(`/v1/permissions/${id}`),
};