import { canonicalOrigin, indexingEnabled } from '../../lib/server/indexing'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const isPublic = indexingEnabled(request.headers.get('host'))
  const rules = isPublic
    ? `User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /profile\nDisallow: /login\nDisallow: /cart\nDisallow: /checkout\nDisallow: /order/\nSitemap: ${canonicalOrigin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n'
  return new Response(rules, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
}
