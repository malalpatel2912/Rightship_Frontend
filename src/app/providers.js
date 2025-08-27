'use client';

import { NextAuthProvider } from './providers/NextAuthProvider'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }) {
  return (
    <NextAuthProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
          <Toaster position='center' reverseOrder={false}/>
        </NotificationProvider>
      </AuthProvider>
    </NextAuthProvider>
  );
} 