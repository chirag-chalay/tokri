import assert from 'node:assert/strict'
import { writeFile, unlink } from 'node:fs/promises'
import { chromium } from 'playwright-core'
const origin = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:5247'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
const root = new URL('../', import.meta.url)
const html = new URL('.pincode-verification.html', root), entry = new URL('.pincode-verification.jsx', root)
await writeFile(html, '<html><meta name="viewport" content="width=device-width, initial-scale=1"><div id="root"></div><script type="module" src="/.pincode-verification.jsx"></script></html>')
await writeFile(entry, `import React from 'react'
import { createRoot } from 'react-dom/client'
import AddressFormModal from './src/components/account/AddressFormModal'
import './src/index.css'
createRoot(document.getElementById('root')).render(<AddressFormModal initial={{ name: 'Test customer', phone: '9999900000', line1: 'Test house', line2: 'Test street', city: 'Test city', state: 'Test state', pincode: '' }} onClose={() => {}} onSave={async form => { window.savedAddress = form }} />)`)
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true })
try {
  for (const [name, width, height, touch] of [['desktop', 1440, 1000, false], ['tablet', 768, 1024, true], ['mobile', 375, 812, true], ['narrow', 320, 640, true]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch })
    const page = await context.newPage(), errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${origin}/.pincode-verification.html`)
    const pin = page.getByRole('combobox', { name: 'Pincode' }), options = page.getByRole('option')
    const request = page.waitForResponse(r => r.url().includes('/delivery/pincodes?q=1'))
    await pin.fill('1')
    const response = await request
    assert.equal(response.status(), 200)
    const { suggestions } = await response.json()
    assert.ok(suggestions.length > 0)
    await options.first().waitFor()
    assert.equal(await options.count(), suggestions.length)
    assert.equal(suggestions.find(r => r.pincode === '110092')?.areaLabel, '')
    assert.equal(suggestions.find(r => r.pincode === '110033')?.areaLabel, 'Adarsh Nagar')
    assert.equal(await pin.evaluate(el => el.validity.valid), false)
    await pin.press('ArrowDown'); await pin.press('Enter')
    assert.equal(await pin.inputValue(), suggestions[0].pincode)
    assert.equal(await options.count(), 0)
    assert.equal(await pin.evaluate(el => el.validity.valid), true)
    await pin.fill('122')
    await options.first().waitFor()
    if (touch) await options.first().tap()
    else await options.first().click()
    assert.match(await pin.inputValue(), /^122[0-9]{3}$/)
    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.waitForFunction(() => Boolean(window.savedAddress))
    assert.equal(await page.evaluate(() => window.savedAddress.pincode), await pin.inputValue())
    assert.equal(await page.evaluate(() => window.savedAddress.line1), 'Test house')
    await pin.fill('999999')
    await page.getByText('No serviceable pincode found', { exact: true }).waitFor()
    await pin.press('Escape')
    assert.equal(await pin.getAttribute('aria-expanded'), 'false')
    // Simulated keyboard viewport; does not open a physical OS keyboard.
    await page.evaluate(() => {
      Object.defineProperty(window.visualViewport, 'height', { configurable: true, get: () => 350 })
      Object.defineProperty(window.visualViewport, 'offsetTop', { configurable: true, get: () => 0 })
    })
    await pin.fill('1')
    await page.evaluate(() => {
      const el = document.querySelector('[role=combobox][aria-label=Pincode]')
      el.closest('.overflow-y-auto').scrollTop += el.getBoundingClientRect().top - 270
      window.visualViewport.dispatchEvent(new Event('resize'))
    })
    await options.first().waitFor()
    await page.waitForTimeout(150)
    const box = await page.getByRole('listbox').locator('..').boundingBox(), field = await pin.boundingBox()
    assert.ok(box.y >= -1 && box.y + box.height <= 351, `${name}: keyboard bounds ${JSON.stringify(box)}`)
    assert.ok(box.y + box.height <= field.y + 1, `${name}: opens above keyboard`)
    assert.ok(box.x >= 0 && box.x + box.width <= width, `${name}: horizontal fit`)
    await page.screenshot({ path: `/tmp/tokri-pincode-${name}.png` })
    // Slow and out-of-order responses must not replace newer results.
    let releaseOld
    const oldResponse = new Promise(resolve => { releaseOld = resolve })
    const delayed = async route => {
      const query = new URL(route.request().url()).searchParams.get('q')
      if (query === '12') {
        await oldResponse
        await route.fulfill({ json: { suggestions: [{ pincode: '122003', areaLabel: 'Sector 45' }] } })
      } else await route.fulfill({ json: { suggestions: [{ pincode: '110033', areaLabel: 'Adarsh Nagar' }] } })
    }
    await page.route('**/delivery/pincodes?*', delayed)
    await pin.fill('12')
    await page.getByText('Loading pincodes…', { exact: true }).waitFor()
    await pin.fill('110')
    await page.getByRole('option').filter({ hasText: '110033' }).waitFor()
    releaseOld()
    await page.waitForTimeout(100)
    assert.equal(await options.count(), 1)
    assert.match(await options.first().innerText(), /110033/)
    await page.unroute('**/delivery/pincodes?*', delayed)
    await page.route('**/delivery/pincodes?*', route => route.fulfill({ status: 503, json: { message: 'Test outage' } }))
    await pin.fill('12')
    await page.getByText('Could not load pincodes. You can enter your pincode manually.', { exact: true }).waitFor()
    await pin.fill('122003')
    assert.equal(await pin.inputValue(), '122003')
    assert.deepEqual(errors, [])
    console.log(`${name}: live API, first digit, keyboard/touch selection, form save, no-match, failure, drop-up and viewport bounds passed`)
    await context.close()
  }
  // Exercise the real checkout page with intercepted account/cart writes. Pincode
  // suggestions still use the actual local API and configured database records.
  for (const width of [1440, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } })
    const page = await context.newPage()
    const user = { id: 'browser-test', phone: '9999900000', name: 'Test customer', token: 'test-only' }
    const item = { slug: 'test-fruit', id: 'test-fruit', name: 'Test fruit', quantity: 1, priceValue: 300 }
    const eligibility = { serviceable: true, defaultOption: 'morning', morning: { enabled: true }, express: { enabled: false } }
    let addresses = [{ id: 'old', label: 'Home', formatted: 'Existing address', pincode: '122003', serviceable: true, delivery: eligibility }]
    let saved
    const option = { title: 'Morning Delivery', minimumMet: true, deliveryFee: 30 }
    const quote = { options: { morning: option, express: { ...option, title: 'Same Day Delivery' } }, totals: { itemsTotal: 300, taxTotal: 0, discount: 0, deliveryCharge: 30, handlingCharge: 0, grandTotal: 330 } }
    await page.addInitScript(({ user, item }) => {
      localStorage.setItem('tokri_user', JSON.stringify(user))
      localStorage.setItem('tokri_cart_v1', JSON.stringify([item]))
    }, { user, item })
    await page.route('**/api/v1/**', async route => {
      const request = route.request(), path = new URL(request.url()).pathname.replace('/api/v1', '')
      if (path === '/delivery/pincodes') return route.continue()
      let json = {}
      if (path === '/auth/me') json = { user }
      if (path === '/account/cart') json = { cart: { items: [item] } }
      if (path === '/checkout/config') json = { codEnabled: true, razorpay: { enabled: false } }
      if (path === '/checkout/quote') json = quote
      if (path === '/account/addresses') {
        if (request.method() === 'POST') {
          saved = request.postDataJSON()
          const address = { ...saved, id: 'new', formatted: `Selected ${saved.pincode}`, serviceable: true, delivery: eligibility }
          addresses = [...addresses, address]
          json = { address }
        } else json = { addresses }
      }
      await route.fulfill({ json })
    })
    await page.goto(`${origin}/checkout`)
    await page.getByRole('heading', { name: 'Delivery address', exact: true }).waitFor()
    await page.locator('input[name="address"]').first().waitFor()
    assert.equal(await page.locator('input[name="address"]').first().isChecked(), true)
    await page.getByRole('button', { name: 'Add new address', exact: true }).click()
    const form = page.locator('#address-form')
    await form.getByPlaceholder('Receiver name').fill('Test customer')
    await form.getByLabel('House / Flat / Plot Number', { exact: true }).fill('Test house')
    await form.getByLabel('Street / Block', { exact: true }).fill('Test street')
    // Existing form labels predate this change and do not use htmlFor.
    await form.getByLabel('City', { exact: true }).fill('Gurgaon')
    await form.getByLabel('State', { exact: true }).fill('Haryana')
    await page.getByRole('combobox', { name: 'Pincode' }).fill('122003')
    await page.getByRole('option').first().click()
    await page.getByRole('button', { name: 'Save address', exact: true }).click()
    await page.getByText('Selected 122003', { exact: true }).waitFor()
    assert.equal(saved.pincode, '122003')
    assert.equal(await page.locator('input[name="address"]').last().isChecked(), true)
    assert.equal(await page.locator('input[name="deliveryOption"]').first().isEnabled(), true)
    assert.equal(await page.locator('input[name="deliveryOption"]').last().isDisabled(), true)
    await page.locator('input[name="address"]').first().check()
    assert.equal(await page.locator('input[name="address"]').first().isChecked(), true)
    console.log(`checkout ${width}px: add via autocomplete, address save/selection and Morning/Same Day controls passed (account/cart/quote mocked; no order placed)`)
    await context.close()
  }

} finally {
  await browser.close()
  await Promise.all([unlink(html), unlink(entry)])
}
