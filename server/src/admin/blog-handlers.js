import { ValidationError } from 'adminjs'
import { prisma } from '../lib/prisma.js'
import { slugify } from './category-handlers.js'

function toBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1'
}

function emptyToNull(value) {
  const text = String(value || '').trim()
  return text || null
}

function plainText(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function readExcerpt(payload) {
  const given = String(payload.excerpt || '').trim()
  if (given) return given.slice(0, 320)
  const text = plainText(payload.body)
  if (!text) return null
  return text.length > 180 ? `${text.slice(0, 177)}…` : text
}

function readPublishedAt(value, isPublished) {
  const text = String(value || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T12:00:00.000Z`)
    if (!Number.isNaN(date.getTime())) return date
  }
  if (text) {
    const date = new Date(text)
    if (!Number.isNaN(date.getTime())) return date
  }
  return isPublished ? new Date() : null
}

async function uniqueBlogSlug(value, currentId) {
  const base = slugify(value)
  if (!base) return ''

  let candidate = base
  let suffix = 2
  while (
    await prisma.blogPost.findFirst({
      where: {
        slug: candidate,
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  return candidate
}

export async function prepareBlogPayload(request) {
  if (request.method !== 'post') return request
  const payload = { ...(request.payload || {}) }
  const title = String(payload.title || '').trim()
  const body = String(payload.body || '').trim()
  const isPublished = toBoolean(payload.isPublished, true)

  if (!title) throw new ValidationError({ title: { message: 'Title is required.' } })
  if (!body || plainText(body).length === 0) {
    throw new ValidationError({ body: { message: 'Write the blog post before saving.' } })
  }

  const slug = await uniqueBlogSlug(payload.slug || title, request.params?.recordId)
  if (!slug) throw new ValidationError({ slug: { message: 'Enter a URL slug.' } })

  request.payload = {
    title,
    slug,
    excerpt: readExcerpt(payload),
    body,
    coverImage: emptyToNull(payload.coverImage),
    author: emptyToNull(payload.author) || 'Tokriii',
    category: emptyToNull(payload.category),
    isPublished,
    publishedAt: readPublishedAt(payload.publishedAt, isPublished),
  }
  return request
}

export async function toggleBlogPublishedAction(request, _response, context) {
  const post = await prisma.blogPost.findUnique({ where: { id: request.params.recordId } })
  if (!post) throw new Error('Blog post not found')
  const raw = request.payload?.isPublished ?? request.payload?.isActive
  const next = raw === undefined ? !post.isPublished : toBoolean(raw, true)
  const updated = await prisma.blogPost.update({
    where: { id: post.id },
    data: {
      isPublished: next,
      publishedAt: next ? post.publishedAt || new Date() : post.publishedAt,
    },
  })
  return {
    record: context.resource.build(updated).toJSON(context.currentAdmin),
    notice: {
      message: updated.isPublished
        ? `"${updated.title}" is live on the blog.`
        : `"${updated.title}" is hidden from the blog.`,
      type: 'success',
    },
  }
}
