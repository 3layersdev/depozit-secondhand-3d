import puppeteer from 'puppeteer-core'

const base = process.argv[2] || 'http://127.0.0.1:4195/depozit-secondhand-3d/'
const sizes = [
  ['desktop', 1440, 900],
  ['mobil', 390, 844],
]
const b = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
})

for (const [label, w, h] of sizes) {
  const pg = await b.newPage()
  await pg.setViewport({ width: w, height: h, isMobile: label === 'mobil', hasTouch: label === 'mobil' })
  await pg.goto(`${base}?qa=1`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 4500))

  const n = await pg.evaluate(
    () => document.querySelectorAll('main.track > section, main.track > footer').length,
  )

  for (let i = 0; i < n; i++) {
    const done = await pg.evaluate(async (idx) => {
      const el = document.querySelectorAll('main.track > section, main.track > footer')[idx]
      const y = Math.round(el.getBoundingClientRect().top + window.scrollY)
      window.scrollTo(0, y)
      // aștept ca snapping-ul să se așeze (progresul stabil 350ms)
      let last = null
      let stable = 0
      for (let k = 0; k < 90; k++) {
        await new Promise((r) => setTimeout(r, 60))
        const p = document.documentElement.dataset.p
        if (p === last) {
          stable++
          if (stable > 6) return { p, y }
        } else {
          stable = 0
          last = p
        }
      }
      return { p: last, y }
    }, i)

    const rep = await pg.evaluate((vw, vh) => {
      const out = []
      document.querySelectorAll('.card, .contact, .panel--hero .reveal').forEach((el) => {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || +cs.opacity === 0) return
        const r = el.getBoundingClientRect()
        if (r.height < 20) return
        out.push({
          box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
          cutTop: Math.round(r.top),
          cutBottom: Math.round(vh - r.bottom),
          scrollable: Math.round(el.scrollHeight - el.clientHeight),
        })
      })
      const hdr = document.querySelector('.header')?.getBoundingClientRect()
      return {
        cards: out,
        hdrBottom: hdr ? Math.round(hdr.bottom) : 0,
        p: document.documentElement.dataset.p,
      }
    }, w, h)

    const c = rep.cards[0]
    const line = c
      ? `card ${c.box[2]}x${c.box[3]} top=${c.cutTop} bottomMarja=${c.cutBottom} scroll=${c.scrollable}`
      : 'fara card'
    const flag =
      c && (c.cutTop < rep.hdrBottom - 2 || c.cutBottom < 4 || c.scrollable > 2) ? '  <-- PROBLEMA' : ''
    console.log(`${label} #${i} p=${rep.p} hdr=${rep.hdrBottom} | ${line}${flag}`)
  }
  await pg.close()
}
await b.close()
