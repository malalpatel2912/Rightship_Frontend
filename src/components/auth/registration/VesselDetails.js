'use client';

// VesselDetails.js
import React from 'react';
import Select from 'react-select';

const VesselDetails = ({ formData, handleInputChange,vesselExpOptions, nextStep, prevStep }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const getSelectedMultiOptions = (values, options) => {
    return values.map(value => options.find(option => option.value === value)).filter(Boolean);
  };

  const handleVesselExperienceChange = (value) => {
    const newExperience = formData.vesselExperience.includes(value)
      ? formData.vesselExperience.filter(v => v !== value)
      : [...formData.vesselExperience, value];
    handleInputChange('vesselExperience', newExperience);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">Vessel Details</h2>
      <p className="text-gray-600 mb-6">Enter your vessel details to create your account.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Vessel <span className="text-red-500">*</span>
            </label>
            <Select
              value={vesselExpOptions.find(option => option.value === formData.lastVessel)}
              onChange={(e) => handleInputChange('lastVessel', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              options={vesselExpOptions}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applied Vessel <span className="text-red-500">*</span>
            </label>
            <Select
              value={vesselExpOptions.find(option => option.value === formData.appliedVessel)}
              onChange={(e) => handleInputChange('appliedVessel', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              options={vesselExpOptions}/>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Types of Vessels Experience <span className="text-red-500">*</span>
            </label>
            {/* <Select
              value={vesselExpOptions.find(option => option.value === formData.vesselExperience)}
              onChange={(e) => handleInputChange('vesselExperience', (e ? e.value : ''))}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              isMulti
              options={vesselExpOptions}/> */}
              <Select
              value={getSelectedMultiOptions(formData.vesselExperience, vesselExpOptions)}
              onChange={(selected) => handleInputChange('vesselExperience', selected ? selected.map(option => option.value) : [])}
              className="w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              isMulti
              options={vesselExpOptions}
              placeholder="Select Vessel Experience"
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

export default VesselDetails;