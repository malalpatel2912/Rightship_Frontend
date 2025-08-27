// File: src/app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RightShips | Top Marine Jobs & Maritime Careers',
  description: 'Find the best marine jobs and maritime careers at RightShips. Connect with leading shipping companies and advance your maritime career.',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'RightShips | Top Marine Jobs & Maritime Careers',
    description: 'Find the best marine jobs and maritime careers at RightShips. Connect with leading shipping companies and advance your maritime career.',
    url: 'https://rightships.com',
    siteName: 'RightShips',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rightships.com'}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'RightShips - Leading Platform for Marine Jobs',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RightShips | Top Marine Jobs & Maritime Careers',
    description: 'Find the best marine jobs and maritime careers at RightShips. Connect with leading shipping companies and advance your maritime career.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://rightships.com'}/logo.png`],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <head>
      <meta name="apple-mobile-web-app-title" content="Rightships" />
    </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}