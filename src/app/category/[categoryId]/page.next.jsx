import { permanentRedirect } from 'next/navigation'

export default async function CategoryRedirect({ params }) {
  const { categoryId } = await params
  permanentRedirect(`/shop?category=${encodeURIComponent(categoryId)}`)
}
