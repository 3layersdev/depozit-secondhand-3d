import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
})
for (const url of [
  'https://3layersdev.github.io/depozit-secondhand-3d/',
  'https://3layersdev.github.io/depozit-secondhand-3d-noir/',
]) {
  const pg = await b.newPage()
  await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
  const errs = []
  pg.on('pageerror', (e) => errs.push(e.message.slice(0, 70)))
  await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 6000))
  const res = []
  for (const frac of [0, 0.5, 1]) {
    await pg.evaluate(async (f) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(max * f))
      await new Promise((r) => setTimeout(r, 1200))
    }, frac)
    res.push(
      await pg.evaluate(
        (vh) => {
          const card = [...document.querySelectorAll('.card, .contact')].find((c) => {
            const r = c.getBoundingClientRect()
            return r.top < vh && r.bottom > 0
          })
          if (!card) return 'fara card'
          const r = card.getBoundingClientRect()
          const cut = card.scrollHeight - card.clientHeight
          const cover = Math.round(((Math.min(vh, r.bottom) - Math.max(0, r.top)) / vh) * 100)
          return `card ${Math.round(r.width)}x${Math.round(r.height)} acopera ${cover}% taiat ${cut}`
        },
        844,
      ),
    )
  }
  console.log(url.split('/')[3], '|', res.join(' | '), '| erori:', errs.length || 0)
  await pg.close()
}
await b.close()
