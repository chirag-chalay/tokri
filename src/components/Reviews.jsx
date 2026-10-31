import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { fetchJson, resolveAssetUrl } from '../lib/api'

const MAX_REVIEWS = 9

const fallbackReviews = [
  {
    id: 1,
    title: 'Super fresh fruits',
    content: 'Super fresh fruits. Always fresh and delivered right on time.',
    name: 'Tina McDonnell',
    image: '',
    rating: 5,
  },
  {
    id: 2,
    title: 'Excellent quality produce',
    content: 'Excellent quality produce. Clean packaging and great consistency.',
    name: 'Aarav Sharma',
    image: '',
    rating: 5,
  },
  {
    id: 3,
    title: 'Tasty and juicy fruits',
    content: 'Tasty and juicy fruits. Better taste than local market options.',
    name: 'Priya Nair',
    image: '',
    rating: 4,
  },
]

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

function ReviewCard({ review, rawUrls = false }) {
  const avatar = rawUrls ? review.image : resolveAssetUrl(review.image)
  const hasImage = review.image && avatar

  return (
    <div className="flex h-full flex-col items-center rounded-3xl border border-line bg-panel p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8">
      <Quote className="mb-3 h-8 w-8 text-brand/30" />
      <Stars rating={review.rating} />
      <h3 className="mt-4 text-base font-semibold text-white sm:text-lg">{review.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{review.content}</p>
      <div className="mt-6 flex items-center gap-3">
        {hasImage ? (
          <img
            src={avatar}
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
  )
}

export default function Reviews({ initialReviews, rawUrls = false }) {
  const [reviews, setReviews] = useState(Array.isArray(initialReviews) ? initialReviews.slice(0, MAX_REVIEWS) : fallbackReviews)
  const trackRef = useRef(null)

  useEffect(() => {
    let ignore = false

    fetchJson('/reviews')
      .then((items) => {
        if (!ignore && Array.isArray(items) && items.length) {
          setReviews(items.slice(0, MAX_REVIEWS))
        }
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

  // Desktop: slide only when more than 3 reviews. Mobile: always single-card slide.
  const desktopSlider = reviews.length > 3

  const scrollByCard = (direction) => {
    const track = trackRef.current
    if (!track) return
    const firstCard = track.querySelector('[data-review-card]')
    const amount = firstCard ? firstCard.getBoundingClientRect().width + 16 : track.clientWidth * 0.9
    track.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section className="rounded-3xl bg-canvas px-4 py-8 sm:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-mint">
            What customers say
          </p>
          <h2 className="home-section-title">
            Verified, <span className="text-brand">Honest Reviews</span>
          </h2>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous reviews"
            className={`absolute -left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line bg-panel p-2 text-white shadow-md transition hover:bg-brand hover:text-black sm:-left-3 sm:p-2.5 ${
              desktopSlider ? 'flex' : 'flex lg:hidden'
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Mobile / tablet: always horizontal single-card slider */}
          <div
            ref={trackRef}
            className={`flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide ${
              desktopSlider ? '' : 'lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:snap-none'
            }`}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                data-review-card
                className={
                  desktopSlider
                    ? 'w-[88%] shrink-0 snap-center sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]'
                    : 'w-[88%] shrink-0 snap-center lg:w-auto lg:shrink'
                }
              >
                <ReviewCard review={review} rawUrls={rawUrls} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next reviews"
            className={`absolute -right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line bg-panel p-2 text-white shadow-md transition hover:bg-brand hover:text-black sm:-right-3 sm:p-2.5 ${
              desktopSlider ? 'flex' : 'flex lg:hidden'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
