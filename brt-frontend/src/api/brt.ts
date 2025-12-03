import type { ApiResponse, BRTPaginatedResponse } from './index';
import { apiClient } from './client';

export interface BRT {
  id: string;
  user_id: string;
  brt_code: string; // Changed from reservation_code to match backend
  reserved_amount: string | number; // Backend returns string, frontend might expect number
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
}

export interface CreateBRTData {
  reserved_amount: number;
  expires_at: string;
}

export interface UpdateBRTData {
  reserved_amount?: number;
  expires_at?: string;
  status?: 'active' | 'expired' | 'redeemed';
}

export interface BRTListParams {
  page?: number;
  per_page?: number;
  status?: string;
  user_id?: string;
  search?: string;
}

export interface DashboardStats {
  overview: {
    total_brts: number;
    active_brts: number;
    expired_brts: number;
    redeemed_brts: number;
    total_reserved_amount: string;
    total_users: number;
  };
  time_periods: {
    today: {
      brts_created: number;
      reserved_amount: string;
    };
    this_week: {
      brts_created: number;
      reserved_amount: string;
    };
    this_month: {
      brts_created: number;
      reserved_amount: string;
    };
  };
  charts: {
    status_distribution: {
      active: number;
      expired: number;
      redeemed: number;
    };
    daily_creation: Array<{
      date: string;
      count: number;
      total_amount: number;
    }>;
  };
  top_users: Array<{
    id: string;
    name: string;
    email: string;
    brt_count: number;
  }>;
  generated_at: string;
}

export interface TrendsData {
  trends: Array<{
    period: string;
    status: string;
    count: number;
    total_amount: string;
  }>;
}

export const brtApi = {
  // BRT CRUD operations
  getBRTs: async (params?: BRTListParams): Promise<ApiResponse<BRTPaginatedResponse>> => {
    const response = await apiClient.get('/v1/brts', params);
    return response.data;
  },

  getBRT: async (id: string): Promise<ApiResponse<BRT>> => {
    const response = await apiClient.get(`/v1/brts/${id}`);
    return response.data;
  },

  createBRT: async (data: CreateBRTData): Promise<ApiResponse<BRT>> => {
    const response = await apiClient.post('/v1/brts', data);
    return response.data;
  },

  updateBRT: async (id: string, data: UpdateBRTData): Promise<ApiResponse<BRT>> => {
    const response = await apiClient.put(`/v1/brts/${id}`, data);
    return response.data;
  },

  deleteBRT: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/v1/brts/${id}`);
    return response.data;
  },

  // Analytics endpoints
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get('/v1/analytics/dashboard');
    return response.data;
  },

  getTrends: async (period = 'daily', days = 7): Promise<ApiResponse<TrendsData>> => {
    const response = await apiClient.get('/v1/analytics/trends', {
      params: { period, days }
    });
    return response.data;
  },

  // Redeem BRT by code
  redeemBRT: async (brtCode: string): Promise<ApiResponse<BRT>> => {
    const response = await apiClient.post('/v1/brts/redeem', { 
      reservation_code: brtCode  // Backend still expects this parameter name
    });
    return response.data;
  },

  // Test notification
  testNotification: async () => {
    return await apiClient.get('/v1/test-notification');
  },
};