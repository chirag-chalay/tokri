import { createContext, useContext } from 'react'

export const NavigationContext = createContext(null)

function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) throw new Error('Navigation provider is missing')
  return context
}

export function Link({ to, ...props }) {
  const { LinkComponent } = useNavigation()
  return <LinkComponent to={to} {...props} />
}

export function useNavigate() { return useNavigation().navigate }
export function useLocation() { return useNavigation().location }

export function useSearchParams() { return useNavigation().searchParamsState }
