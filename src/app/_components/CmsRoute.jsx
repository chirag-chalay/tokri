import 'server-only'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cleanHtml, getCmsPage, plainText } from '../../lib/server/content'
import { canonicalOrigin } from '../../lib/server/indexing'
import { publicCmsSlugs } from '../../lib/server/cms-slugs'

const directSlugs = new Set(publicCmsSlugs)
const canonicalPath = (slug) => directSlugs.has(slug) ? `/${slug}` : `/p/${encodeURIComponent(slug)}`

export async function cmsMetadata(slug) {
  const page = await getCmsPage(slug)
  if (!page) return {}
  const title = `${page.title} · Tokriii`
  const description = plainText(page.body).slice(0, 160)
  const canonical = `${canonicalOrigin}${canonicalPath(slug)}`
  return { title, ...(description ? { description } : {}), alternates: { canonical }, openGraph: { title, ...(description ? { description } : {}), url: canonical, type: 'website' } }
}

export async function renderCms(slug) {
  const page = await getCmsPage(slug)
  if (!page) notFound()
  const body = cleanHtml(page.body)
  return (
    <main className="cms-static-page min-h-screen bg-canvas py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-line bg-panel px-4 pb-4 pt-3 sm:p-6 md:p-8">
          <h1 className="cms-static-page__title">{page.title}</h1>
          {page.body ? <div className="cms-page-content mt-3 sm:mt-4" dangerouslySetInnerHTML={{ __html: body }} /> : (
            <p className="mt-3 text-sm leading-6 text-muted sm:mt-4 sm:text-base sm:leading-7">Content for this page has not been added yet. Edit it in the admin under Content → Pages.</p>
          )}
          {slug === 'privacy-policy' ? <section className="cms-page-content mt-5">
            <h2>Delivery location and service logs</h2>
            <p>Tokriii uses a first-party session cookie to link actions during your visit and diagnose delivery, checkout and payment issues. Service logs may include your selected delivery pincode, whether we deliver there, your IP address and an approximate area derived from it, device information, and a reference to your account if you sign in.</p>
            <p>If you allow location access, we use your location to help find your delivery area. The service logs keep the area and omit precise coordinates. Authorized staff can access the logs. We keep website activity, mobile app API activity and error logs for up to 90 days. We keep backoffice and system audit logs for up to one year, including records waiting to be written to the audit log.</p>
          </section> : null}
          <Link href="/" className="mt-5 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black hover:bg-brand-hover sm:mt-6">Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
