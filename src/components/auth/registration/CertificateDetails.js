'use client';

// CertificateDetails.js
import React from 'react';
import Select from 'react-select';

const CertificateDetails = ({ 
  formData, 
  handleInputChange, 
  copOptions, 
  cocOptions, 
  watchKeepingOptions, 
  prevStep, 
  handleFinalSubmit 
}) => {

  const onSubmit = async (e) => {
      e.preventDefault();
      if (handleFinalSubmit) {
          await handleFinalSubmit();
      }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">Certificate Details</h2>
      <p className="text-gray-600 mb-6">Enter your certificate details to create your account.</p>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              COP
            </label>

            <Select
              value={copOptions.find(option => option.value === formData.cop)}
              onChange={(e) => handleInputChange('cop', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              options={copOptions}/>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              COC
            </label>

            <Select
              value={cocOptions.find(option => option.value === formData.coc)}
              onChange={(e) => handleInputChange('coc', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              options={cocOptions}/>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Watch Keeping
            </label>

            <Select
              value={watchKeepingOptions.find(option => option.value === formData.watchKeeping)}
              onChange={(e) => handleInputChange('watchKeeping', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              options={watchKeepingOptions}/>

          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Previous
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-800 text-white rounded hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CertificateDetails;