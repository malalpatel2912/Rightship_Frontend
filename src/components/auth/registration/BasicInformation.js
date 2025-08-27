'use client';
// BasicInformation.js
import React from 'react';
import Select from 'react-select';

const BasicInformation = ({ formData, handleInputChange, nationalityOptions, nextStep, prevStep }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
      <p className="text-gray-600 mb-6">Enter your basic information to create your account.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nationality <span className="text-red-500">*</span>
            </label>

            <Select
              value={nationalityOptions.find(option => option.value === formData.nationality)}
              onChange={(e) => handleInputChange('nationality', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              options={nationalityOptions}/>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Availability <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfAvailability}
              onChange={(e) => handleInputChange('dateOfAvailability', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SID <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sid}
              onChange={(e) => handleInputChange('sid', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select SID</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
       
              {/* Add more SID options as needed */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              US Visa <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.usVisa}
              onChange={(e) => handleInputChange('usVisa', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="C1D">Yes</option>
              <option value="B1">No</option>
              {/* Add more visa options as needed */}
            </select>
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
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInformation;