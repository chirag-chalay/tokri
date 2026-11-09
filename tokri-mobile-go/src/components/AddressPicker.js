import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSystemBottomInset } from '../lib/safeArea'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { authDelete, authPost } from '../lib/api'
import { explainLocationError, fetchAddressFromDevice } from '../lib/location'
import { useAddress } from '../context/AddressContext'
import { useAuth } from '../context/AuthContext'
import { useScrollFocusedInput } from '../lib/keyboard'
import Icon from './Icon'

const LABELS = ['Home', 'Work', 'Other']
const ADDRESS_FIELDS = new Set(['line1', 'line2', 'city', 'state', 'pincode', 'landmark'])

function mapPin(found) {
  const latitude = Number(found?.latitude)
  const longitude = Number(found?.longitude)
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return { latitude: null, longitude: null }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return { latitude: null, longitude: null }
  return { latitude, longitude }
}

const emptyForm = (phone = '') => ({
  label: 'Home',
  name: '',
  phone,
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
})

export default function AddressPicker() {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const bottomInset = useSystemBottomInset()
  const navigation = useNavigation()
  const { isLoggedIn, user, token } = useAuth()
  const { addresses, selectedId, pickerOpen, closePicker, selectAddress, refresh } = useAddress()
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [locating, setLocating] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const showForm = isLoggedIn && (formOpen || addresses.length === 0)

  const applyDetected = useCallback((found) => {
    setForm((current) => ({
      ...current,
      line1: found.line1 || '',
      line2: found.line2 || '',
      city: found.city || '',
      state: found.state || '',
      pincode: found.pincode || '',
      landmark: found.landmark || '',
      ...mapPin(found),
    }))
    setFieldErrors((current) => {
      const next = { ...current }
      ;['line1', 'line2', 'city', 'state', 'pincode'].forEach((key) => {
        if (found?.[key]) delete next[key]
      })
      return next
    })
  }, [])

  const fillFromLocation = useCallback(async () => {
    setLocating(true)
    setError('')
    try {
      const found = await fetchAddressFromDevice()
      applyDetected(found)
    } catch (err) {
      explainLocationError(err)
    } finally {
      setLocating(false)
    }
  }, [applyDetected])

  const startForm = () => {
    setError('')
    setFieldErrors({})
    setForm({
      ...emptyForm(user?.phone || ''),
      name: String(user?.name || '').trim(),
      phone: String(user?.phone || '').replace(/\D/g, '').slice(0, 10),
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setError('')
    setFieldErrors({})
    setLocating(false)
    if (addresses.length === 0) closePicker()
  }

  const emptyBookPrefill = useRef(false)
  useEffect(() => {
    if (!pickerOpen) {
      emptyBookPrefill.current = false
      return
    }
    if (!showForm || formOpen || emptyBookPrefill.current) return
    emptyBookPrefill.current = true
    setFieldErrors({})
    setForm({
      ...emptyForm(user?.phone || ''),
      name: String(user?.name || '').trim(),
      phone: String(user?.phone || '').replace(/\D/g, '').slice(0, 10),
    })
  }, [pickerOpen, showForm, formOpen, user?.name, user?.phone])

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(ADDRESS_FIELDS.has(field) ? { latitude: null, longitude: null } : {}),
    }))
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const removeAddress = (address) => {
    Alert.alert('Delete address', 'Remove this saved address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await authDelete(`/account/addresses/${address.id}`, token)
            await refresh()
          } catch (err) {
            setError(err.message || 'Could not delete address.')
          }
        },
      },
    ])
  }

  const saveAddress = async () => {
    setError('')
    const nextErrors = {}
    const name = String(form.name || '').trim()
    const phone = String(form.phone || '').replace(/\D/g, '')
    const line1 = String(form.line1 || '').trim()
    const city = String(form.city || '').trim()
    const state = String(form.state || '').trim()
    const pincode = String(form.pincode || '').replace(/\D/g, '')
    if (!name) nextErrors.name = 'Enter full name'
    if (phone.length !== 10) nextErrors.phone = 'Enter a valid 10-digit mobile number'
    if (!line1) nextErrors.line1 = 'Enter house / flat / building'
    if (!city) nextErrors.city = 'Enter city'
    if (!state) nextErrors.state = 'Enter state'
    if (pincode.length !== 6) nextErrors.pincode = 'Enter a valid 6-digit pincode'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      const data = await authPost('/account/addresses', token, {
        ...form,
        name,
        phone,
        line1,
        city,
        state,
        pincode,
      })
      await refresh()
      if (data.address?.id) await selectAddress(data.address.id)
      setFormOpen(false)
    } catch (err) {
      setError(err.message || 'Could not save address.')
    } finally {
      setSaving(false)
    }
  }

  const hint = useMemo(() => {
    if (!isLoggedIn) return 'Log in to save a delivery address and place your order.'
    return 'Choose where we should deliver your order.'
  }, [isLoggedIn])

  const scrollRef = useRef(null)
  const { keyboardHeight, onScroll, ensureVisible } = useScrollFocusedInput(scrollRef)

  return (
    <Modal
      visible={pickerOpen}
      animationType="slide"
      transparent={!showForm}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={showForm ? closeForm : closePicker}
    >
      {showForm ? (
        <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
          <View style={styles.formHead}>
            <Text style={styles.title}>Add new address</Text>
            <Pressable onPress={closeForm} hitSlop={10}>
              <Icon name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>
          <ScrollView
            ref={scrollRef}
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScroll={onScroll}
            scrollEventThrottle={16}
            automaticallyAdjustKeyboardInsets={false}
          >
            <Text style={styles.hint}>Where should we deliver your fresh fruits?</Text>
            <Pressable
              style={[styles.locateBtn, locating && { opacity: 0.7 }]}
              onPress={fillFromLocation}
              disabled={locating}
            >
              {locating ? (
                <ActivityIndicator color={colors.brand} size="small" />
              ) : (
                <Icon name="navigate" size={18} color={colors.brand} />
              )}
              <Text style={styles.locateText}>
                {locating ? 'Detecting your location…' : 'Use current location'}
              </Text>
            </Pressable>
            <Text style={styles.fieldLabel}>Save as</Text>
            <View style={styles.chips}>
              {LABELS.map((label) => (
                <Pressable
                  key={label}
                  style={[styles.chip, form.label === label && styles.chipActive]}
                  onPress={() => update('label', label)}
                >
                  <Text style={[styles.chipText, form.label === label && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <Field
              label="Full name"
              value={form.name}
              onChangeText={(value) => update('name', value)}
              placeholder="Receiver name"
              onFocusField={ensureVisible}
              error={fieldErrors.name}
            />
            <Field
              label="Mobile number"
              value={form.phone}
              onChangeText={(value) => update('phone', value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile"
              keyboardType="number-pad"
              prefix="+91"
              onFocusField={ensureVisible}
              error={fieldErrors.phone}
            />
            <Field
              label="House / flat / building"
              value={form.line1}
              onChangeText={(value) => update('line1', value)}
              placeholder="Flat 402, Green Valley Apartments"
              onFocusField={ensureVisible}
              error={fieldErrors.line1}
            />
            <Field
              label="Street / area"
              value={form.line2}
              onChangeText={(value) => update('line2', value)}
              placeholder="Sector 18, Noida"
              onFocusField={ensureVisible}
            />
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field
                  label="City"
                  value={form.city}
                  onChangeText={(value) => update('city', value)}
                  onFocusField={ensureVisible}
                  error={fieldErrors.city}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="State"
                  value={form.state}
                  onChangeText={(value) => update('state', value)}
                  onFocusField={ensureVisible}
                  error={fieldErrors.state}
                />
              </View>
            </View>
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Pincode"
                  value={form.pincode}
                  onChangeText={(value) => update('pincode', value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit pincode"
                  keyboardType="number-pad"
                  onFocusField={ensureVisible}
                  error={fieldErrors.pincode}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Landmark (optional)"
                  value={form.landmark}
                  onChangeText={(value) => update('landmark', value)}
                  placeholder="Near metro gate"
                  onFocusField={ensureVisible}
                />
              </View>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>
          <View
            style={[
              styles.formFooter,
              { paddingBottom: bottomInset + 12 + keyboardHeight },
            ]}
          >
            <Pressable style={[styles.save, saving && { opacity: 0.7 }]} onPress={saveAddress} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save address'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.overlay} onPress={closePicker}>
          <Pressable style={[styles.sheet, { paddingBottom: bottomInset + 20 }]} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.title}>Delivery address</Text>
            <Text style={styles.hint}>{hint}</Text>
            {!isLoggedIn ? (
              <Pressable
                style={styles.save}
                onPress={() => {
                  closePicker()
                  navigation.navigate('Login')
                }}
              >
                <Text style={styles.saveText}>Log in to continue</Text>
              </Pressable>
            ) : (
              <>
                <ScrollView style={styles.list}>
                  {addresses.map((address) => (
                    <Pressable
                      key={address.id}
                      style={[styles.row, selectedId === address.id && styles.rowActive]}
                      onPress={() => {
                        if (address.serviceable === false) {
                          setError("We don't deliver to this pincode yet.")
                          return
                        }
                        selectAddress(address.id)
                      }}
                    >
                      <Icon name="location" size={18} color={colors.brand} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>{address.label || 'Home'}</Text>
                        <Text style={styles.line}>{address.formatted}</Text>
                        {address.serviceable === false ? (
                          <Text style={styles.error}>We don't deliver to this pincode yet.</Text>
                        ) : null}
                      </View>
                      {selectedId === address.id ? <Icon name="checkmark-circle" color={colors.brand} /> : null}
                      <Pressable onPress={() => removeAddress(address)} hitSlop={8}>
                        <Icon name="trash-outline" size={18} color={colors.danger || '#b91c1c'} />
                      </Pressable>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable style={styles.locateBtn} onPress={startForm}>
                  <Icon name="navigate" size={18} color={colors.brand} />
                  <Text style={styles.locateText}>Use current location</Text>
                </Pressable>
                <Pressable style={styles.addBtn} onPress={startForm}>
                  <Icon name="add" size={18} color={colors.brand} />
                  <Text style={styles.addText}>Add new address</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      )}
    </Modal>
  )
}

function Field({ label, prefix, onFocusField, error, ...inputProps }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const wrapRef = useRef(null)
  return (
    <View ref={wrapRef} style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          {...inputProps}
          onFocus={(event) => {
            inputProps.onFocus?.(event)
            onFocusField?.(wrapRef)
          }}
        />
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  )
}

const createStyles = (c) => ({
  overlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: 'flex-end',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: c.canvas,
  },
  sheet: {
    backgroundColor: c.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '88%',
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
  title: { color: c.text, fontSize: 18, fontWeight: '800' },
  hint: { color: c.muted, marginTop: 6, marginBottom: 12, fontSize: 13 },
  loginHint: { color: c.muted, paddingVertical: 12 },
  list: { maxHeight: 320 },
  row: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.line,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  rowActive: { borderColor: c.brand, backgroundColor: c.panel2 },
  label: { color: c.text, fontWeight: '700', marginBottom: 4 },
  line: { color: c.mint, fontSize: 12, lineHeight: 18 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  addText: { color: c.brand, fontWeight: '800' },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: c.brand,
    backgroundColor: c.addBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  locateText: { color: c.brand, fontWeight: '800', flex: 1 },
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
  formScroll: { flex: 1, backgroundColor: c.canvas },
  formContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  formFooter: {
    borderTopWidth: 1,
    borderTopColor: c.line,
    backgroundColor: c.panel,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  field: { marginBottom: 12 },
  fieldLabel: { color: c.text, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: {
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: c.panel2,
  },
  chipActive: { backgroundColor: c.brand, borderColor: c.brand },
  chipText: { color: c.text, fontWeight: '700' },
  chipTextActive: { color: c.onBrand },
  twoCol: { flexDirection: 'row', gap: 10 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.panel2,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWrapError: { borderColor: c.danger },
  prefix: { color: c.muted, marginRight: 8, fontWeight: '700' },
  input: { flex: 1, color: c.text, paddingVertical: 11, fontSize: 14 },
  fieldError: { color: c.danger, fontSize: 12, marginTop: 6 },
  error: { color: c.danger, marginBottom: 10 },
  save: {
    backgroundColor: c.brand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: c.onBrand, fontWeight: '800' },
})
