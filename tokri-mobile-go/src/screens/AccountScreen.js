import { useRef, useState } from 'react'
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSystemBottomInset } from '../lib/safeArea'
import Icon from '../components/Icon'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useAnalyticsSettings } from '../context/AnalyticsContext'
import { useCart } from '../context/CartContext'
import { useAddress } from '../context/AddressContext'
import { useScrollFocusedInput } from '../lib/keyboard'

const SUPPORT_EMAIL = 'support@tokriii.com'

function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

function maskDob(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function toDobInput(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }
  return maskDob(value)
}

function fromDobInput(value) {
  const raw = maskDob(value)
  if (!raw) return null
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!dmy) return raw.length ? raw : null
  return `${dmy[3]}-${dmy[2]}-${dmy[1]}`
}

function parseDobDate(value) {
  const iso = fromDobInput(value)
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function formatDobFromDate(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

export default function AccountScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const bottomInset = useSystemBottomInset()
  const { user, isLoggedIn, logout, updateProfile } = useAuth()
  const { showAnalyticsChoice, showMarketingChoice, marketingAvailable } = useAnalyticsSettings()
  const { mode, setMode, colors, isDark } = useTheme()
  const styles = useThemedStyles(createStyles)
  const { setCart } = useCart()
  const { openPicker } = useAddress()
  const [nameOpen, setNameOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [showDobPicker, setShowDobPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const profileScrollRef = useRef(null)
  const nameFieldRef = useRef(null)
  const dobFieldRef = useRef(null)
  const { keyboardHeight, onScroll, ensureVisible } = useScrollFocusedInput(profileScrollRef)

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack()
    else navigation.navigate('Home')
  }

  const openHelp = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Tokriii support`)
  }

  const shareApp = () => {
    Share.share({
      message: 'Order fresh fruits on Tokriii: https://tokriii.com',
      url: 'https://tokriii.com',
      title: 'Tokriii',
    }).catch(() => {})
  }

  const handleLogout = async () => {
    await logout()
    setCart(null)
  }

  const openNameSheet = () => {
    setError('')
    setName(user?.name || '')
    setDateOfBirth(toDobInput(user?.dateOfBirth))
    setShowDobPicker(false)
    setNameOpen(true)
  }

  const closeNameSheet = () => {
    setNameOpen(false)
    setShowDobPicker(false)
    setError('')
  }

  const onDobPicked = (event, selected) => {
    if (Platform.OS === 'android') setShowDobPicker(false)
    if (event.type === 'dismissed') return
    if (selected) setDateOfBirth(formatDobFromDate(selected))
  }

  const saveName = async () => {
    const nextName = name.trim()
    if (!nextName) {
      setError('Please enter your name.')
      return
    }
    if (nextName.length > 80) {
      setError('Name is too long.')
      return
    }
    const nextDob = fromDobInput(dateOfBirth)
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(nextDob || '')) {
      setError('Enter date of birth as DD/MM/YYYY.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateProfile({ name: nextName, dateOfBirth: nextDob })
      setNameOpen(false)
    } catch (err) {
      setError(err.message || 'Could not save name.')
    } finally {
      setSaving(false)
    }
  }

  const phone = formatPhone(user?.phone)

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable style={styles.back} onPress={goBack} hitSlop={12}>
        <Icon name="chevron-back" size={22} color={colors.text} />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Icon name="person" size={42} color={colors.white} />
          </View>
          <Text style={styles.title}>Your account</Text>
          {isLoggedIn ? (
            phone ? <Text style={styles.subtitle}>{phone}</Text> : null
          ) : (
            <>
              <Text style={styles.subtitle}>Log in to view your complete profile.</Text>
              <Pressable style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Login</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.quickRow}>
          <QuickCard
            icon="basket-outline"
            label="Your orders"
            onPress={() => navigation.navigate('Orders')}
          />
          <QuickCard icon="location-outline" label="Address" onPress={openPicker} />
          <QuickCard icon="chatbubbles-outline" label="Need help?" onPress={openHelp} />
        </View>

        <View style={styles.block}>
          <Row
            icon={isDark ? 'moon-outline' : 'sunny-outline'}
            label="Appearance"
            trailing={isDark ? 'DARK' : 'LIGHT'}
            onPress={() => setAppearanceOpen(true)}
          />
        </View>

        {isLoggedIn ? (
          <>
            <Text style={styles.section}>Your information</Text>
            <View style={styles.block}>
              <Row
                icon="person-outline"
                label="Profile"
                trailing={user?.name || undefined}
                onPress={openNameSheet}
              />
            </View>
          </>
        ) : null}

        <Text style={styles.section}>Other information</Text>
        <View style={styles.block}>
          <Row icon="shield-checkmark-outline" label="App analytics preference" onPress={showAnalyticsChoice} />
          {marketingAvailable ? <Row icon="megaphone-outline" label="Advertising measurement preference" onPress={showMarketingChoice} /> : null}
          <Row icon="share-outline" label="Share the app" onPress={shareApp} />
          <Row
            icon="book-outline"
            label="About us"
            onPress={() => Linking.openURL('https://tokriii.com/about')}
          />
          {isLoggedIn ? (
            <Row icon="log-out-outline" label="Logout" danger onPress={handleLogout} />
          ) : null}
        </View>

        <Text style={styles.brandMark}>tokriii</Text>
      </ScrollView>

      <Modal
        visible={nameOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={closeNameSheet}
      >
        <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
          <View style={styles.formHead}>
            <Text style={styles.sheetTitle}>Profile</Text>
            <Pressable onPress={closeNameSheet} hitSlop={10}>
              <Icon name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView
            ref={profileScrollRef}
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            <View ref={nameFieldRef}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                maxLength={80}
                returnKeyType="next"
                onFocus={() => ensureVisible(nameFieldRef)}
              />
            </View>
            <View ref={dobFieldRef}>
              <Text style={styles.fieldLabel}>Date of birth</Text>
              <View style={styles.dobRow}>
                <TextInput
                  style={styles.dobInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.muted}
                  value={dateOfBirth}
                  onChangeText={(value) => setDateOfBirth(maskDob(value))}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="birthdate-full"
                  returnKeyType="done"
                  onSubmitEditing={saveName}
                  onFocus={() => ensureVisible(dobFieldRef)}
                />
                <Pressable style={styles.dobIcon} onPress={() => setShowDobPicker((open) => !open)} hitSlop={8}>
                  <Icon name="calendar-outline" size={22} color={colors.brand} />
                </Pressable>
              </View>
            </View>
            {showDobPicker ? (
              <DateTimePicker
                value={parseDobDate(dateOfBirth) || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant={isDark ? 'dark' : 'light'}
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                onChange={onDobPicked}
              />
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
          <View
            style={[
              styles.formFooter,
              { paddingBottom: bottomInset + 12 + keyboardHeight },
            ]}
          >
            <Pressable
              style={[styles.saveBtn, saving && styles.buttonDisabled]}
              onPress={saveName}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? 'Please wait…' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={appearanceOpen} transparent animationType="slide" onRequestClose={() => setAppearanceOpen(false)}>
        <View style={styles.sheetWrap}>
          <Pressable style={styles.overlay} onPress={() => setAppearanceOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: bottomInset + 20 }]}>
            <View style={styles.handle} />
            <View style={styles.formHead}>
              <Text style={styles.sheetTitle}>Appearance</Text>
              <Pressable onPress={() => setAppearanceOpen(false)} hitSlop={10}>
                <Icon name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>
            <ThemeChoice
              icon="moon-outline"
              title="Dark theme"
              hint="Green night mode currently used in the app"
              selected={mode === 'dark'}
              onPress={() => {
                setMode('dark')
                setAppearanceOpen(false)
              }}
            />
            <ThemeChoice
              icon="sunny-outline"
              title="Light theme"
              hint="Bright screens with white cards"
              selected={mode === 'light'}
              onPress={() => {
                setMode('light')
                setAppearanceOpen(false)
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

function ThemeChoice({ icon, title, hint, selected, onPress }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <Pressable style={[styles.themeChoice, selected && styles.themeChoiceSelected]} onPress={onPress}>
      <Icon name={icon} size={22} color={selected ? colors.brand : colors.text} />
      <View style={{ flex: 1 }}>
        <Text style={styles.themeTitle}>{title}</Text>
        <Text style={styles.themeHint}>{hint}</Text>
      </View>
      {selected ? <Icon name="checkmark-circle" size={22} color={colors.brand} /> : null}
    </Pressable>
  )
}

function QuickCard({ icon, label, onPress }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <Pressable style={styles.quick} onPress={onPress}>
      <Icon name={icon} size={26} color={colors.text} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  )
}

function Row({ icon, label, trailing, onPress, danger }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <Icon name={icon} size={20} color={danger ? colors.danger : colors.text} />
      <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
      {onPress ? <Icon name="chevron-forward" size={16} color={colors.muted} /> : null}
    </Pressable>
  )
}

const createStyles = (c) => ({
  screen: { flex: 1, backgroundColor: c.canvas },
  back: {
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.panel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 16 },
  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 20 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: c.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { color: c.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: c.muted, fontSize: 14, marginTop: 6, textAlign: 'center' },
  loginBtn: {
    marginTop: 18,
    width: '100%',
    borderWidth: 1.5,
    borderColor: c.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginText: { color: c.brand, fontSize: 18, fontWeight: '800' },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quick: {
    flex: 1,
    backgroundColor: c.panel,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: c.line,
  },
  quickLabel: { color: c.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  section: {
    color: c.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 8,
  },
  block: {
    backgroundColor: c.panel,
    borderRadius: 14,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  rowLabel: { flex: 1, color: c.text, fontSize: 15, fontWeight: '600' },
  trailing: { color: c.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  brandMark: {
    textAlign: 'center',
    color: c.line,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  fullScreen: { flex: 1, backgroundColor: c.canvas },
  formScroll: { flex: 1 },
  formContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  formFooter: {
    borderTopWidth: 1,
    borderTopColor: c.line,
    backgroundColor: c.panel,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: c.overlay,
  },
  sheet: {
    backgroundColor: c.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: c.line,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.line,
    marginBottom: 12,
  },
  formHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    backgroundColor: c.panel,
  },
  sheetTitle: { color: c.text, fontSize: 18, fontWeight: '800' },
  fieldLabel: { color: c.text, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: c.panel2,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: c.text,
    fontSize: 16,
    marginBottom: 16,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.panel2,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 14,
    marginBottom: 16,
    paddingRight: 6,
  },
  dobInput: {
    flex: 1,
    color: c.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dobIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: c.danger, marginBottom: 12, fontSize: 13 },
  saveBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: c.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: { opacity: 0.55 },
  saveText: { color: c.brand, fontSize: 18, fontWeight: '800' },
  themeChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.line,
    marginBottom: 10,
    backgroundColor: c.panel2,
  },
  themeChoiceSelected: {
    borderColor: c.brand,
    backgroundColor: c.successBg,
  },
  themeTitle: { color: c.text, fontSize: 16, fontWeight: '800' },
  themeHint: { color: c.muted, fontSize: 12, marginTop: 2 },
})
