import { notFound } from 'next/navigation'
import LegacyBridge from '../LegacyBridge'

const singleSegmentRoutes = new Set(['cart', 'checkout', 'account', 'login', 'profile'])
const twoSegmentRoutes = new Set(['order'])
const privateRoutes = new Set(['cart', 'checkout', 'account', 'login', 'profile', 'order'])

export async function generateMetadata({ params }) {
  const { path = [] } = await params
  return privateRoutes.has(path[0]) ? { robots: { index: false, follow: false } } : {}
}

export default async function Page({ params }) {
  const { path = [] } = await params
  const known = path.length === 0 ||
    (path.length === 1 && singleSegmentRoutes.has(path[0])) ||
    (path.length === 2 && twoSegmentRoutes.has(path[0]))
  if (!known) notFound()
  return <LegacyBridge />
}
