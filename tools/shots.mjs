import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const PORT = process.env.PORT || '4175'
const MODE = process.argv[2] || 'scene' // scene | ui
const OUT = MODE === 'ui' ? 'shots-ui' : 'shots'
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
})
const page = await browser.newPage()
const vp = process.env.VP === 'mobile' ? { width: 400, height: 860 } : { width: 1440, height: 900 }
await page.setViewport({ ...vp, deviceScaleFactor: 1, isMobile: process.env.VP === 'mobile' })
const logs = []
page.on('console', (m) => { if (m.type() === 'error') logs.push(`[${m.type()}] ${m.text()}`) })
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))

await page.goto(`http://127.0.0.1:${PORT}/?qa=1`, { waitUntil: 'domcontentloaded', timeout: 45000 })
await new Promise((r) => setTimeout(r, 7000))

if (MODE === 'scene') {
  await page.evaluate(() => {
    for (const sel of ['.track', '.header', '.rail', '.veil']) {
      const el = document.querySelector(sel)
      if (el) el.style.display = 'none'
    }
  })
}

const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
const readP = () => page.evaluate(() => Number(document.documentElement.dataset.p || 0))
const scrollTo = async (y) => {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await new Promise((r) => setTimeout(r, 90))
}

async function seek(target) {
  let lo = 0
  let hi = max
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    await scrollTo(mid)
    const p = await readP()
    if (p < target) lo = mid
    else hi = mid
  }
  await scrollTo((lo + hi) / 2)
  await new Promise((r) => setTimeout(r, 1800))
  return readP()
}

const targets = (process.env.TARGETS || '0.02,0.12,0.2,0.3,0.4,0.46,0.49,0.55,0.61,0.67,0.73,0.79,0.85,0.91,0.97,1')
  .split(',')
  .map(Number)

for (const t of targets) {
  const actual = await seek(t)
  const name = `${OUT}/${MODE}-${String(Math.round(t * 100)).padStart(3, '0')}.png`
  await page.screenshot({ path: name })
  console.log(name, 'p=', actual.toFixed(3))
}
console.log('ERRORS', logs.join(' | ') || 'none')
await browser.close()
