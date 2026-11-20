export const logReasons = {
  AUTH_REQUIRED: ['Customer was not signed in at checkout', 'Check that sign-in is easy to complete.'],
  PINCODE_INVALID: ['Pincode was not valid', 'Ask the customer to enter a six-digit pincode.'],
  PINCODE_NOT_SERVICEABLE: ['We do not deliver to this pincode', 'Consider adding this area.'],
  MIN_ORDER_NOT_MET: ['Cart value is below the minimum order', 'Show the minimum before checkout.'],
  OUT_OF_STOCK: ['An item became unavailable', 'Check stock and product availability.'],
  PAYMENT_FAILED: ['Payment was declined or failed', 'Check the payment provider before retrying.'],
  PAYMENT_CANCELLED: ['Customer cancelled the payment', 'Offer another way to pay.'],
  NETWORK_ERROR: ['Connection dropped before the request finished', 'Ask the customer to try again after checking their connection.'],
  VALIDATION_ERROR: ['Required details were missing or wrong', 'Check the details entered at checkout.'],
  UNKNOWN: ['Failed, cause could not be determined', 'Look at the related events in this visit.'],
}
export const isLogReason = value => typeof value === 'string' && Object.hasOwn(logReasons, value)
export const visitorCookie = 'tokri_visit'
export const validVisitorSession = value => typeof value === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value)
