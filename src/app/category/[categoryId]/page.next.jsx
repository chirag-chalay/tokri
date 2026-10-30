import { redirect } from 'next/navigation'

export default async function CategoryRedirect({ params }) {
  const { categoryId } = await params
  redirect(`/shop?category=${encodeURIComponent(categoryId)}`)
}
