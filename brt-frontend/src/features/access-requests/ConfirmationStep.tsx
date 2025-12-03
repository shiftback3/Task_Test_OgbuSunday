import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWizard } from '../../hooks/useWizard.tsx';
import { rolesApi } from '../../api/roles';
import { permissionsApi } from '../../api/permissions';

const ConfirmationStep: React.FC = () => {
  const { data, updateStepValidity } = useWizard();

  // This step is always valid since it's just confirmation
  useEffect(() => {
    updateStepValidity('confirmation', true);
  }, [updateStepValidity]);

  // Fetch role and permission details for display
  const { data: rolesData } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => rolesApi.getRoles({ page: 1, per_page: 100 }),
  });

  const { data: permissionsData } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: () => permissionsApi.getPermissions({ page: 1, per_page: 100 }),
  });

  const selectedRoles = rolesData?.data?.data?.filter((role: any) => 
    data.requested_roles?.includes(role.id)
  ) || [];

  const selectedPermissions = permissionsData?.data?.data?.filter((permission: any) => 
    data.requested_permissions?.includes(permission.name)
  ) || [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('text')) return '📋';
    return '📁';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Please review your access request details before submitting.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Request Details */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Request Details</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.reason}
            </p>
          </div>
        </div>

        {/* Requested Roles */}
        {selectedRoles.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Requested Roles ({selectedRoles.length})
            </h3>
            <div className="space-y-3">
                {selectedRoles.map((role: any) => (
                  <div key={role.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    🔐
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{role.name}</h4>
                    {role.description && (
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    )}
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Includes {role.permissions?.length || 0} permissions:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.slice(0, 5).map((permission: any) => (
                            <span
                              key={permission.id}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                            >
                              {permission.name}
                            </span>
                          ))}
                          {(role.permissions?.length || 0) > 5 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              +{(role.permissions?.length || 0) - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requested Permissions */}
        {selectedPermissions.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Individual Permissions ({selectedPermissions.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedPermissions.map((permission: any) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200"
                >
                  <span className="text-green-500">✓</span>
                  <span className="text-sm font-medium text-gray-900">
                    {permission.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supporting Document */}
        {data.supporting_document && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Supporting Document</h3>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">
                {getFileIcon(data.supporting_document?.type || '')}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{data.supporting_document?.name || 'Unknown file'}</h4>
                <p className="text-sm text-gray-500">
                  {formatFileSize(data.supporting_document?.size || 0)} • {data.supporting_document?.type || 'Unknown type'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Requested Roles:</span>
              <span className="ml-2 text-gray-900">{selectedRoles.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Individual Permissions:</span>
              <span className="ml-2 text-gray-900">{selectedPermissions.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Supporting Documents:</span>
              <span className="ml-2 text-gray-900">
                {data.supporting_document ? '1 file' : 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Request Status:</span>
              <span className="ml-2 text-yellow-600 font-medium">Pending Review</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Before you submit
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Your request will be reviewed by system administrators</li>
                <li>You will receive an email notification when your request is processed</li>
                <li>Approval may take 1-3 business days depending on the requested permissions</li>
                <li>You can track the status of your request in the "My Requests" section</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-xl">📋</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Next Steps
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              After submitting, your request will enter the review queue. Administrators will evaluate your request based on the provided justification and supporting documents. You'll be notified via email once a decision is made.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;