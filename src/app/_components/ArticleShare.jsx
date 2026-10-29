'use client'

import { useState, useSyncExternalStore } from 'react'

const subscribe = () => () => {}

export default function ArticleShare({ title, canonical }) {
  const [copied, setCopied] = useState(false)
  const url = useSyncExternalStore(subscribe, () => window.location.href, () => canonical)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true) } catch { setCopied(false) }
  }
  return (
    <div className="blog-article-share" aria-label="Share this article">
      <span className="blog-article-share-label">Share</span>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">WA</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">f</a>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">𝕏</a>
      <button type="button" onClick={copyLink} aria-label="Copy article link">{copied ? '✓' : '↗'}</button>
      <span className="sr-only" role="status">{copied ? 'Link copied' : ''}</span>
    </div>
  )
}
