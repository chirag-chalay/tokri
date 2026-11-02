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
  console.log('=== STARTING TOKRIII DIWALI 2026 & HERO BANNER BROWSER AUDIT ===\n')

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  // 1. Verify Default state (Now active starting Nov 2)
  console.log('--- 1. Testing Default Schedule (Nov 2, Live Today) ---')
  const defaultPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await defaultPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
  const defaultDiwali = await defaultPage.locator('[data-testid="diwali-atmosphere"]').count()
  console.log(`Default schedule Diwali element count: ${defaultDiwali}`)
  assert.equal(defaultDiwali, 1, 'Diwali element MUST be active and visible today on Nov 2')

  // Verify Big Hero Banner is present and sharp
  const heroLink = await defaultPage.locator('section a[aria-label="Shop all"]').count()
  const heroImg = await defaultPage.locator('section a[aria-label="Shop all"] img').first()
  const imgWidth = await heroImg.evaluate((img) => img.naturalWidth)
  console.log(`Big hero banner image naturalWidth: ${imgWidth}px`)
  assert.ok(heroLink >= 1, 'Big hero banner link MUST be present')
  assert.ok(imgWidth > 0, 'Big hero banner image MUST be loaded and non-empty')
  await defaultPage.close()
  console.log('✓ Default schedule is live today AND big hero banner is crisp and present (PASS)')

  // 2. Verify Before Schedule Date (?diwali_date=2026-11-01)
  console.log('\n--- 2. Testing Date Before Schedule (?diwali_date=2026-11-01) ---')
  const beforePage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await beforePage.goto('http://127.0.0.1:3000/?diwali_date=2026-11-01', { waitUntil: 'networkidle' })
  const beforeDiwali = await beforePage.locator('[data-testid="diwali-atmosphere"]').count()
  assert.equal(beforeDiwali, 0, 'Diwali element MUST NOT render before start date')
  await beforePage.close()
  console.log('✓ Inactive before schedule (PASS)')

  // 3. Verify Manual Disable (?diwali=0)
  console.log('\n--- 3. Testing Manual Disable (?diwali=0) ---')
  const offPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await offPage.goto('http://127.0.0.1:3000/?diwali=0', { waitUntil: 'networkidle' })
  const offDiwali = await offPage.locator('[data-testid="diwali-atmosphere"]').count()
  assert.equal(offDiwali, 0, 'Diwali element MUST NOT render when forced off')
  // Ensure big banner remains visible even when diwali is forced off
  const offHero = await offPage.locator('section a[aria-label="Shop all"]').count()
  assert.ok(offHero >= 1, 'Big hero banner MUST remain visible when diwali is disabled')
  await offPage.close()
  console.log('✓ Manual disable parameter ?diwali=0 respected, banner intact (PASS)')

  // 4. Verify Simulated Date after expiration (?diwali_date=2026-11-15)
  console.log('\n--- 4. Testing Simulated Expiration Date (?diwali_date=2026-11-15) ---')
  const expPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await expPage.goto('http://127.0.0.1:3000/?diwali_date=2026-11-15', { waitUntil: 'networkidle' })
  const expDiwali = await expPage.locator('[data-testid="diwali-atmosphere"]').count()
  assert.equal(expDiwali, 0, 'Diwali element MUST NOT render on simulated date after 12 Nov')
  await expPage.close()
  console.log('✓ Simulated expiration 2026-11-15 deactivates automatically (PASS)')

  // 5. Verify All 8 Viewports with Live Diwali + Big Banner
  console.log('\n--- 5. Testing Live Storefront across all 8 Viewports ---')
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })

    const diwaliElem = page.locator('[data-testid="diwali-atmosphere"]').first()
    assert.equal(await diwaliElem.count(), 1, `Diwali element must be present at ${vp.width}px`)

    // Verify greeting text
    const greeting = await page.locator('text=Happy Diwali from Tokriii').count()
    assert.ok(greeting >= 1, `Greeting text must be present at ${vp.width}px`)

    // Verify diya SVG is present
    const diya = await page.locator('svg[aria-label="Golden Diya"]').count()
    assert.ok(diya >= 1, `Diya SVG must be present at ${vp.width}px`)

    // Verify big hero banner is loaded
    const bannerImg = page.locator('section a[aria-label="Shop all"] img').first()
    assert.ok(await bannerImg.count() >= 1, `Hero banner must be present at ${vp.width}px`)
    const naturalWidth = await bannerImg.evaluate((img) => img.naturalWidth)
    assert.ok(naturalWidth > 0, `Hero banner image natural width must be > 0 at ${vp.width}px`)

    // Capture screenshots
    const heroSection = page.locator('section.mt-4, section.mt-6').first()
    if (await heroSection.count()) {
      await heroSection.screenshot({ path: path.join(outputDir, `${vp.name}-festive-hero.png`) })
    }
    await page.screenshot({ path: path.join(outputDir, `${vp.name}-festive-full.png`), fullPage: false })

    console.log(`  ✓ Captured ${vp.name} (${vp.width}x${vp.height}) with Diwali + Big Banner: PASS`)
    await page.close()
  }

  // 6. Accessibility & Reduced Motion Test
  console.log('\n--- 6. Testing Accessibility (prefers-reduced-motion) ---')
  const a11yPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  await a11yPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
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

  await browser.close()
  console.log('\n============================================================')
  console.log('ALL DIWALI & BIG HERO BANNER AUDIT TESTS PASSED!')
  console.log('============================================================')
}

run().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
