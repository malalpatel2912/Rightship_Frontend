// File: src/app/login/page.js
'use client'
import { useState } from 'react'
import Image from 'next/image'
import OtpVerificationForm from '@/components/auth/OtpVerificationForm'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const [step, setStep] = useState('login')
  const [credentials, setCredentials] = useState(null)
  const [userData, setUserData] = useState(null)

  const handleOtpRequested = (creds, user) => {
    setCredentials(creds)
    setUserData(user)
    setStep('otp')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {step === 'login' ? (
        <LoginForm onOtpRequested={handleOtpRequested} />
      ) : (
        <OtpVerificationForm
          credentials={credentials}
          userData={userData}
          onBack={() => setStep('login')}
        />
      )}
    </div>
  )
}