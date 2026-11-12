import { failureReasons } from '../monitoring/event-facts.js'
import { readableStatus } from '../../../shared/monitoring.js'
import { isIP } from 'node:net'
import { sanitize } from '../monitoring/sanitize.js'

export const categoryLabels = { website: 'Website access', api: 'API access', access: 'Earlier access history', error: 'Errors', audit: 'Admin activity', debug: 'Debug', payment: 'Payments', account: 'New accounts' }
const modelFor = (row) => typeof row.model === 'string' ? row.model : typeof row.event === 'string' ? row.event.split('.')[0] : ''
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 })
const numeric = (value) => (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) && Number(value) >= 0
const money = (value) => numeric(value) ? currency.format(Number(value)) : null
export function displayText(value) {
  if (typeof value !== 'string' || !value.trim() || /^\s*[\[{]/.test(value) || /\[(?:REDACTED|OMITTED)/i.test(value)) return ''
  const safe = sanitize({ slug: value }).slug.replace(/\b\d(?:[\s()-]*\d){9,14}\b/g, '[REDACTED_PHONE]').replace(/[\u0000-\u001f\u007f]/g, ' ').trim()
  return /\[(?:REDACTED|OMITTED)/i.test(safe) ? '' : safe
}
const words = (value) => displayText(value).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._/-]+/g, ' ').replace(/\s+/g, ' ').trim()
const success = new Set(['success', 'successful', 'paid', 'captured', 'refunded', 'processed', 'delivered', 'matched'])
const failures = new Set(['failed', 'failure', 'error', 'cancelled', 'canceled'])
const pending = new Set(['pending', 'attempt', 'created', 'authorized', 'processing'])
export function resultFor(row) { return readableStatus(row) }

const models = { Product: 'product', Order: 'order', Coupon: 'coupon', Setting: 'store settings', User: 'administrator account', Customer: 'customer account', DeliveryPartner: 'delivery partner', Category: 'category', Page: 'page', Blog: 'blog post', Review: 'review', Media: 'media file', AppRelease: 'app settings', Pincode: 'delivery area' }
Object.assign(models, { BlogPost: 'blog post', AppReleasePolicy: 'app update settings', ServiceablePincode: 'delivery area', ProductTax: 'product tax settings', AdminPermission: 'team permissions', CouponRedemption: 'coupon use', ProductCategory: 'product category assignment', Cart: 'shopping cart', CartItem: 'cart item', DeviceToken: 'notification registration', PartnerDeviceToken: 'delivery partner notification registration', PasswordResetToken: 'password reset request', PartnerPasswordToken: 'delivery partner password reset request' })
const changeLabels = { priceValue: 'Product price', oldPriceValue: 'Previous selling price', mrp: 'Maximum retail price', stock: 'Stock', quantity: 'Quantity', isActive: 'Active', status: 'Order status', paymentStatus: 'Payment status', paymentMode: 'Payment method', shippingFee: 'Delivery fee', handlingFee: 'Handling fee', discount: 'Discount', minOrder: 'Minimum order', maxDiscount: 'Maximum discount', usageLimit: 'Usage limit', role: 'Role', codEnabled: 'Cash on delivery enabled', razorpayEnabled: 'Razorpay enabled', morningEnabled: 'Morning delivery enabled', expressEnabled: 'Same-day delivery enabled', isPublished: 'Published', isApproved: 'Approved', gstRate: 'GST rate' }
Object.assign(changeLabels, { morningShippingFee: 'Morning delivery fee', morningFreeAbove: 'Free morning delivery above', expressShippingFee: 'Same-day delivery fee', expressFreeAbove: 'Free same-day delivery above', expressMinimumOrderValue: 'Minimum same-day order', firstThreeMorningEnabled: 'First three morning deliveries offer enabled', msg91Enabled: 'SMS service enabled', msg91WhatsappEnabled: 'WhatsApp service enabled', isBestSeller: 'Best seller', isImported: 'Imported', isFeatured: 'Featured', isTaxable: 'Taxable', type: 'Discount type', value: 'Discount value', minCart: 'Minimum cart amount', usedCount: 'Times used', sortOrder: 'Display order', startsAt: 'Start date', expiresAt: 'Expiry date', hsnCode: 'Tax classification', manageProducts: 'Manage products', manageOrders: 'Manage orders', manageCoupons: 'Manage coupons', manageSettings: 'Manage settings', manageUsers: 'Manage team', manageCatalog: 'Manage catalog', manageMedia: 'Manage media', manageContent: 'Manage content' })
const moneyFields = new Set(['priceValue', 'oldPriceValue', 'mrp', 'shippingFee', 'handlingFee', 'discount', 'minOrder', 'maxDiscount', 'morningShippingFee', 'morningFreeAbove', 'expressShippingFee', 'expressFreeAbove', 'expressMinimumOrderValue', 'minCart'])
function changeValue(key, value) {
  if (value == null || value === '' || typeof value === 'object') return null
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (moneyFields.has(key)) return money(value)
  const known = { admin: 'Administrator', super_admin: 'Super Admin', staff: 'Staff member', pending: 'Pending', paid: 'Paid', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', cod: 'Cash on delivery', online: 'Online payment', cash: 'Cash', qr: 'QR code payment', percent: 'Percentage discount', flat: 'Fixed discount' }
  if (Object.hasOwn(known, value)) return known[value]
  if (['startsAt', 'expiresAt'].includes(key) && Number.isFinite(Date.parse(value))) return `${new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })} IST`
  if (key === 'gstRate' && numeric(value)) return `${Number(value)}%`
  return words(String(value)) || null
}
function changesFor(row) {
  if (row.category !== 'audit' || resultFor(row) !== 'Successful') return []
  const before = row.old || {}, after = row.new || {}
  return Object.entries(changeLabels).flatMap(([key, label]) => {
    if (!Object.hasOwn(after, key)) return []
    const knownPrevious = Object.hasOwn(before, key)
    const to = knownPrevious && (after[key] === null || after[key] === '') ? 'Cleared' : changeValue(key, after[key])
    const from = knownPrevious && before[key] === null ? 'Not set' : changeValue(key, before[key])
    if (!to || from === to) return []
    if (Array.isArray(row.changedFields) && row.changedFields.length && !row.changedFields.includes(key)) return []
    return [{ label, from, to }]
  })
}

// Interpret the recorded feature and method without displaying transport details.
function requestExplanation(row, result) {
  const object = Object.hasOwn(models, row.model) ? models[row.model] : null
  const actions = { create: 'creation', update: 'edit', delete: 'removal', deleteMany: 'bulk removal' }
  const task = Object.hasOwn(actions, row.operation) ? actions[row.operation] : null
  if (object && task) return { action: `${object[0].toUpperCase() + object.slice(1)} ${task}`, description: result === 'Failed' ? `An administrator could not complete the ${object} ${task}. This entry does not confirm whether any changes were saved.` : result === 'Successful' ? `An administrator completed the ${object} ${task} successfully.` : `An administrator requested the ${object} ${task}. Completion is not confirmed.` }
  const route = typeof row.route === 'string' ? row.route : ''
  const writing = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(row.method)
  const features = [
    ['/checkout/quote', 'Cart total calculation', "Customer's shopping cart total was calculated successfully.", 'The shopping cart total could not be calculated.'],
    ['/preview-coupon', 'Coupon check', "The customer's coupon was checked successfully.", 'The selected coupon could not be applied.'],
    ['/verify-otp', 'Customer sign-in', 'Customer signed in successfully.', 'Customer could not log in because verification failed.'],
    ['/send-otp', 'Sign-in code request', 'A customer sign-in code was requested successfully.', 'A customer sign-in code could not be requested.'],
    ['/account/cart', 'Shopping cart', writing ? "Customer's shopping cart was updated successfully." : "Customer's shopping cart was loaded successfully.", writing ? "Customer's shopping cart could not be updated." : "Customer's shopping cart could not be loaded."],
    ['/products', 'Product information', 'Product information was loaded successfully.', 'Product information was requested, but it could not be loaded.'],
    ['/categories', 'Store categories', 'Store categories were loaded successfully.', 'Store categories could not be loaded.'],
    ['/confirm-cod', 'Cash on delivery order', 'The cash on delivery confirmation request completed.', 'Customer could not confirm the cash on delivery order.'],
    ['/checkout', 'Checkout', 'The checkout step completed successfully. This entry alone does not confirm payment.', 'Customer could not proceed to checkout.'],
    ['/addresses', 'Delivery addresses', writing ? 'Customer delivery addresses were updated successfully.' : 'Customer delivery addresses were loaded successfully.', 'Customer delivery addresses could not be processed.'],
    ['/orders', 'Order information', 'Order information was loaded successfully.', 'Order information could not be loaded.'],
    ['/settings', 'Store configuration', 'Store configuration was loaded successfully.', 'Store configuration could not be loaded.'],
    ['/auth', 'Customer sign-in', 'The customer sign-in step completed successfully.', 'The customer sign-in step failed.'],
    ['/health', 'Service availability', 'The store service responded to an availability check.', 'The store service did not complete an availability check.'],
  ]
  const feature = features.find(([part]) => route.includes(part))
  const action = feature?.[1] || 'Store activity'
  let description = row.event === 'request.aborted' ? 'The action was interrupted before it completed.' : result === 'Successful' ? feature?.[2] || 'The requested store action completed successfully; its purpose was not recorded.' : result === 'Failed' ? feature?.[3] || 'The requested store action failed; its purpose was not recorded.' : `An action was recorded in ${action.toLowerCase()}; completion is not confirmed.`
  if (route.includes('/checkout/') && ['paid', 'captured', 'failed', 'pending', 'refunded'].includes(row.paymentStatus)) {
    description = row.paymentStatus === 'failed' ? 'The checkout payment was reported as failed.' : row.paymentStatus === 'pending' ? row.paymentMode === 'cod' ? 'A cash on delivery order was recorded; payment is still pending.' : 'The checkout payment is awaiting confirmation.' : row.paymentStatus === 'refunded' ? 'The checkout payment was reported as refunded.' : 'The checkout payment was confirmed as paid.'
  }
  if (row.origin === 'browser' && route.includes('/checkout/') && !row.paymentStatus && result === 'Successful' && !/quote|preview-coupon/.test(route)) description = 'The checkout step returned information. This browser entry does not establish the payment outcome.'
  return { action, description }
}
function factsFor(row) {
  const values = [row, row.data, row.data?.totals, row.totals].filter(value => value && typeof value === 'object' && !Array.isArray(value))
  const facts = {}
  for (const key of ['productCount', 'itemsTotal', 'discount', 'grandTotal', 'deliveryCharge', 'handlingCharge', 'taxTotal', 'couponCode', 'deliveryOption']) {
    const source = values.find(value => Object.hasOwn(value, key))
    if (source) facts[key] = source[key]
  }
  return facts
}

// Presentation only: facts come from the stored entry. No current prices, balances,
// payment states or historical identities are inferred from today's database records.
export function presentLog(row, names = {}) {
  const result = resultFor(row)
  const failed = result === 'Failed'
  const event = typeof row.event === 'string' ? row.event : ''
  const model = modelFor(row)
  const operation = typeof row.operation === 'string' ? row.operation : event.split('.')[1]
  const object = Object.hasOwn(models, model) ? models[model] : undefined
  const changes = changesFor(row)
  const actor = row.origin === 'browser' ? 'Website visitor (identity not collected)' : names.actor || 'Name not recorded'
  const recordedOrderNo = row.orderNo || (model === 'Order' ? row.new?.orderNo || row.old?.orderNo : null)
  const subject = displayText(row.product) ? `Product: ${displayText(row.product)}` : row.origin === 'browser' && displayText(row.page) ? displayText(row.page) : names.subject || (recordedOrderNo ? `Order ${displayText(recordedOrderNo)}` : model === 'Product' && (row.new?.slug || row.old?.slug) ? 'Product name not recorded' : model === 'Coupon' && (row.new?.code || row.old?.code) ? `Coupon: ${displayText(row.new?.code || row.old?.code)}` : object ? object[0].toUpperCase() + object.slice(1) : 'Not recorded')
  let action = 'Recorded event', description = 'An event was recorded. Its meaning and impact are not available for this event type.'
  const amount = money(row.amountInr)
  const paymentAmount = amount ? ` of ${amount}` : ''
  const paymentOutcome = (state) => {
    if (['paid', 'captured'].includes(state)) return `Payment${paymentAmount} was received successfully.`
    if (failures.has(state)) return `Customer payment${paymentAmount} failed.`
    if (state === 'refunded') return `Payment${paymentAmount} was refunded.`
    return 'The payment is awaiting confirmation.'
  }
  const product = displayText(row.product), page = displayText(row.page)
  if (object && ['request.completed', 'request.aborted', 'request.timing', 'admin.action'].includes(event) && ['create', 'update', 'delete', 'deleteMany'].includes(operation)) {
    ;({ action, description } = requestExplanation(row, result))
  } else if (event === 'website.navigation') {
    action = 'Page opened'
    description = product ? `Customer opened the product page for ${product}.` : page ? `Customer opened the ${page.toLowerCase()} page.` : 'A website page was opened; its name was not recorded.'
  } else if (event === 'cart.added') {
    action = 'Added to cart'; description = product ? `Customer added ${product} to cart.` : 'A product was added to the website cart; its name was not recorded.'
  } else if (event === 'cart.removed') {
    action = 'Removed from cart'; description = product ? `Customer removed ${product} from cart.` : 'A product was removed from the website cart; its name was not recorded.'
  } else if (event === 'cart.quantity.changed') {
    action = 'Cart quantity changed'; description = product && numeric(row.quantity) ? `Customer changed the quantity of ${product} to ${row.quantity}.` : 'A quantity in the website cart changed.'
  } else if (event === 'cart.cleared') {
    action = 'Cart cleared'; description = 'The website cart was cleared.'
  } else if (event === 'coupon.applied' || event === 'coupon.removed' || event === 'coupon.invalidated') {
    action = 'Coupon selection changed'; description = event === 'coupon.applied' ? 'Customer selected a coupon for their cart.' : event === 'coupon.invalidated' ? 'The website cleared a coupon that no longer applied to the cart.' : 'Customer removed a coupon from their cart.'
  } else if (event === 'customer.session.started' || event === 'customer.session.ended') {
    action = 'Website sign-in session'; description = event.endsWith('started') ? 'A customer sign-in session started on the website.' : 'A customer sign-in session ended on the website.'
  } else if (event === 'delivery.selected') {
    action = 'Delivery selected'; description = ['morning', 'express'].includes(row.deliveryOption) ? `Customer selected the ${row.deliveryOption} delivery option.` : 'The website delivery selection changed.'
  } else if (event === 'frontend.api.completed' || event === 'frontend.api.failed') {
    ;({ action, description } = requestExplanation(row, result))
  } else if (event === 'frontend.page.failed' || event === 'website.response.failed') {
    action = 'Page loading failed'; description = page ? `Website failed to load the ${page.toLowerCase()} page.` : 'Website failed to load a page.'
  } else if (event === 'frontend.resource.failed') {
    action = 'Page resource failed'; description = row.resourceKind === 'product image' ? 'Website failed to load a product image.' : 'A resource needed by the website could not be loaded.'
  } else if (event === 'frontend.error' || event === 'frontend.promise.failed') {
    action = 'Website error'; description = page ? `A website error occurred on the ${page.toLowerCase()} page.` : 'A website error occurred.'
  } else if (event === 'website.page.ready') {
    action = 'Page available'; description = page ? `The ${page.toLowerCase()} page was available in the customer's browser when diagnostics were recorded.` : 'A website page was available in the customer’s browser when diagnostics were recorded.'
  } else if (event === 'backend.operation.failed') {
    action = row.route ? requestExplanation(row, result).action : 'Store operation failed'; description = row.route ? requestExplanation(row, result).description : 'An operation needed by the store failed while extra diagnostics were enabled.'
  } else   if (object && ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'].includes(operation)) {
    const verb = operation.startsWith('create') ? 'added' : operation.startsWith('delete') ? 'removed' : 'updated'
    action = `${object[0].toUpperCase() + object.slice(1)} ${verb}`
    if (failed) { action = `${object[0].toUpperCase() + object.slice(1)} change failed`; description = `The ${object} could not be ${verb}.` }
    else if (result !== 'Successful') { action = `${object[0].toUpperCase() + object.slice(1)} change recorded`; description = `An attempt to change the ${object} was recorded. Completion is not confirmed.` }
    else if (operation.endsWith('Many')) description = `${numeric(row.count) ? row.count : 'An unrecorded number of'} records were ${verb}. See the changes below for the recorded summary.`
    else if (model === 'Product' && operation === 'create') description = 'A new product was added to the store.'
    else if (model === 'Product' && operation === 'delete') description = 'A product was removed from the store.'
    else {
      const price = changes.find((change) => change.label === 'Product price' && change.from)
      description = model === 'Product' && price ? `Product price changed from ${price.from} to ${price.to}.` : object.endsWith('settings') || object.endsWith('permissions') ? `${object[0].toUpperCase() + object.slice(1)} were ${verb}.` : `The ${object} was ${verb}.`
      if (model === 'Product' && price) action = 'Product price changed'
    }
  } else if (event === 'Customer.created' || event === 'User.created') {
    action = failed ? 'Account registration failed' : result !== 'Successful' ? 'Account registration recorded' : event === 'Customer.created' ? 'Customer registered' : 'Administrator registered'
    description = failed ? 'Account registration failed.' : result === 'Successful' ? event === 'Customer.created' ? 'A new customer registered.' : 'A new administrator account was created.' : 'Account registration was recorded; completion is not confirmed.'
  } else if (event === 'customer.login' || event === 'admin.login') {
    const person = event === 'admin.login' ? 'An administrator' : 'A customer'
    action = failed ? 'Sign-in failed' : 'Sign-in'
    description = failed ? event === 'customer.login' && /^otp_/.test(row.failureReason || '') ? 'Customer could not log in because verification failed.' : `${person} could not sign in.` : result === 'Successful' ? `${person} signed in.` : 'A sign-in attempt was recorded; completion is not confirmed.'
  } else if (['order.payment.created', 'order.payment.updated'].includes(event)) {
    action = event.endsWith('created') ? 'Order payment recorded' : 'Payment status changed'
    description = paymentOutcome(String(row.status || ''))
    if (!['paid', 'captured', 'refunded', 'pending', 'failed', 'failure'].includes(row.status)) description = 'An order payment record changed. Payment completion is not confirmed by this entry.'
    if (event.endsWith('created') && row.status === 'pending') description = 'An order was created and its payment is pending.'
  } else if (event === 'webhook.received') {
    action = 'Payment notification received'
    const outcome = row.outcome
    if (outcome === 'payment.failed') description = `The payment provider reported that customer payment${paymentAmount} failed.`
    else if (outcome === 'payment.captured') description = `The payment provider reported that payment${paymentAmount} was received successfully.`
    else if (['refund.created', 'refund.processed', 'refund.failed'].includes(outcome)) {
      // Razorpay refund webhook amounts are stored in paise. Other amounts have no assumed unit.
      const refund = money(numeric(row.amount) ? Number(row.amount) / 100 : undefined)
      const part = refund ? ` of ${refund}` : ''
      description = outcome === 'refund.processed' ? `The payment provider reported that a refund${part} was processed.` : outcome === 'refund.failed' ? `The payment provider reported that a refund${part} failed.` : `The payment provider reported that a refund${part} was requested. Completion is pending.`
    } else description = 'A verified payment notification was received. This entry alone does not confirm that an order was paid.'
  } else if (event === 'webhook.completed') {
    action = 'Payment notification processing'
    description = failed ? 'A payment notification could not be processed. This entry does not confirm the payment result.' : row.outcome === 'unmatched' ? 'The payment notification was processed, but no matching order was found.' : row.status === 'ignored' ? 'No order update was made for this notification type.' : row.status === 'success' ? 'The payment notification was processed. Check the order payment entry for its recorded payment status.' : 'Payment notification handling was recorded. Processing completion is not confirmed.'
  } else if (['checkout.request', 'checkout.callback'].includes(event)) {
    action = event === 'checkout.callback' ? 'Payment return checked' : 'Checkout request'
    description = ['paid', 'failed', 'pending', 'refunded'].includes(row.status) ? paymentOutcome(row.status) : failed ? 'A checkout request failed. This entry does not establish whether money was collected.' : result === 'Successful' ? 'A checkout request completed. This entry alone does not confirm payment.' : 'A checkout request was recorded. Its completion and payment outcome are not confirmed.'
  } else if (event.startsWith('razorpay.')) {
    const operations = { 'razorpay.order.create': 'payment order creation', 'razorpay.link.create': 'payment link creation', 'razorpay.lookup': 'payment information lookup', 'razorpay.payment.request': 'payment service request' }
    const task = operations[event]
    action = task ? task[0].toUpperCase() + task.slice(1) : 'Payment service event'
    description = task ? result === 'Pending' ? `A ${task} was started.` : failed ? `The ${task} failed.` : result === 'Successful' ? `The ${task} completed. This does not by itself confirm that payment was received.` : `A ${task} was recorded; completion is not confirmed.` : 'A payment service event was recorded. The recorded information does not explain the exact action.'
    if (event === 'razorpay.lookup' && ['captured', 'authorized', 'failed', 'pending'].includes(row.outcome)) description += ` The provider reported the payment as ${words(row.outcome)}.`
  } else if (event === 'operation.failed' || event === 'process.fatal') {
    const area = { database: 'database', 'database-transaction': 'database transaction', api: 'API', application: 'application', server: 'server', 'checkout-callback': 'payment return handling' }[row.source] || 'application'
    action = event === 'process.fatal' ? 'Server error' : row.route ? requestExplanation(row, result).action : 'Operation failed'
    description = event === 'process.fatal' ? 'The server encountered a fatal error and was scheduled to stop. Requests may have been interrupted.' : row.route ? requestExplanation(row, result).description : `An operation failed in the ${area}. This entry does not record the customer impact.`
  } else if (event === 'email.unconfigured' || event === 'msg91.unconfigured') {
    action = 'Message delivery unavailable'
    description = `${event.startsWith('email') ? 'Email' : 'SMS'} delivery was skipped because the messaging service was not configured.`
  } else if (event === 'debug.change.requested') {
    action = 'Debug logging change requested'; description = typeof row.enabled === 'boolean' ? `An administrator requested to ${row.enabled ? 'enable' : 'disable'} extra diagnostic logging. This entry does not confirm that the setting changed.` : 'An administrator requested a change to debug logging. Completion is not confirmed.'
  } else if (event === 'debug.change.failed') {
    action = 'Debug logging change failed'; description = 'An administrator tried to change debug logging, but the change could not be confirmed as saved.'
  } else if (event === 'debug.enabled' || event === 'debug.disabled') {
    action = 'Debug logging changed'
    description = event.endsWith('enabled') ? 'An administrator enabled extra diagnostic logging for a limited time.' : 'An administrator disabled extra diagnostic logging.'
  } else if (event === 'request.timing') {
    ;({ action, description } = requestExplanation(row, result))
    if (numeric(row.durationMs)) description += ` Processing took ${row.durationMs} milliseconds.`
  } else if (event === 'request.completed' || event === 'request.aborted') {
    ;({ action, description } = requestExplanation(row, result))
  } else if (event === 'admin.action') {
    action = 'Admin action'; description = failed ? 'An administrator request failed. The exact action was not recorded.' : result === 'Successful' ? 'An administrator request completed. The exact action was not recorded.' : 'An administrator request was recorded. Its exact action and completion are not confirmed.'
  } else if (event === 'storage.files.pruned') {
    action = 'Old log files removed'; description = 'Log files were removed to keep log storage within its disk limit.'
  } else if (row.category === 'debug') {
    action = 'Diagnostic event'; description = 'Extra diagnostic information was recorded while debug logging was enabled. This entry does not explain its impact.'
  }
  const context = '' // Transport paths and methods remain in protected server records.
  const presentation = { context, action, description, result, actor, subject, changes, category: Object.hasOwn(categoryLabels, row.category) ? categoryLabels[row.category] : 'Other', reference: displayText(recordedOrderNo) || names.order || '', identityNote: names.actor || names.subject || names.customer ? 'Names are from current records; they may differ from names at the time of the event.' : '', outcomeNote: result === 'Warning' && !row.status ? 'No outcome was recorded.' : '' }
  return { ...presentation, details: readableDetails(row, names, presentation) }
}

const reasonLabels = {
  insufficient_funds: 'The payment account did not have enough funds.',
  payment_declined: 'The payment provider declined the payment.',
  payment_timed_out: 'The payment attempt timed out.',
  invalid_signature: 'The payment notification could not be verified.',
  signature_mismatch: 'The payment notification could not be verified.',
  'outbox-capacity': 'The recovery storage limit was reached.',
  'outbox-schema-unavailable': 'The database setup for automatic log recovery was unavailable.',
  'outbox-database-unavailable': 'The database used for automatic log recovery was unavailable.',
  'previous-snapshot-unavailable': 'The previous values were not recorded.',
  'bulk-summary': 'This entry summarizes a change to several records.',
}
const errorLabels = {
  P2002: 'A value conflicts with an existing record.',
  P2025: 'The record needed for this operation could not be found.',
  P2003: 'A related record prevented this operation.',
  P1001: 'The application could not reach the database.',
  P1000: 'The database did not accept the application connection.',
  RAZORPAY_NOT_CONFIGURED: 'Online payments were not configured.',
  QUOTE_CHANGED: 'The order total changed and needs to be reviewed before payment.',
}
function requestArea(row) {
  if (['request.completed', 'request.aborted', 'request.timing', 'frontend.api.failed', 'frontend.api.completed'].includes(row.event)) return requestExplanation(row, resultFor(row)).action
  const areas = { database: 'Database', 'database-transaction': 'Database transaction', api: 'Website or app service', application: 'Application', server: 'Server', 'checkout-callback': 'Payment return handling', 'payment-recovery': 'Payment confirmation checks', 'payment-link-cancel': 'Payment link cancellation', 'upi-intent': 'UPI payment setup', background: 'Background task' }
  if (Object.hasOwn(areas, row.source)) return areas[row.source]
  const route = typeof row.route === 'string' ? row.route.toLowerCase() : ''
  if (route.includes('verify-otp') || route.includes('send-otp')) return 'Customer sign-in'
  if (route.includes('/checkout/quote') || route === '/quote') return 'Cart price calculation'
  if (route.includes('confirm-cod')) return 'Cash on delivery confirmation'
  if (route.includes('checkout') || route.includes('create-order')) return 'Checkout'
  if (route.includes('addresses')) return 'Delivery addresses'
  if (route.includes('webhook')) return 'Payment notifications'
  if (row.category === 'payment') return 'Payments'
  if (row.category === 'debug') return 'Diagnostic logging'
  if (row.category === 'account') return 'Account registration'
  if (row.category === 'audit') return 'Administration'
  return 'Website or app service'
}
function responseMeaning(value) {
  const labels = { 200: 'The request completed.', 201: 'The requested record was created.', 202: 'The request was accepted for processing.', 204: 'The request completed.', 400: 'Some request information was invalid.', 401: 'Sign-in was required.', 403: 'Access was refused.', 404: 'The requested information was not found.', 409: 'The information changed; review it before trying again.', 422: 'Some supplied information could not be accepted.', 429: 'Too many requests were received.', 499: 'The request ended before a response was completed.' }
  return (Object.hasOwn(labels, value) ? labels[value] : '') || (Number(value) >= 500 ? 'The server could not complete the request.' : Number(value) >= 300 && Number(value) < 400 ? 'The request was redirected.' : '')
}
function readableDetails(row, names, view) {
  const details = []
  const add = (label, value) => { if (typeof value === 'string' && value) details.push({ label, value }) }
  add('Area', requestArea(row))
  const facts = factsFor(row)
  if (numeric(facts.productCount)) add('Products', String(Number(facts.productCount)))
  for (const [key, label] of [['itemsTotal', 'Subtotal'], ['discount', 'Discount'], ['deliveryCharge', 'Delivery charge'], ['handlingCharge', 'Handling charge'], ['taxTotal', 'Tax'], ['grandTotal', 'Final amount']]) if (numeric(facts[key])) add(label, money(facts[key]))
  if (typeof facts.couponCode === 'string' && /^[A-Z][A-Z0-9_-]{0,39}$/.test(facts.couponCode) && displayText(facts.couponCode)) add('Coupon', displayText(facts.couponCode))
  if (['morning', 'express'].includes(facts.deliveryOption)) add('Delivery', facts.deliveryOption === 'morning' ? 'Morning delivery' : 'Express delivery')

  if (displayText(row.page)) add('Website page', displayText(row.page))
  if (row.navigationType) add('Navigation', { initial: 'Opened a website page', client: 'Moved to another page without reloading the website', back_forward: 'Used the browser Back or Forward button' }[row.navigationType])
  if (row.event === 'website.navigation' && !row.httpStatus) add('Page response', 'The browser reported this visit without a separate page-loading result.')
  if (row.origin === 'browser') add('Source', "Reported by the customer's browser. This does not confirm a payment or an administrator’s action.")
  if (typeof row.ip === 'string' && isIP(row.ip)) add('Connection IP', row.ip)
  if (row.event === 'debug.enabled' && row.debugUntil && Number.isFinite(Date.parse(row.debugUntil))) add('Automatic stop', `${new Date(row.debugUntil).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })} IST`)
  if (view.reference) add('Order', `Order ${view.reference}`)
  if (names.customer) add('Customer', names.customer)
  if (row.category !== 'payment' && ['cod', 'online'].includes(row.paymentMode)) add('Payment method', row.paymentMode === 'cod' ? 'Cash on delivery' : 'Online payment')
  if (row.category === 'payment') {
    const refund = row.event === 'webhook.received' && ['refund.created', 'refund.processed', 'refund.failed'].includes(row.outcome)
    const amount = refund && numeric(row.amount) ? money(Number(row.amount) / 100) : money(row.amountInr)
    add(refund ? 'Refund amount' : 'Payment amount', amount || 'Not recorded for this event.')
    add('Payment method', { cod: 'Cash on delivery', online: 'Online payment' }[row.paymentMode])
    add('Collected using', { cash: 'Cash', qr: 'QR code payment' }[row.paymentCollectedAs])
    add('Payment service', row.provider === 'razorpay' || (typeof row.event === 'string' && row.event.startsWith('razorpay.')) ? 'Razorpay' : '')
  }
  if (view.result === 'Pending') add('Progress', responseMeaning(row.httpStatus))
  if (numeric(row.durationMs)) add('Time taken', `${row.durationMs} milliseconds`)
  const recorded = [row, row.data].filter(value => value && typeof value === 'object')
  const reason = recorded.map(value => (Object.hasOwn(failureReasons, value.failureReason) ? failureReasons[value.failureReason] : '') || (Object.hasOwn(reasonLabels, value.reason) ? reasonLabels[value.reason] : '') || (Object.hasOwn(errorLabels, value.code) ? errorLabels[value.code] : '')).find(Boolean)
  if (reason) add(view.result === 'Failed' ? 'Why it failed' : 'Explanation', reason)
  else if (view.result === 'Failed') add('Why it failed', 'The action failed, but the system did not record a specific reason.')
  else if (row.reason) add('Explanation', 'Additional information requires internal review; it is not displayed here.')
  if (row.event === 'webhook.completed' && row.outcome === 'unmatched') add('Affected order', 'No matching order was found for this notification.')
  if (row.event === 'process.fatal') add('Possible impact', 'Requests may have been interrupted when the server stopped.')
  else if (row.category === 'error') add('Impact', 'The affected records or customer impact were not recorded.')
  if (numeric(row.count)) add('Number of records', String(row.count))
  if (row.recoveredAt && Number.isFinite(Date.parse(row.recoveredAt))) add('Log recovery', 'This entry was recovered after a logging interruption. Its original event time is shown.')
  if (view.identityNote) add('About names', view.identityNote)
  if (!details.length) add('Available information', 'Only the event summary was recorded. More detail is not available.')
  return details
}

// Resolve only this page, in batches, after the existing admin authorization check.
// Select names only; never load email, phone, address, credentials or payment data.
export async function enrichLogRows(rows, client) {
  const ids = [...new Set(rows.flatMap((row) => [row.actorId, row.userId, row.customerId, ['User', 'Customer', 'DeliveryPartner'].includes(modelFor(row)) ? row.resourceId : null]).filter((id) => typeof id === 'string' && id.length <= 100))]
  const productIds = [...new Set(rows.filter((row) => (modelFor(row)) === 'Product').map((row) => row.resourceId).filter(Boolean))]
  const orderNos = [...new Set(rows.map((row) => row.orderNo || ((modelFor(row)) === 'Order' ? row.new?.orderNo || row.old?.orderNo : null)).filter((value) => typeof value === 'string' && value.length <= 100))]
  const orderIds = [...new Set(rows.map((row) => row.orderId || ((modelFor(row)) === 'Order' ? row.resourceId : null)).filter(Boolean))]
  const lookup = async (model, keys, select) => {
    if (!keys.length) return []
    try { return await client[model].findMany({ where: { id: { in: keys } }, select }) } catch { return [] }
  }
  const [users, customers, partners, products, orders] = await Promise.all([
    lookup('user', ids, { id: true, name: true }), lookup('customer', ids, { id: true, name: true }), lookup('deliveryPartner', ids, { id: true, name: true }), lookup('product', productIds, { id: true, name: true }), (async () => {
      if (!orderIds.length && !orderNos.length) return []
      try { return await client.order.findMany({ where: { OR: [{ id: { in: orderIds } }, { orderNo: { in: orderNos } }] }, select: { id: true, orderNo: true, customer: { select: { name: true } } } }) } catch { return [] }
    })(),
  ])
  const people = new Map()
  for (const [kind, entries] of [['Administrator', users], ['Customer', customers], ['Delivery partner', partners]]) for (const person of entries) {
    const list = people.get(person.id) || []
    list.push({ kind, name: displayText(person.name) }); people.set(person.id, list)
  }
  const person = (id, kind) => {
    const matches = (people.get(id) || []).filter((entry) => !kind || entry.kind === kind)
    return matches.length === 1 && matches[0].name ? `${matches[0].name} (${matches[0].kind})` : ''
  }
  const productNames = new Map(products.map((item) => [item.id, displayText(item.name)]))
  const orderById = new Map(orders.map((item) => [item.id, item]))
  const orderByNo = new Map(orders.map((item) => [item.orderNo, item]))
  return rows.map((row) => {
    const model = modelFor(row)
    const actorKind = row.event === 'admin.login' || row.category === 'audit' ? 'Administrator' : row.event === 'customer.login' ? 'Customer' : null
    let subject = model === 'Product' && productNames.get(row.resourceId) ? `Product: ${productNames.get(row.resourceId)}` : ''
    if (model === 'User' || model === 'Customer' || model === 'DeliveryPartner') subject = person(row.resourceId || row.userId, { User: 'Administrator', Customer: 'Customer', DeliveryPartner: 'Delivery partner' }[model])
    const order = orderById.get(row.orderId || (model === 'Order' ? row.resourceId : null)) || orderByNo.get(row.orderNo || row.new?.orderNo || row.old?.orderNo)
    const orderNo = displayText(order?.orderNo)
    if (orderNo) subject = `Order ${orderNo}`
    if (!subject && row.customerId) subject = person(row.customerId, 'Customer')
    return { ...row, presentation: presentLog(row, { actor: person(row.actorId, actorKind), subject, order: orderNo, customer: person(row.customerId, 'Customer') || displayText(order?.customer?.name) }) }
  })
}
