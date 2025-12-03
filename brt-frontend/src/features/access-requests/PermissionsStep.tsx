import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWizard } from '../../hooks/useWizard.tsx';
import { rolesApi } from '../../api/roles';
import { permissionsApi } from '../../api/permissions';

const PermissionsStep: React.FC = () => {
  const { data, updateData, updateStepValidity } = useWizard();
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Initialize selections from wizard data (only on mount)
  useEffect(() => {
    if (data.requested_roles && selectedRoles.length === 0) {
      setSelectedRoles(data.requested_roles);
    }
    if (data.requested_permissions && selectedPermissions.length === 0) {
      setSelectedPermissions(data.requested_permissions);
    }
  }, []); // Empty dependency array - only run on mount

  // Fetch available roles and permissions
  const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => rolesApi.getRoles({ page: 1, per_page: 100 }),
  });

  const { data: permissionsResponse, isLoading: permissionsLoading, error: permissionsError } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: () => permissionsApi.getPermissions({ page: 1, per_page: 100 }),
  });

  const rolesData = rolesResponse?.data;
  const permissionsData = permissionsResponse?.data;

  // Debug logging
  console.log('Roles response:', rolesResponse);
  console.log('Permissions response:', permissionsResponse);
  console.log('Roles error:', rolesError);
  console.log('Permissions error:', permissionsError);

  // Update wizard data when selections change
  useEffect(() => {
    updateData('requested_roles', selectedRoles);
    updateData('requested_permissions', selectedPermissions);
    
    // Update step validity
    const hasSelections = selectedRoles.length > 0 || selectedPermissions.length > 0;
    updateStepValidity('permissions', hasSelections);
  }, [selectedRoles, selectedPermissions]); // Don't include updateData/updateStepValidity in deps

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const groupedPermissions = permissionsData?.data?.reduce((acc, permission) => {
    const [resource] = permission.name.split(':');
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, any[]>) || {};

  // Show loading state
  if (rolesLoading || permissionsLoading) {
    return (
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
            Select Permissions
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Loading roles and permissions...
          </p>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (rolesError || permissionsError) {
    return (
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
            Select Permissions
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Error loading permissions data.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            {rolesError?.message || permissionsError?.message || 'Failed to load data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
          Select Permissions
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Choose the specific roles and permissions you need. You can select either roles (which include multiple permissions) or individual permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Roles Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Roles</h3>
          <div className="space-y-3">
            {rolesData?.data && rolesData.data.length > 0 ? (
              rolesData.data.map((role) => (
                <div
                  key={role.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedRoles.includes(role.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">{role.name}</h4>
                          {role.description && (
                            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                          )}
                        </div>
                      </div>
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="mt-2 ml-7">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <span
                                key={permission.id}
                                className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                              >
                                {permission.name}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No roles available</p>
              </div>
            )}
          </div>
        </div>

        {/* Individual Permissions Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Permissions</h3>
          <div className="space-y-4">
            {Object.keys(groupedPermissions).length > 0 ? (
              Object.entries(groupedPermissions).map(([resource, permissions]) => (
              <div key={resource} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 capitalize">
                  {resource} Permissions
                </h4>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.name)}
                        onChange={() => handlePermissionToggle(permission.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">
                          {permission.name}
                        </span>
                        {permission.description && (
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No permissions available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selection summary */}
      {(selectedRoles.length > 0 || selectedPermissions.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Selection Summary</h4>
          <div className="text-sm text-green-700">
            {selectedRoles.length > 0 && (
              <div>
                <strong>Roles:</strong> {selectedRoles.length} selected
              </div>
            )}
            {selectedPermissions.length > 0 && (
              <div>
                <strong>Individual Permissions:</strong> {selectedPermissions.length} selected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning if nothing selected */}
      {selectedRoles.length === 0 && selectedPermissions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-yellow-400 text-lg mr-2">⚠️</span>
            <div>
              <h4 className="font-medium text-yellow-800">No permissions selected</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Please select at least one role or permission to continue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsStep;