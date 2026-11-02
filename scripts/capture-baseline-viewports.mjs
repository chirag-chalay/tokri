import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { chromium } from 'playwright-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../docs/diwali-2026/before')
fs.mkdirSync(outputDir, { recursive: true })

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
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })

    const heroSection = await page.locator('section.mt-6').first()
    if (await heroSection.count()) {
      await heroSection.screenshot({ path: path.join(outputDir, `${vp.name}-hero.png`) })
    }
    await page.screenshot({ path: path.join(outputDir, `${vp.name}-full.png`), fullPage: false })
    await page.close()
    console.log(`Captured baseline: ${vp.name}`)
  }

  await browser.close()
  console.log('All baseline viewports successfully captured in docs/diwali-2026/before/')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
