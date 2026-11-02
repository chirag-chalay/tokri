import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../docs/diwali-2026/after')
const animationDir = path.resolve(__dirname, '../docs/diwali-2026/animation')
const artifactDir = '/home/gaurav/.gemini/antigravity-cli/brain/3f3db14e-91f4-4b4d-bf94-998995d13889/screenshots/diwali'

fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(animationDir, { recursive: true })
fs.mkdirSync(path.join(artifactDir, 'after'), { recursive: true })
fs.mkdirSync(path.join(artifactDir, 'animation'), { recursive: true })

const viewports = [
  { width: 320, height: 568, name: '320-small-mobile' },
  { width: 360, height: 800, name: '360-android-mobile' },
  { width: 375, height: 812, name: '375-iphone-mini' },
  { width: 390, height: 844, name: '390-standard-mobile' },
  { width: 400, height: 874, name: '400-pixel-mobile' },
  { width: 430, height: 932, name: '430-large-mobile' },
  { width: 768, height: 1024, name: '768-tablet-portrait' },
  { width: 1024, height: 768, name: '1024-tablet-landscape' },
  { width: 1440, height: 900, name: '1440-desktop' },
  { width: 1920, height: 1080, name: '1920-large-desktop' },
]

async function run() {
  console.log('=== STARTING TOKRIII DIWALI 2026 MOBILE DIYAS & HERO WINGS AUDIT ===\n')

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  // 1. Verify Default state (Live starting Nov 2)
  console.log('--- 1. Testing Default Schedule (Nov 2, Live Today) ---')
  const defaultPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await defaultPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })

  // Diwali navbar atmosphere
  const defaultNavDiwali = await defaultPage.locator('[data-testid="diwali-navbar-atmosphere"]').count()
  console.log(`Default schedule Diwali navbar atmosphere count: ${defaultNavDiwali}`)
  assert.equal(defaultNavDiwali, 1, 'Diwali navbar atmosphere MUST be active and visible in header')

  // Diwali hero atmosphere (Left and Right Hero Diyas)
  const defaultHeroDiwali = await defaultPage.locator('[data-testid="diwali-atmosphere"]').count()
  console.log(`Default schedule Diwali hero atmosphere count: ${defaultHeroDiwali}`)
  assert.equal(defaultHeroDiwali, 1, 'Diwali hero atmosphere MUST be present around hero banner')

  const leftWing = await defaultPage.locator('[class*="leftWing"]').count()
  const rightWing = await defaultPage.locator('[class*="rightWing"]').count()
  console.log(`Hero leftWing count: ${leftWing}, rightWing count: ${rightWing}`)
  assert.ok(leftWing >= 1, 'Hero left wing diya MUST be present')
  assert.ok(rightWing >= 1, 'Hero right wing diya MUST be present')

  // Verify that the old separate Diwali greeting card strip remains COMPLETELY REMOVED
  const oldGreeting = await defaultPage.locator('text=Happy Diwali from Tokriii').count()
  const oldEyebrow = await defaultPage.locator('text=Festival of Lights').count()
  console.log(`Old separate greeting banner count: ${oldGreeting}, old eyebrow: ${oldEyebrow}`)
  assert.equal(oldGreeting, 0, 'Old separate Diwali greeting text MUST remain removed')
  assert.equal(oldEyebrow, 0, 'Old separate Festival of Lights banner MUST remain removed')

  // Verify Big Hero Banner is present, directly below the header
  const heroLink = await defaultPage.locator('section a[aria-label="Shop all"]').count()
  const heroImg = await defaultPage.locator('section a[aria-label="Shop all"] img').first()
  const imgWidth = await heroImg.evaluate((img) => img.naturalWidth)
  console.log(`Big hero banner image naturalWidth: ${imgWidth}px`)
  assert.ok(heroLink >= 1, 'Big hero banner link MUST be present directly below navbar')
  assert.ok(imgWidth > 0, 'Big hero banner image MUST be loaded and non-empty')
  await defaultPage.close()
  console.log('✓ Diwali navbar atmosphere live, hero wings intact, old greeting strip removed (PASS)')

  // 2. Verify Inner Page Persistence (/shop)
  console.log('\n--- 2. Testing Inner Page Persistence (/shop) ---')
  const shopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await shopPage.goto('http://127.0.0.1:3000/shop', { waitUntil: 'networkidle' })
  const shopNavDiwali = await shopPage.locator('[data-testid="diwali-navbar-atmosphere"]').count()
  assert.equal(shopNavDiwali, 1, 'Diwali navbar atmosphere MUST persist on inner page /shop')
  await shopPage.screenshot({ path: path.join(outputDir, 'inner-page-shop-navbar.png') })
  await shopPage.close()
  console.log('✓ Inner page /shop displays animated Diwali navbar (PASS)')

  // 3. Verify Manual Disable (?diwali=0)
  console.log('\n--- 3. Testing Manual Disable (?diwali=0) ---')
  const offPage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await offPage.goto('http://127.0.0.1:3000/?diwali=0', { waitUntil: 'networkidle' })
  const offDiwali = await offPage.locator('[data-testid="diwali-navbar-atmosphere"]').count()
  assert.equal(offDiwali, 0, 'Navbar atmosphere MUST NOT render when forced off')
  const offHeroWings = await offPage.locator('[data-testid="diwali-atmosphere"]').count()
  assert.equal(offHeroWings, 0, 'Hero atmosphere MUST NOT render when forced off')
  await offPage.close()
  console.log('✓ Manual disable parameter ?diwali=0 respected (PASS)')

  // 4. Verify All Viewports (Mobile, Tablet, Desktop)
  console.log('\n--- 4. Testing All Viewports with Live Diwali Navbar & Hero Wings ---')
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })

    const diwaliElem = page.locator('[data-testid="diwali-navbar-atmosphere"]').first()
    assert.equal(await diwaliElem.count(), 1, `Diwali navbar atmosphere must be present at ${vp.width}px`)

    const headerElem = page.locator('header.sticky').first()
    assert.ok(await headerElem.count() >= 1, `Sticky header must be present at ${vp.width}px`)

    // Verify horizontal scrolling does not occur
    const overflowInfo = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    assert.ok(
      overflowInfo.scrollWidth <= overflowInfo.clientWidth + 1,
      `Horizontal overflow detected at ${vp.width}px: scrollWidth ${overflowInfo.scrollWidth} > clientWidth ${overflowInfo.clientWidth}`
    )

    // Verify navbar diyas are visible depending on breakpoint:
    if (vp.width < 640) {
      // Mobile phones: mobileLeftDiya & mobileRightDiya
      const mLeft = page.locator('[class*="mobileLeftDiya"]').first()
      const mRight = page.locator('[class*="mobileRightDiya"]').first()
      assert.ok(await mLeft.isVisible(), `Mobile left diya MUST be visible at ${vp.width}px`)
      assert.ok(await mRight.isVisible(), `Mobile right diya MUST be visible at ${vp.width}px`)

      const mLeftBox = await mLeft.boundingBox()
      const mRightBox = await mRight.boundingBox()
      console.log(`  [${vp.name}] Mobile Left Diya box:`, mLeftBox)
      console.log(`  [${vp.name}] Mobile Right Diya box:`, mRightBox)
      assert.ok(mLeftBox && mLeftBox.width >= 24, `Mobile left diya width must be >= 24px at ${vp.width}px`)
      assert.ok(mRightBox && mRightBox.width >= 24, `Mobile right diya width must be >= 24px at ${vp.width}px`)
    } else if (vp.width < 1024) {
      // Tablet: tabletLeftDiya & tabletRightDiya
      const tLeft = page.locator('[class*="tabletLeftDiya"]').first()
      const tRight = page.locator('[class*="tabletRightDiya"]').first()
      assert.ok(await tLeft.isVisible(), `Tablet left diya MUST be visible at ${vp.width}px`)
      assert.ok(await tRight.isVisible(), `Tablet right diya MUST be visible at ${vp.width}px`)
    } else {
      // Desktop: desktopLeftDiya & desktopRightDiya
      const dLeft = page.locator('[class*="desktopLeftDiya"]').first()
      const dRight = page.locator('[class*="desktopRightDiya"]').first()
      assert.ok(await dLeft.isVisible(), `Desktop left diya MUST be visible at ${vp.width}px`)
      assert.ok(await dRight.isVisible(), `Desktop right diya MUST be visible at ${vp.width}px`)
    }

    // Verify Tokriii logo is present and visible (wordmark or symbol)
    const logoImg = page.locator('header a[href="/"] img:visible, header a[aria-label*="Tokriii"] img:visible').first()
    assert.ok(await logoImg.isVisible(), `Tokriii logo must be visible at ${vp.width}px`)

    // Verify Search Box is usable and visible
    const searchInput = page.locator('header input[type="text"]:visible').first()
    assert.ok(await searchInput.isVisible(), `Search input must be visible at ${vp.width}px`)

    // Verify Big hero banner is loaded
    const bannerImg = page.locator('section a[aria-label="Shop all"] img').first()
    assert.ok(await bannerImg.count() >= 1, `Hero banner must be present at ${vp.width}px`)

    // Capture screenshots
    await headerElem.screenshot({ path: path.join(outputDir, `${vp.name}-festive-navbar.png`) })
    await page.screenshot({ path: path.join(outputDir, `${vp.name}-festive-full.png`), fullPage: false })

    console.log(`  ✓ Verified & Captured ${vp.name} (${vp.width}x${vp.height}): PASS`)
    await page.close()
  }

  // 5. Accessibility & Reduced Motion Test
  console.log('\n--- 5. Testing Accessibility (prefers-reduced-motion) ---')
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

  // 6. Capture Festive OFF comparison screenshots
  console.log('\n--- 6. Capturing Festive OFF Comparison Screenshots ---')
  for (const item of [
    { width: 1920, height: 1080, name: '1920-large-desktop' },
    { width: 1440, height: 900, name: '1440-desktop' },
    { width: 390, height: 844, name: '390-standard-mobile' },
    { width: 320, height: 568, name: '320-small-mobile' },
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

  // 7. Capture sequential frames of the mobile diya flame animation and compile GIF
  console.log('\n--- 7. Capturing Living Diya Flame Animation Frames ---')
  const animPage = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await animPage.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
  const diyaElem = animPage.locator('[class*="mobileLeftDiya"]').first()
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

  // Copy all assets to artifact directory
  try {
    execSync(`cp -r ${outputDir}/* ${path.join(artifactDir, 'after/')}`)
    execSync(`cp -r ${animationDir}/* ${path.join(artifactDir, 'animation/')}`)
    console.log('✓ Mirrored all screenshots to artifact directory')
  } catch (err) {
    console.warn('Could not mirror screenshots:', err.message)
  }

  await browser.close()
  console.log('\n============================================================')
  console.log('ALL DIWALI NAVBAR & HERO WINGS AUDIT TESTS PASSED!')
  console.log('============================================================')
}

run().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
