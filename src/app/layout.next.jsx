import '../index.css'
import { cookies, headers } from 'next/headers'
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
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
  }
}

export default async function RootLayout({ children }) {
  const requestHeaders = await headers()
  const hostname = String(requestHeaders.get('host') || '').toLowerCase().split(':')[0]
  const productionHost = hostname === 'tokriii.com' || hostname === 'www.tokriii.com'
  const consent = (await cookies()).get('tokriii_marketing_consent')?.value === 'granted'
  const renderNoScriptPixel = productionHost && consent

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preload" href="/fonts/plus-jakarta-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body>
        <div id="root">{children}<MarketingConsent /></div>
        {renderNoScriptPixel && (
          <noscript>
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: 'none' }}
              referrerPolicy="origin"
              src="https://www.facebook.com/tr?id=891089060757681&ev=PageView&noscript=1"
            />
          </noscript>
        )}
      </body>
    </html>
  )
}
