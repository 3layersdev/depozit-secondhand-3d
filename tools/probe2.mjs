import puppeteer from 'puppeteer-core'
const args = process.env.ARGS ? process.env.ARGS.split(' ') : []
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'shell',
  args: ['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars', ...args] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const logs = []
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`))
await page.goto('http://127.0.0.1:4176/?qa=1', { waitUntil: 'domcontentloaded' })
await new Promise(r => setTimeout(r, 6000))
const info = await page.evaluate(() => ({
  canvas: !!document.querySelector('canvas'),
  fallback: !!document.querySelector('.fallback'),
  appClass: document.querySelector('.app')?.className,
  gl: (()=>{try{const c=document.createElement('canvas');const g=c.getContext('webgl2')||c.getContext('webgl');return !!g}catch(e){return 'err'}})(),
  loader: !!document.querySelector('.loader'),
  p: document.documentElement.dataset.p,
}))
console.log(JSON.stringify(info))
console.log(logs.slice(0,6).join('\n'))
await browser.close()
