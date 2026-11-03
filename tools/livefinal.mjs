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
  pg.on('pageerror', (e) => errs.push(e.message.slice(0, 60)))
  await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 6000))
  const r = await pg.evaluate(() => {
    let bf = 0
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el)
      if (cs.backdropFilter && cs.backdropFilter !== 'none') bf++
    })
    const cards = [...document.querySelectorAll('.card, .contact')]
    const cut = cards.filter((c) => c.scrollHeight - c.clientHeight > 2).length
    const spill = cards.some((c) => {
      const r = c.getBoundingClientRect()
      return r.left < -1 || r.right > window.innerWidth + 1
    })
    const card = document.querySelector('#depozit .reveal')
    const cr = card.getBoundingClientRect()
    return {
      blur: bf,
      cut,
      spill,
      scenePct: Math.round((cr.top / window.innerHeight) * 100),
      shadow: getComputedStyle(card).textShadow,
    }
  })
  console.log(url.split('/')[3], JSON.stringify(r), '| erori:', errs.length)
  await pg.close()
}
await b.close()
