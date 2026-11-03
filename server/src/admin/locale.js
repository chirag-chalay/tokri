import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const en = JSON.parse(
  readFileSync(join(__dirname, '../../node_modules/adminjs/lib/locale/en/translation.json'), 'utf8'),
)

const navLabels = {
  Catalog: 'Catalog',
  Content: 'Content',
  Sales: 'Sales',
  Marketing: 'Marketing',
  Settings: 'Settings',
  Team: 'Team',
}

const resourceLabels = {
  Products: 'Products',
  Categories: 'Categories',
  'Media Library': 'Media Library',
  Pages: 'Pages',
  Reviews: 'Reviews',
  Orders: 'Orders',
  Coupons: 'Coupons',
  General: 'General',
  'Delivery partners': 'Delivery partners',
  'Serviceable pincodes': 'Serviceable pincodes',
  Team: 'Team',
  Tax: 'Tax',
  'Tax Management': 'Tax Management',
}

export const adminLocale = {
  language: 'en',
  availableLanguages: ['en'],
  debug: false,
  translations: {
    en: {
      ...en,
      labels: {
        ...en.labels,
        ...navLabels,
        ...resourceLabels,
      },
      properties: {
        ...en.properties,
        productDisplayLimit: 'Products',
      },
      components: {
        ...en.components,
        Login: {
          ...en.components.Login,
          welcomeHeader: 'Tokriii CMS',
          welcomeMessage: 'Sign in to manage your store, products, and website content.',
          properties: {
            ...en.components.Login.properties,
            email: 'Email or username',
          },
        },
      },
      resources: {
        Product: { labels: { Products: 'Products' } },
        Category: {
          labels: { Categories: 'Categories' },
          properties: {
            productDisplayLimit: 'Products',
          },
        },
        Media: { labels: { 'Media Library': 'Media Library' } },
        Page: { labels: { Pages: 'Pages' } },
        Review: { labels: { Reviews: 'Reviews' } },
        Order: {
          labels: { Orders: 'Orders' },
          properties: {
            status: 'Fulfillment',
            paymentStatus: 'Payment',
          },
        },
        Coupon: {
          labels: { Coupons: 'Coupons' },
          properties: {
            applyOn: 'Applies to',
            targetType: 'Target',
            usageType: 'Usage',
          },
        },
        Setting: { labels: { General: 'General' } },
        DeliveryPartner: { labels: { 'Delivery partners': 'Delivery partners' } },
        ServiceablePincode: { labels: { 'Serviceable pincodes': 'Serviceable pincodes' } },
        IndiaState: { labels: { 'Indian states': 'Indian states' } },
        Customer: { labels: { Customers: 'Customers' } },
        User: { labels: { Team: 'Team' } },
        ProductTax: {
          labels: { Tax: 'Tax', 'Tax Management': 'Tax Management' },
          properties: {
            productName: 'Product Name',
            categoryName: 'Category',
            hsnCode: 'HSN Code',
            gstRate: 'GST %',
            isTaxable: 'Taxable Yes/No',
          },
        },
      },
    },
  },
}
