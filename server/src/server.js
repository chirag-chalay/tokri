import { processTrackingDeliveries } from './services/trackingPurchase.js'

import websiteMonitoring from './monitoring/website.js'
import express from 'express'
import { requestLogging, startCriticalOutbox, closeMonitoring, installProcessErrorLogging, installGracefulShutdown } from './monitoring/index.js'
import { logError } from './monitoring/database.js'
import cors from 'cors'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import { buildAdminRouter } from './admin/index.js'
import adminAuthRouter from './admin/authRoutes.js'
import partnerPagesRouter from './routes/partnerPages.js'
import { handleRazorpayWebhook } from './routes/webhooks.js'
import { handleRazorpayCheckoutCallback } from './routes/checkout.js'
import apiRouter from './routes/api.js'
import mediaRouter from './routes/media.js'
import { errorHandler } from './middleware/errorHandler.js'
import { prisma } from './lib/prisma.js'
import { recoverPendingOnlinePayments } from './services/checkout.js'

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Create server/.env from server/.env.example and set it to your local MySQL connection string.',
  )
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsPath = path.join(__dirname, '../uploads')
const distPath = path.join(__dirname, '../../dist')
const hasDist = fs.existsSync(path.join(distPath, 'index.html'))
const useNextStorefront = Boolean(env.nextOrigin)

function isReservedStorefrontPath(reqPath) {
  return (
    reqPath.startsWith('/api') ||
    reqPath.startsWith(env.adminPath) ||
    reqPath.startsWith('/admin') ||
    reqPath.startsWith('/uploads') ||
    reqPath.startsWith('/partner')
  )
}

function proxyToNext(req, res) {
  let target
  try {
    target = new URL(env.nextOrigin)
  } catch {
    res.status(502).type('text').send('Storefront origin is invalid.')
    return
  }

  const headers = { ...req.headers, host: target.host }
  delete headers['accept-encoding']

  const proxyReq = http.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      path: req.originalUrl,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
      proxyRes.pipe(res)
    },
  )

  proxyReq.on('error', (error) => {
    logError(error, 'storefront-proxy')
    if (!res.headersSent) {
      res.status(502).type('text').send('Storefront is temporarily unavailable.')
    } else {
      res.end()
    }
  })

  req.pipe(proxyReq)
}

installProcessErrorLogging()
const app = express()
app.use(requestLogging)

if (env.trustProxy) {
  app.set('trust proxy', 1)
}

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Phone'],
    exposedHeaders: ['X-Tokri-Request-Id', 'X-Tokri-Failure-Reason', 'X-Tokri-Operation-Status'],
  }),
)

app.use('/uploads', express.static(uploadsPath))

// Next storefront (TOKRIII_NEXT_ORIGIN) keeps this public port for API/admin and proxies pages.
// Otherwise serve Vite dist/ when present (staging/single-host). Live often uses nginx for HTML.
if (useNextStorefront) {
  // Storefront HTML/assets come from the local Next process via the catch-all below.
} else if (hasDist) {
  app.use(express.static(distPath, { index: false, maxAge: '1h' }))
} else {
  app.get('/', (_req, res) => {
    res.json({
      name: 'Tokriii API',
      api: '/api/v1',
      health: '/api/v1/health',
    })
  })
}

// Password reset pages (before AdminJS; no global body parser here)
app.use(env.adminPath, adminAuthRouter)
app.use(`${env.adminPath}/partner`, partnerPagesRouter)
app.use('/partner', partnerPagesRouter)

app.post('/api/v1/webhooks/razorpay', express.raw({ type: 'application/json' }), handleRazorpayWebhook)
app.post(
  '/api/v1/checkout/razorpay-callback',
  express.urlencoded({ extended: true }),
  handleRazorpayCheckoutCallback,
)

// CMS theme assets
app.use(
  `${env.adminPath}/assets`,
  express.static(path.join(__dirname, 'admin/assets')),
)

// AdminJS must be mounted BEFORE express.json() on overlapping paths
const { admin, adminRouter } = await buildAdminRouter()
app.use(admin.options.rootPath, adminRouter)

app.use('/api/v1/monitoring', websiteMonitoring)

// API routes use body parser (after AdminJS)
const api = express.Router()
api.use(express.json({ limit: '2mb' }))
api.use(express.urlencoded({ extended: true }))
api.use('/', apiRouter)
api.use('/media', mediaRouter)
app.use('/api/v1', api)

// Storefront fallback (must be after API + admin)
if (useNextStorefront) {
  app.use((req, res, next) => {
    if (isReservedStorefrontPath(req.path)) return next()
    return proxyToNext(req, res)
  })
} else if (hasDist) {
  app.get('*', (req, res, next) => {
    if (isReservedStorefrontPath(req.path)) return next()
    return res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use(errorHandler)

async function start() {
  try {
    await prisma.$connect()
    await startCriticalOutbox()
    const listener = app.listen(env.port, () => {
      console.log(`Tokriii server listening on port ${env.port}`)
      console.log(`Public site: ${env.clientUrl}`)
      console.log(`Admin panel: ${env.appUrl}${env.adminPath}`)
      console.log(`API: ${env.apiUrl}/api/v1`)
      if (useNextStorefront) {
        console.log(`Storefront proxy: ${env.nextOrigin}`)
      } else {
        console.log(`Storefront dist: ${hasDist ? distPath : 'not found (API-only root)'}`)
      }
      const deliverTracking = () => processTrackingDeliveries().catch(() => console.error('Tracking delivery processing failed'))
      setInterval(deliverTracking, 30000).unref()
      const recover = () =>
        recoverPendingOnlinePayments()
          .then((ids) => {
            if (ids.length) console.log('Recovered Razorpay payments:', ids.join(', '))
          })
          .catch((error) => logError(error, 'payment-recovery'))
      setTimeout(recover, 8000)
      setInterval(recover, 5 * 60 * 1000)
    })
    installGracefulShutdown(listener, () => prisma.$disconnect())
  } catch (error) {
    logError(error, 'server-start')
    await closeMonitoring().catch(() => {})
    process.exit(1)
  }
}

start()
