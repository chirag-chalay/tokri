import '../index.css'
import { headers } from 'next/headers'
import { indexingEnabled } from '../lib/server/indexing'

export async function generateMetadata() {
  const requestHeaders = await headers()
  const index = indexingEnabled(requestHeaders.get('host'))
  return { title: 'Tokriii — Premium & Exotic Fruits', robots: { index, follow: index } }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preload" href="/fonts/plus-jakarta-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body><div id="root">{children}</div></body>
    </html>
  )
}
