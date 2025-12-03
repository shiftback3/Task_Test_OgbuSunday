import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token and handle file uploads
    this.client.interceptors.request.use(
      (config) => {
        // Skip adding auth token for auth endpoints
        const isAuthEndpoint = config.url?.includes('/auth/login') || 
                              config.url?.includes('/auth/register') ||
                              config.url?.includes('/auth/forgot-password') ||
                              config.url?.includes('/auth/reset-password');
        
        // Debug logging
        if (isAuthEndpoint) {
          console.log('🚀 Auth request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers
          });
        }
        
        const token = localStorage.getItem('auth_token');
        if (token && !isAuthEndpoint) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Check if data contains files and convert to FormData
        if (config.data && this.containsFiles(config.data) && (config.method === 'post' || config.method === 'put')) {
          const formData = new FormData();
          this.appendToFormData(formData, config.data);
          config.data = formData;
          // Remove Content-Type header to let browser set it with boundary
          delete config.headers['Content-Type'];
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle common errors
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Don't redirect if this is an auth endpoint (login/register)
          const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                                error.config?.url?.includes('/auth/register');
          
          if (!isAuthEndpoint) {
            // Token expired or invalid - redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
          }
        }
        
        if (error.response?.status === 429) {
          // Rate limit exceeded
          const retryAfter = error.response.headers['retry-after'];
          console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
        }

        return Promise.reject(error);
      }
    );
  }

  // Helper method to check if data contains files
  private containsFiles(data: any): boolean {
    if (data instanceof File) return true;
    if (data instanceof FormData) return true;
    
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).some(value => {
        if (value instanceof File) return true;
        if (Array.isArray(value)) {
          return value.some(item => item instanceof File);
        }
        if (typeof value === 'object' && value !== null) {
          return this.containsFiles(value);
        }
        return false;
      });
    }
    
    return false;
  }

  // Helper method to convert data to FormData
  private appendToFormData(formData: FormData, data: any, parentKey?: string): void {
    if (data instanceof File) {
      formData.append(parentKey || 'file', data);
      return;
    }

    if (typeof data === 'object' && data !== null && !(data instanceof Date)) {
      Object.keys(data).forEach(key => {
        const value = data[key];
        const formKey = parentKey ? `${parentKey}[${key}]` : key;
        
        if (value instanceof File) {
          formData.append(formKey, value);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item instanceof File) {
              formData.append(`${formKey}[${index}]`, item);
            } else {
              formData.append(`${formKey}[${index}]`, String(item));
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          this.appendToFormData(formData, value, formKey);
        } else if (value !== null && value !== undefined) {
          formData.append(formKey, String(value));
        }
      });
    } else if (data !== null && data !== undefined) {
      formData.append(parentKey || 'data', String(data));
    }
  }

  // Generic HTTP methods
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }

  // File upload method
  async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Get underlying axios instance for advanced usage
  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;