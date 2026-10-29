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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body><div id="root">{children}</div></body>
    </html>
  )
}
