'use client';

// ExperienceDetails.js
import React from 'react';

const ExperienceDetails = ({ formData, handleInputChange, nextStep, prevStep }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">Experience Details</h2>
      <p className="text-gray-600 mb-6">Enter your experience details to create your account.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Sea Experience year's & month's <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={formData.totalSeaExperienceYear}
                onChange={(e) => handleInputChange('totalSeaExperienceYear', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Years"
                required
              />
              <input
                type="number"
                value={formData.totalSeaExperienceMonth}
                onChange={(e) => handleInputChange('totalSeaExperienceMonth', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Months"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Rank Experience (In Months) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.presentRankExperienceInMonth}
              onChange={(e) => handleInputChange('presentRankExperienceInMonth', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter months"
              required
            />
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

export default ExperienceDetails;

