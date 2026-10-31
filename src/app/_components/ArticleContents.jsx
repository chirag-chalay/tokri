'use client'

export default function ArticleContents({ headings, mobile = false }) {
  if (!headings.length) return null
  const links = (
    <nav aria-label="Article sections" className="blog-article-toc-links">
      {headings.map((heading) => (
        <a key={heading.id} href={`#${heading.id}`} className={heading.level === 3 ? 'blog-article-toc-subitem' : undefined}
          onClick={(event) => {
            event.preventDefault()
            document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' })
            window.history.replaceState(null, '', `#${heading.id}`)
          }}>
          {heading.text}
        </a>
      ))}
    </nav>
  )
  if (mobile) return <details className="blog-article-mobile-toc"><summary>In this article</summary>{links}</details>
  return <section className="blog-article-toc" aria-label="Table of contents"><p className="blog-article-side-title">In this article</p>{links}</section>
}
