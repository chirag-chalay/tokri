import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../docs/diwali-2026/after')
const animationDir = path.resolve(__dirname, '../docs/diwali-2026/animation')
fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(animationDir, { recursive: true })

const viewports = [
  { width: 320, height: 600, name: '320-small-mobile' },
  { width: 360, height: 640, name: '360-android-mobile' },
  { width: 390, height: 844, name: '390-standard-mobile' },
  { width: 430, height: 932, name: '430-large-mobile' },
  { width: 768, height: 1024, name: '768-tablet-portrait' },
  { width: 1024, height: 768, name: '1024-tablet-landscape' },
  { width: 1440, height: 900, name: '1440-desktop' },
  { width: 1920, height: 1080, name: '1920-large-desktop' },
]

async function run() {
  console.log('=== STARTING TOKRIII DIWALI 2026 BROWSER AUDIT & CAPTURE ===\n')

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  // 1. Verify Default state (before schedule start date Nov 3)
  console.log('--- 1. Testing Default Schedule (Nov 2, before festival window) ---')
  const defaultPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await defaultPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
  const defaultDiwali = await defaultPage.locator('[data-testid="diwali-atmosphere"]').count()
  console.log(`Default schedule Diwali element count: ${defaultDiwali}`)
  assert.equal(defaultDiwali, 0, 'Diwali element MUST NOT render before 3 Nov 00:00 IST')
  await defaultPage.close()
  console.log('✓ Default schedule is clean and unpolluted before Nov 3 (PASS)')

  // 2. Verify Manual Disable (?diwali=0)
  console.log('\n--- 2. Testing Manual Disable (?diwali=0) ---')
  const offPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await offPage.goto('http://127.0.0.1:3000/?diwali=0', { waitUntil: 'networkidle' })
  const offDiwali = await offPage.locator('[data-testid="diwali-atmosphere"]').count()
  assert.equal(offDiwali, 0, 'Diwali element MUST NOT render when forced off')
  await offPage.close()
  console.log('✓ Manual disable parameter ?diwali=0 respected (PASS)')

  // 3. Verify Simulated Date within schedule (?diwali_date=2026-11-08)
  console.log('\n--- 3. Testing Simulated Festival Date (?diwali_date=2026-11-08) ---')
  const datePage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await datePage.goto('http://127.0.0.1:3000/?diwali_date=2026-11-08', { waitUntil: 'networkidle' })
  const dateDiwali = await datePage.locator('[data-testid="diwali-atmosphere"]').count()
  assert.equal(dateDiwali, 1, 'Diwali element MUST render on simulated festival date 2026-11-08')
  await datePage.close()
  console.log('✓ Simulated date 2026-11-08 activates Diwali atmosphere (PASS)')

  // 4. Verify Simulated Date after expiration (?diwali_date=2026-11-15)
  console.log('\n--- 4. Testing Simulated Expiration Date (?diwali_date=2026-11-15) ---')
  const expPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await expPage.goto('http://127.0.0.1:3000/?diwali_date=2026-11-15', { waitUntil: 'networkidle' })
  const expDiwali = await expPage.locator('[data-testid="diwali-atmosphere"]').count()
  assert.equal(expDiwali, 0, 'Diwali element MUST NOT render on simulated date after 12 Nov')
  await expPage.close()
  console.log('✓ Simulated expiration 2026-11-15 deactivates automatically (PASS)')

  // 5. Verify Preview Mode across all 8 Viewports
  console.log('\n--- 5. Testing Preview Mode (?diwali=preview) across all 8 Viewports ---')
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto('http://127.0.0.1:3000/?diwali=preview', { waitUntil: 'networkidle' })

    const diwaliElem = page.locator('[data-testid="diwali-atmosphere"]').first()
    assert.equal(await diwaliElem.count(), 1, `Diwali element must be present at ${vp.width}px`)

    // Verify greeting text
    const greeting = await page.locator('text=Happy Diwali from Tokriii').count()
    assert.ok(greeting >= 1, `Greeting text must be present at ${vp.width}px`)

    // Verify diya SVG is present
    const diya = await page.locator('svg[aria-label="Golden Diya"]').count()
    assert.ok(diya >= 1, `Diya SVG must be present at ${vp.width}px`)

    // Verify hero section captures
    const heroSection = page.locator('section.mt-4, section.mt-6').first()
    if (await heroSection.count()) {
      await heroSection.screenshot({ path: path.join(outputDir, `${vp.name}-festive-hero.png`) })
    }
    await page.screenshot({ path: path.join(outputDir, `${vp.name}-festive-full.png`), fullPage: false })

    console.log(`  ✓ Captured ${vp.name} (${vp.width}x${vp.height}): PASS`)
    await page.close()
  }

  // 6. Accessibility & Reduced Motion Test
  console.log('\n--- 6. Testing Accessibility (prefers-reduced-motion) ---')
  const a11yPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  await a11yPage.goto('http://127.0.0.1:3000/?diwali=preview', { waitUntil: 'networkidle' })
  const flameAnim = await a11yPage.evaluate(() => {
    const el = document.querySelector('[class*="flameElement"]')
    if (!el) return null
    return window.getComputedStyle(el).animationName
  })
  console.log(`Flame animation with reduced-motion: "${flameAnim}"`)
  assert.equal(flameAnim, 'none', 'Flame animation must be "none" when prefers-reduced-motion is active')
  await a11yPage.screenshot({ path: path.join(outputDir, 'reduced-motion-preview.png') })
  await a11yPage.close()
  console.log('✓ Accessibility reduced-motion rule verified (PASS)')

  // 7. Capture sequential frames of the flame animation for demonstration
  console.log('\n--- 7. Capturing Flame Flicker Animation Frames ---')
  const animPage = await browser.newPage({ viewport: { width: 800, height: 350 } })
  await animPage.goto('http://127.0.0.1:3000/?diwali=preview', { waitUntil: 'networkidle' })
  const diwaliHero = animPage.locator('[data-testid="diwali-atmosphere"]').first()
  for (let i = 0; i < 8; i++) {
    await diwaliHero.screenshot({ path: path.join(animationDir, `flame-frame-${i + 1}.png`) })
    await new Promise((r) => setTimeout(r, 200))
  }
  await animPage.close()
  console.log('✓ 8 animation demonstration frames captured in docs/diwali-2026/animation/')

  await browser.close()
  console.log('\n============================================================')
  console.log('ALL DIWALI BROWSER & AUDIT TESTS PASSED!')
  console.log('============================================================')
}

run().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
