// File: src/components/registration/ValidationRules.js
'use client'
import { Check, X } from 'lucide-react'

export function ValidationRules({ rules, field, value }) {
  const getValidationStatus = (rule) => {
    switch (field) {
      case 'password':
        switch (rule.key) {
          case 'length':
            return value.length >= 8
          case 'uppercase':
            return /[A-Z]/.test(value)
          case 'lowercase':
            return /[a-z]/.test(value)
          case 'number':
            return /\d/.test(value)
          case 'special':
            return /[!@#$%^&*]/.test(value)
          default:
            return false
        }
      case 'email':
        switch (rule.key) {
          case 'format':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          default:
            return false
        }
      case 'phone':
        switch (rule.key) {
          case 'length':
            return /^\d{10}$/.test(value)
          case 'numeric':
            return /^\d+$/.test(value)
          default:
            return false
        }
      default:
        return false
    }
  }

  return (
    <div className="mt-2 space-y-2">
      {rules.map((rule) => {
        const isValid = getValidationStatus(rule)
        return (
          <div
            key={rule.key}
            className={`flex items-center space-x-2 text-sm ${
              isValid ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {isValid ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{rule.message}</span>
          </div>
        )
      })}
    </div>
  )
}