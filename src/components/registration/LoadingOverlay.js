// File: src/components/registration/LoadingOverlay.js
'use client'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingOverlay({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg p-8 flex flex-col items-center max-w-sm mx-4"
          >
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Processing Registration
            </h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Please wait while we set up your account. This may take a moment.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}