import { cmsMetadata, renderCms } from '../../../_components/CmsRoute'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  return cmsMetadata(slug)
}

export default async function Page({ params }) {
  const { slug } = await params
  return renderCms(slug)
}
