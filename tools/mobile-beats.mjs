import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
const url = process.argv[2] ?? 'http://127.0.0.1:4176/?qa=1'
const out = process.argv[3] ?? 'shots-m'
const BEATS = (process.env.BEATS ?? '0.02,0.2,0.42,0.6,0.85').split(',').map(Number)
mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'] })
const p = await b.newPage()
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await p.waitForFunction(() => document.documentElement.dataset.p !== undefined, { timeout: 30000 })
await new Promise((r) => setTimeout(r, 2000))
const max = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
for (const beat of BEATS) {
  let lo = 0, hi = max
  for (let i = 0; i < 14; i += 1) {
    const mid = (lo + hi) / 2
    await p.evaluate((y) => window.scrollTo(0, y), mid)
    await new Promise((r) => setTimeout(r, 90))
    const cp = await p.evaluate(() => Number(document.documentElement.dataset.p))
    if (cp < beat) lo = mid; else hi = mid
  }
  await p.evaluate((y) => window.scrollTo(0, y), hi)
  await new Promise((r) => setTimeout(r, 2200))
  const name = `${out}/m${String(Math.round(beat * 100)).padStart(3, '0')}.png`
  await p.screenshot({ path: name })
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(name, 'p=', (await p.evaluate(() => document.documentElement.dataset.p)), 'hOverflow=', overflow)
}
const imgs = await p.evaluate(() => [...document.querySelectorAll('img')].map((i) => ({ s: i.currentSrc || i.src, w: i.naturalWidth })))
console.log('imgs', imgs.length, 'broken', imgs.filter((i) => !i.w).length)
console.log(errors.length ? errors.slice(0, 4) : 'no console errors')
await b.close()
