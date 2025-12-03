import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DashboardLayout from '../components/layout/DashboardLayout';
import { brtApi } from '../api/brt';
import type { BRT, UpdateBRTData } from '../api/brt';

interface BRTFormProps {
  brt?: BRT;
  onClose: () => void;
  onSuccess: () => void;
}

const BRTForm: React.FC<BRTFormProps> = ({ brt, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: brtApi.createBRT,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['brts'] });
      console.log('✅ BRT created successfully:', { 
        message: 'New BRT created successfully!', 
        brtCode: response?.data?.brt_code || 'Unknown',
        response 
      });
      console.log('📢 Check the BRT list for the new entry!');
      onSuccess();
    },
    onError: (error) => {
      console.error('❌ BRT creation failed:', error);
      console.error('📢 Failed to create BRT. Check console for details.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBRTData }) => 
      brtApi.updateBRT(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brts'] });
      console.log('✅ BRT updated successfully:', { 
        message: 'BRT updated successfully!', 
        brtCode: response?.data?.brt_code || variables.id,
        updatedData: variables.data,
        response 
      });
      console.log('📢 Check the BRT list to see the updated information!');
      onSuccess();
    },
    onError: (error, variables) => {
      console.error('❌ BRT update failed:', error);
      console.error('📢 Failed to update BRT:', variables.id);
    },
  });

  const validationSchema = Yup.object({
    reserved_amount: Yup.number()
      .required('Reserved amount is required')
      .min(0.01, 'Amount must be greater than 0'),
    expires_at: Yup.date()
      .required('Expiration date is required')
      .min(new Date(), 'Expiration date must be in the future'),
    status: brt ? Yup.string().oneOf(['active', 'expired', 'redeemed']) : Yup.string(),
  });

  const initialValues = {
    reserved_amount: brt?.reserved_amount ? 
      (typeof brt.reserved_amount === 'string' ? parseFloat(brt.reserved_amount) : brt.reserved_amount) : 0,
    expires_at: brt?.expires_at ? 
      new Date(brt.expires_at).toISOString().slice(0, 16) : 
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: brt?.status || 'active',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {brt ? 'Edit BRT' : 'Create New BRT'}
          </h3>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              if (brt) {
                await updateMutation.mutateAsync({
                  id: brt.id,
                  data: {
                    reserved_amount: values.reserved_amount,
                    expires_at: values.expires_at,
                    status: values.status as 'active' | 'expired' | 'redeemed',
                  },
                });
              } else {
                await createMutation.mutateAsync({
                  reserved_amount: values.reserved_amount,
                  expires_at: values.expires_at,
                });
              }
            } catch (error) {
              console.error('Form submission error:', error);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reserved Amount ($)
                </label>
                <Field
                  name="reserved_amount"
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage name="reserved_amount" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At
                </label>
                <Field
                  name="expires_at"
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <ErrorMessage name="expires_at" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              {brt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="redeemed">Redeemed</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : brt ? 'Update BRT' : 'Create BRT'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const BRTManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedBRT, setSelectedBRT] = useState<BRT | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const queryClient = useQueryClient();

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const { data: brtsResponse, isLoading, error } = useQuery({
    queryKey: ['brts', currentPage, statusFilter, debouncedSearch],
    queryFn: () => brtApi.getBRTs({
      page: currentPage,
      per_page: 10,
      status: statusFilter || undefined,
      search: debouncedSearch || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: brtApi.deleteBRT,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brts'] });
      console.log('✅ BRT deleted successfully:', { 
        message: 'BRT deleted successfully!', 
        deletedId: variables,
        response: data 
      });
      console.log('📢 BRT has been removed from the system!');
    },
    onError: (error, variables) => {
      console.error('❌ BRT deletion failed:', error);
      console.error('📢 Failed to delete BRT:', variables);
    },
  });

  const handleEdit = (brt: BRT) => {
    setSelectedBRT(brt);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedBRT(undefined);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this BRT?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedBRT(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedBRT(undefined);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      redeemed: 'bg-blue-100 text-blue-800',
    };
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
  };

  // Handle both wrapped and direct response structures
  // The brtsResponse from your console shows it's direct, not wrapped
  const brts: BRT[] = (brtsResponse as any)?.brts || [];
  const pagination = (brtsResponse as any)?.pagination;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎫 BRT Management</h1>
            <p className="text-gray-600">Create, update, and manage BRT tickets</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  const result = await brtApi.testNotification();
                  const message = result.message || 'Test notification sent!';
                  const brtCode = result.data?.brt_code || 'Unknown';
                  console.log('✅ Test notification sent successfully:', { message, brtCode });
                  console.log('📢 Check the notification bell for real-time updates!');
                } catch (error) {
                  console.error('❌ Test notification error:', error);
                  console.error('📢 Failed to send test notification. Check console for details.');
                }
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              🔔 Test Notification
            </button>
            <button
              onClick={handleCreate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create New BRT
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by BRT code or user..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="redeemed">Redeemed</option>
              </select>
            </div>
          </div>
        </div>

        {/* BRT List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Failed to load BRTs
            </div>
          ) : brts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No BRTs found
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BRT Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {brts.map((brt) => (
                      <tr key={brt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {brt.brt_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{brt.user?.name}</div>
                            <div className="text-gray-500">{brt.user?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${brt.reserved_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(brt.status)}`}>
                            {brt.status.charAt(0).toUpperCase() + brt.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {brt.expires_at ? new Date(brt.expires_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(brt)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(brt.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={deleteMutation.isPending}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {brts.map((brt) => (
                  <div key={brt.id} className="border-b border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900">{brt.brt_code}</div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(brt.status)}`}>
                        {brt.status.charAt(0).toUpperCase() + brt.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>{brt.user?.name}</div>
                      <div>{brt.user?.email}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <div className="font-medium">${brt.reserved_amount}</div>
                        <div className="text-gray-500">Expires: {brt.expires_at ? new Date(brt.expires_at).toLocaleString() : 'N/A'}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(brt)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(brt.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.total > pagination.per_page && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= pagination.last_page}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <BRTForm
          brt={selectedBRT}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export default BRTManagement;