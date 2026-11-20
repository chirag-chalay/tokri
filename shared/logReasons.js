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
  ACCESS_DENIED: ['The server refused the request', 'Check whether this action requires access.'],
  RESOURCE_NOT_FOUND: ['The requested item or page was unavailable', 'Check the link or catalog listing.'],
  SERVICE_UNAVAILABLE: ['A service could not answer the request', 'Check the service and retry.'],
  BROWSER_ERROR: ['An error occurred in the browser', 'Check the related page and recent website changes.'],
  RESOURCE_LOAD_FAILED: ['Part of the page could not load', 'Check that the image, script or stylesheet is available.'],
  SIGN_IN_FAILED: ['The sign-in details were not accepted', 'Check the sign-in flow and try again.'],
  UNKNOWN: ['Failed, cause could not be determined', 'Look at the related events in this visit.'],
}
export const isLogReason = value => typeof value === 'string' && Object.hasOwn(logReasons, value)
export const visitorIdleSeconds = 30 * 60
export const visitorCookie = 'tokri_visit'
export const validVisitorSession = value => typeof value === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value)
