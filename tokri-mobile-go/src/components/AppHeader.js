import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Pressable, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemedStyles } from '../context/ThemeContext'
import { useAddress } from '../context/AddressContext'
import Icon from './Icon'
import SearchPlaceholderSlider from './SearchPlaceholderSlider'
import { listenForSearch } from '../lib/voiceSearch'

const TOP_ROW_HEIGHT = 52

function shortAddress(address) {
  if (!address) return 'Select address'
  const line = [address.line1, address.line2, address.city].filter(Boolean).join(', ')
  return line.length > 36 ? `${line.slice(0, 36)}…` : line
}

export default function AppHeader({ navigation, onSearch, collapseProgress = 0 }) {
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)
  const insets = useSafeAreaInsets()
  const { selectedAddress, detectedLabel, addressChosen, openPicker } = useAddress()
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [focused, setFocused] = useState(false)
  const showHints = !query && !focused && !listening
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (collapseProgress && typeof collapseProgress.interpolate === 'function') return
    const next = Math.max(0, Math.min(1, Number(collapseProgress) || 0))
    anim.setValue(next)
  }, [anim, collapseProgress])

  const progress = collapseProgress && typeof collapseProgress.interpolate === 'function'
    ? collapseProgress
    : anim
  const topRowHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [TOP_ROW_HEIGHT, 0],
  })
  const topRowOpacity = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [1, 0.2, 0],
  })
  const topRowTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  })
  const headerBackground = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.panel, colors.canvas],
  })
  const headerBorder = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.line, colors.brand],
  })

  const submit = (value = query) => {
    const term = String(value || '').trim()
    if (!term) return
    onSearch ? onSearch(term) : navigation.navigate('Search', { q: term })
  }

  const onMic = async () => {
    try {
      setListening(true)
      const spoken = await listenForSearch()
      setQuery(spoken)
      submit(spoken)
    } catch (error) {
      Alert.alert('Voice search', error.message || 'Could not start voice search.')
    } finally {
      setListening(false)
    }
  }

  const onProfile = () => {
    navigation.navigate('Main', { screen: 'Account' })
  }

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 8,
          backgroundColor: headerBackground,
          borderBottomColor: headerBorder,
        },
      ]}
    >
      <Animated.View
        style={{
          height: topRowHeight,
          opacity: topRowOpacity,
          transform: [{ translateY: topRowTranslateY }],
          overflow: 'hidden',
        }}
      >
        <View style={styles.topRow}>
          <Pressable style={styles.address} onPress={openPicker}>
            <Text style={styles.eta}>Deliver to</Text>
            <View style={styles.addressLine}>
              <Icon name="location" size={14} color={colors.brand} />
              <Text style={styles.addressText} numberOfLines={1}>
                {addressChosen && selectedAddress
                  ? shortAddress(selectedAddress)
                  : detectedLabel || 'Select address'}
              </Text>
              <Icon name="chevron-down" size={14} color={colors.muted} />
            </View>
          </Pressable>
          <Pressable style={styles.profile} onPress={onProfile}>
            <Icon name="person-circle-outline" size={32} color={colors.text} />
          </Pressable>
        </View>
      </Animated.View>

      <View style={styles.search}>
        <Icon name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholder=""
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={() => submit()}
        />
        <SearchPlaceholderSlider visible={showHints} />
        <Pressable onPress={onMic} hitSlop={8}>
          <Icon name={listening ? 'mic' : 'mic-outline'} size={20} color={listening ? colors.brand : colors.mint} />
        </Pressable>
      </View>
    </Animated.View>
  )
}

const createStyles = (c) => ({
  wrap: {
    backgroundColor: c.panel,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: TOP_ROW_HEIGHT },
  address: { flex: 1 },
  eta: { color: c.text, fontSize: 14, fontWeight: '800' },
  addressLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  addressText: { flex: 1, color: c.mint, fontSize: 12 },
  profile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginTop: 4,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.panel2,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  input: { flex: 1, color: c.text, fontSize: 14, paddingVertical: 0 },
})
