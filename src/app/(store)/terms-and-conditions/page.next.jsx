import { cmsMetadata, renderCms } from '../../_components/CmsRoute'

export const dynamic = 'force-dynamic'

export async function generateMetadata() { return cmsMetadata('terms-and-conditions') }
export default async function Page() { return renderCms('terms-and-conditions') }
