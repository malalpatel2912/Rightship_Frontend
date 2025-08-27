// File: src/app/register/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RegistrationForm from '@/components/registration/RegistrationForm'
import SuccessMessage from '@/components/registration/SuccessMessage'
import Image from 'next/image'

export default function RegisterPage() {
  const [isRegistered, setIsRegistered] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full">
        {isRegistered ? (
          <SuccessMessage onContinue={() => router.push('/login')} />
        ) : (
          <RegistrationForm onSuccess={() => setIsRegistered(true)} />
        )}
      </div>
    </div>
  )
}