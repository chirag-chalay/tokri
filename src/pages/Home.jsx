'use client'

import { useEffect, useState } from 'react'
import Banner from '../components/Banner'
import Categories from '../components/Categories'
import BestSellers from '../components/BestSellers'
import SeasonalFruits from '../components/SeasonalFruits'
import FruitHighlight from '../components/FruitHighlight'
import HomeCategoryFeed from '../components/HomeCategoryFeed'
import Reviews from '../components/Reviews'
import { fetchJson } from '../lib/api'

export default function Home({ initialData }) {
  const [home, setHome] = useState(initialData?.home || {
    bannerImage: null,
    mobileBannerImage: null,
    highlightImage: null,
    featuredCategorySlugs: [],
  })

  useEffect(() => {
    let ignore = false

    fetchJson('/settings/public')
      .then((data) => {
        if (ignore) return
        const next = data?.home || {}
        setHome({
          bannerImage: next.bannerImage || null,
          mobileBannerImage: next.mobileBannerImage || null,
          highlightImage: next.highlightImage || null,
          featuredCategorySlugs: Array.isArray(next.featuredCategorySlugs)
            ? next.featuredCategorySlugs
            : [],
        })
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [])

  return (
    <main>
      <Banner image={home.bannerImage} mobileImage={home.mobileBannerImage} rawUrls={Boolean(initialData)} />
      <Categories initialCategories={initialData?.categories} />
      <BestSellers initialProducts={initialData?.bestSellers} deferCart={Boolean(initialData)} />
      <SeasonalFruits initialProducts={initialData?.featured} deferCart={Boolean(initialData)} />
      <FruitHighlight image={home.highlightImage} rawUrls={Boolean(initialData)} />
      <HomeCategoryFeed slugs={home.featuredCategorySlugs} initialSections={initialData?.categorySections} />
      <Reviews initialReviews={initialData?.reviews} rawUrls={Boolean(initialData)} />
    </main>
  )
}
