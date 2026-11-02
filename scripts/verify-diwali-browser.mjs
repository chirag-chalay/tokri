import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../docs/diwali-2026/after')
const animationDir = path.resolve(__dirname, '../docs/diwali-2026/animation')
fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(animationDir, { recursive: true })

const viewports = [
  { width: 320, height: 568, name: '320-small-mobile' },
  { width: 360, height: 800, name: '360-android-mobile' },
  { width: 390, height: 844, name: '390-standard-mobile' },
  { width: 430, height: 932, name: '430-large-mobile' },
  { width: 768, height: 1024, name: '768-tablet-portrait' },
  { width: 1024, height: 768, name: '1024-tablet-landscape' },
  { width: 1440, height: 900, name: '1440-desktop' },
  { width: 1920, height: 1080, name: '1920-large-desktop' },
]

async function run() {
  console.log('=== STARTING TOKRIII ANIMATED DIWALI NAVBAR BROWSER AUDIT ===\n')

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  // 1. Verify Default state (Live starting Nov 2)
  console.log('--- 1. Testing Default Schedule (Nov 2, Live Today) ---')
  const defaultPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await defaultPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
  const defaultNavDiwali = await defaultPage.locator('[data-testid="diwali-navbar-atmosphere"]').count()
  console.log(`Default schedule Diwali navbar atmosphere count: ${defaultNavDiwali}`)
  assert.equal(defaultNavDiwali, 1, 'Diwali navbar atmosphere MUST be active and visible in header')

  // Verify that the old separate Diwali greeting banner is COMPLETELY REMOVED
  const oldGreeting = await defaultPage.locator('text=Happy Diwali from Tokriii').count()
  const oldEyebrow = await defaultPage.locator('text=Festival of Lights').count()
  console.log(`Old separate greeting banner count: ${oldGreeting}, old eyebrow: ${oldEyebrow}`)
  assert.equal(oldGreeting, 0, 'Old separate Diwali greeting text MUST be removed')
  assert.equal(oldEyebrow, 0, 'Old separate Festival of Lights banner MUST be removed')

  // Verify Big Hero Banner is present, directly below the header
  const heroLink = await defaultPage.locator('section a[aria-label="Shop all"]').count()
  const heroImg = await defaultPage.locator('section a[aria-label="Shop all"] img').first()
  const imgWidth = await heroImg.evaluate((img) => img.naturalWidth)
  console.log(`Big hero banner image naturalWidth: ${imgWidth}px`)
  assert.ok(heroLink >= 1, 'Big hero banner link MUST be present directly below navbar')
  assert.ok(imgWidth > 0, 'Big hero banner image MUST be loaded and non-empty')
  await defaultPage.close()
  console.log('✓ Diwali navbar atmosphere live, old banner removed, hero banner intact (PASS)')

  // 2. Verify Inner Page Persistence (/shop)
  console.log('\n--- 2. Testing Inner Page Persistence (/shop) ---')
  const shopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await shopPage.goto('http://127.0.0.1:3000/shop', { waitUntil: 'networkidle' })
  const shopNavDiwali = await shopPage.locator('[data-testid="diwali-navbar-atmosphere"]').count()
  assert.equal(shopNavDiwali, 1, 'Diwali navbar atmosphere MUST persist on inner page /shop')
  await shopPage.screenshot({ path: path.join(outputDir, 'inner-page-shop-navbar.png') })
  await shopPage.close()
  console.log('✓ Inner page /shop displays animated Diwali navbar (PASS)')

  // 3. Verify Before Schedule Date (?diwali_date=2026-11-01)
  console.log('\n--- 3. Testing Date Before Schedule (?diwali_date=2026-11-01) ---')
  const beforePage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await beforePage.goto('http://127.0.0.1:3000/?diwali_date=2026-11-01', { waitUntil: 'networkidle' })
  const beforeDiwali = await beforePage.locator('[data-testid="diwali-navbar-atmosphere"]').count()
  assert.equal(beforeDiwali, 0, 'Navbar atmosphere MUST NOT render before start date')
  await beforePage.close()
  console.log('✓ Inactive before schedule (PASS)')

  // 4. Verify Manual Disable (?diwali=0)
  console.log('\n--- 4. Testing Manual Disable (?diwali=0) ---')
  const offPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await offPage.goto('http://127.0.0.1:3000/?diwali=0', { waitUntil: 'networkidle' })
  const offDiwali = await offPage.locator('[data-testid="diwali-navbar-atmosphere"]').count()
  assert.equal(offDiwali, 0, 'Navbar atmosphere MUST NOT render when forced off')
  const offHero = await offPage.locator('section a[aria-label="Shop all"]').count()
  assert.ok(offHero >= 1, 'Big hero banner MUST remain visible when diwali is disabled')
  await offPage.close()
  console.log('✓ Manual disable parameter ?diwali=0 respected, navbar returns to standard (PASS)')

  // 5. Verify Simulated Date after expiration (?diwali_date=2026-11-15)
  console.log('\n--- 5. Testing Simulated Expiration Date (?diwali_date=2026-11-15) ---')
  const expPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await expPage.goto('http://127.0.0.1:3000/?diwali_date=2026-11-15', { waitUntil: 'networkidle' })
  const expDiwali = await expPage.locator('[data-testid="diwali-navbar-atmosphere"]').count()
  assert.equal(expDiwali, 0, 'Navbar atmosphere MUST NOT render after 12 Nov')
  await expPage.close()
  console.log('✓ Simulated expiration 2026-11-15 deactivates automatically (PASS)')

  // 6. Verify All 8 Viewports with Live Diwali Navbar
  console.log('\n--- 6. Testing Live Storefront across all 8 Viewports ---')
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })

    const diwaliElem = page.locator('[data-testid="diwali-navbar-atmosphere"]').first()
    assert.equal(await diwaliElem.count(), 1, `Diwali navbar atmosphere must be present at ${vp.width}px`)

    // Verify Tokriii logo is clearly present
    const logoImg = page.locator('header a[aria-label="Tokriii Home"] img, header a[to="/"] img').first()
    assert.ok(await logoImg.count() >= 1, `Tokriii logo must be present at ${vp.width}px`)

    // Verify header element
    const headerElem = page.locator('header.sticky').first()
    assert.ok(await headerElem.count() >= 1, `Sticky header must be present at ${vp.width}px`)

    // Verify big hero banner is loaded
    const bannerImg = page.locator('section a[aria-label="Shop all"] img').first()
    assert.ok(await bannerImg.count() >= 1, `Hero banner must be present at ${vp.width}px`)
    const naturalWidth = await bannerImg.evaluate((img) => img.naturalWidth)
    assert.ok(naturalWidth > 0, `Hero banner image natural width must be > 0 at ${vp.width}px`)

    // Capture screenshots
    await headerElem.screenshot({ path: path.join(outputDir, `${vp.name}-festive-navbar.png`) })
    await page.screenshot({ path: path.join(outputDir, `${vp.name}-festive-full.png`), fullPage: false })

    console.log(`  ✓ Captured ${vp.name} (${vp.width}x${vp.height}) with Animated Diwali Navbar: PASS`)
    await page.close()
  }

  // 7. Accessibility & Reduced Motion Test
  console.log('\n--- 7. Testing Accessibility (prefers-reduced-motion) ---')
  const a11yPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  await a11yPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
  const flameAnim = await a11yPage.evaluate(() => {
    const el = document.querySelector('[class*="flameElement"], [class*="flameFlicker"]')
    if (!el) return null
    return window.getComputedStyle(el).animationName
  })
  console.log(`Navbar flame animation with reduced-motion: "${flameAnim}"`)
  assert.equal(flameAnim, 'none', 'Navbar flame animation must be "none" when prefers-reduced-motion is active')
  await a11yPage.screenshot({ path: path.join(outputDir, 'navbar-reduced-motion-preview.png') })
  await a11yPage.close()
  console.log('✓ Accessibility reduced-motion rule verified (PASS)')

  // 8. Capture Festive OFF comparison screenshots (at 1920px, 1440px, and 390px)
  console.log('\n--- 8. Capturing Festive OFF Comparison Screenshots ---')
  for (const item of [
    { width: 1920, height: 1080, name: '1920-large-desktop' },
    { width: 1440, height: 900, name: '1440-desktop' },
    { width: 390, height: 844, name: '390-standard-mobile' },
  ]) {
    const p = await browser.newPage({ viewport: { width: item.width, height: item.height } })
    await p.goto('http://127.0.0.1:3000/?diwali=0', { waitUntil: 'networkidle' })
    await p.screenshot({ path: path.join(outputDir, `${item.name}-navbar-off.png`), fullPage: false })
    const offHeader = p.locator('header.sticky').first()
    if (await offHeader.count()) {
      await offHeader.screenshot({ path: path.join(outputDir, `${item.name}-header-off.png`) })
    }
    await p.close()
  }
  console.log('✓ Captured OFF comparison screenshots')

  // 9. Capture sequential frames of the navbar diya flame animation and compile GIF
  console.log('\n--- 9. Capturing Navbar Living Diya Flame Animation Frames ---')
  const animPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await animPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
  const diyaElem = animPage.locator('[class*="desktopLeftDiya"]').first()
  for (let i = 0; i < 8; i++) {
    await diyaElem.screenshot({ path: path.join(animationDir, `flame-frame-${i + 1}.png`) })
    await new Promise((r) => setTimeout(r, 200))
  }
  await animPage.close()
  console.log('✓ Captured 8 animation demonstration frames in docs/diwali-2026/animation/')

  try {
    execSync(`convert -delay 20 -loop 0 ${path.join(animationDir, 'flame-frame-*.png')} ${path.join(animationDir, 'diwali-flame-animation.gif')}`)
    execSync(`convert -delay 20 -loop 0 ${path.join(animationDir, 'flame-frame-*.png')} ${path.join(animationDir, 'diwali-navbar-flame-animation.gif')}`)
    console.log('✓ Generated diwali-navbar-flame-animation.gif via ImageMagick')
  } catch (err) {
    console.warn('Could not compile gif via convert:', err.message)
  }

  await browser.close()
  console.log('\n============================================================')
  console.log('ALL DIWALI NAVBAR AUDIT TESTS PASSED!')
  console.log('============================================================')
}

run().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
