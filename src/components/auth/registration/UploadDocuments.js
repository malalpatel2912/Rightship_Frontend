'use client';

// UploadDocuments.js
import React, { useRef, useState } from 'react';
import axios from 'axios';

const UploadDocuments = ({ formData, handleInputChange, nextStep }) => {
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.file_url) {
        return response.data.file_url;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (name, file) => {
    try {
      setUploadError('');
      if (file) {
        const fileUrl = await handleFileUpload(file);
        handleInputChange(name, file);
        handleInputChange(`${name}Url`, fileUrl);
      }
    } catch (error) {
      setUploadError('Failed to upload file. Please try again.');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!formData.resume) {
      setUploadError('Please upload your resume before proceeding');
      return;
    }
    nextStep();
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">Upload Resume & Profile Picture</h2>
      <p className="text-gray-600 mb-6">Upload your resume & profile picture to create your account.</p>
      
      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {uploadError}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Profile Picture Upload Section - Same as before */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                {formData.profilePicture ? (
                  <img
                    src={URL.createObjectURL(formData.profilePicture)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Upload your Photo</h3>
            <p className="text-sm text-gray-500 mb-4">Receive 2x job offers after uploading</p>
            <input
              type="file"
              ref={photoInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange('profilePicture', e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Browse files
            </button>
            <p className="text-xs text-gray-500 mt-2">OR</p>
          </div>
        </div>
        {/* ... */}

        {/* Resume Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                {formData.resume ? (
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Upload your Resume!</h3>
            <p className="text-sm text-gray-500 mb-4">Receive 2x job offers after uploading</p>
            <input
              type="file"
              ref={resumeInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange('resume', e.target.files[0])}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => resumeInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Browse files'}
            </button>
            {formData.resume && (
              <p className="text-sm text-green-600 mt-2">Resume uploaded successfully!</p>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="submit"
            disabled={isUploading || !formData.resume}
            className="px-6 py-2 bg-red-800 text-white rounded hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocuments;