// File: src/components/registration/StepIndicator.js
'use client'

export function StepIndicator({ steps, currentStep }) {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="absolute h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 ${
                    index <= currentStep
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 bg-white'
                  }`}
                />
                <div className="mt-4 space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block">
                    {step.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}