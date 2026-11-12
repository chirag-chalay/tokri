// Fixed translations of actual application failures, never arbitrary messages.
export const failureReasons = {
  product_name_required: 'A product name was required before this change could continue.',
  admin_validation: 'Some information supplied for this change was not valid.',
  debug_audit: 'The change could not be recorded in critical audit storage, so enabling debug logging was refused.',
  debug_storage: 'The server could not confirm that the debug setting was saved to monitoring storage.',
  debug_permissions: 'The server did not have permission to save monitoring settings.',
  debug_disk_full: 'There was not enough disk space to save monitoring settings.',
  insufficient_funds: 'The payment account did not have enough funds.',
  payment_declined: 'The payment provider declined the payment.',
  payment_timed_out: 'The payment attempt timed out.',
  cart_empty: 'The shopping cart is empty.',
  quantity_invalid: 'A product quantity was not valid.',
  cart_item_invalid: 'A shopping cart item was not valid.',
  product_missing: 'The requested product could not be found.',
  coupon_minimum: 'The shopping cart is below the minimum amount required by the coupon.',
  coupon_products: 'This coupon applies only to selected products or categories.',
  coupon_shipping: 'There is no delivery charge to discount.',
  product_unavailable: 'The requested product is no longer available.',
  address_invalid: 'A valid delivery address was not selected.',
  location_unserviceable: 'The selected delivery location is not serviceable.',
  delivery_option_unavailable: 'The selected delivery option is not available at this location.',
  otp_incorrect: 'The verification code did not match.',
  otp_expired: 'The verification code expired or could not be found. A new code is required.',
  otp_missing: 'The required verification code was not supplied in the expected format.',
  otp_attempts: 'Too many incorrect verification attempts were made. A new code is required.',
  otp_wait: 'Another verification code was requested too soon.',
  phone_invalid: 'The supplied mobile number was not valid.',
  account_inactive: 'The customer account is inactive.',
  login_required: 'The customer must sign in before continuing.',
  coupon_invalid: 'The selected coupon is not valid.',
  coupon_expired: 'The selected coupon has expired.',
  coupon_not_started: 'The selected coupon is not active yet.',
  coupon_limit: 'The selected coupon has reached its usage limit.',
  coupon_used: 'The customer has already used this coupon.',
  coupon_no_discount: 'The selected coupon does not give a discount on this cart.',
  order_missing: 'The requested order could not be found.',
  payment_mismatch: 'The payment details do not match this order.',
  cod_unavailable: 'Cash on delivery is not available for this order.',
  admin_credentials: 'The administrator sign-in details were not accepted.',
}
const exact = new Map([
  ['Product name is required to generate a slug.', 'product_name_required'], ['Product not found', 'product_missing'], ['This coupon is only valid on selected categories.', 'coupon_products'], ['This coupon is only valid on selected products.', 'coupon_products'], ['No eligible items for this coupon.', 'coupon_products'], ['No shipping fee to discount.', 'coupon_shipping'],
  ['Your cart is empty.', 'cart_empty'], ['Invalid product quantity.', 'quantity_invalid'], ['Invalid cart item.', 'cart_item_invalid'],
  ['Please select a valid delivery address.', 'address_invalid'], ["We don't deliver to this pincode yet.", 'location_unserviceable'],
  ['This delivery option is not available for your pincode yet.', 'delivery_option_unavailable'],
  ['Incorrect OTP. Please try again.', 'otp_incorrect'], ['OTP expired or not found. Please request a new one.', 'otp_expired'], ['OTP has expired. Please request a new one.', 'otp_expired'],
  ['Please enter the 4-digit OTP.', 'otp_missing'], ['Too many incorrect attempts. Please request a new OTP.', 'otp_attempts'], ['Please wait a minute before requesting another OTP.', 'otp_wait'],
  ['Please enter a valid 10-digit mobile number.', 'phone_invalid'], ['This account is inactive. Please contact support.', 'account_inactive'],
  ['Please log in to continue.', 'login_required'], ['Please log in to use this coupon.', 'login_required'],
  ['This coupon is not valid.', 'coupon_invalid'], ['This coupon is not active yet.', 'coupon_not_started'], ['This coupon has expired.', 'coupon_expired'], ['This coupon has reached its usage limit.', 'coupon_limit'],
  ['Add items to your cart before applying a coupon.', 'cart_empty'], ['You have already used this coupon.', 'coupon_used'], ['This coupon does not give a discount on your cart.', 'coupon_no_discount'],
  ['Order not found.', 'order_missing'], ['Payment details do not match this order.', 'payment_mismatch'], ['Cash on delivery is not available for this order.', 'cod_unavailable'],
])
export function safeFailureFacts(error) {
  let failureReason = exact.get(error?.message)
  if (!failureReason && error?.code === 'MINIMUM_SUBTOTAL') failureReason = 'coupon_minimum'
  if (!failureReason && /^Product ".+" is no longer available\.$/.test(error?.message || '')) failureReason = 'product_unavailable'
  return failureReason ? { failureReason } : {}
}
export function checkoutFacts(body) {
  if (!body || typeof body !== 'object') return {}
  const totals = body.totals
  if (!totals || typeof totals !== 'object') return {}
  const facts = {}
  for (const key of ['itemsTotal', 'discount', 'grandTotal', 'deliveryCharge', 'handlingCharge', 'taxTotal']) {
    if (totals[key] != null && totals[key] !== '' && Number.isFinite(Number(totals[key])) && Number(totals[key]) >= 0) facts[key] = Number(totals[key])
  }
  if (Array.isArray(totals.lineItems)) facts.productCount = totals.lineItems.length
  else if (Array.isArray(body.items)) facts.productCount = body.items.length
  // Only the server-confirmed selected code, never the customer's raw input.
  const code = body.coupon?.code || (body.couponStatus?.status === 'applied' ? body.couponStatus.code : undefined)
  if (typeof code === 'string' && /^[A-Z][A-Z0-9_-]{0,39}$/.test(code) && !/\d{10}/.test(code)) facts.couponCode = code
  if (['morning', 'express'].includes(body.deliveryType)) facts.deliveryOption = body.deliveryType
  return facts
}

export function checkoutPaymentFacts(body) {
  const paymentStatus = body?.paymentStatus || body?.status || body?.order?.paymentStatus
  const facts = {}
  if (['paid', 'captured', 'failed', 'pending', 'refunded'].includes(paymentStatus)) facts.paymentStatus = paymentStatus
  if (paymentStatus === 'failed') Object.assign(facts, safeFailureFacts(body))
  if (paymentStatus === 'failed' && ['insufficient_funds', 'payment_declined', 'payment_timed_out'].includes(body?.message)) { facts.reason = body.message; facts.failureReason = body.message }
  const orderNo = body?.orderNo || body?.order?.orderNo
  if (typeof orderNo === 'string') facts.orderNo = orderNo
  const mode = body?.order?.paymentMode || body?.paymentMode
  if (['cod', 'online'].includes(mode)) facts.paymentMode = mode
  const total = body?.order?.grandTotal
  if (total != null && Number.isFinite(Number(total)) && Number(total) >= 0) facts.grandTotal = Number(total)
  return facts
}

const adminModels = new Set(['Product', 'Order', 'Coupon', 'Setting', 'User', 'Customer', 'DeliveryPartner', 'Category', 'Page', 'BlogPost', 'Review', 'Media', 'AppReleasePolicy', 'ServiceablePincode', 'ProductTax', 'AdminPermission', 'ProductCategory'])
const adminOperations = new Map([['edit', 'update'], ['new', 'create'], ['delete', 'delete'], ['bulkDelete', 'deleteMany']])
export function adminActionFacts(value) {
  const path = typeof value === 'string' ? value.split(/[?#]/)[0] : ''
  const match = path.match(/\/api\/resources\/([A-Za-z]+)\/(?:records\/([a-zA-Z0-9_-]{1,100})|actions|bulk)\/([A-Za-z]+)\/?$/)
  const operation = adminOperations.get(match?.[3])
  return match && adminModels.has(match[1]) && operation ? { model: match[1], operation, ...(match[2] ? { resourceId: match[2] } : {}) } : {}
}
