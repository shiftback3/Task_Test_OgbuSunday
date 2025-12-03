import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../components/layout/DashboardLayout';
import { resourcesApi } from '../api/resources';
import type { Resource } from '../types';

const ResourcesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  // TODO: Implement create/edit modals
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const queryClient = useQueryClient();

  // Fetch resources
  const { data: resourcesResponse, isLoading } = useQuery({
    queryKey: ['resources', currentPage, searchTerm, typeFilter],
    queryFn: () => resourcesApi.getResources({
      page: currentPage,
      per_page: 12,
    }),
  });

  const resourcesData = resourcesResponse?.data;

  // Mutations
  // TODO: Implement create/update modals
  // const createResourceMutation = useMutation({
  //   mutationFn: (data: CreateResourceForm) => resourcesApi.createResource(data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['resources'] });
  //     setShowCreateModal(false);
  //   },
  // });

  // const updateResourceMutation = useMutation({
  //   mutationFn: ({ id, data }: { id: string; data: Partial<CreateResourceForm> }) => 
  //     resourcesApi.updateResource(id, data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['resources'] });
  //     setSelectedResource(null);
  //   },
  // });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: string) => resourcesApi.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const handleDeleteResource = (resource: Resource) => {
    if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      deleteResourceMutation.mutate(resource.id);
    }
  };

  const resourceTypes = [
    'document',
    'image',
    'video',
    'audio',
    'archive',
    'application',
    'other',
  ];

  const getResourceIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      document: '📄',
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      archive: '📦',
      application: '⚙️',
      other: '📁',
    };
    return iconMap[type] || '📁';
  };

  const getResourceColor = (type: string) => {
    const colorMap: Record<string, string> = {
      document: 'bg-blue-100 text-blue-800',
      image: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      audio: 'bg-yellow-100 text-yellow-800',
      archive: 'bg-gray-100 text-gray-800',
      application: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resources</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Manage system resources, files, and digital assets.
            </p>
          </div>
          <button
            onClick={() => alert('Upload modal coming soon!')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors w-full sm:w-auto"
          >
            Upload Resource
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setCurrentPage(1)}
                className="w-full bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Resources grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resourcesData?.data?.map((resource) => (
            <div key={resource.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-4">
                {/* Resource preview */}
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg mb-4">
                  <div className="text-4xl">
                    {getResourceIcon(resource.type || 'other')}
                  </div>
                </div>

                {/* Resource info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate" title={resource.title}>
                    {resource.title}
                  </h3>
                  
                  {resource.body && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {resource.body}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResourceColor(resource.type || 'other')}`}
                    >
                      {(resource.type || 'other').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {resource.meta?.file_size ? formatFileSize(resource.meta.file_size) : 'Unknown size'}
                    </span>
                  </div>

                  {resource.meta?.mime_type && (
                    <div className="text-xs text-gray-500">
                      {resource.meta.mime_type}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Created {new Date(resource.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert('Edit modal coming soon!')}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {resource.meta?.file_path && (
                      <a
                        href={resource.meta.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        View
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteResource(resource)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {resourcesData?.data?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || typeFilter ? 'Try adjusting your search terms.' : 'Get started by uploading your first resource.'}
            </p>
            {!searchTerm && !typeFilter && (
              <button
                onClick={() => alert('Upload modal coming soon!')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Upload Resource
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {resourcesData?.pagination && resourcesData.pagination.total > resourcesData.pagination.per_page && (
          <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * resourcesData.pagination.per_page) + 1} to{' '}
                {Math.min(currentPage * resourcesData.pagination.per_page, resourcesData.pagination.total)} of{' '}
                {resourcesData.pagination.total} results
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
                  disabled={currentPage >= (resourcesData.pagination.last_page || 1)}
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

export default ResourcesPage;