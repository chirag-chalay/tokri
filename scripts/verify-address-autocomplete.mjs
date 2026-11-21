import assert from 'node:assert/strict'
import { writeFile, unlink } from 'node:fs/promises'
import { chromium } from 'playwright-core'
// Start server/scripts/verify-address-server.js and Vite on the ports below.
// Account/address routes use real handlers with isolated in-memory storage.
const origin = process.env.TOKRIII_TEST_SITE || 'http://127.0.0.1:5249'
const api = process.env.TOKRIII_TEST_API || 'http://127.0.0.1:5253'
for (const url of [origin, api]) assert.ok(['127.0.0.1', 'localhost'].includes(new URL(url).hostname))
const { user } = await (await fetch(`${api}/test-session`)).json()
assert.equal(user.id, 'address-browser-test', 'Only the isolated fixture server is allowed')
const html = new URL('../.address-verification.html', import.meta.url)
const entry = new URL('../.address-verification.jsx', import.meta.url)
await writeFile(html, '<html><meta name="viewport" content="width=device-width, initial-scale=1"><div id="root"></div><script type="module" src="/.address-verification.jsx"></script></html>')
await writeFile(entry, `import React from 'react'
import { createRoot } from 'react-dom/client'
import AddressFormModal from './src/components/account/AddressFormModal'
import PincodeAutocomplete from './src/components/account/PincodeAutocomplete'
import { authPost } from './src/lib/api'
import './src/index.css'
const user=${JSON.stringify(user)}
const root = createRoot(document.getElementById('root'))
function ControlledPin() { const [value,setValue] = React.useState(''); React.useEffect(()=>{window.updateTestPin=setValue},[]); return <PincodeAutocomplete value={value} onChange={setValue}/> }
window.testControlledPin = () => root.render(<ControlledPin/>)
root.render(<React.StrictMode><AddressFormModal initial={{name:user.name,phone:user.phone,line1:'',line2:'',city:'',state:'',pincode:''}} onClose={() => {}} onSave={async form => { window.savedAddress = (await authPost('/account/addresses',user,form)).address }} /></React.StrictMode>)`)
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true })
try {
  let index = 0
  const subnet = process.pid % 255
  for (const [name, width, height, touch] of [['desktop',1440,1000,false],['tablet',768,1024,true],['mobile',375,812,true],['narrow',320,640,true]]) {
    await fetch(`${api}/test-reset`, { method: 'POST' })
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch,
      extraHTTPHeaders: { 'X-Forwarded-For': `198.18.${subnet}.${++index}` } })
    const page = await context.newPage(), errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${origin}/.address-verification.html`)
    const search = page.getByRole('combobox', { name: 'Search address' })
    const pin = page.getByRole('combobox', { name: 'Pincode' })
    const house = page.getByLabel('House / Flat / Plot Number', { exact: true })
    const locality = page.getByLabel('Sector / Locality', { exact: true })
    const options = page.getByRole('option')
    const choose = async (query, match) => {
      await search.fill(query)
      const option = options.filter({ hasText: match }).first()
      await option.waitFor()
      if(touch) await option.tap(); else await option.click()
    }
    // Regression: chosen label synchronizes without a new search/pincode popup.
    await choose('Galleria', 'Galleria DLF Phase IV')
    assert.match(await search.inputValue(), /^Galleria DLF Phase IV,/)
    assert.equal(await page.getByLabel('Building / Society', { exact: true }).inputValue(), 'Galleria Market')
    assert.equal(await locality.inputValue(), 'DLF Phase IV')
    assert.equal(await pin.inputValue(), '122009')
    assert.equal(await search.getAttribute('aria-expanded'), 'false')
    assert.equal(await pin.getAttribute('aria-expanded'), 'false')
    await page.waitForTimeout(400)
    assert.equal(await options.count(), 0, 'Programmatic label and pincode updates stay closed')
    await choose('Plot 25 Sector 46', 'Sector 46')
    assert.equal(await house.inputValue(), 'Plot 25')
    assert.equal(await pin.inputValue(), '122003')
    assert.equal(await locality.inputValue(), 'Sector 46')
    await page.getByText('Morning Delivery', { exact: true }).waitFor()
    await house.fill('House 42-A')
    await page.getByLabel('Floor / Tower / Portion', { exact: true }).fill('2nd floor, rear portion')
    await choose('Sector 56 Gurgaon', 'Sector 56')
    assert.equal(await house.inputValue(), 'House 42-A')
    assert.equal(await locality.inputValue(), 'Sector 56')
    assert.equal(await pin.inputValue(), '122011')
    await page.getByText('Same Day Delivery', { exact: true }).waitFor()
    assert.equal(await page.getByText('Morning Delivery', { exact: true }).count(), 0)
    await choose('DLF Phase 3', 'DLF Phase III')
    assert.equal(await pin.inputValue(), '122010')
    await page.getByText("We don't deliver to this pincode yet. You can edit your address.", { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Save changes', exact: true }).click()
    await page.getByText("We don't deliver to this pincode yet.", { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => Boolean(window.savedAddress)), false)
    await choose('House 42 Sector 15', 'Sector 15')
    assert.equal(await pin.inputValue(), '')
    assert.equal(await house.inputValue(), 'House 42-A')
    await choose('Golf Course Road', 'Golf Course Road')
    assert.equal(await pin.inputValue(), '')
    assert.equal(await page.getByLabel('Street / Block', { exact: true }).inputValue(), 'Golf Course Road')
    await choose('Amity International', 'Amity International School')
    assert.equal(await page.getByLabel('Building / Society', { exact: true }).inputValue(), 'Amity International School')
    await choose('122002', 'Chakkarpur')
    assert.equal(await pin.inputValue(), '122002')
    // Previous automatic building and road are cleared, customer premise retained.
    assert.equal(await page.getByLabel('Building / Society', { exact: true }).inputValue(), '')
    assert.equal(await page.getByLabel('Street / Block', { exact: true }).inputValue(), '')
    await search.fill('Invented Society XYZ')
    await page.getByText('No matching verified address found. Enter your address manually.', { exact: true }).waitFor()
    await search.fill('Flat 304 DLF')
    await options.first().waitFor()
    assert.ok(await options.count() <= 8)
    await search.press('ArrowDown'); await search.press('Enter')
    assert.equal(await options.count(), 0)
    assert.equal(await house.inputValue(), 'House 42-A')
    await search.fill('Sector')
    await options.first().waitFor()
    assert.ok(await page.locator('mark').count() > 0, 'Query highlighting')
    // Visual viewport keyboard emulation, including viewport scroll offsets.
    await page.evaluate(() => {
      Object.defineProperty(window.visualViewport,'height',{configurable:true,get:()=>350})
      Object.defineProperty(window.visualViewport,'offsetTop',{configurable:true,get:()=>20})
    })
    await page.waitForTimeout(120)
    await search.evaluate(el => {
      const panel = el.closest('[data-address-scroll]'), viewport = window.visualViewport
      const bottom = Math.min(panel.getBoundingClientRect().bottom, viewport.offsetTop + viewport.height - 4)
      panel.scrollTop += el.getBoundingClientRect().bottom - (bottom - 12)
      viewport.dispatchEvent(new Event('resize'))
    })
    await page.waitForTimeout(50)
    const box = await page.getByRole('listbox').locator('..').boundingBox(), field = await search.boundingBox()
    assert.ok(box.y >= 20 && box.y + box.height <= 371, `${name} visible viewport: ${JSON.stringify(box)}`)
    assert.ok(box.y + box.height <= field.y + 1, `${name} drop-up`)
    assert.ok(box.x >= 0 && box.x + box.width <= width)
    const footer = await page.locator('[data-address-footer]').boundingBox()
    const header = await page.locator('[data-address-header]').boundingBox()
    assert.ok(box.y >= header.y + header.height - 1, 'Dropdown stays below modal header')
    assert.ok(box.y + box.height <= footer.y + 1, 'Dropdown stays above Save footer')
    assert.ok(field.y + field.height <= footer.y + 1, 'Focused field stays visible above Save footer')
    assert.ok(await page.getByRole('listbox').evaluate(el => el.scrollHeight > el.clientHeight), 'Options genuinely overflow and scroll')
    // Keyboard navigation scrolls the options only, without moving the modal.
    const beforeScroll = await page.locator('[data-address-scroll]').evaluate(el => el.scrollTop)
    for (let step=0; step<7; step++) await search.press('ArrowDown')
    assert.equal(await page.locator('[data-address-scroll]').evaluate(el => el.scrollTop), beforeScroll)
    await page.getByRole('listbox').evaluate(el => { el.scrollTop = el.scrollHeight })
    await page.getByRole('listbox').hover()
    const documentScroll = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 500)
    await page.waitForTimeout(50)
    assert.equal(await page.locator('[data-address-scroll]').evaluate(el => el.scrollTop), beforeScroll)
    assert.equal(await page.evaluate(() => window.scrollY), documentScroll)
    await page.screenshot({path:`/tmp/tokri-full-address-${name}.png`})
    await search.press('Escape')
    assert.equal(await search.getAttribute('aria-expanded'),'false')
    // Slow API, loading, stale-response protection and failure/manual fallback.
    let release
    const held = new Promise(resolve => { release=resolve })
    const slow = async route => {
      if(route.request().postDataJSON().query==='slow') { await held; return route.fulfill({json:{suggestions:[{id:'old',label:'Old response'}]}}) }
      return route.continue()
    }
    await page.route('**/addresses/search',slow)
    await search.fill('slow')
    await page.getByText('Searching addresses…',{exact:true}).waitFor()
    // Wait past debounce so the old request is genuinely in flight.
    await page.waitForTimeout(400)
    await search.fill('Sector 46')
    await options.first().waitFor()
    release(); await page.waitForTimeout(100)
    assert.equal(await options.filter({hasText:'Old response'}).count(),0)
    await page.unroute('**/addresses/search',slow)
    await page.route('**/addresses/search',route=>route.fulfill({status:503,json:{message:'Test outage'}}))
    await search.fill('Offline search')
    await page.getByText('Could not search addresses. Enter your address manually.',{exact:true}).waitFor()
    await house.fill('Plot 25-B')
    await page.getByLabel('Building / Society', { exact: true }).fill('')
    await locality.fill('Sector 46')
    await pin.fill('012345')
    assert.equal(await pin.evaluate(el=>el.validity.valid),false)
    await pin.fill('122003')
    await page.getByRole('button',{name:'Save changes',exact:true}).click()
    await page.waitForFunction(()=>Boolean(window.savedAddress))
    const saved = await page.evaluate(()=>window.savedAddress)
    assert.equal(saved.houseNumber,'Plot 25-B')
    assert.equal(saved.floor,'2nd floor, rear portion')
    assert.equal(saved.locality,'Sector 46')
    assert.equal(saved.line1,'Plot 25-B, 2nd floor, rear portion')
    assert.equal(saved.addressDetailsVersion,1)
    const persisted = await (await context.request.get(`${api}/api/v1/account/addresses`,{headers:{Authorization:`Bearer ${user.token}`}})).json()
    assert.equal(persisted.addresses[0].houseNumber,'Plot 25-B')
    await page.evaluate(() => {
      delete window.visualViewport.height
      delete window.visualViewport.offsetTop
      window.testControlledPin()
    })
    await pin.fill('1')
    await options.first().waitFor()
    await page.evaluate(() => window.updateTestPin('122003'))
    assert.equal(await pin.getAttribute('aria-expanded'), 'false')
    await page.waitForTimeout(100)
    assert.equal(await options.count(), 0, 'Programmatic pincode update closes an existing dropdown')
    await pin.fill('122')
    await options.first().waitFor()
    if(touch) await options.first().tap(); else await options.first().click()
    assert.equal(await pin.getAttribute('aria-expanded'), 'false')
    assert.deepEqual(errors,[])
    console.log(`${name}: real search/availability/authenticated save, all query types, exact premises, no-match, failure, stale requests and keyboard drop-up passed`)
    await context.close()
  }
  for (const [width,height] of [[1440,1000],[768,1024],[375,812],[320,640]]) {
    await fetch(`${api}/test-reset`,{method:'POST'})
    const context = await browser.newContext({viewport:{width,height},extraHTTPHeaders:{'X-Forwarded-For':`198.18.${subnet}.${++index}`}})
    const oldResponse = await context.request.post(`${api}/api/v1/account/addresses`,{headers:{Authorization:`Bearer ${user.token}`},data:{name:user.name,phone:user.phone,line1:'Legacy House 42, Tower B',line2:'Old street, Sector 46',city:'Gurugram',state:'Haryana',pincode:'122003'}})
    assert.equal(oldResponse.status(),201)
    const old = (await oldResponse.json()).address
    const page = await context.newPage(), errors=[]
    page.on('pageerror',error=>errors.push(error.message))
    const item = {slug:'test-fruit',id:'test-fruit',name:'Test fruit',quantity:1,priceValue:300}
    await page.addInitScript(({user,item})=>{
      localStorage.setItem('tokri_user',JSON.stringify(user))
      localStorage.setItem('tokri_cart_v1',JSON.stringify([item]))
    },{user,item})
    await page.route('**/api/v1/**',async route=>{
      const path = new URL(route.request().url()).pathname.replace('/api/v1','')
      if (/^\/(?:addresses\/search|delivery\/|auth\/me|account\/addresses)/.test(path)) return route.continue()
      let json={}
      if(path==='/account/cart') json={cart:{items:[item]}}
      if(path==='/checkout/config') json={codEnabled:true,razorpay:{enabled:false}}
      if(path==='/checkout/quote') json={options:{morning:{title:'Morning Delivery',minimumMet:true,deliveryFee:30},express:{title:'Same Day Delivery',minimumMet:true,deliveryFee:30}},totals:{itemsTotal:300,grandTotal:330,taxTotal:0,discount:0,deliveryCharge:30,handlingCharge:0}}
      await route.fulfill({json})
    })
    await page.goto(`${origin}/checkout`)
    const radios=page.locator('input[name="address"]')
    await radios.first().waitFor()
    assert.equal(await radios.first().isChecked(),true)
    await page.getByRole('button',{name:'Add new address',exact:true}).click()
    await page.getByLabel('House / Flat / Plot Number',{exact:true}).fill('Plot 25-A')
    await page.getByLabel('Floor / Tower / Portion',{exact:true}).fill('Rear portion')
    await page.getByRole('combobox',{name:'Search address'}).fill('Sector 56 Gurgaon')
    await page.getByRole('option').filter({hasText:'Sector 56'}).first().click()
    const savedResponse=page.waitForResponse(r=>r.url().endsWith('/account/addresses')&&r.request().method()==='POST')
    await page.getByRole('button',{name:'Save address',exact:true}).click()
    assert.equal((await savedResponse).status(),201)
    await page.waitForFunction(()=>document.querySelectorAll('input[name=address]').length===2)
    await page.waitForFunction(()=>document.querySelectorAll('input[name=address]')[1].checked)
    await page.waitForFunction(()=>document.querySelectorAll('input[name=deliveryOption]')[0].disabled)
    assert.equal(await page.locator('input[name=deliveryOption]').last().isEnabled(),true)
    await radios.first().check()
    await page.waitForFunction(()=>!document.querySelectorAll('input[name=deliveryOption]')[0].disabled)
    assert.equal(await page.locator('input[name=deliveryOption]').last().isDisabled(),true)
    // Saved-address edit round-trip through real authenticated PUT and GET.
    await page.goto(`${origin}/account?section=addresses`)
    await page.getByRole('heading',{name:'My addresses',exact:true}).waitFor()
    await page.getByRole('button',{name:'Address options',exact:true}).last().click()
    await page.getByRole('menuitem',{name:'Edit',exact:true}).click()
    assert.equal(await page.getByLabel('House / Flat / Plot Number',{exact:true}).inputValue(),'Plot 25-A')
    assert.equal(await page.getByLabel('Floor / Tower / Portion',{exact:true}).inputValue(),'Rear portion')
    await page.getByLabel('Floor / Tower / Portion',{exact:true}).fill('2nd floor, rear portion')
    const updatedResponse=page.waitForResponse(r=>r.url().includes('/account/addresses/')&&r.request().method()==='PUT')
    await page.getByRole('button',{name:'Save changes',exact:true}).click()
    assert.equal((await updatedResponse).status(),200)
    const after = await (await context.request.get(`${api}/api/v1/account/addresses`,{headers:{Authorization:`Bearer ${user.token}`}})).json()
    assert.equal(after.addresses[1].floor,'2nd floor, rear portion')
    assert.equal(after.addresses[0].line1,old.line1)
    assert.equal(after.addresses[0].line2,old.line2)
    assert.equal(after.addresses[0].addressDetailsVersion,undefined)
    // Opening an old address must retain its entire original lines.
    await page.getByRole('button',{name:'Address options',exact:true}).first().click()
    await page.getByRole('menuitem',{name:'Edit',exact:true}).click()
    assert.equal(await page.getByLabel('House / Flat / Plot Number',{exact:true}).inputValue(),old.line1)
    assert.equal(await page.getByLabel('Street / Block',{exact:true}).inputValue(),old.line2)
    await page.getByRole('button',{name:'Close',exact:true}).click()
    await page.getByRole('button').filter({hasText:'Legacy House 42'}).first().click()
    await page.getByRole('heading',{name:'Select delivery address',exact:true}).waitFor()
    await page.getByRole('button',{name:'Add new address',exact:true}).last().click()
    await page.getByRole('combobox',{name:'Search address'}).fill('Adarsh Nagar Delhi')
    await page.getByRole('option').filter({hasText:'Adarsh Nagar'}).first().click()
    assert.equal(await page.getByRole('combobox',{name:'Pincode'}).inputValue(),'110033')
    assert.equal(await page.getByLabel('City',{exact:true}).inputValue(),'Delhi')
    await page.getByRole('button',{name:'Close',exact:true}).click()
    assert.deepEqual(errors,[])
    console.log(`${width}px: authenticated checkout add/save/switch, eligibility controls, saved-address edit and legacy address preservation passed; pricing transport stubbed, no order/payment`)
    await context.close()
  }

} finally {
  await browser.close()
  await Promise.all([unlink(html),unlink(entry)])
}
