import puppeteer from 'puppeteer-core'

const base = process.argv[2] || 'http://127.0.0.1:4195/depozit-secondhand-3d/'
const devices = [
  ['1440x900', 1440, 900, false],
]

const b = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
})

for (const [name, w, h, mobile] of devices) {
  const pg = await b.newPage()
  await pg.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile })
  await pg.goto(`${base}?qa=1`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 3200))

  const n = await pg.evaluate(() => document.querySelectorAll('main.track > section, main.track > footer').length)
  let worstScene = 100
  let cut = 0
  let overflow = 0

  for (let i = 0; i < n; i++) {
    await pg.evaluate(async (idx) => {
      const el = document.querySelectorAll('main.track > section, main.track > footer')[idx]
      window.scrollTo(0, Math.round(el.getBoundingClientRect().top + window.scrollY))
      let last = null
      let stable = 0
      for (let k = 0; k < 40; k++) {
        await new Promise((r) => setTimeout(r, 50))
        const p = document.documentElement.dataset.p
        if (p === last) {
          if (++stable > 6) return
        } else {
          stable = 0
          last = p
        }
      }
    }, i)

    const m = await pg.evaluate((vw, vh) => {
      const cover = []
      const add = (el) => {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return
        const r = el.getBoundingClientRect()
        if (r.width < 8 || r.height < 8) return
        const x1 = Math.max(0, r.left)
        const y1 = Math.max(0, r.top)
        const x2 = Math.min(vw, r.right)
        const y2 = Math.min(vh, r.bottom)
        if (x2 > x1 && y2 > y1) cover.push([x1, y1, x2, y2])
      }
      document.querySelectorAll('.card, .contact, .header, .rail, .hero__card').forEach(add)

      // rasterize the cover rectangles to count the visible scene share
      const step = 4
      let covered = 0
      let total = 0
      for (let y = 0; y < vh; y += step)
        for (let x = 0; x < vw; x += step) {
          total++
          if (cover.some(([x1, y1, x2, y2]) => x >= x1 && x < x2 && y >= y1 && y < y2)) covered++
        }

      const canvas = document.querySelector('canvas')
      const cr = canvas ? canvas.getBoundingClientRect() : null
      const clipped = [...document.querySelectorAll('.card, .contact')].filter((el) => {
        const d = el.scrollHeight - el.clientHeight
        return d > 2
      }).length
      const spill = [...document.querySelectorAll('.card, .contact, .header, .btn, .chip')].some((el) => {
        const r = el.getBoundingClientRect()
        return r.left < -1 || r.right > vw + 1
      })
      return {
        scene: Math.round(100 - (covered / total) * 100),
        canvas: cr ? `${Math.round(cr.width)}x${Math.round(cr.height)}` : 'lipsa',
        clipped,
        spill,
      }
    }, w, h)

    worstScene = Math.min(worstScene, m.scene)
    cut += m.clipped
    overflow += m.spill ? 1 : 0
    if (i === 0) var first = m
  }
  console.log(`${name} | canvas ${first.canvas} | scena vizibila min ${worstScene}% | carduri taiate ${cut} | capitole cu depasire orizontala ${overflow}`)
  await pg.close()
}
await b.close()
