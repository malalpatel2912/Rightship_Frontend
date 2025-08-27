'use client';

// RankDetails.js
import React from 'react';
import Select from 'react-select';

const RankDetails = ({ formData, handleInputChange,rankOptions, nextStep, prevStep }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">Rank Details</h2>
      <p className="text-gray-600 mb-6">Enter your rank details to create your account.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Rank <span className="text-red-500">*</span>
            </label>

            <Select
              value={rankOptions.find(option => option.value === formData.lastRank)}
              onChange={(e) => handleInputChange('lastRank', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              options={rankOptions}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applied Rank <span className="text-red-500">*</span>
            </label>
            <Select
              value={rankOptions.find(option => option.value === formData.appliedRank)}
              onChange={(e) => handleInputChange('appliedRank', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              options={rankOptions}/>
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

export default RankDetails;

