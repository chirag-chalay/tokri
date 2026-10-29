import 'server-only'

// Only public, unauthenticated GET requests belong here. Never pass customer data.
const apiOrigin = process.env.TOKRIII_SERVER_API_ORIGIN || 'http://127.0.0.1:5223'

export async function publicGet(path) {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Invalid public API path')
  const url = new URL(`/api/v1${path}`, apiOrigin)
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Public API returned ${response.status}`)
  return response.json()
}

export async function getAllPublicBlogs() {
  const result = []
  const limit = 50
  let offset = 0
  while (true) {
    const page = await publicGet(`/blogs?limit=${limit}&offset=${offset}`)
    if (!page || !Array.isArray(page.posts) || !Number.isFinite(page.total)) {
      throw new Error('Unexpected public blog response')
    }
    result.push(...page.posts)
    offset += page.posts.length
    if (offset >= page.total) return result
    if (!page.posts.length) throw new Error('Incomplete public blog response')
  }
}
