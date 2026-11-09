import { useMemo, useRef, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import Icon from './Icon'

function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function formatInr(value) {
  return Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function offerTitle(offer) {
  if (offer?.percentage != null) return `${offer.percentage}% OFF`
  const match = String(offer?.label || '').match(/₹\s*([\d,.]+)/)
  if (match) return `Flat ₹${match[1]} Off`
  return offer?.label || offer?.code || 'Offer'
}

function unlockText(offer) {
  if (offer?.eligible) {
    return `${offer.applied ? 'You save' : 'Save'} ₹${formatInr(offer.estimatedSavings)}`
  }
  if (Number(offer?.amountToUnlock) > 0) {
    return `Shop for ₹${formatInr(offer.amountToUnlock)} more to unlock`
  }
  return offer?.reason || 'Not available on this cart'
}

function hasKnowMoreHtml(html) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return Boolean(text)
}

function pickBestEligible(offers = []) {
  const eligible = offers.filter((offer) => offer?.eligible && offer?.code)
  if (!eligible.length) return null
  return [...eligible].sort((a, b) => {
    const savingsDiff = Number(b.estimatedSavings || 0) - Number(a.estimatedSavings || 0)
    if (savingsDiff !== 0) return savingsDiff
    const minDiff = Number(b.minimumSubtotal || 0) - Number(a.minimumSubtotal || 0)
    if (minDiff !== 0) return minDiff
    return String(a.code).localeCompare(String(b.code))
  })[0]
}

function featuredOffer(offers, selectedCode) {
  if (!offers.length) return null
  const applied = offers.find((offer) => offer.applied || offer.code === selectedCode)
  if (applied) return applied
  const best = pickBestEligible(offers)
  if (best) return best
  return [...offers].sort(
    (a, b) => Number(a.amountToUnlock || 0) - Number(b.amountToUnlock || 0),
  )[0]
}

function OfferAction({ offer, updating, busyCode, onApply, onRemove, styles, colors }) {
  const busy = updating && busyCode === offer.code
  const label = busy ? '…' : offer.applied ? 'Remove' : offer.eligible ? 'Apply' : 'Locked'
  const disabled = (!offer.eligible && !offer.applied) || updating
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        if (updating) return
        if (offer.applied) onRemove()
        else if (offer.eligible) onApply(offer.code)
      }}
      style={[
        styles.actionBtn,
        offer.applied && styles.actionBtnOn,
        !offer.eligible && !offer.applied && styles.actionBtnLocked,
        disabled && { opacity: 0.6 },
      ]}
    >
      <Text
        style={[
          styles.actionText,
          offer.applied && { color: colors.onBrand },
          !offer.eligible && !offer.applied && { color: colors.muted },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export default function CouponBox() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const {
    coupon,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
    quote,
    quoteLoading,
  } = useCart()
  const [panelOpen, setPanelOpen] = useState(false)
  const [localError, setLocalError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [busyCode, setBusyCode] = useState(null)
  const previousOffers = useRef([])
  if (quote) previousOffers.current = quote.availableCoupons || []
  const offers = quote ? quote.availableCoupons || [] : previousOffers.current
  const selectedCode =
    quote?.couponStatus?.status === 'applied'
      ? quote.couponStatus.code
      : quote?.totals?.couponDiscount > 0
        ? coupon?.code
        : null
  const featured = useMemo(() => featuredOffer(offers, selectedCode), [offers, selectedCode])
  const updating = couponLoading || quoteLoading
  const message = localError || couponError || ''

  if (!offers.length) return null

  const handleApply = async (code) => {
    setLocalError('')
    setBusyCode(code)
    try {
      await applyCoupon(code)
    } catch (err) {
      setLocalError(err.message || 'Could not apply coupon')
    } finally {
      setBusyCode(null)
    }
  }

  const handleRemove = () => {
    setLocalError('')
    setBusyCode(null)
    removeCoupon()
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <Text style={styles.head}>Coupons & offers</Text>
        {updating && !busyCode ? <Text style={styles.muted}>Updating…</Text> : null}
      </View>

      {featured ? (
        <View style={[styles.card, featured.applied && styles.cardOn]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>%</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.title} numberOfLines={2}>
                  {featured.eligible
                    ? `Save ₹${formatInr(featured.estimatedSavings)} with ${featured.code}`
                    : offerTitle(featured)}
                </Text>
                <Text style={[styles.sub, !featured.eligible && styles.subWarn]}>
                  {unlockText(featured)}
                </Text>
                <Pressable onPress={() => setPanelOpen(true)} hitSlop={6} style={styles.viewAll}>
                  <Text style={styles.viewAllText}>View all coupons</Text>
                  <Icon name="chevron-forward" size={14} color={colors.mint} />
                </Pressable>
              </View>
              <OfferAction
                offer={featured}
                updating={updating}
                busyCode={busyCode}
                onApply={handleApply}
                onRemove={handleRemove}
                styles={styles}
                colors={colors}
              />
            </View>
          </View>
        </View>
      ) : null}

      {message ? <Text style={styles.error}>{message}</Text> : null}

      <Modal visible={panelOpen} animationType="slide" onRequestClose={() => setPanelOpen(false)}>
        <View style={[styles.panel, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.panelHead}>
            <Text style={styles.panelTitle}>Coupons & offers</Text>
            <Pressable onPress={() => setPanelOpen(false)} hitSlop={10}>
              <Icon name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>
          <Text style={styles.featuredLabel}>FEATURED COUPONS</Text>
          <ScrollView contentContainerStyle={styles.panelList} showsVerticalScrollIndicator={false}>
            {offers.map((offer) => {
              const knowMore = hasKnowMoreHtml(offer.knowMoreHtml)
              const open = Boolean(expanded[offer.id])
              return (
                <View key={offer.id} style={[styles.listCard, offer.applied && styles.cardOn]}>
                  <View style={styles.listTop}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>%</Text>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 10 }}>
                      <Text style={styles.listTitle}>{offerTitle(offer)}</Text>
                      <Text style={[styles.sub, !offer.eligible && styles.subWarn]}>
                        {unlockText(offer)}
                      </Text>
                    </View>
                    <OfferAction
                      offer={offer}
                      updating={updating}
                      busyCode={busyCode}
                      onApply={handleApply}
                      onRemove={handleRemove}
                      styles={styles}
                      colors={colors}
                    />
                  </View>
                  <View style={styles.codeRow}>
                    <Text style={styles.codePill}>{offer.code}</Text>
                    {knowMore ? (
                      <Pressable
                        onPress={() =>
                          setExpanded((current) => ({ ...current, [offer.id]: !current[offer.id] }))
                        }
                        hitSlop={6}
                        style={styles.knowMoreBtn}
                      >
                        <Text style={styles.knowMoreText}>Know more</Text>
                        <Icon
                          name={open ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color={colors.muted}
                        />
                      </Pressable>
                    ) : null}
                  </View>
                  {knowMore && open ? (
                    <Text style={styles.knowMoreBody}>{stripHtml(offer.knowMoreHtml)}</Text>
                  ) : null}
                </View>
              )
            })}
            {message ? <Text style={styles.error}>{message}</Text> : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const createStyles = (c) => ({
  wrap: { marginBottom: 12 },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  head: { color: c.text, fontWeight: '800', fontSize: 15 },
  muted: { color: c.muted, fontSize: 12 },
  card: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: c.panel2,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: c.line,
  },
  cardOn: { borderColor: c.brand, backgroundColor: c.successBg || c.panel2 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.canvas,
  },
  badgeText: { color: c.muted, fontWeight: '800', fontFamily: 'monospace' },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { color: c.text, fontWeight: '800', fontSize: 14, lineHeight: 20 },
  sub: { color: c.mint, fontSize: 12, marginTop: 4 },
  subWarn: { color: '#fbbf24' },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 8 },
  viewAllText: { color: c.mint, fontWeight: '700', fontSize: 12 },
  actionBtn: {
    minWidth: 72,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionBtnOn: { backgroundColor: c.brand },
  actionBtnLocked: { borderColor: c.line, backgroundColor: c.panel2 },
  actionText: { color: c.mint, fontWeight: '800', fontSize: 12 },
  error: { color: '#f87171', marginTop: 8, fontSize: 12 },
  panel: { flex: 1, backgroundColor: c.panel },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  panelTitle: { color: c.text, fontSize: 18, fontWeight: '800' },
  featuredLabel: {
    color: c.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  panelList: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  listCard: {
    backgroundColor: c.panel2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: c.line,
  },
  listTop: { flexDirection: 'row', alignItems: 'flex-start' },
  listTitle: { color: c.text, fontWeight: '800', fontSize: 15 },
  codeRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codePill: {
    color: c.muted,
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
    backgroundColor: c.canvas,
  },
  knowMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  knowMoreText: { color: c.muted, fontWeight: '700', fontSize: 12 },
  knowMoreBody: { marginTop: 10, color: c.muted, fontSize: 12, lineHeight: 18 },
})
