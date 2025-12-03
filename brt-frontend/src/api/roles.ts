import apiClient from './client';
import type { 
  Role, 
  CreateRoleForm, 
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const rolesApi = {
  // Get all roles
  getRoles: (params?: { page?: number; per_page?: number }): Promise<ApiResponse<PaginatedResponse<Role>>> =>
    apiClient.get('/v1/roles', params),

  // Get single role
  getRole: (id: number): Promise<ApiResponse<{ role: Role }>> =>
    apiClient.get(`/v1/roles/${id}`),

  // Create new role
  createRole: (data: CreateRoleForm): Promise<ApiResponse<Role>> =>
    apiClient.post('/v1/roles', data),

  // Update role
  updateRole: (id: number, data: Partial<CreateRoleForm>): Promise<ApiResponse<{ role: Role }>> =>
    apiClient.put(`/v1/roles/${id}`, data),

  // Delete role
  deleteRole: (id: number): Promise<ApiResponse> =>
    apiClient.delete(`/v1/roles/${id}`),

  // Permission assignment
  attachPermissions: (roleId: number, permissionIds: number[]): Promise<ApiResponse> =>
    apiClient.post(`/v1/roles/${roleId}/permissions`, { permission_ids: permissionIds }),

  detachPermission: (roleId: number, permissionId: number): Promise<ApiResponse> =>
    apiClient.delete(`/v1/roles/${roleId}/permissions/${permissionId}`),
};