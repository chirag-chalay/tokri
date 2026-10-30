import PrivateRoute from '../../../_components/PrivateRoute'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

export default function Page() { return <PrivateRoute page="order" /> }
