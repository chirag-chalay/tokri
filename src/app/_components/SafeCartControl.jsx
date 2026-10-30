'use client'

import dynamic from 'next/dynamic'

// Cart state is browser-local and may differ from the server render.
const CartControl = dynamic(() => import('../../components/CartControl'), { ssr: false })
export default function SafeCartControl(props) { return <CartControl {...props} /> }
