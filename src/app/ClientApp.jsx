'use client'

import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { installUploadFallback } from '../lib/api'
import { installAnalytics } from '../lib/telemetry'

export default function ClientApp() {
  useEffect(() => {
    installUploadFallback()
    installAnalytics()
  }, [])
  return <BrowserRouter><App /></BrowserRouter>
}
