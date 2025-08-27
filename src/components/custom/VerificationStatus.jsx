'use client'

import React from 'react';
import { AlertCircle, Clock, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const VerificationStatus = () => {

  const { logout } = useAuth();

  return (
    <div className='py-20'>  

    <div> 
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-amber-200">
      <div className="flex items-start space-x-4">
        <div className="shrink-0 bg-amber-100 p-3 rounded-full">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Account Verification In Progress</h2>
            <p className="text-gray-600">
              Your account is currently under review. Verification typically takes up to 24 hours to complete.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center text-blue-800 mb-2">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-medium">Estimated completion time: 24 hours</span>
            </div>
            <p className="text-blue-700">
              We're verifying your information to ensure account security. You'll receive an email notification once your account is verified.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Need assistance? Contact our Help Center:</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-2 text-gray-500" />
                <a href="mailto:support@company.com" className="text-blue-600 hover:underline">support@company.com</a>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-2 text-gray-500" />
                <a href="tel:+18001234567" className="text-blue-600 hover:underline">+1 (800) 123-4567</a>
              </div>
            </div>
          </div>
          
          <button 
            className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
            onClick={()=> {logout()}}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
    </div> 
    </div> 
  );
};

export default VerificationStatus;