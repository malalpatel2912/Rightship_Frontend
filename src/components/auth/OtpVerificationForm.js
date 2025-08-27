// File: src/components/auth/OtpVerificationForm.js
'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react'

// Auth Implementation
import { useAuth } from '@/context/AuthContext'

export default function OtpVerificationForm({ credentials, onBack, userData }) {
  const { login, loginWithNextAuth } = useAuth()
  const router = useRouter()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(25)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimer, setBlockTimer] = useState(0)

  const inputRefs = Array(6).fill(0).map(() => useRef())

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus()

    // Check for previous block status
    const blockUntil = localStorage.getItem('otpBlockUntil')
    if (blockUntil && new Date().getTime() < parseInt(blockUntil)) {
      setIsBlocked(true)
      setBlockTimer(Math.ceil((parseInt(blockUntil) - new Date().getTime()) / 1000))
    }
  }, [])

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  useEffect(() => {
    let interval
    if (blockTimer > 0) {
      interval = setInterval(() => {
        setBlockTimer(t => {
          if (t <= 1) {
            setIsBlocked(false)
            localStorage.removeItem('otpBlockUntil')
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [blockTimer])

  const handleInput = (index, value) => {
    if (!/^\d*$/.test(value)) return

    setOtp(prev => {
      const newOtp = [...prev]
      newOtp[index] = value
      return newOtp
    })

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)
    if (pastedData.length) {
      inputRefs[Math.min(5, pastedData.length - 1)].current?.focus()
    }
  }

  // Inside OtpVerificationForm.js, update the handleVerifyOtp function
  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Format credentials for NextAuth
      const nextAuthCredentials = {
        contactType: credentials.type,
        contactValue: credentials.value,
        otp: otpValue,
        userType: 'company' // Always company for this form
      };

      console.log('Verifying OTP with NextAuth:', nextAuthCredentials);

      // Use NextAuth for authentication
      const result = await loginWithNextAuth(nextAuthCredentials);

      console.log('NextAuth signIn result:', result);

      if (result?.error) {
        throw new Error(result.error || 'Invalid OTP');
      }

      // For backward compatibility, also use the old login method
      if (userData && userData.token) {
        await login(userData.token, userData);
        console.log('Stored token in localStorage:', userData.token);
      }

      toast.success('Login successful!');
      
      // Route based on user type
      const redirectPath = userData?.type === 'employee' ? '/profile' : '/company';
      router.replace(redirectPath);
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
      toast.error(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isBlocked || timer > 0) return

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/otp/send_otp`, {
        [credentials.type === 'phone' ? 'mobile_no' : 'email']: credentials.value
      })

      if (response.data.code === 200) {
        setTimer(25)
        setResendAttempts(prev => {
          const newAttempts = prev + 1
          if (newAttempts >= 5) {
            setIsBlocked(true)
            setBlockTimer(600) // 10 minutes
            const blockUntil = new Date().getTime() + (600 * 1000)
            localStorage.setItem('otpBlockUntil', blockUntil)
          }
          return newAttempts
        })
        toast.success('New OTP sent successfully')
      } else {
        throw new Error(response.data.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center relative h-20 w-20 mx-auto">
          <Image
            src="/logo.png"
            alt="RightShips Logo"
            fill
            sizes="(max-width: 768px) 80px, 80px"
            className="object-contain"
            priority
          />
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {`We've sent a verification code to ${credentials.type === 'phone' ?
            credentials.value.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3') :
            credentials.value}`
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* OTP Input Fields */}
            <div className="space-y-2">
              <label
                htmlFor="otp-input"
                className="block text-sm font-medium text-gray-700"
              >
                Enter verification code
              </label>
              <div className="flex gap-2 sm:gap-4 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-xl font-semibold border ${error ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    aria-label={`Digit ${index + 1} of OTP`}
                  />
                ))}
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  {error}
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Verify
                </>
              )}
            </button>

            {/* Resend OTP Section */}
            <div className="text-center">
              {isBlocked ? (
                <p className="text-sm text-red-600">
                  Too many attempts. Please try again in {Math.floor(blockTimer / 60)}:
                  {(blockTimer % 60).toString().padStart(2, '0')}
                </p>
              ) : timer > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend code in {timer} seconds
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Resend verification code
                </button>
              )}
            </div>

            {/* Back Button */}
            <div className="mt-6">
              <button
                onClick={onBack}
                className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change contact information
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}