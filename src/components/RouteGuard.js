'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

export default function RouteGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Skip check if still loading
    if (loading) return

    const isPublicPath = PUBLIC_PATHS.includes(pathname)

    if (!user && !isPublicPath) {
      console.log('Unauthorized access, redirecting to login')
      setAuthorized(false)
      router.replace('/login')
    } else if (user && isPublicPath) {
      console.log('Authenticated user on public path, redirecting to dashboard')
      setAuthorized(false)
      router.replace('/company')
    } else {
      console.log('Access authorized')
      setAuthorized(true)
    }
  }, [user, loading, pathname, router])

  // Show nothing while loading or during unauthorized states
  if (loading || !authorized) {
    return null
  }

  return children
}