import 'server-only'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseDocument } from 'htmlparser2'
import { findAll, textContent } from 'domutils'
import { cleanHtml, getCmsPage, plainText, jsonLd } from '../../lib/server/content'
import { canonicalOrigin } from '../../lib/server/indexing'
import { publicCmsSlugs } from '../../lib/server/cms-slugs'
import {
  CORE_PAGES_METADATA,
  DEFAULT_OG_IMAGE,
  getBreadcrumbSchema,
  getFaqPageSchema,
} from '../../lib/server/seo-defaults'

const directSlugs = new Set(publicCmsSlugs)
const canonicalPath = (slug) => directSlugs.has(slug) ? `/${slug}` : `/p/${encodeURIComponent(slug)}`

export async function cmsMetadata(slug) {
  const page = await getCmsPage(slug)
  if (!page) return {}
  const predefined = CORE_PAGES_METADATA[slug]
  const title = predefined?.title || `${page.title} · Tokriii`
  const bodyText = plainText(page.body).slice(0, 160)
  const description = predefined?.description || bodyText || 'Tokriii premium fresh fruits delivered across Delhi NCR.'
  const canonical = `${canonicalOrigin}${canonicalPath(slug)}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, alt: page.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

function extractFaqsFromHtml(html) {
  const dom = parseDocument(html || '')
  const h3s = findAll((n) => n.type === 'tag' && (n.name === 'h3' || n.name === 'h2'), dom.children)
  const faqs = []
  for (const h3 of h3s) {
    const q = textContent(h3).trim()
    let next = h3.next
    while (next && (next.type !== 'tag' || next.name !== 'p')) {
      next = next.next
    }
    const a = next ? textContent(next).trim() : ''
    if (q && a && q.endsWith('?')) {
      faqs.push({ question: q, answer: a })
    }
  }
  return faqs
}

export async function renderCms(slug) {
  const page = await getCmsPage(slug)
  if (!page) notFound()
  const body = cleanHtml(page.body)
  const canonical = `${canonicalOrigin}${canonicalPath(slug)}`

  const breadcrumbsSchema = getBreadcrumbSchema([
    { name: 'Home', item: `${canonicalOrigin}/` },
    { name: page.title, item: canonical },
  ])

  let faqSchema = null
  if (slug === 'help-faqs') {
    const faqs = extractFaqsFromHtml(page.body)
    if (faqs.length > 0) {
      faqSchema = getFaqPageSchema(faqs)
    }
  }

  return (
    <main className="cms-static-page min-h-screen bg-canvas py-4 sm:py-6 md:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbsSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-line bg-panel px-4 pb-4 pt-3 sm:p-6 md:p-8">
          <h1 className="cms-static-page__title">{page.title}</h1>
          {page.body ? <div className="cms-page-content mt-3 sm:mt-4" dangerouslySetInnerHTML={{ __html: body }} /> : (
            <p className="mt-3 text-sm leading-6 text-muted sm:mt-4 sm:text-base sm:leading-7">Content for this page has not been added yet. Edit it in the admin under Content → Pages.</p>
          )}
          <Link href="/" className="mt-5 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover sm:mt-6">Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
