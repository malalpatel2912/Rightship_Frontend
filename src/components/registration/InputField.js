// File: src/components/registration/InputField.js
'use client'

export function InputField({
  label,
  type,
  value,
  onChange,
  required,
  icon: Icon,
  prefix,
}) {
  const inputClasses = `
    w-full px-4 py-3 
    ${prefix ? 'rounded-r-lg' : 'rounded-lg'} 
    ${Icon ? 'pl-11' : ''}
    border border-gray-300 
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    placeholder-gray-400
    transition-colors
    disabled:opacity-50
    disabled:cursor-not-allowed
  `

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative mt-1">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="flex">
          {prefix && (
            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              {prefix}
            </span>
          )}

          {type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              className={inputClasses}
              rows={4}
            />
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              className={inputClasses}
            />
          )}
        </div>
      </div>
    </div>
  )
}
