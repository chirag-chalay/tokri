import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { authGet } from '../lib/api'
import { fetchAddressFromBrowser } from '../lib/geolocation'

import { observeLocationPermission, setVisitLocation, setVisitPincode } from '../lib/logVisit'

const AddressContext = createContext(null)

function storageKey(phone) {
  return phone ? `tokri_selected_address_${phone}` : null
}

function detectedPlaceLabel(found) {
  const line = [found?.line2 || found?.line1, found?.city].filter(Boolean).join(', ')
  if (!line) return ''
  return line.length > 42 ? `${line.slice(0, 42)}…` : line
}

export function AddressProvider({ children }) {
  const { user, isLoggedIn } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detectedLocation, setDetectedLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const locationRequest = useRef(null)

  const refreshAddresses = useCallback(async () => {
    if (!isLoggedIn || !user?.phone) {
      setAddresses([])
      setSelectedAddressId(null)
      return []
    }

    setLoading(true)
    try {
      const data = await authGet('/account/addresses', user)
      const list = data.addresses || []
      setAddresses(list)

      const key = storageKey(user.phone)
      const storedId = key ? localStorage.getItem(key) : null
      const canDeliver = (item) => item && item.serviceable !== false
      const storedAddress = list.find((item) => item.id === storedId)
      const fallback = list.find(canDeliver)

      if (canDeliver(storedAddress)) {
        setSelectedAddressId(storedId)
      } else if (fallback) {
        setSelectedAddressId(fallback.id)
        if (key) localStorage.setItem(key, fallback.id)
      } else {
        setSelectedAddressId(null)
        if (key) localStorage.removeItem(key)
      }

      return list
    } catch (err) {
      console.warn('Failed to load addresses:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, user])

  useEffect(() => {
    refreshAddresses()
  }, [refreshAddresses])

  const detectLocation = useCallback(() => {
    if (locationRequest.current) return locationRequest.current
    setLocating(true)
    setLocationError('')
    locationRequest.current = fetchAddressFromBrowser()
      .then((found) => {
        setVisitLocation(found)
        observeLocationPermission()
        const label = detectedPlaceLabel(found)
        const pincode = /^\d{6}$/.test(found.pincode || '') ? String(found.pincode) : ''
        setDetectedLocation(label || pincode ? { label, pincode } : null)
        if (!pincode) setLocationError('A delivery PIN could not be detected. Try again.')
        return pincode
      })
      .catch(() => {
        setVisitLocation(null)
        observeLocationPermission()
        setLocationError('Location is unavailable. Check your browser permissions and try again.')
      })
      .finally(() => {
        locationRequest.current = null
        setLocating(false)
      })
    return locationRequest.current
  }, [])

  useEffect(() => {
    if (navigator.geolocation) detectLocation()
  }, [detectLocation])

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId) || null,
    [addresses, selectedAddressId],
  )

  useEffect(() => {
    if (selectedAddress?.pincode) setVisitPincode(selectedAddress.pincode)
  }, [selectedAddress?.pincode])

  const hasDeliveryAddress = Boolean(isLoggedIn && selectedAddress)

  const selectAddress = useCallback(
    (addressId) => {
      setSelectedAddressId(addressId)
      const key = storageKey(user?.phone)
      if (key) localStorage.setItem(key, addressId)
      setPickerOpen(false)
    },
    [user?.phone],
  )

  const openPicker = useCallback(() => {
    setPickerOpen(true)
    if (isLoggedIn) {
      refreshAddresses().catch(() => {})
    }
  }, [isLoggedIn, refreshAddresses])

  const closePicker = useCallback(() => {
    setPickerOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      addresses,
      selectedAddress,
      selectedAddressId,
      hasDeliveryAddress,
      detectedLabel: detectedLocation?.label || detectedLocation?.pincode || '',
      detectedLocation,
      detectLocation,
      locating,
      locationError,
      loading,
      pickerOpen,
      refreshAddresses,
      selectAddress,
      openPicker,
      closePicker,
    }),
    [
      addresses,
      selectedAddress,
      selectedAddressId,
      hasDeliveryAddress,
      detectedLocation,
      detectLocation,
      locating,
      locationError,
      loading,
      pickerOpen,
      refreshAddresses,
      selectAddress,
      openPicker,
      closePicker,
    ],
  )

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
}

export function useAddress() {
  const context = useContext(AddressContext)
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider')
  }
  return context
}
