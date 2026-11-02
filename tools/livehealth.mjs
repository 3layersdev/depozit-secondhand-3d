import puppeteer from 'puppeteer-core'
const urls = [
  'https://3layersdev.github.io/depozit-secondhand-3d/?qa=1',
  'https://3layersdev.github.io/depozit-secondhand-3d-noir/?qa=1',
]
const b = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
})
for (const u of urls) {
  const pg = await b.newPage()
  await pg.setViewport({ width: 1440, height: 900 })
  const errs = []
  pg.on('pageerror', (e) => errs.push(String(e).slice(0, 90)))
  pg.on('console', (m) => {
    if (m.type() === 'error') errs.push(m.text().slice(0, 90))
  })
  await pg.goto(u, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 6000))
  const st = await pg.evaluate(() => ({
    canvas: !!document.querySelector('canvas'),
    p: document.documentElement.dataset.p,
    slats: (window.__qa || {}).slats,
    truck: (window.__qa || {}).truckZ,
  }))
  const clean = errs.filter((e) => !/autoplay|AudioContext/i.test(e))
  console.log(u.split('/')[3], JSON.stringify(st), 'erori:', clean.slice(0, 2).join(' | ') || 'niciuna')
  await pg.close()
}
await b.close()
