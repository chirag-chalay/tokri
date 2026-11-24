'use client'

import BannerSlider from './BannerSlider'
import CategoryStrip from './CategoryStrip'
import ProductRail from './ProductRail'
import ImageBanner from './ImageBanner'
import ReviewsSection from './ReviewsSection'
import BlogPostsSection from './BlogPostsSection'

export default function HomeSectionRenderer({
  sections = [],
  deferCart = true,
  isDiwaliActive = false,
  rawUrls = true,
}) {
  return (
    <>
      {(sections || []).map((section) => {
        switch (section.type) {
          case 'banner_slider':
            return (
              <BannerSlider
                key={section.id}
                slides={section.slides}
                autoplaySeconds={section.autoplaySeconds}
                isDiwaliActive={isDiwaliActive}
                rawUrls={rawUrls}
              />
            )
          case 'category_strip':
            return (
              <CategoryStrip
                key={section.id}
                title={section.title}
                categories={section.categories}
              />
            )
          case 'product_rail':
            return (
              <ProductRail
                key={section.id}
                title={section.title}
                products={section.products}
                layout={section.layout}
                seeAll={section.seeAll}
                seeAllLink={section.seeAllLink}
                deferCart={deferCart}
              />
            )
          case 'category_rails':
            return (
              <div key={section.id}>
                {section.title ? (
                  <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
                    <h2 className="home-section-title">{section.title}</h2>
                  </div>
                ) : null}
                {(section.rows || []).map((row) => (
                  <ProductRail
                    key={`${section.id}-${row.category?.slug}`}
                    title={row.category?.title || row.category?.label || ''}
                    products={row.products}
                    layout="grid"
                    deferCart={deferCart}
                    seeAll
                    seeAllLink={{ type: 'category', value: row.category?.slug || '' }}
                  />
                ))}
              </div>
            )
          case 'image_banner':
            return (
              <ImageBanner
                key={section.id}
                image={section.image}
                mobileImage={section.mobileImage}
                alt={section.alt}
                link={section.link}
              />
            )
          case 'reviews':
            return (
              <ReviewsSection
                key={section.id}
                title={section.title}
                reviews={section.reviews}
              />
            )
          case 'blog_posts':
            return (
              <BlogPostsSection
                key={section.id}
                title={section.title}
                posts={section.posts}
                rawUrls={rawUrls}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}
