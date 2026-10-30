import { useSyncExternalStore } from 'react'
import CartControl from './CartControl'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

// Server output must not contain a particular visitor's local cart state.
export default function DeferredCartControl({ defer, ...props }) {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  if (defer && !mounted) return null
  return <CartControl {...props} />
}
