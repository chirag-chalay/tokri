import { Router } from 'express'
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { prisma } from '../lib/prisma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsRoot = path.join(__dirname, '../../uploads')
const ALLOWED_FOLDERS = new Set(['products', 'categories', 'reviews', 'pages', 'blog', 'general'])

function normalizeFolder(value) {
  const folder = String(value || '').trim().toLowerCase()
  return ALLOWED_FOLDERS.has(folder) ? folder : 'general'
}

for (const folder of ALLOWED_FOLDERS) {
  fs.mkdirSync(path.join(uploadsRoot, folder), { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folder = normalizeFolder(req.body?.folder || req.query?.folder)
    cb(null, path.join(uploadsRoot, folder))
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, '-')
      .toLowerCase()
      .slice(0, 40)
    cb(null, `${base}-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'))
    }
    cb(null, true)
  },
})

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const folder = req.query.folder ? String(req.query.folder) : undefined
    const media = await prisma.media.findMany({
      where: folder ? { folder } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    res.json(media)
  } catch (error) {
    next(error)
  }
})

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const folder = normalizeFolder(path.basename(req.file.destination))
    const relativePath = `/uploads/${folder}/${req.file.filename}`

    const media = await prisma.media.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: relativePath,
        folder,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    })

    res.status(201).json(media)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } })
    if (!media) {
      return res.status(404).json({ message: 'Media not found' })
    }

    const linkedProducts = await prisma.product.count({ where: { image: media.path } })
    if (linkedProducts > 0) {
      return res.status(400).json({
        message: 'Cannot delete: image is used by one or more products',
        linkedProducts,
      })
    }

    const absolutePath = path.join(uploadsRoot, media.folder, media.filename)
    await fsp.unlink(absolutePath).catch(() => {})
    await prisma.media.delete({ where: { id: media.id } })

    res.json({ message: 'Media deleted', id: media.id })
  } catch (error) {
    next(error)
  }
})

export default router
