import { Building2, Home, MapPin } from 'lucide-react'

export function addressLabelIcon(label) {
  if (label === 'Work') return Building2
  if (label === 'Home') return Home
  return MapPin
}
