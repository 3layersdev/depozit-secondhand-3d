/**
 * Captures the scroll film at exact scene-progress values.
 * The app publishes its internal progress on <html data-p="0.4832">, so we can
 * binary-search a scroll offset for any beat instead of guessing pixel ratios.
 *
 *   node tools/beats.mjs [url] [outDir]
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://127.0.0.1:4176/'
const out = process.argv[3] ?? 'shots'
const BEATS = process.env.BEATS
  ? process.env.BEATS.split(',').map(Number)
  : [0, 0.08, 0.16, 0.24, 0.31, 0.38, 0.44, 0.47, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8, 0.86, 0.92, 1]

mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console] ${m.text()}`)
})

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForFunction(() => document.documentElement.dataset.p !== undefined, { timeout: 30000 })
await new Promise((r) => setTimeout(r, 1500))

const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)

for (const beat of BEATS) {
  let lo = 0
  let hi = max
  for (let i = 0; i < 14; i += 1) {
    const mid = (lo + hi) / 2
    await page.evaluate((y) => window.scrollTo(0, y), mid)
    await new Promise((r) => setTimeout(r, 90))
    const p = await page.evaluate(() => Number(document.documentElement.dataset.p))
    if (p < beat) lo = mid
    else hi = mid
  }
  await new Promise((r) => setTimeout(r, 700))
  const tag = String(Math.round(beat * 100)).padStart(3, '0')
  await page.screenshot({ path: `${out}/b${tag}.png` })
  const p = await page.evaluate(() => document.documentElement.dataset.p)
  console.log(`b${tag} -> p=${p}`)
}

if (errors.length) console.log('ERRORS\n' + errors.join('\n'))
else console.log('no console errors')
await browser.close()
