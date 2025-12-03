import apiClient from './client';
import type { 
  Resource, 
  CreateResourceForm,
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const resourcesApi = {
  // Get all resources
  getResources: (params?: { page?: number; per_page?: number }): Promise<ApiResponse<PaginatedResponse<Resource>>> =>
    apiClient.get('/v1/resources', params),

  // Get single resource
  getResource: (id: string): Promise<ApiResponse<{ resource: Resource }>> =>
    apiClient.get(`/v1/resources/${id}`),

  // Create new resource
  createResource: (data: CreateResourceForm): Promise<ApiResponse<Resource>> =>
    apiClient.post('/v1/resources', data),

  // Update resource
  updateResource: (id: string, data: Partial<CreateResourceForm>): Promise<ApiResponse<{ resource: Resource }>> =>
    apiClient.put(`/v1/resources/${id}`, data),

  // Delete resource
  deleteResource: (id: string): Promise<ApiResponse> =>
    apiClient.delete(`/v1/resources/${id}`),
};