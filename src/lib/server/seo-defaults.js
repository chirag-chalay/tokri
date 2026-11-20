import 'server-only'
import { canonicalOrigin } from './indexing'
import { plainText } from './content'

export const DEFAULT_OG_IMAGE = `${canonicalOrigin}/uploads/general/hero-image-1789854996436-1789856580595.webp`
export const TOKRIII_LOGO = `${canonicalOrigin}/uploads/general/tokri-logo.png`

export const CORE_PAGES_METADATA = {
  '/': {
    title: 'Tokriii — Buy Fresh, Exotic & Imported Fruits Online in Delhi NCR',
    description: 'Order handpicked, farm-fresh, exotic & imported fruits online at Tokriii. Enjoy morning delivery before 7 AM across Delhi NCR & Gurugram. 100% freshness guaranteed.',
    h1: 'Tokriii — Farm-Fresh, Exotic & Imported Fruits Delivered in Delhi NCR',
  },
  '/shop': {
    title: 'Online Fruit Store — Shop Fresh, Exotic & Dry Fruits · Tokriii',
    description: "Browse Tokriii's complete catalog of fresh, exotic, imported & seasonal fruits, dry fruits, and luxury gift hampers. Fast doorstep delivery in Delhi NCR & Gurugram.",
    h1: 'Shop All Fruits & Gourmet Hampers',
  },
  '/blog': {
    title: 'The Tokriii Journal — Seasonal Fruit Guides, Nutrition & Recipes',
    description: "Read fruit buying guides, seasonal availability tips, nutritional insights, and healthy recipes curated by Tokriii's fruit experts for Indian households.",
    h1: 'The Tokriii Journal — Fresh Fruit Insights & Guides',
  },
  'about': {
    title: 'About Tokriii — Direct from Azadpur Mandi to Delhi NCR Doorsteps',
    description: 'Discover how Tokriii sources grade-A fresh, imported, and exotic fruits directly from farmers and Azadpur Mandi, delivering farm freshness to Delhi NCR homes every morning.',
    h1: 'About Tokriii — Freshness Without Compromise',
  },
  'careers': {
    title: 'Careers at Tokriii — Join Our Fresh Fruit Revolution in Delhi NCR',
    description: 'Explore career opportunities and job openings at Tokriii. Join our team in fresh fruit procurement, cold-chain operations, and quick commerce delivery in Delhi NCR.',
    h1: 'Careers at Tokriii',
  },
  'privacy-policy': {
    title: 'Privacy Policy — Tokriii Customer Data Protection & Security',
    description: "Read Tokriii's Privacy Policy to understand how we safeguard your personal data, delivery address, and payment information with encrypted, confidential standards.",
    h1: 'Privacy Policy',
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions — Tokriii Online Fruit Store Guidelines',
    description: 'Review the terms and conditions governing fruit orders, delivery schedules, payments, refunds, and user obligations on Tokriii.com and the Tokriii mobile app.',
    h1: 'Terms & Conditions',
  },
  'help-faqs': {
    title: 'Help & FAQs — Delivery, Ordering & Freshness Questions · Tokriii',
    description: 'Get answers to common questions about Tokriii morning deliveries, Delhi NCR serviceable pincodes, quality checks, return policies, packaging, and payment modes.',
    h1: 'Frequently Asked Questions (FAQ)',
  },
  'returns-policy': {
    title: 'Returns & Refund Policy — 100% Freshness Guarantee · Tokriii',
    description: "Learn about Tokriii's hassle-free replacement and refund policy. If any fruit fails our freshness standard upon delivery, we provide prompt refunds or replacements.",
    h1: 'Returns & Refund Policy',
  },
  'support-center': {
    title: 'Support Center — Contact Tokriii Customer Care in Delhi NCR',
    description: 'Connect with Tokriii customer support via WhatsApp (+91 9580280280), phone, or email. We assist with order tracking, morning delivery updates, and quality queries.',
    h1: 'Tokriii Support Center',
  },
  'shipping-and-delivery-policy': {
    title: 'Shipping & Delivery Policy — Morning & Express Drops · Tokriii',
    description: 'Check Tokriii shipping fees, free delivery thresholds, order cutoff times, morning delivery before 7:00 AM, and 90-minute express service across Delhi NCR.',
    h1: 'Shipping & Delivery Policy',
  },
  'cancellation-policy': {
    title: 'Cancellation Policy — Easy Order Cancellations · Tokriii',
    description: 'Understand Tokriii order cancellation guidelines. Cancel easily before order packing or dispatch with immediate wallet or original payment method refunds.',
    h1: 'Cancellation Policy',
  },
  'cookie-policy': {
    title: 'Cookie Policy — Website Experience & Privacy Preferences · Tokriii',
    description: "Learn how Tokriii uses cookies and essential storage to preserve your cart, deliver personalized fruit recommendations, and protect your secure session.",
    h1: 'Cookie Policy',
  },
  'freshness-guarantee': {
    title: 'Freshness Guarantee — Farm-Fresh Handpicked Quality · Tokriii',
    description: 'Our promise: 100% naturally ripened, farm-fresh, chemically untouched fruits handpicked daily at Azadpur Mandi. If anything is subpar, we replace it instantly.',
    h1: 'Tokriii Freshness Guarantee',
  },
}

export const CATEGORY_METADATA = {
  'fresh-fruits': {
    title: 'Fresh Fruits Online — Farm-Fresh Daily Fruits · Tokriii Delhi NCR',
    description: 'Buy farm-fresh seasonal apples, bananas, pomegranates, and daily fruits online at Tokriii. Handpicked at peak ripeness and delivered fresh in Delhi NCR.',
    h1: 'Fresh Fruits',
  },
  'premium': {
    title: 'Premium Fruits Online — Selected Grade-A Quality · Tokriii',
    description: "Discover Tokriii's premium fruit collection featuring hand-selected Zespri Kiwis, Shine Muscat grapes, imported berries, and flawless gourmet fruits.",
    h1: 'Premium Fruits',
  },
  'imported': {
    title: 'Imported Fruits Online — Global Fresh Fruits Delivery · Tokriii',
    description: 'Order authentic imported fruits online: Washington & Pink Lady apples, USA cherries, Egyptian citrus, avocados, and blueberries delivered in Delhi NCR.',
    h1: 'Imported Fruits',
  },
  'exotic': {
    title: 'Exotic Fruits Online — Dragon Fruit, Berries, Avocados · Tokriii',
    description: 'Buy rare & exotic fruits online: fresh dragon fruit, rambutan, mangosteen, passion fruit, Haas avocados, and fresh blueberries with fast doorstep delivery.',
    h1: 'Exotic Fruits',
  },
  'tropical': {
    title: 'Tropical Fruits Online — Guavas, Coconuts & Papayas · Tokriii',
    description: 'Shop luscious tropical fruits online at Tokriii: tender coconuts, Thai pink guavas, ripe papayas, sweet limes, and pineapples in Delhi NCR & Gurugram.',
    h1: 'Tropical Fruits',
  },
  'melons': {
    title: 'Fresh Melons Online — Sweet Watermelon & Muskmelon · Tokriii',
    description: 'Order juicy fresh watermelons, sun melons, and sweet muskmelons online. Naturally sweet, hydrating, and hand-inspected for ripeness by Tokriii.',
    h1: 'Fresh Melons',
  },
  'dry-fruits': {
    title: 'Premium Dry Fruits & Nuts Online — Almonds, Walnuts · Tokriii',
    description: 'Buy premium quality dry fruits online: Mamra almonds, Chandler walnuts, Medjool dates, and pine nuts. Vacuum-packed for freshness and rich nutrition.',
    h1: 'Dry Fruits & Nuts',
  },
  'daily-fruits': {
    title: 'Daily Fruits Online — Essential Everyday Fresh Fruits · Tokriii',
    description: 'Stock up on daily essential fruits for your family: bananas, seasonal apples, citrus, and sweet limes delivered before 7 AM every morning in Delhi NCR.',
    h1: 'Daily Fruits',
  },
  'fruit-hampers-combo-boxes': {
    title: 'Luxury Fruit Hampers & Gift Combo Boxes Online · Tokriii',
    description: 'Order exquisitely packaged fruit gift hampers and celebration combo boxes for festivals, weddings, and corporate gifting. Custom fruit baskets delivered in Delhi NCR.',
    h1: 'Fruit Hampers & Combo Boxes',
  },
}

export function toAbsoluteUrl(url) {
  if (!url) return DEFAULT_OG_IMAGE
  try {
    if (typeof url === 'string' && (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1'))) {
      const parsed = new URL(url)
      return `${canonicalOrigin}${parsed.pathname}${parsed.search}`
    }
    if (/^https?:\/\//i.test(url)) return url
  } catch (_error) {
    void _error
  }
  const cleanPath = String(url).startsWith('/') ? url : `/${url}`
  return `${canonicalOrigin}${cleanPath}`
}

export function generateProductSeo(product) {
  if (!product) return {}
  const name = product.name || 'Fresh Fruit'
  const weight = product.weight ? ` (${product.weight})` : ''
  const title = `${name}${weight} · Tokriii`
  
  let description = plainText(product.description)
  if (!description || description.length < 50) {
    description = `Buy fresh ${name}${weight} online at Tokriii. Handpicked grade-A quality fruit, clean packaging, and morning doorstep delivery in Delhi NCR & Gurugram.`
  }

  const canonical = `${canonicalOrigin}/product/${encodeURIComponent(product.slug || product.id)}`
  const image = toAbsoluteUrl(product.image)

  return {
    title,
    description,
    canonical,
    image,
    metadata: {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'website',
        images: [{ url: image, alt: name }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    },
  }
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore'],
    '@id': `${canonicalOrigin}/#organization`,
    name: 'Tokriii',
    url: canonicalOrigin,
    logo: TOKRIII_LOGO,
    description: 'Online retailer of farm-fresh, exotic, imported, and seasonal fruits delivering to Delhi NCR and Gurugram.',
    telephone: '+91-9580280280',
    email: 'support@tokriii.com',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9580280280',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C 617 Azadpur Fruit Market',
      addressLocality: 'New Delhi',
      postalCode: '110033',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://www.instagram.com/tokriii_official',
    ],
  }
}

export function getLocalStoreSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${canonicalOrigin}/#localstore`,
    name: 'Tokriii Fresh Fruits',
    image: DEFAULT_OG_IMAGE,
    url: canonicalOrigin,
    telephone: '+91-9580280280',
    email: 'support@tokriii.com',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C 617 Azadpur Fruit Market',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110033',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.7159,
      longitude: 77.1783,
    },
    areaServed: [
      { '@type': 'City', name: 'Delhi' },
      { '@type': 'City', name: 'New Delhi' },
      { '@type': 'City', name: 'Gurugram' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '05:00',
        closes: '23:00',
      },
    ],
  }
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${canonicalOrigin}/#website`,
    name: 'Tokriii',
    url: `${canonicalOrigin}/`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${canonicalOrigin}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function getBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }
}

export function getFaqPageSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

export function getCollectionPageSchema(title, url, description, products = []) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    url,
    description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${canonicalOrigin}/#website`,
    },
  }

  if (Array.isArray(products) && products.length > 0) {
    schema.mainEntity = {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 24).map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${canonicalOrigin}/product/${encodeURIComponent(p.slug || p.id)}`,
        name: p.name,
      })),
    }
  }

  return schema
}
