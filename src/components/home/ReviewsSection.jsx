'use client'

import { Quote, Star } from 'lucide-react'

const initials = (name) =>
  String(name || '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

function Stars({ rating = 5 }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={18}
          className={
            index < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          }
        />
      ))}
    </div>
  )
}

export default function ReviewsSection({ title = '', reviews = [] }) {
  if (!reviews.length) return null

  return (
    <section className="rounded-3xl bg-canvas px-4 py-8 sm:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-10">
          {title ? <h2 className="home-section-title">{title}</h2> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex h-full flex-col items-center rounded-3xl border border-line bg-panel p-6 text-center shadow-sm sm:p-8"
            >
              <Quote className="mb-3 h-8 w-8 text-brand/30" />
              <Stars rating={review.rating} />
              <h3 className="mt-4 text-base font-semibold text-white sm:text-lg">{review.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{review.content}</p>
              <div className="mt-6 flex items-center gap-3">
                {review.image ? (
                  <img
                    src={review.image}
                    alt={review.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-brand/30"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/20 text-sm font-semibold text-mint">
                    {initials(review.name)}
                  </span>
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                  <p className="text-xs text-brand">Verified buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
