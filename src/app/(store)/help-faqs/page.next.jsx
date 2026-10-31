import { cmsMetadata, renderCms } from '../../_components/CmsRoute'

export const dynamic = 'force-dynamic'

export async function generateMetadata() { return cmsMetadata('help-faqs') }
export default async function Page() { return renderCms('help-faqs') }
