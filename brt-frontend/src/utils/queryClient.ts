import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time before inactive queries are removed from cache  
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Retry failed requests
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (except 401, 403, 408, 429)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          const retryableStatuses = [401, 403, 408, 429];
          return retryableStatuses.includes(error.response.status) && failureCount < 2;
        }
        // Retry on 5xx errors up to 3 times
        return failureCount < 3;
      },
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry failed mutations
      retry: (failureCount, error: any) => {
        // Don't retry client errors (4xx)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry server errors (5xx) up to 2 times
        return failureCount < 2;
      },
    },
  },
});

// Query Keys Factory
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  currentUser: () => [...queryKeys.auth, 'current-user'] as const,

  // Users
  users: ['users'] as const,
  usersList: (params?: any) => [...queryKeys.users, 'list', params] as const,
  userDetail: (id: string) => [...queryKeys.users, 'detail', id] as const,

  // Roles
  roles: ['roles'] as const,
  rolesList: (params?: any) => [...queryKeys.roles, 'list', params] as const,
  roleDetail: (id: number) => [...queryKeys.roles, 'detail', id] as const,

  // Permissions
  permissions: ['permissions'] as const,
  permissionsList: (params?: any) => [...queryKeys.permissions, 'list', params] as const,
  permissionDetail: (id: number) => [...queryKeys.permissions, 'detail', id] as const,

  // Resources
  resources: ['resources'] as const,
  resourcesList: (params?: any) => [...queryKeys.resources, 'list', params] as const,
  resourceDetail: (id: string) => [...queryKeys.resources, 'detail', id] as const,

  // Audit Logs
  auditLogs: ['audit-logs'] as const,
  auditLogsList: (params?: any) => [...queryKeys.auditLogs, 'list', params] as const,
  auditLogDetail: (id: string) => [...queryKeys.auditLogs, 'detail', id] as const,
};