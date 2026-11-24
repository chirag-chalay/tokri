import { Router } from 'express'
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { hasPermission } from './permissions.js'
import { listBlockTypes, PLATFORMS } from '../services/homeBuilder/blocks.js'
import { validateDocument } from '../services/homeBuilder/validate.js'
import {
  discardDraft,
  getDraftPreview,
  getLayoutState,
  publishLayout,
  restoreRevision,
  saveDraft,
  searchCategories,
  searchProducts,
} from '../services/homeBuilder/store.js'
import { prisma } from '../lib/prisma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsRoot = path.join(__dirname, '../../uploads')
const homeUploadDir = path.join(uploadsRoot, 'home')
fs.mkdirSync(homeUploadDir, { recursive: true })

function requireContentAdmin() {
  return async (req, res, next) => {
    try {
      const adminId = req.session?.adminUser?.id
      const admin = adminId
        ? await prisma.user.findUnique({ where: { id: adminId }, include: { permissions: true } })
        : null
      if (!admin?.isActive || !hasPermission(admin, 'manageContent')) {
        return res.status(403).json({ message: 'You do not have permission to manage homepage content.' })
      }
      req.homeBuilderAdmin = admin
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

/**
 * AdminJS mounts express-formidable on the whole admin router before our routes.
 * Bodies arrive on req.fields (and optionally a JSON "payload" field), never via express.json().
 */
function readBody(req) {
  const fields = req.fields && typeof req.fields === 'object' ? req.fields : {}
  if (fields.payload != null) {
    try {
      const parsed = typeof fields.payload === 'string' ? JSON.parse(fields.payload) : fields.payload
      if (parsed && typeof parsed === 'object') return parsed
    } catch {
      const error = new Error('Invalid JSON payload.')
      error.status = 400
      throw error
    }
  }
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
    return req.body
  }
  return fields
}

function readPlatform(req, body) {
  const platform = String((body?.platform ?? req.query?.platform) || '').trim()
  if (!PLATFORMS.includes(platform)) {
    const error = new Error('Platform must be web or mobile.')
    error.status = 400
    throw error
  }
  return platform
}

function formidableFile(req) {
  const raw = req.files?.file
  if (raw) return Array.isArray(raw) ? raw[0] : raw
  const values = req.files ? Object.values(req.files) : []
  return values.flatMap((value) => (Array.isArray(value) ? value : [value]))[0] || null
}

function safeUploadName(originalName) {
  const ext = path.extname(originalName || '').toLowerCase() || '.webp'
  const base = path
    .basename(originalName || 'home', path.extname(originalName || ''))
    .replace(/[^a-z0-9-_]/gi, '-')
    .toLowerCase()
    .slice(0, 40)
  return `${base || 'home'}-${Date.now()}${ext}`
}

export function buildHomeBuilderRoutes() {
  const router = Router()
  router.use(requireContentAdmin())

  router.get('/meta', (_req, res) => {
    res.json({
      platforms: PLATFORMS,
      webBlocks: listBlockTypes('web'),
      mobileBlocks: listBlockTypes('mobile'),
    })
  })

  router.get('/state', async (req, res, next) => {
    try {
      const platform = readPlatform(req)
      const state = await getLayoutState(platform)
      return res.json({
        ...state,
        blockTypes: listBlockTypes(platform),
      })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/validate', async (req, res, next) => {
    try {
      const body = readBody(req)
      const platform = readPlatform(req, body)
      const result = validateDocument(body?.document, platform)
      return res.json(result)
    } catch (error) {
      if (error.status === 400) return res.status(400).json({ message: error.message })
      return next(error)
    }
  })

  router.post('/draft', async (req, res, next) => {
    try {
      const body = readBody(req)
      const platform = readPlatform(req, body)
      const state = await saveDraft(platform, body?.document, { allowInvalid: true })
      return res.json({ ...state, blockTypes: listBlockTypes(platform) })
    } catch (error) {
      if (error.status === 400) return res.status(400).json({ message: error.message, errors: error.errors || [] })
      return next(error)
    }
  })

  router.post('/publish', async (req, res, next) => {
    try {
      const body = readBody(req)
      const platform = readPlatform(req, body)
      const state = await publishLayout(platform, {
        document: body?.document,
        publishedById: req.homeBuilderAdmin.id,
      })
      return res.json({ ...state, blockTypes: listBlockTypes(platform) })
    } catch (error) {
      if (error.status === 400) return res.status(400).json({ message: error.message, errors: error.errors || [] })
      return next(error)
    }
  })

  router.post('/discard', async (req, res, next) => {
    try {
      const body = readBody(req)
      const platform = readPlatform(req, body)
      const state = await discardDraft(platform)
      return res.json({ ...state, blockTypes: listBlockTypes(platform) })
    } catch (error) {
      if (error.status === 400) return res.status(400).json({ message: error.message })
      return next(error)
    }
  })

  router.post('/restore', async (req, res, next) => {
    try {
      const body = readBody(req)
      const platform = readPlatform(req, body)
      const state = await restoreRevision(platform, body?.version, {
        publishedById: req.homeBuilderAdmin.id,
      })
      return res.json({ ...state, blockTypes: listBlockTypes(platform) })
    } catch (error) {
      if (error.status === 404 || error.status === 400) {
        return res.status(error.status).json({ message: error.message })
      }
      return next(error)
    }
  })

  router.get('/preview', async (req, res, next) => {
    try {
      const platform = readPlatform(req)
      const preview = await getDraftPreview(platform)
      res.set('Cache-Control', 'no-store')
      return res.json(preview)
    } catch (error) {
      return next(error)
    }
  })

  router.get('/categories', async (req, res, next) => {
    try {
      return res.json(await searchCategories(req.query.q, req.query.limit))
    } catch (error) {
      return next(error)
    }
  })

  router.get('/products', async (req, res, next) => {
    try {
      return res.json(await searchProducts(req.query.q, req.query.limit))
    } catch (error) {
      return next(error)
    }
  })

  router.post('/upload', async (req, res, next) => {
    let tempPath = ''
    try {
      const uploaded = formidableFile(req)
      if (!uploaded) return res.status(400).json({ message: 'No file uploaded' })

      const mimeType = String(uploaded.type || uploaded.mimetype || '')
      if (!mimeType.startsWith('image/')) {
        return res.status(400).json({ message: 'Only image uploads are allowed' })
      }

      const originalName = uploaded.originalFilename || uploaded.name || 'home.webp'
      const filename = safeUploadName(originalName)
      tempPath = uploaded.filepath || uploaded.path || ''
      if (!tempPath) return res.status(400).json({ message: 'No file uploaded' })

      const size = Number(uploaded.size || 0)
      if (size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: 'Image must be 5MB or smaller' })
      }

      const destPath = path.join(homeUploadDir, filename)
      await fsp.copyFile(tempPath, destPath)
      await fsp.unlink(tempPath).catch(() => {})
      tempPath = ''

      const relativePath = `/uploads/home/${filename}`
      const media = await prisma.media.create({
        data: {
          filename,
          originalName,
          path: relativePath,
          folder: 'home',
          mimeType: mimeType || 'image/webp',
          size: size || (await fsp.stat(destPath)).size,
        },
      })
      return res.status(201).json(media)
    } catch (error) {
      if (tempPath) await fsp.unlink(tempPath).catch(() => {})
      return next(error)
    }
  })

  router.use((error, _req, res, next) => {
    if (error?.status) return res.status(error.status).json({ message: error.message })
    if (error?.message === 'Only image uploads are allowed') {
      return res.status(400).json({ message: error.message })
    }
    return next(error)
  })

  return router
}
