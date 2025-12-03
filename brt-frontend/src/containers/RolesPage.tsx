import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../components/layout/DashboardLayout';
import { rolesApi } from '../api/roles';
// import { permissionsApi } from '../api/permissions';
import type { Role } from '../types';

const RolesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // TODO: Implement create/edit modals
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const queryClient = useQueryClient();

  // Fetch roles
  const { data: rolesResponse, isLoading } = useQuery({
    queryKey: ['roles', currentPage, searchTerm],
    queryFn: () => rolesApi.getRoles({
      page: currentPage,
      per_page: 12,
    }),
  });

  const rolesData = rolesResponse?.data;

  // Fetch permissions for role creation
  // TODO: Implement permission assignment functionality
  // const { data: permissionsResponse } = useQuery({
  //   queryKey: ['permissions'],
  //   queryFn: () => permissionsApi.getPermissions({ page: 1, per_page: 100 }),
  // });

  // Mutations
  // TODO: Implement create/edit modals
  // const createRoleMutation = useMutation({
  //   mutationFn: (data: CreateRoleData) => rolesApi.createRole(data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['roles'] });
  //     setShowCreateModal(false);
  //   },
  // });

  // const updateRoleMutation = useMutation({
  //   mutationFn: ({ id, data }: { id: number; data: UpdateRoleData }) => 
  //     rolesApi.updateRole(id, data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['roles'] });
  //     setSelectedRole(null);
  //   },
  // });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const handleDeleteRole = (role: Role) => {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Roles</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Manage user roles and their associated permissions.
            </p>
          </div>
          <button
            onClick={() => alert('Create role modal coming soon!')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors w-full sm:w-auto"
          >
            Create Role
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setCurrentPage(1)}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Roles grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rolesData?.data?.map((role) => (
            <div key={role.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white text-sm font-medium">
                        🔐
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {role.name}
                      </h3>
                      {role.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Permissions ({role.permissions?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 3).map((permission) => (
                      <span
                        key={permission.id}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md"
                      >
                        {permission.name}
                      </span>
                    ))}
                    {(role.permissions?.length || 0) > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                        +{(role.permissions?.length || 0) - 3} more
                      </span>
                    )}
                    {(!role.permissions || role.permissions.length === 0) && (
                      <span className="text-xs text-gray-400">No permissions assigned</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Created {new Date(role.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert('Edit role modal coming soon!')}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {rolesData?.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new role.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => alert('Create role modal coming soon!')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Create Role
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {rolesData?.pagination && rolesData.pagination.total > rolesData.pagination.per_page && (
          <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * rolesData.pagination.per_page) + 1} to{' '}
                {Math.min(currentPage * rolesData.pagination.per_page, rolesData.pagination.total)} of{' '}
                {rolesData.pagination.total} results
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
                  disabled={currentPage >= (rolesData.pagination.last_page || 1)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RolesPage;