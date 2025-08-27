// File: src/components/registration/SuccessMessage.js
'use client'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export default function SuccessMessage({ onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md mx-auto"
    >
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckCircle2 className="h-6 w-6 text-green-600" />
      </div>

      <div className="mt-3 text-center sm:mt-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Registration Successful!
        </h3>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-500">
            We have sent a verification link to your email address. Please verify your account to continue.
          </p>
          <p className="text-sm text-gray-500">
            Our team will review your application and get back to you shortly.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onContinue}
          className="w-full flex justify-center items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Continue to Login
        </button>
      </div>
    </motion.div>
  )
}
