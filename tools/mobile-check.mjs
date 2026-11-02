import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
const url = process.argv[2] ?? 'https://3layersdev.github.io/depozit-secondhand-3d/'
mkdirSync('shots/mobile', { recursive: true })
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'shell',
  args: ['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
const errs = []
page.on('pageerror', e => errs.push(e.message))
page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,120)) })
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
await new Promise(r => setTimeout(r, 6000))
const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
for (const [i, f] of [0, 0.2, 0.45, 0.62, 0.86, 1].entries()) {
  await page.evaluate(y => window.scrollTo(0, y), max * f)
  await new Promise(r => setTimeout(r, 2200))
  await page.screenshot({ path: `shots/mobile/m${i}.png` })
}
const overflow = await page.evaluate(() => ({
  docW: document.documentElement.scrollWidth,
  winW: innerWidth,
  wide: Array.from(document.querySelectorAll('*')).filter(el => el.getBoundingClientRect().width > innerWidth + 2).slice(0, 5).map(el => el.className || el.tagName),
}))
console.log(JSON.stringify(overflow))
console.log(errs.length ? 'ERRORS: ' + [...new Set(errs)].join(' | ') : 'clean')
await browser.close()
