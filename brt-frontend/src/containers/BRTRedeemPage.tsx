import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DashboardLayout from '../components/layout/DashboardLayout';
import { brtApi } from '../api/brt';
import type { BRT } from '../api/brt';

const BRTRedeemPage: React.FC = () => {
  const [redeemedBRT, setRedeemedBRT] = useState<BRT | null>(null);

  const redeemMutation = useMutation({
    mutationFn: brtApi.redeemBRT,
    onSuccess: (data) => {
      console.log('🎫 Redeem success:', data);
      setRedeemedBRT(data.data || data);
    },
    onError: (error: any) => {
      console.error('❌ Redeem error:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const validationSchema = Yup.object({
    brt_code: Yup.string()
      .required('BRT code is required')
      .min(6, 'BRT code must be at least 6 characters'),
  });

  const resetForm = () => {
    setRedeemedBRT(null);
    redeemMutation.reset();
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">🎫 Redeem BRT</h1>
          <p className="text-gray-600 mt-2">Enter your BRT code to redeem your BRT</p>
        </div>

        {!redeemedBRT && !redeemMutation.isSuccess && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Formik
              initialValues={{ brt_code: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                try {
                  await redeemMutation.mutateAsync(values.brt_code);
                } catch (error) {
                  console.error('Redeem error:', error);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BRT Code
                    </label>
                    <Field
                      name="brt_code"
                      type="text"
                      placeholder="Enter your BRT code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg font-mono tracking-wider"
                    />
                    <ErrorMessage name="brt_code" component="div" className="text-red-600 text-sm mt-1" />
                  </div>

                  {redeemMutation.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="text-red-600 text-sm">
                        {redeemMutation.error.message || 'Failed to redeem BRT. Please check your BRT code and try again.'}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || redeemMutation.isPending}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
                  >
                    {redeemMutation.isPending ? 'Redeeming...' : 'Redeem BRT'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {redeemedBRT && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">BRT Successfully Redeemed! 🎉</h3>
              <p className="text-gray-600">Your BRT has been processed and redeemed.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">BRT Code</label>
                  <div className="text-lg font-mono font-semibold text-gray-900">{redeemedBRT.brt_code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="text-lg font-semibold text-green-600">${redeemedBRT.reserved_amount}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Redeemed
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Redeemed At</label>
                  <div className="text-sm text-gray-900">
                    {redeemedBRT.redeemed_at ? new Date(redeemedBRT.redeemed_at).toLocaleString() : 'Just now'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Originally Created</label>
                <div className="text-sm text-gray-900">{new Date(redeemedBRT.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={resetForm}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Redeem Another BRT
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">How to Redeem:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Enter your unique BRT code in the field above</li>
            <li>• Make sure the BRT is still active and not expired</li>
            <li>• Once redeemed, the BRT cannot be used again</li>
            <li>• Contact support if you encounter any issues</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BRTRedeemPage;