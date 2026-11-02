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
  await pg.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: label === 'mobil', hasTouch: label === 'mobil' })
  await pg.goto(`${base}?qa=1`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 4000))

  const sections = await pg.evaluate(() =>
    Array.from(document.querySelectorAll('main.track > section, main.track > footer')).map((s, i) => ({
      i,
      id: s.id || s.className,
    })),
  )

  for (const sec of sections) {
    await pg.evaluate((i) => {
      const el = document.querySelectorAll('main.track > section, main.track > footer')[i]
      const y = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, y)
    }, sec.i)
    await new Promise((r) => setTimeout(r, 900))

    const rep = await pg.evaluate((vw, vh) => {
      const sel = '.card, .header, .rail, .h1, .hero__text, .stats, .actions, .scrollhint, .svc, .svc__row, .gallery, .contact, .lede, .chapter__title, .eyebrow, .btn, .footer__cols, .lightbox, .brand'
      const out = []
      document.querySelectorAll(sel).forEach((el) => {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return
        const r = el.getBoundingClientRect()
        if (r.width < 4 || r.height < 4) return
        if (r.bottom < -20 || r.top > vh + 20) return
        out.push({
          c: (el.className || '').toString().split(' ')[0],
          x: Math.round(r.left),
          y: Math.round(r.top),
          w: Math.round(r.width),
          h: Math.round(r.height),
          outX: r.left < -1 || r.right > vw + 1,
          outY: r.top < -1 || r.bottom > vh + 1,
        })
      })
      // pairs that overlap meaningfully (>12% of the smaller box)
      const pairs = []
      for (let i = 0; i < out.length; i++)
        for (let j = i + 1; j < out.length; j++) {
          const a = out[i]
          const bb = out[j]
          const ox = Math.min(a.x + a.w, bb.x + bb.w) - Math.max(a.x, bb.x)
          const oy = Math.min(a.y + a.h, bb.y + bb.h) - Math.max(a.y, bb.y)
          if (ox <= 0 || oy <= 0) continue
          const inter = ox * oy
          const small = Math.min(a.w * a.h, bb.w * bb.h)
          if (inter / small > 0.12) pairs.push(`${a.c}/${bb.c} ${Math.round((inter / small) * 100)}%`)
        }
      const cards = out.filter((o) => o.c === 'card' || o.c === 'hero__text')
      const cardArea = cards.reduce((s, o) => {
        const cl = Math.max(0, o.x)
        const cr = Math.min(vw, o.x + o.w)
        const ct = Math.max(0, o.y)
        const cb = Math.min(vh, o.y + o.h)
        return s + Math.max(0, cr - cl) * Math.max(0, cb - ct)
      }, 0)
      return { boxes: out, pairs: pairs.slice(0, 6), cardPct: Math.round((cardArea / (vw * vh)) * 100) }
    }, w, h)

    const bad = rep.boxes.filter((o2) => o2.outX || o2.outY).map((o2) => `${o2.c}@${o2.x},${o2.y} ${o2.w}x${o2.h}`)
    const tall = rep.boxes.filter((o2) => o2.h > h * 0.82).map((o2) => `${o2.c} h=${o2.h}`)
    console.log(
      `${label} #${sec.i} ${sec.id.slice(0, 22)} | carduri ${rep.cardPct}% | in afara: ${bad.join(', ') || '-'} | inalte: ${tall.join(', ') || '-'} | suprapuneri: ${rep.pairs.join(', ') || '-'}`,
    )
  }
  await pg.close()
}
await b.close()
