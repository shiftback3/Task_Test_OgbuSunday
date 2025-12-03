import apiClient from './client';
import type { 
  AuditLog, 
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const auditLogsApi = {
  // Get all audit logs
  getAuditLogs: (params?: { 
    page?: number; 
    per_page?: number; 
    since?: string;
    user_id?: string;
    action?: string;
    entity_type?: string;
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> =>
    apiClient.get('/v1/audit-logs', { params }),

  // Get single audit log
  getAuditLog: (id: string): Promise<ApiResponse<AuditLog>> =>
    apiClient.get(`/v1/audit-logs/${id}`),
};