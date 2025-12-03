// Common interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Backend specific response for BRTs
export interface BRTPaginatedResponse {
  brts: Array<{
    id: string;
    user_id: string;
    brt_code: string;
    reserved_amount: string | number;
    status: 'active' | 'expired' | 'redeemed';
    expires_at?: string;
    redeemed_at?: string;
    created_at: string;
    updated_at: string;
    user?: {
      id: string;
      name: string;
      email: string;
      email_verified_at?: string;
      is_active?: boolean;
      roles?: any[];
    };
  }>;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Re-export all API modules for easy importing
export { authApi } from './auth';
export { usersApi } from './users';
export { rolesApi } from './roles';
export { permissionsApi } from './permissions';
export { resourcesApi } from './resources';
export { auditLogsApi } from './audit-logs';
export { accessRequestsApi } from './access-requests';
export { brtApi } from './brt';
export { apiClient } from './client';