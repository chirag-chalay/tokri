import { Link, useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { NavigationContext } from './navigation'

export default function LegacyNavigation({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParamsState = useSearchParams()
  return <NavigationContext.Provider value={{ navigate, location, searchParamsState, LinkComponent: Link, useParamsHook: useParams }}>{children}</NavigationContext.Provider>
}
