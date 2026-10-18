import { publicDeliveryConfig } from '../config/charges.js'
import { toPublicAssetUrl } from './formatters.js'
import { publicSocialLinks } from './socialLinks.js'

export function parseFeaturedCategorySlugs(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))]
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parseFeaturedCategorySlugs(parsed)
    } catch {
      // comma-separated fallback
    }
    return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))]
  }
  return []
}

export function formatPublicSettings(settings) {
  if (!settings) {
    return { store: null, home: null, payment: null, messaging: null, social: {}, charges: null }
  }

  return {
    store: {
      name: settings.storeName,
      tagline: settings.storeTagline,
      email: settings.storeEmail,
      phones: [settings.storePhone1, settings.storePhone2].filter(Boolean),
      address: settings.storeAddress,
      promoBanner: settings.promoBanner,
      earlyDelivery: settings.earlyDelivery,
    },
    home: {
      bannerImage: toPublicAssetUrl(settings.homeBannerImage),
      mobileBannerImage: toPublicAssetUrl(settings.homeMobileBannerImage),
      highlightImage: toPublicAssetUrl(settings.homeHighlightImage),
      featuredCategorySlugs: parseFeaturedCategorySlugs(settings.homeFeaturedCategorySlugs),
    },
    payment: {
      razorpay: {
        enabled: Boolean(settings.razorpayEnabled),
        keyId: settings.razorpayKeyId || '',
      },
      codEnabled: settings.codEnabled !== false,
    },
    messaging: {
      msg91: {
        enabled: Boolean(settings.msg91Enabled),
        senderId: settings.msg91SenderId || '',
        whatsappEnabled: Boolean(settings.msg91WhatsappEnabled),
      },
    },
    social: publicSocialLinks(settings.socialLinks),
    charges: {
      shippingFee: Number(settings.morningShippingFee ?? settings.shippingFee ?? 25),
      handlingFee: Number(settings.handlingFee ?? 2),
      delivery: publicDeliveryConfig(settings),
    },
  }
}
