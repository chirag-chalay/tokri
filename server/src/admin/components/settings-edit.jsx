import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  DrawerContent,
  DrawerFooter,
  H4,
  Icon,
  Text,
} from '@adminjs/design-system'
import { BasePropertyComponent, useRecord, useNotice } from 'adminjs'
import { isFlagOn, SearchableMultiSelect, StatusSwitch } from './form-controls.jsx'

const TABS = [
  {
    id: 'general',
    label: 'General',
    fields: [
      'storeName',
      'storeTagline',
      'storeEmail',
      'storePhone1',
      'storePhone2',
      'storeAddress',
      'promoBanner',
      'earlyDelivery',
    ],
  },
  {
    id: 'social',
    label: 'Social',
    fields: [],
  },
  {
    id: 'charges',
    label: 'Charges',
    fields: [
      'morningDeliveryTitle',
      'morningDeliverySubtitle',
      'morningShippingFee',
      'morningFreeAbove',
      'expressDeliveryTitle',
      'expressDeliverySubtitle',
      'expressShippingFee',
      'expressFreeAbove',
      'expressMinimumOrderValue',
      'firstThreeMorningEnabled',
      'handlingFee',
    ],
  },
  {
    id: 'homepage',
    label: 'Homepage',
    fields: [
      'homeBannerImage',
      'homeMobileBannerImage',
      'homeHighlightImage',
      'homeFeaturedCategorySlugs',
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    fields: ['razorpayEnabled', 'razorpayKeyId', 'razorpayKeySecret', 'codEnabled'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    fields: [
      'msg91Enabled',
      'msg91AuthKey',
      'msg91SenderId',
      'msg91OtpTemplateId',
      'msg91OrderTemplateId',
      'msg91WhatsappEnabled',
      'msg91WhatsappNumber',
      'msg91WhatsappNamespace',
      'msg91WhatsappOtpEnabled',
      'msg91WhatsappOtpTemplate',
      'msg91WhatsappOtpButton',
      'msg91WhatsappOrderEnabled',
      'msg91WhatsappOrderTemplate',
      'msg91WhatsappPartnerEnabled',
      'msg91WhatsappPartnerTemplate',
    ],
  },
]

const withoutTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

function parseSlugs(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean)
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parseSlugs(parsed)
    } catch {
      // ignore
    }
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function resolveImageUrl(path, appUrl) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${withoutTrailingSlash(appUrl || window.location.origin)}${path}`
}

function ImageUploader({
  label,
  hint,
  value,
  previewUrl,
  uploading,
  fileRef,
  onUpload,
  wide,
}) {
  const displayed = previewUrl || value

  return (
    <label className="tokri-coupon-label">
      {label}
      <span className={`tokri-upload-drop${wide ? ' tokri-upload-drop-wide' : ''}`}>
        {displayed ? (
          <img src={displayed} alt={`${label} preview`} />
        ) : (
          <span>{uploading ? 'Uploading…' : 'Click to upload an image'}</span>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} />
      </span>
      <span className="tokri-field-hint">{hint}</span>
    </label>
  )
}

const NOTIFICATION_SECTIONS = [
  {
    id: 'sms',
    title: 'SMS',
    intro: 'Login OTP and order confirmation through MSG91 SMS.',
    fields: [
      { key: 'msg91Enabled', type: 'switch', label: 'Enable MSG91 SMS' },
      {
        key: 'msg91AuthKey',
        type: 'password',
        label: 'MSG91 Auth Key',
        hint: 'Leave blank to keep the current key',
      },
      {
        key: 'msg91SenderId',
        type: 'text',
        label: 'Sender ID',
        hint: '6-character DLT approved header, e.g. TOKRII',
      },
      {
        key: 'msg91OtpTemplateId',
        type: 'text',
        label: 'Login OTP template ID',
        hint: 'MSG91 Template ID from the copy icon, e.g. 6aae9748a337d718910d31f3. Do not paste the 19-digit Airtel DLT ID.',
      },
      {
        key: 'msg91OrderTemplateId',
        type: 'text',
        label: 'Order confirmation template ID',
        hint: 'MSG91 Template ID from the copy icon, e.g. 6aae978b1d0d6a12170b93f4. Do not paste the 19-digit Airtel DLT ID.',
      },
    ],
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    intro: 'Shared number and namespace for every WhatsApp template.',
    fields: [
      {
        key: 'msg91WhatsappEnabled',
        type: 'switch',
        label: 'Enable MSG91 WhatsApp',
        hint: 'Used when SMS is off or the SMS gateway rejects a message',
      },
      {
        key: 'msg91WhatsappNumber',
        type: 'text',
        label: 'WhatsApp business number',
        hint: 'The number on your MSG91 WhatsApp account. A 10-digit Indian mobile gets 91 added automatically.',
      },
      {
        key: 'msg91WhatsappNamespace',
        type: 'text',
        label: 'WhatsApp template namespace',
        hint: 'Required by MSG91. Delivery and OTP templates are told apart by this namespace.',
      },
    ],
  },
  {
    id: 'otp',
    title: 'OTP message',
    intro: 'Login code sent to the customer on WhatsApp.',
    fields: [
      {
        key: 'msg91WhatsappOtpEnabled',
        type: 'switch',
        label: 'Send OTP WhatsApp',
        hint: 'Login OTP to the customer',
      },
      {
        key: 'msg91WhatsappOtpTemplate',
        type: 'text',
        label: 'OTP template name',
        hint: 'Approved MSG91 template with 1 body variable: the OTP code',
      },
      {
        key: 'msg91WhatsappOtpButton',
        type: 'switch',
        label: 'OTP template has a copy-code button',
        hint: 'Turn on only if your WhatsApp OTP template includes the copy-code button',
      },
    ],
  },
  {
    id: 'order',
    title: 'Order message',
    intro: 'Customer confirmation after COD is placed or online payment is confirmed.',
    fields: [
      {
        key: 'msg91WhatsappOrderEnabled',
        type: 'switch',
        label: 'Send order WhatsApp',
        hint: 'Customer confirmation after COD is placed or online payment is confirmed',
      },
      {
        key: 'msg91WhatsappOrderTemplate',
        type: 'text',
        label: 'Order template name',
        hint: 'Approved template with 3 body variables: name, order number, amount',
      },
    ],
  },
  {
    id: 'partner',
    title: 'Delivery partner message',
    intro: 'Sent after COD is placed or online payment is confirmed, if a partner is assigned.',
    fields: [
      {
        key: 'msg91WhatsappPartnerEnabled',
        type: 'switch',
        label: 'Send delivery-partner WhatsApp',
        hint: 'Sent after COD is placed or online payment is confirmed, if a partner is assigned',
      },
      {
        key: 'msg91WhatsappPartnerTemplate',
        type: 'text',
        label: 'Delivery-partner template name',
        hint: 'Approved template tokriii_delivery_assigned with 8 body variables and a Search in map button. Button URL: https://www.google.com/maps/search/?api=1&query={{1}}',
      },
    ],
  },
]

function FieldTip({ text }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    const timer = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <span
      className={`tokri-hint${open ? ' is-open' : ''}`}
      ref={ref}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="tokri-hint-trigger"
        aria-label="Field help"
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen((current) => !current)
        }}
      >
        ?
      </button>
      <span className="tokri-hint-pop" role="tooltip">
        {text}
      </span>
    </span>
  )
}

function NotifyInput({ field, value, onChange }) {
  const isWhatsappNumber = field.key === 'msg91WhatsappNumber'
  const [locked, setLocked] = useState(field.type === 'password')

  return (
    <input
      className="tokri-coupon-input"
      type={field.type === 'password' ? 'password' : 'text'}
      name={`tokri-${field.key}`}
      value={isWhatsappNumber ? String(value ?? '').replace(/\D/g, '') : value}
      readOnly={locked}
      inputMode={isWhatsappNumber ? 'numeric' : undefined}
      maxLength={isWhatsappNumber ? 15 : undefined}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      placeholder={
        field.type === 'password'
          ? 'Leave blank to keep the current key'
          : isWhatsappNumber
            ? 'MSG91 WhatsApp number'
            : undefined
      }
      onFocus={() => setLocked(false)}
      onChange={(event) =>
        onChange(
          field.key,
          isWhatsappNumber ? event.target.value.replace(/\D/g, '').slice(0, 15) : event.target.value,
        )
      }
    />
  )
}

const SOCIAL_FIELDS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/tokriii' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tokriii' },
  { key: 'threads', label: 'Threads', placeholder: 'https://www.threads.net/@tokriii' },
  { key: 'x', label: 'X', placeholder: 'https://x.com/tokriii' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/company/tokriii' },
]

function readSocialLinks(raw) {
  const links = Object.fromEntries(SOCIAL_FIELDS.map((field) => [field.key, '']))
  let value = raw
  if (!raw) return links
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch {
      return links
    }
  }
  if (!value || typeof value !== 'object') return links
  for (const field of SOCIAL_FIELDS) {
    links[field.key] = typeof value[field.key] === 'string' ? value[field.key] : ''
  }
  return links
}

function SocialFields({ value, onChange }) {
  const links = readSocialLinks(value)

  return (
    <div className="tokri-notify-fields">
      <section className="tokri-coupon-card">
        <h4>Footer icons</h4>
        <p>These links appear under the address on the website. Leave a box empty to hide that icon.</p>
        {SOCIAL_FIELDS.map((field) => (
          <label key={field.key} className="tokri-coupon-label">
            {field.label}
            <input
              className="tokri-coupon-input"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder={field.placeholder}
              value={links[field.key]}
              onChange={(event) =>
                onChange(
                  'socialLinks',
                  JSON.stringify({ ...links, [field.key]: event.target.value }),
                )
              }
            />
          </label>
        ))}
      </section>
    </div>
  )
}

function NotificationsFields({ params, onChange }) {
  return (
    <div className="tokri-notify-fields">
      {NOTIFICATION_SECTIONS.map((section) => (
        <section key={section.id} className="tokri-coupon-card">
          <h4>{section.title}</h4>
          <p>{section.intro}</p>
          {section.fields.map((field) =>
            field.type === 'switch' ? (
              <div key={field.key} className="tokri-notify-switch">
                <StatusSwitch
                  checked={isFlagOn(params[field.key])}
                  title={field.label}
                  onChange={(next) => onChange(field.key, next)}
                />
                {field.hint ? <FieldTip text={field.hint} /> : null}
              </div>
            ) : (
              <label key={field.key} className="tokri-coupon-label">
                <span className="tokri-label-line">
                  {field.label}
                  {field.hint ? <FieldTip text={field.hint} /> : null}
                </span>
                <NotifyInput
                  field={field}
                  value={params[field.key] ?? ''}
                  onChange={onChange}
                />
              </label>
            ),
          )}
        </section>
      ))}
    </div>
  )
}

const SettingsEdit = (props) => {
  const { record: initialRecord, resource } = props
  const [activeTab, setActiveTab] = useState('general')
  const addNotice = useNotice()
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(
    initialRecord,
    resource.id,
  )
  const bannerFileRef = useRef(null)
  const mobileBannerFileRef = useRef(null)
  const highlightFileRef = useRef(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [mobileBannerPreview, setMobileBannerPreview] = useState('')
  const [highlightPreview, setHighlightPreview] = useState('')
  const [bannerUploading, setBannerUploading] = useState(false)
  const [mobileBannerUploading, setMobileBannerUploading] = useState(false)
  const [highlightUploading, setHighlightUploading] = useState(false)
  const [categories, setCategories] = useState([])

  const params = record?.params || {}
  const custom = resource?.options?.custom || {}
  const apiBaseUrl = withoutTrailingSlash(custom.apiBaseUrl || '/api/v1')
  const appUrl = custom.appUrl || window.location.origin
  const selectedCategorySlugs = parseSlugs(params.homeFeaturedCategorySlugs)

  const bannerImageUrl = useMemo(
    () => resolveImageUrl(params.homeBannerImage, appUrl),
    [appUrl, params.homeBannerImage],
  )
  const mobileBannerImageUrl = useMemo(
    () => resolveImageUrl(params.homeMobileBannerImage, appUrl),
    [appUrl, params.homeMobileBannerImage],
  )
  const highlightImageUrl = useMemo(
    () => resolveImageUrl(params.homeHighlightImage, appUrl),
    [appUrl, params.homeHighlightImage],
  )

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === 'appearance') {
      setActiveTab('charges')
      return
    }
    if (hash && TABS.some((tab) => tab.id === hash)) {
      setActiveTab(hash)
    }
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', `#${activeTab}`)
  }, [activeTab])

  useEffect(() => {
    return () => {
      if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview)
    }
  }, [bannerPreview])

  useEffect(() => {
    return () => {
      if (mobileBannerPreview?.startsWith('blob:')) URL.revokeObjectURL(mobileBannerPreview)
    }
  }, [mobileBannerPreview])

  useEffect(() => {
    return () => {
      if (highlightPreview?.startsWith('blob:')) URL.revokeObjectURL(highlightPreview)
    }
  }, [highlightPreview])

  useEffect(() => {
    let ignore = false
    fetch(`${apiBaseUrl}/categories`)
      .then((response) => response.json())
      .then((data) => {
        if (!ignore) setCategories(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!ignore) setCategories([])
      })
    return () => {
      ignore = true
    }
  }, [apiBaseUrl])

  const uploadImage = async (event, field, setPreview, setBusy, fileRef, successMessage) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('folder', 'general')
    formData.append('file', file)
    const localPreviewUrl = URL.createObjectURL(file)
    setPreview(localPreviewUrl)
    setBusy(true)

    try {
      const response = await fetch(`${apiBaseUrl}/media/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Image upload failed')
      }
      const media = await response.json()
      handleChange(field, media.path)
      setPreview(resolveImageUrl(media.path, appUrl))
      addNotice({ message: successMessage, type: 'success' })
    } catch (error) {
      addNotice({ message: error.message || 'Could not upload image', type: 'error' })
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const submit = (event) => {
    event.preventDefault()

    handleSubmit()
      .then((response) => {
        const notice = response?.data?.notice
        if (notice?.type === 'error') {
          addNotice({
            message: notice.message || 'Could not save settings',
            type: 'error',
          })
        } else if (notice?.type === 'success' || response?.data?.record) {
          addNotice({
            message: 'Settings saved successfully',
            type: 'success',
          })
        }
      })
      .catch(() => {
        addNotice({
          message: 'Could not save settings. Please try again.',
          type: 'error',
        })
      })

    return false
  }

  return (
    <Box as="form" onSubmit={submit} flex flexDirection="column" className="tokri-settings-form">
      <Box className="tokri-settings-tabs" mb="xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tokri-settings-tab${activeTab === tab.id ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </Box>

      <DrawerContent>
        {TABS.map((tab) => {
          const properties = resource.editProperties.filter((property) =>
            tab.fields.includes(property.propertyPath),
          )

          return (
            <Box
              key={tab.id}
              className="tokri-settings-panel"
              p="xl"
              style={{ display: activeTab === tab.id ? 'block' : 'none' }}
            >
              <H4 mb="sm">{tab.label}</H4>
              <Text mb="xl" opacity={0.75}>
                {tab.id === 'charges'
                  ? 'Set copy and prices for Morning and Express delivery. Handling fee is added to every order.'
                  : tab.id === 'homepage'
                    ? 'These images and categories appear on the website homepage. Click Save changes after uploading.'
                    : tab.id === 'social'
                      ? 'Paste each page link. A link without https:// is completed for you. Save changes when you are done.'
                      : tab.id === 'notifications'
                      ? 'Auth key, WhatsApp number, and namespace are shared. Each template has its own name and on/off toggle. Order and partner messages send only after COD is placed or the online payment is confirmed.'
                      : 'Update your store settings and click Save changes below.'}
              </Text>
              {tab.id === 'charges' ? (
                <div className="tokri-charges-fields">
                  <section className="tokri-coupon-card">
                    <h4>Morning delivery</h4>
                    <p>Shown at checkout when this option is on for the pincode.</p>
                    <label className="tokri-coupon-label">
                      Title
                      <input
                        className="tokri-coupon-input"
                        type="text"
                        value={record?.params?.morningDeliveryTitle ?? ''}
                        onChange={(event) => handleChange('morningDeliveryTitle', event.target.value)}
                        placeholder="Flawless Morning Delivery"
                      />
                    </label>
                    <label className="tokri-coupon-label">
                      Subtitle
                      <input
                        className="tokri-coupon-input"
                        type="text"
                        value={record?.params?.morningDeliverySubtitle ?? ''}
                        onChange={(event) => handleChange('morningDeliverySubtitle', event.target.value)}
                        placeholder="Freshness Guaranteed"
                      />
                    </label>
                    <div className="tokri-coupon-two">
                      <label className="tokri-coupon-label">
                        Shipping fee (₹)
                        <input
                          className="tokri-coupon-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={record?.params?.morningShippingFee ?? ''}
                          onChange={(event) => handleChange('morningShippingFee', event.target.value)}
                        />
                      </label>
                      <label className="tokri-coupon-label">
                        Free above (₹)
                        <input
                          className="tokri-coupon-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={record?.params?.morningFreeAbove ?? ''}
                          onChange={(event) => handleChange('morningFreeAbove', event.target.value)}
                        />
                        <span className="tokri-field-hint">0 means no free delivery</span>
                      </label>
                    </div>
                  </section>
                  <section className="tokri-coupon-card">
                    <h4>Express delivery</h4>
                    <p>Shown at checkout. Disabled pincodes still see this as coming soon.</p>
                    <label className="tokri-coupon-label">
                      Title
                      <input
                        className="tokri-coupon-input"
                        type="text"
                        value={record?.params?.expressDeliveryTitle ?? ''}
                        onChange={(event) => handleChange('expressDeliveryTitle', event.target.value)}
                        placeholder="Same day"
                      />
                    </label>
                    <label className="tokri-coupon-label">
                      Subtitle
                      <input
                        className="tokri-coupon-input"
                        type="text"
                        value={record?.params?.expressDeliverySubtitle ?? ''}
                        onChange={(event) => handleChange('expressDeliverySubtitle', event.target.value)}
                        placeholder="On-Demand Luxury"
                      />
                    </label>
                    <div className="tokri-coupon-two">
                      <label className="tokri-coupon-label">
                        Shipping fee (₹)
                        <input
                          className="tokri-coupon-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={record?.params?.expressShippingFee ?? ''}
                          onChange={(event) => handleChange('expressShippingFee', event.target.value)}
                        />
                      </label>
                      <label className="tokri-coupon-label">
                        Free above (₹)
                        <input
                          className="tokri-coupon-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={record?.params?.expressFreeAbove ?? ''}
                          onChange={(event) => handleChange('expressFreeAbove', event.target.value)}
                        />
                        <span className="tokri-field-hint">0 means no free delivery</span>
                      </label>
                    </div>
                    <label className="tokri-coupon-label">
                      Minimum order value (₹)
                      <input
                        className="tokri-coupon-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={record?.params?.expressMinimumOrderValue ?? ''}
                        onChange={(event) => handleChange('expressMinimumOrderValue', event.target.value)}
                      />
                    </label>
                  </section>
                  <label className="tokri-coupon-label">
                    <input
                      type="checkbox"
                      checked={isFlagOn(record?.params?.firstThreeMorningEnabled)}
                      onChange={(event) => handleChange('firstThreeMorningEnabled', event.target.checked)}
                    />
                    First 3 orders free on Morning Delivery
                  </label>
                  <label className="tokri-coupon-label tokri-charges-handling">
                    Handling charge (₹)
                    <input
                      className="tokri-coupon-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={record?.params?.handlingFee ?? ''}
                      onChange={(event) => handleChange('handlingFee', event.target.value)}
                    />
                    <span className="tokri-field-hint">Cart handling fee added to every order</span>
                  </label>
                </div>
              ) : tab.id === 'homepage' ? (
                <div className="tokri-homepage-fields">
                  <ImageUploader
                    label="Home banner image"
                    hint="Desktop / large-screen hero banner. JPG, PNG, GIF, or WebP up to 5MB."
                    value={bannerImageUrl}
                    previewUrl={bannerPreview}
                    uploading={bannerUploading}
                    fileRef={bannerFileRef}
                    wide
                    onUpload={(event) =>
                      uploadImage(
                        event,
                        'homeBannerImage',
                        setBannerPreview,
                        setBannerUploading,
                        bannerFileRef,
                        'Banner image uploaded',
                      )
                    }
                  />
                  <ImageUploader
                    label="Home mobile banner image"
                    hint="Shown on phones. If empty, the desktop banner is used instead."
                    value={mobileBannerImageUrl}
                    previewUrl={mobileBannerPreview}
                    uploading={mobileBannerUploading}
                    fileRef={mobileBannerFileRef}
                    onUpload={(event) =>
                      uploadImage(
                        event,
                        'homeMobileBannerImage',
                        setMobileBannerPreview,
                        setMobileBannerUploading,
                        mobileBannerFileRef,
                        'Mobile banner image uploaded',
                      )
                    }
                  />
                  <ImageUploader
                    label="Fruit highlight image"
                    hint="Replaces the kiwi image in “The Small Fruit with a Big Punch” on the website."
                    value={highlightImageUrl}
                    previewUrl={highlightPreview}
                    uploading={highlightUploading}
                    fileRef={highlightFileRef}
                    onUpload={(event) =>
                      uploadImage(
                        event,
                        'homeHighlightImage',
                        setHighlightPreview,
                        setHighlightUploading,
                        highlightFileRef,
                        'Highlight image uploaded',
                      )
                    }
                  />
                  <label className="tokri-coupon-label">
                    Homepage categories
                    <SearchableMultiSelect
                      options={categories.map((item) => ({
                        value: item.slug,
                        label: item.label || item.title || item.slug,
                      }))}
                      selected={selectedCategorySlugs}
                      onChange={(slugs) =>
                        handleChange('homeFeaturedCategorySlugs', JSON.stringify(slugs))
                      }
                      placeholder="Search and select categories"
                      searchPlaceholder="Search categories"
                    />
                    <span className="tokri-field-hint">
                      These categories load on the website after the fruit highlight section, one at
                      a time as the visitor scrolls.
                    </span>
                  </label>
                </div>
              ) : tab.id === 'notifications' ? (
                <NotificationsFields params={params} onChange={handleChange} />
              ) : tab.id === 'social' ? (
                <SocialFields value={params.socialLinks} onChange={handleChange} />
              ) : (
                properties.map((property) => (
                  <BasePropertyComponent
                    key={property.propertyPath}
                    where="edit"
                    onChange={handleChange}
                    property={property}
                    resource={resource}
                    record={record}
                  />
                ))
              )}
            </Box>
          )
        })}
      </DrawerContent>

      <DrawerFooter>
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? <Icon icon="Loader" spin /> : null}
          Save changes
        </Button>
      </DrawerFooter>
    </Box>
  )
}

export default SettingsEdit
