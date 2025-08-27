'use client';

// ProgressBar.js
import React from 'react';



const ProgressBar = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Upload Resume & Profile Picture' },
    { number: 2, label: 'Personal Details' },
    { number: 3, label: 'Contact Details' },
    { number: 4, label: 'Basic Information' },
    { number: 5, label: 'Rank Details' },
    { number: 6, label: 'Vessel Details' },
    { number: 7, label: 'Experience Details' },
    { number: 8, label: 'Certificate Details' },
  ];

  return (
    <div className="w-[400px] bg-[#051B2C] min-h-screen p-6 flex flex-col">
      
      {/* Logo */}
      <div className="mb-10">
        <div className="flex items-center">
          <span className="text-white text-2xl font-bold">
          <img src="../logo.svg" alt="Logo" height={40} width={40} />
          </span>
        </div>
      </div>

      {/* Step Title */}
      <div className="mb-4">
        <h2 className="text-2xl text-white font-semibold">Step {currentStep}</h2>
        <p className="text-white/80 text-xl mt-4">
          {steps[currentStep - 1]?.label ? 
            `Enter your ${steps[currentStep - 1].label.toLowerCase()} to create your account.` : ''}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="relative mt-6">
        {/* Vertical Line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gray-600" />
        
        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center relative">
              {/* Step Circle */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center z-10
                ${index < (currentStep - 1) ? 'bg-green-500' : 
                  index === (currentStep - 1) ? 'border-2 border-white bg-[#051b2c]' : 
                  'border border-gray-400 bg-[#051b2c]'}
              `}>
                {index < currentStep ? (
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                ) : (
                  <span className={`text-sm ${
                    index === currentStep ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.number}
                  </span>
                )}
              </div>

              {/* Step Label */}
              <span className={`ml-4 text-sm ${
                index < (currentStep-1) ? 'text-green-500' :
                index === (currentStep-1) ? 'text-white' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    
    </div>
  );
};

export default ProgressBar;