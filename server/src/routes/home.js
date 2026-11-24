import { Router } from 'express'
import { PLATFORMS } from '../services/homeBuilder/blocks.js'
import { verifyPreviewToken } from '../services/homeBuilder/preview.js'
import { getDraftPreview, getPublishedHome } from '../services/homeBuilder/store.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const platform = String(req.query.platform || '').trim()
    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({ message: 'Query platform must be web or mobile.' })
    }

    const previewToken = String(req.query.previewToken || '').trim()
    if (previewToken) {
      const verified = verifyPreviewToken(previewToken, platform)
      if (!verified.ok) {
        return res.status(403).json({ message: 'Preview link is invalid or expired.' })
      }
      res.set('Cache-Control', 'no-store')
      const preview = await getDraftPreview(platform)
      return res.json(preview)
    }

    const home = await getPublishedHome(platform)
    if (home.sections == null) {
      res.set('Cache-Control', 'no-store')
    } else {
      res.set('Cache-Control', 'public, max-age=15')
    }
    return res.json(home)
  } catch (error) {
    return next(error)
  }
})

export default router
