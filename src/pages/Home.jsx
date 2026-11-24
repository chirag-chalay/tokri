'use client'

import { useEffect, useState } from 'react'
import Banner from '../components/Banner'
import Categories from '../components/Categories'
import BestSellers from '../components/BestSellers'
import SeasonalFruits from '../components/SeasonalFruits'
import FruitHighlight from '../components/FruitHighlight'
import HomeCategoryFeed from '../components/HomeCategoryFeed'
import Reviews from '../components/Reviews'
import HomeSectionRenderer from '../components/home/HomeSectionRenderer'
import { fetchJson } from '../lib/api'

function LegacyHome({ initialData, home }) {
  return (
    <main>
      <Banner
        image={home.bannerImage}
        mobileImage={home.mobileBannerImage}
        rawUrls={Boolean(initialData)}
        isDiwaliActive={initialData?.diwaliStatus?.isActive}
      />
      <Categories initialCategories={initialData?.categories} />
      <BestSellers initialProducts={initialData?.bestSellers} deferCart={Boolean(initialData)} />
      <SeasonalFruits initialProducts={initialData?.featured} deferCart={Boolean(initialData)} />
      <FruitHighlight image={home.highlightImage} rawUrls={Boolean(initialData)} />
      <HomeCategoryFeed slugs={home.featuredCategorySlugs} initialSections={initialData?.categorySections} />
      <Reviews initialReviews={initialData?.reviews} rawUrls={Boolean(initialData)} />
    </main>
  )
}

export default function Home({ initialData }) {
  const [home, setHome] = useState(initialData?.home || {
    bannerImage: null,
    mobileBannerImage: null,
    highlightImage: null,
    featuredCategorySlugs: [],
  })
  const [sections, setSections] = useState(
    Array.isArray(initialData?.homepage?.sections) && initialData.homepage.sections.length
      ? initialData.homepage.sections
      : null,
  )
  const [previewNotice, setPreviewNotice] = useState(Boolean(initialData?.homepage?.preview))

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

  useEffect(() => {
    if (Array.isArray(initialData?.homepage?.sections) && initialData.homepage.sections.length) {
      return undefined
    }
    let ignore = false
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const previewToken = params?.get('homePreview') || ''
    const path = previewToken
      ? `/home?platform=web&previewToken=${encodeURIComponent(previewToken)}`
      : '/home?platform=web'

    fetchJson(path)
      .then((data) => {
        if (ignore) return
        if (Array.isArray(data?.sections) && data.sections.length) {
          setSections(data.sections)
          setPreviewNotice(Boolean(data.preview))
        } else {
          setSections(null)
        }
      })
      .catch(() => {
        if (!ignore) setSections(null)
      })

    return () => {
      ignore = true
    }
  }, [initialData?.homepage?.sections])

  if (Array.isArray(sections) && sections.length) {
    return (
      <main>
        {previewNotice ? (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
            Draft preview — visitors still see the last published homepage.
          </div>
        ) : null}
        <HomeSectionRenderer
          sections={sections}
          deferCart={Boolean(initialData)}
          isDiwaliActive={initialData?.diwaliStatus?.isActive}
          rawUrls
        />
      </main>
    )
  }

  return <LegacyHome initialData={initialData} home={home} />
}
