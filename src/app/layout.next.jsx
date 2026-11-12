import '../index.css'
import { Suspense } from 'react'
import NextWebsiteMonitoring from './_components/NextWebsiteMonitoring'
import { headers } from 'next/headers'
import { indexingEnabled } from '../lib/server/indexing'
import MarketingConsent from '../components/MarketingConsent'

export async function generateMetadata() {
  const requestHeaders = await headers()
  const index = indexingEnabled(requestHeaders.get('host'))
  return {
    title: 'Tokriii — Premium & Exotic Fruits',
    robots: { index, follow: index },
    icons: {
      icon: [
        { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
        { url: '/favicon-32x32.png?v=2', type: 'image/png', sizes: '32x32' },
        { url: '/favicon-16x16.png?v=2', type: 'image/png', sizes: '16x16' },
        { url: '/favicon.ico?v=2', sizes: 'any' },
      ],
      apple: [
        { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
  }
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/plus-jakarta-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body>
        <div id="root"><Suspense fallback={null}><NextWebsiteMonitoring /></Suspense>{children}<MarketingConsent /></div>
      </body>
    </html>
  )
}
