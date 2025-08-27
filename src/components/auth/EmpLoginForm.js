// File: src/components/auth/LoginForm.js
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { Phone, Mail, ArrowRight, AlertCircle } from 'lucide-react'

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`

const EmpLoginForm = ({ onOtpRequested }) => {
  const [loginMethod, setLoginMethod] = useState('phone')
  const [contact, setContact] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateInput = () => {
    if (!contact) {
      setError('Please enter your contact information')
      return false
    }

    if (loginMethod === 'phone' && !/^\d{10}$/.test(contact)) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }

    if (loginMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      setError('Please enter a valid email address')
      return false
    }

    setError('')
    return true
  }

  const verifyUserExists = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/details`, {
        mobile_no: loginMethod === 'phone' ? contact : undefined,
        email: loginMethod === 'email' ? contact : undefined,
        user_type: 'employee'
      })
      return response.data
    } catch (error) {
      console.error('Error verifying user:', error)
      if (error.response?.status === 404) {
        return false
      }
      throw error
    }
  }

  // Inside LoginForm.js, update the handleRequestOtp function
  const handleRequestOtp = async () => {
    if (!validateInput()) return

    setIsLoading(true)
    setError('')

    try {
      const userExists = await verifyUserExists()

      if (!userExists.data) {
        setError('Account not found. Please register first.')
        toast.error('Account not found. Please register first.')
        return
      }

      const response = await axios.post(`${BASE_URL}/otp/send_otp`, {
        mobile_no: loginMethod === 'phone' ? contact : undefined,
        email: loginMethod === 'email' ? contact : undefined
      })

      if (response.data.code === 200) {
        onOtpRequested(
          { type: loginMethod, value: contact },
          userExists.data // Pass the user data to the parent
        )
        toast.success('OTP sent successfully!')
        console.log("user data ", userExists.data);
      } else {
        throw new Error(response.data.message || 'Failed to send OTP')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center relative h-20 w-20 mx-auto">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="RightShips Logo"
              fill
              className="object-contain"
              priority
              />
          </Link>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Create New Account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('phone')
                  setContact('')
                  setError('')
                }}
                className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-md shadow-sm text-sm font-medium transition-colors
                  ${loginMethod === 'phone'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
              >
                <Phone className="h-5 w-5 mr-2" />
                Phone
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email')
                  setContact('')
                  setError('')
                }}
                className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-md shadow-sm text-sm font-medium transition-colors
                  ${loginMethod === 'email'
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
              >
                <Mail className="h-5 w-5 mr-2" />
                Email
              </button>
            </div>

            {/* Input Field */}
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-700"
              >
                {loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}
              </label>
              <div className="mt-1 relative">
                {loginMethod === 'phone' && (
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      +91
                    </span>
                    <input
                      id="contact"
                      type="tel"
                      value={contact}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 10) {
                          setContact(value)
                          setError('')
                        }
                      }}
                      placeholder="10-digit mobile number"
                      className={`appearance-none block w-full rounded-r-md px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base`}
                    />
                  </div>
                )}
                {loginMethod === 'email' && (
                  <input
                    id="contact"
                    type="email"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value)
                      setError('')
                    }}
                    placeholder="your@email.com"
                    className={`appearance-none block w-full rounded-md px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base`}
                  />
                )}
                {error && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleRequestOtp}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <p className="text-center text-sm text-gray-600 underline">
            Back to Home
          </p>
        </Link>
      </div>

    </div>
  )
}

export default EmpLoginForm