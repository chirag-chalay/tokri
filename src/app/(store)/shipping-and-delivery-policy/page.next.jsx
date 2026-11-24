import { cmsMetadata, renderCms } from '../../_components/CmsRoute'

export const dynamic = 'force-dynamic'

export async function generateMetadata() { return cmsMetadata('shipping-and-delivery-policy') }
export default async function Page() { return renderCms('shipping-and-delivery-policy') }
