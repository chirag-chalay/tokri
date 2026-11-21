import { cmsMetadata, renderCms } from '../../_components/CmsRoute'

export const dynamic = 'force-dynamic'

export async function generateMetadata() { return cmsMetadata('cancellation-policy') }
export default async function Page() { return renderCms('cancellation-policy') }
