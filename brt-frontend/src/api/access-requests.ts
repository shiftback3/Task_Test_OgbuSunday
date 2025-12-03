import apiClient from './client';
import type { 
  AccessRequest,
  CreateAccessRequestData,
  UpdateAccessRequestData,
  PaginatedResponse,
  ApiResponse 
} from '../types';

interface AccessRequestFilters {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  user_id?: string;
}

export const accessRequestsApi = {
  // Get all access requests
  getAll: (filters?: AccessRequestFilters): Promise<ApiResponse<{ access_requests: { data: AccessRequest[]; current_page: number; last_page: number; total: number; per_page: number; from: number; to: number; } }>> =>
    apiClient.get('/v1/access-requests', filters),

  // Get single access request
  getById: (id: string): Promise<ApiResponse<AccessRequest>> =>
    apiClient.get(`/v1/access-requests/${id}`),

  // Create access request
  create: (data: CreateAccessRequestData): Promise<ApiResponse<AccessRequest>> =>
    apiClient.post('/v1/access-requests', data),

  // Update access request
  update: (id: string, data: UpdateAccessRequestData): Promise<ApiResponse<AccessRequest>> =>
    apiClient.put(`/v1/access-requests/${id}`, data),

  // Delete access request
  delete: (id: string): Promise<ApiResponse> =>
    apiClient.delete(`/v1/access-requests/${id}`),

  // Approve access request
  approve: (id: string, data: { comments?: string }): Promise<ApiResponse<AccessRequest>> =>
    apiClient.put(`/v1/access-requests/${id}/approve`, data),

  // Reject access request
  reject: (id: string, data: { reason: string }): Promise<ApiResponse<AccessRequest>> =>
    apiClient.put(`/v1/access-requests/${id}/reject`, data),

  // Get my access requests
  getMine: (filters?: Omit<AccessRequestFilters, 'user_id'>): Promise<ApiResponse<PaginatedResponse<AccessRequest>>> =>
    apiClient.get('/v1/access-requests/mine', filters),
};