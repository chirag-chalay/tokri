'use client'

import dynamic from 'next/dynamic'

// Customer-specific state lives only in the browser and is never server cached.
const Cart = dynamic(() => import('../../pages/CartPage'), { ssr: false })
const Checkout = dynamic(() => import('../../pages/CheckoutPage'), { ssr: false })
const Order = dynamic(() => import('../../pages/OrderSuccessPage'), { ssr: false })
const Account = dynamic(() => import('../../pages/MyAccount'), { ssr: false })
const Login = dynamic(() => import('../../pages/MobileLoginPage'), { ssr: false })
const Profile = dynamic(() => import('../../pages/MobileProfilePage'), { ssr: false })
const pages = { cart: Cart, checkout: Checkout, order: Order, account: Account, login: Login, profile: Profile }

export default function PrivateRoute({ page }) {
  const Page = pages[page]
  return <Page />
}
