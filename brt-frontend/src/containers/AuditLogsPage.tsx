import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../components/layout/DashboardLayout';
import { auditLogsApi } from '../api/audit-logs';
import type { AuditLog } from '../types';

const AuditLogsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const queryClient = useQueryClient();

  console.log('AuditLogsPage rendering', { currentPage, searchTerm, eventTypeFilter, dateFilter });

  // Fetch audit logs
  const { data: auditData, isLoading, error } = useQuery({
    queryKey: ['audit-logs', currentPage, searchTerm, eventTypeFilter, dateFilter],
    queryFn: async () => {
      const response = await auditLogsApi.getAuditLogs({
        page: currentPage,
        per_page: 20,
        since: dateFilter || undefined,
        action: eventTypeFilter || undefined,
      });
      // The API returns { data: { data: [...], pagination: {...} } }
      // We need to return it in the expected format
      return response.data as any;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  console.log('Query result', { auditData, isLoading, error });

  // Cast auditData to the correct type since our API returns nested data
  const auditLogs = (auditData as any)?.data || [];
  const paginationInfo = (auditData as any)?.pagination;

  // Real-time updates via polling - temporarily disabled to debug
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
  //   }, 10000); // Poll every 10 seconds

  //   return () => clearInterval(interval);
  // }, [queryClient]);

  const eventTypes = [
    'user_created',
    'user_updated',
    'user_deleted',
    'role_created',
    'role_updated',
    'role_deleted',
    'permission_assigned',
    'permission_revoked',
    'login',
    'logout',
    'password_changed',
    'resource_created',
    'resource_updated',
    'resource_deleted',
  ];

  const getEventIcon = (eventType: string | undefined | null) => {
    if (!eventType) return '📋';
    const iconMap: Record<string, string> = {
      user_created: '👤',
      user_updated: '✏️',
      user_deleted: '🗑️',
      role_created: '🔐',
      role_updated: '⚙️',
      role_deleted: '🗑️',
      permission_assigned: '✅',
      permission_revoked: '❌',
      login: '🔑',
      logout: '🚪',
      password_changed: '🔒',
      resource_created: '📁',
      resource_updated: '📝',
      resource_deleted: '🗑️',
    };
    return iconMap[eventType] || '📋';
  };

  const getEventColor = (eventType: string | undefined | null) => {
    if (!eventType) return 'bg-gray-100 text-gray-800';
    const colorMap: Record<string, string> = {
      user_created: 'bg-green-100 text-green-800',
      user_updated: 'bg-blue-100 text-blue-800',
      user_deleted: 'bg-red-100 text-red-800',
      role_created: 'bg-green-100 text-green-800',
      role_updated: 'bg-blue-100 text-blue-800',
      role_deleted: 'bg-red-100 text-red-800',
      permission_assigned: 'bg-green-100 text-green-800',
      permission_revoked: 'bg-red-100 text-red-800',
      login: 'bg-blue-100 text-blue-800',
      logout: 'bg-gray-100 text-gray-800',
      password_changed: 'bg-yellow-100 text-yellow-800',
      resource_created: 'bg-green-100 text-green-800',
      resource_updated: 'bg-blue-100 text-blue-800',
      resource_deleted: 'bg-red-100 text-red-800',
    };
    return colorMap[eventType] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-gray-600">
            <p className="text-lg font-medium">Loading audit logs...</p>
            <p className="text-sm">Fetching system activity data</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600 text-6xl">⚠️</div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Error loading audit logs</p>
            <p className="text-sm text-gray-500 mt-2">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['audit-logs'] })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">
            Monitor system activity and user actions in real-time.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                id="event-type"
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Events</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type?.replace('_', ' ')?.toUpperCase() || type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-700 text-sm font-medium">Live Feed Active</span>
          </div>
          <span className="text-green-600 text-xs">Auto-refreshing every 10 seconds</span>
        </div>



        {/* Audit logs timeline */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {auditLogs && Array.isArray(auditLogs) && auditLogs.map((log: AuditLog) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                      {getEventIcon(log.event_type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(log.event_type || 'unknown')}`}
                        >
                          {log.event_type?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN EVENT'}
                        </span>
                        {log.user_id && (
                          <span className="text-sm text-gray-500">
                            by User #{log.user_id}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-900 font-medium">
                        {log.description}
                      </p>
                      {log.old_values && Object.keys(log.old_values).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Previous values:</span>
                          <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_values && Object.keys(log.new_values).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">New values:</span>
                          <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.ip_address && (
                        <div className="mt-2 text-xs text-gray-500">
                          IP: {log.ip_address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {(!auditLogs || auditLogs.length === 0) && (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <div className="text-gray-400 text-4xl">📋</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No audit logs found</h3>
              <div className="max-w-md mx-auto">
                <p className="text-gray-500 mb-4">
                  {searchTerm || eventTypeFilter || dateFilter
                    ? 'No logs match your current filters. Try adjusting your search criteria or clearing filters to see more results.'
                    : 'System activity and user actions will appear here as they happen. Audit logs help track changes and maintain security.'}
                </p>
                {(searchTerm || eventTypeFilter || dateFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setEventTypeFilter('');
                      setDateFilter('');
                      setCurrentPage(1);
                      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Debug info - temporary */}
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <strong>Debug:</strong> Data: {auditData ? 'exists' : 'null'}, 
            Array: {Array.isArray(auditLogs) ? 'yes' : 'no'}, 
            Length: {auditLogs?.length || 0}<br/>
            <strong>Structure:</strong> auditLogs is the array
          </div>

          {/* Pagination */}
          {paginationInfo && paginationInfo.total > paginationInfo.per_page && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * paginationInfo.per_page) + 1} to{' '}
                  {Math.min(currentPage * paginationInfo.per_page, paginationInfo.total)} of{' '}
                  {paginationInfo.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= (paginationInfo.last_page || 1)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogsPage;