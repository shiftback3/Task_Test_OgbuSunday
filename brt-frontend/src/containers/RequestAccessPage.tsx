import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { WizardProvider, Wizard } from '../hooks/useWizard.tsx';
import { accessRequestsApi } from '../api/access-requests';
import DetailsStep from '../features/access-requests/DetailsStep';
import PermissionsStep from '../features/access-requests/PermissionsStep';
import DocumentUploadStep from '../features/access-requests/DocumentUploadStep';
import ConfirmationStep from '../features/access-requests/ConfirmationStep';

const RequestAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createRequestMutation = useMutation({
    mutationFn: accessRequestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      navigate('/', { 
        state: { message: 'Your access request has been submitted successfully!' }
      });
    },
    onError: (error: any) => {
      setSubmitError(error.response?.data?.message || 'Failed to submit request');
      setIsSubmitting(false);
    },
  });

  const handleComplete = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the request data
      const requestData = {
        reason: data.reason,
        requested_roles: data.requested_roles || [],
        requested_permissions: data.requested_permissions || [],
        supporting_document: data.supporting_document,
      };

      await createRequestMutation.mutateAsync(requestData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const wizardSteps = [
    {
      id: 'details',
      title: 'Request Details',
      component: DetailsStep,
    },
    {
      id: 'permissions',
      title: 'Permissions',
      component: PermissionsStep,
    },
    {
      id: 'documents',
      title: 'Documents',
      component: DocumentUploadStep,
    },
    {
      id: 'confirmation',
      title: 'Review & Submit',
      component: ConfirmationStep,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Request Elevated Access
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Submit a request for additional system permissions or roles
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Submission Failed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {submitError}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSubmitting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Submitting Request
                </h3>
                <p className="text-sm text-blue-700">
                  Please wait while we process your access request...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard */}
        <WizardProvider 
          steps={wizardSteps} 
          onComplete={handleComplete}
          initialData={{}}
        >
          <Wizard className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8" />
        </WizardProvider>

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                Need Help?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  <span>Contact your manager for approval before requesting access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  <span>Provide clear business justification for faster approval</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  <span>Include supporting documents when possible</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  <span>Allow 1-3 business days for review</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                Contact Support
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2 flex-shrink-0">📧</span>
                  <span className="break-all sm:break-normal">support@company.com</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2 flex-shrink-0">📞</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2 flex-shrink-0">💬</span>
                  <span>Live chat available 9am-5pm EST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestAccessPage;