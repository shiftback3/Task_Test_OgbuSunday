import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useWizard } from '../../hooks/useWizard.tsx';

const validationSchema = Yup.object().shape({
  reason: Yup.string()
    .min(10, 'Please provide at least 10 characters explaining why you need elevated access')
    .max(500, 'Reason must be less than 500 characters')
    .required('Reason is required'),
});

const DetailsStep: React.FC = () => {
  const { data, updateData, updateStepValidity } = useWizard();

  const formik = useFormik({
    initialValues: {
      reason: data.reason || '',
    },
    validationSchema,
    onSubmit: () => {}, // Handled by wizard navigation
    enableReinitialize: true, // Allow formik to reinitialize when data changes
  });

  // Update wizard data when form values change
  useEffect(() => {
    updateData('reason', formik.values.reason);
  }, [formik.values.reason]);

  // Update step validity
  useEffect(() => {
    updateStepValidity('details', formik.isValid && !!formik.values.reason);
  }, [formik.isValid, formik.values.reason]);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Request Details
        </h2>
        <p className="text-gray-600">
          Please provide details about why you need elevated access to the system.
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Access Request *
          </label>
          <textarea
            id="reason"
            rows={6}
            placeholder="Please explain why you need elevated access, what specific permissions you require, and how long you expect to need this access..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            {...formik.getFieldProps('reason')}
          />
          {formik.touched.reason && formik.errors.reason && (
            <div className="mt-1 text-sm text-red-600">{String(formik.errors.reason)}</div>
          )}
          <div className="mt-1 text-sm text-gray-500">
            {formik.values.reason.length}/500 characters
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-xl">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Tips for a good request
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Be specific about what permissions you need</li>
                  <li>Explain the business justification</li>
                  <li>Mention any time constraints or deadlines</li>
                  <li>Include details about the project or task requiring access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DetailsStep;