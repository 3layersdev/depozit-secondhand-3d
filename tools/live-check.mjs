import puppeteer from 'puppeteer-core'
const url = process.argv[2] ?? 'https://3layersdev.github.io/depozit-secondhand-3d/'
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'shell',
  args: ['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800 })
const errs = []
page.on('pageerror', e => errs.push(`pageerror: ${e.message}`))
page.on('requestfailed', r => errs.push(`requestfailed: ${r.url().slice(-60)} ${r.failure()?.errorText}`))
page.on('response', r => { if (r.status() >= 400) errs.push(`http${r.status()}: ${r.url().slice(-70)}`) })
page.on('console', m => { if (m.type() === 'error') errs.push(`console: ${m.text().slice(0,160)}`) })
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
await new Promise(r => setTimeout(r, 6000))
const info = await page.evaluate(() => ({
  canvas: !!document.querySelector('canvas'),
  canvasSize: (() => { const c = document.querySelector('canvas'); return c ? `${c.width}x${c.height}` : null })(),
  poster: !!document.querySelector('.stage--fallback'),
  loaderHidden: !!document.querySelector('.loader.is-hidden'),
  imgs: Array.from(document.images).filter(i => i.currentSrc).length,
  broken: Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.slice(-30)),
  thumbs: document.querySelectorAll('.thumb').length,
}))
console.log(JSON.stringify(info, null, 1))
// scroll through the film and grab two frames
for (const [name, frac] of [['live-mid', 0.42], ['live-end', 0.98]]) {
  await page.evaluate(f => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), frac)
  await new Promise(r => setTimeout(r, 2500))
  await page.screenshot({ path: `shots/${name}.png` })
}
console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'clean: no console errors, no failed requests')
await browser.close()
