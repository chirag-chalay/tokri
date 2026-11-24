'use client'

import BlogCard from '../BlogCard'

export default function BlogPostsSection({ title = '', posts = [], rawUrls = true }) {
  if (!posts.length) return null
  return (
    <section className="bg-canvas py-8 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {title ? <h2 className="home-section-title mb-6">{title}</h2> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} rawUrls={rawUrls} />
          ))}
        </div>
      </div>
    </section>
  )
}
