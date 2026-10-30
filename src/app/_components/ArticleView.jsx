import Link from 'next/link'
import ArticleContents from './ArticleContents'
import ArticleShare from './ArticleShare'
import '../../pages/BlogDetailPage.css'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ArticleSidebar({ headings, others }) {
  return (
    <div className="blog-article-sidebar-content">
      <ArticleContents headings={headings} />
      {others.length > 0 ? (
        <section className="blog-article-related" aria-label="Related articles">
          <p className="blog-article-side-title">More from the journal</p>
          <div className="blog-article-related-list">
            {others.map((item) => (
              <Link key={item.slug} href={`/blog/${item.slug}`} className={`blog-article-related-link${item.coverImage ? '' : ' blog-article-related-link--text'}`}>
                {item.coverImage ? <img src={item.coverImage} alt="" loading="lazy" /> : null}
                <span>
                  <span className="blog-article-related-title">{item.title}</span>
                  <span className="blog-article-related-meta">{[item.category, formatDate(item.publishedAt)].filter(Boolean).join(' · ')}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <Link href="/shop" className="blog-article-shop"><span>Fresh fruits delivered to your doorstep</span><strong>Shop fresh fruits <span aria-hidden="true">→</span></strong></Link>
    </div>
  )
}

export default function ArticleView({ post, others, headings, body, canonical }) {
  const byline = [String(post.author || '').trim(), formatDate(post.publishedAt)].filter(Boolean).join(' · ')
  return (
    <main className="min-h-screen bg-canvas">
      <div className="blog-article-shell">
        <div className="blog-article-grid">
          <aside className="blog-article-share-column"><ArticleShare title={post.title} canonical={canonical} /></aside>
          <article className="blog-article-main">
            <Link href="/blog" className="blog-article-back">← All stories</Link>
            <header className="blog-article-header">
              {post.category ? <p className="blog-article-category">{post.category}</p> : null}
              <h1 className="blog-detail-title">{post.title}</h1>
              {byline ? <p className="blog-article-byline">{byline}</p> : null}
            </header>
            {post.coverImage ? <div className="blog-article-cover"><img src={post.coverImage} alt="" /></div> : null}
            <div className="blog-article-mobile-share"><ArticleShare title={post.title} canonical={canonical} /></div>
            <ArticleContents headings={headings} mobile />
            {body ? <div className="cms-page-content blog-article-body" dangerouslySetInnerHTML={{ __html: body }} /> : null}
            <div className="blog-article-mobile-related"><ArticleSidebar headings={[]} others={others} /></div>
          </article>
          <aside className="blog-article-sidebar"><ArticleSidebar headings={headings} others={others} /></aside>
        </div>
      </div>
    </main>
  )
}
