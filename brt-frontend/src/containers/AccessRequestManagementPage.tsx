import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthProvider';
import DashboardLayout from '../components/layout/DashboardLayout';
import { accessRequestsApi } from '../api/access-requests';
import type { AccessRequest } from '../types';

const AccessRequestManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Check if user has permission to manage access requests
  if (!hasPermission('access-requests:approve')) {
    return (
      <DashboardLayout>
        <div className="min-h-64 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to manage access requests.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch access requests
  const { data: accessRequestsData, isLoading, error } = useQuery({
    queryKey: ['access-requests', { status: selectedStatus, search: searchQuery, page }],
    queryFn: () => accessRequestsApi.getAll({ 
      status: selectedStatus, 
      search: searchQuery, 
      page, 
      per_page: 10 
    }),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => {
      console.log('Approving access request:', { id, comments });
      return accessRequestsApi.approve(id, { comments });
    },
    onSuccess: (data, variables) => {
      console.log('Approve success:', { data, variables });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
    onError: (error, variables) => {
      console.error('Approve error:', { error, variables });
      alert(`Failed to approve access request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => {
      console.log('Rejecting access request:', { id, reason });
      return accessRequestsApi.reject(id, { reason });
    },
    onSuccess: (data, variables) => {
      console.log('Reject success:', { data, variables });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
    onError: (error, variables) => {
      console.error('Reject error:', { error, variables });
      alert(`Failed to reject access request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleApprove = (accessRequest: AccessRequest) => {
    if (accessRequest.status !== 'pending') {
      alert('This access request is no longer pending and cannot be approved.');
      return;
    }
    const comments = prompt('Optional comments for approval:');
    if (comments !== null) { // User didn't cancel
      approveMutation.mutate({ 
        id: accessRequest.id.toString(), 
        comments: comments || undefined 
      });
    }
  };

  const handleReject = (accessRequest: AccessRequest) => {
    if (accessRequest.status !== 'pending') {
      alert('This access request is no longer pending and cannot be rejected.');
      return;
    }
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      rejectMutation.mutate({ 
        id: accessRequest.id.toString(), 
        reason: reason.trim() 
      });
    } else if (reason !== null) { // User didn't cancel but provided empty reason
      alert('A reason is required to reject an access request.');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Failed to load access requests. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  const accessRequests = accessRequestsData?.data?.access_requests?.data || [];
  const pagination = {
    current_page: accessRequestsData?.data?.access_requests?.current_page || 1,
    last_page: accessRequestsData?.data?.access_requests?.last_page || 1,
    total: accessRequestsData?.data?.access_requests?.total || 0,
    per_page: accessRequestsData?.data?.access_requests?.per_page || 10
  };

  // Debug logging
  console.log('Access Requests Debug:', {
    rawData: accessRequestsData,
    accessRequests,
    pagination,
    isLoading,
    error
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Access Request Management</h1>
            <p className="text-gray-600">Review and manage access requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by user or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setPage(1);
                  queryClient.invalidateQueries({ queryKey: ['access-requests'] });
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Access Requests List */}
        <div className="bg-white shadow rounded-lg">
          {accessRequests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No access requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accessRequests.map((accessRequest: AccessRequest) => (
                    <tr key={accessRequest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {accessRequest.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {accessRequest.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {accessRequest.reason || accessRequest.business_justification || 'No reason provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {accessRequest.requested_roles?.length ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {accessRequest.requested_roles.length} role(s)
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(accessRequest.status)}>
                          {accessRequest.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(accessRequest.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {accessRequest.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(accessRequest)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              {approveMutation.isPending && approveMutation.variables?.id === accessRequest.id.toString() ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(accessRequest)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              {rejectMutation.isPending && rejectMutation.variables?.id === accessRequest.id.toString() ? 'Rejecting...' : 'Reject'}
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            {accessRequest.status === 'approved' ? 'Approved' : 'Rejected'}
                            {accessRequest.processed_by && (
                              <div className="text-xs text-gray-500 mt-1">
                                by {accessRequest.processed_by}
                              </div>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.current_page} of {pagination.last_page} 
                ({pagination.total} total requests)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.last_page}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions for Pending Requests */}
        {selectedStatus === 'pending' && accessRequests.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-blue-400 text-xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Pending Requests Found
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  You have {accessRequests.length} pending access request(s) that need review.
                  Click "Approve" or "Reject" to process them.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccessRequestManagementPage;