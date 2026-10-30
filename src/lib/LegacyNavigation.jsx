import { Link, useLocation, useNavigate } from 'react-router-dom'
import { NavigationContext } from './navigation'

export default function LegacyNavigation({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  return <NavigationContext.Provider value={{ navigate, location, LinkComponent: Link }}>{children}</NavigationContext.Provider>
}
