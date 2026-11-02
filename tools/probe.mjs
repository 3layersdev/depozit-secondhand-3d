import puppeteer from 'puppeteer-core'
const args = process.argv.slice(2)
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', ...args],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800 })
const logs = []
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 45000 })
await new Promise(r => setTimeout(r, 5000))
const info = await page.evaluate(() => ({
  html: document.getElementById('root')?.innerHTML.slice(0, 300),
  gl: (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch (e) { return 'err:' + e.message } })(),
  loaderText: document.querySelector('.loader')?.textContent,
  canvas: !!document.querySelector('canvas'),
}))
console.log(JSON.stringify(info, null, 1))
console.log(logs.join('\n'))
await browser.close()
