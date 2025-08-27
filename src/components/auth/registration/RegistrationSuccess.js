'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

const RegistrationSuccess = () => {
  const router = useRouter();
  
  const handleLoginRedirect = () => {
    router.push('/login');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Your account has been created successfully. You can now login to access your account.
          </p>
          <div className="mt-8">
            <button
              onClick={handleLoginRedirect}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;