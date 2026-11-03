import puppeteer from 'puppeteer-core'

const urls = {
  golden: 'https://3layersdev.github.io/depozit-secondhand-3d/?qa=1',
  noir: 'https://3layersdev.github.io/depozit-secondhand-3d-noir/?qa=1',
}
const sel = [
  '.h1',
  '.chapter__title',
  '.lede',
  '.hero__text',
  '.eyebrow',
  '.svc__name',
  '.svc__points',
  '.stat__value',
  '.stat__label',
  '.chip',
  '.btn',
  '.contact__row',
]
const b = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
})
const out = {}
for (const [name, url] of Object.entries(urls)) {
  const pg = await b.newPage()
  await pg.setViewport({ width: 1440, height: 900 })
  await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 5000))
  out[name] = await pg.evaluate((sels) => {
    const res = {}
    for (const s of sels) {
      const el = document.querySelector(s)
      if (!el) {
        res[s] = null
        continue
      }
      const cs = getComputedStyle(el)
      res[s] = {
        font: cs.fontFamily.split(',')[0].replace(/"/g, ''),
        size: Math.round(parseFloat(cs.fontSize) * 10) / 10,
        weight: cs.fontWeight,
        lh: cs.lineHeight === 'normal' ? 'normal' : Math.round(parseFloat(cs.lineHeight) * 10) / 10,
        ls: Math.round(parseFloat(cs.letterSpacing) * 100) / 100,
        color: cs.color,
        tt: cs.textTransform,
        wrap: cs.textWrap || cs.textWrapMode || '-',
      }
    }
    return res
  }, sel)
  await pg.close()
}
await b.close()

console.log('selector | golden | noir | la fel?')
for (const s of sel) {
  const a = out.golden[s]
  const n = out.noir[s]
  if (!a || !n) {
    console.log(`${s} | ${a ? 'ok' : 'lipsa'} | ${n ? 'ok' : 'lipsa'}`)
    continue
  }
  const diffs = []
  for (const k of ['font', 'size', 'weight', 'lh', 'ls', 'tt', 'wrap']) {
    if (String(a[k]) !== String(n[k])) diffs.push(`${k}: ${a[k]} vs ${n[k]}`)
  }
  console.log(`${s} | ${a.size}px ${a.lh}/${a.font} | ${n.size}px ${n.lh}/${n.font} | ${diffs.length ? diffs.join('; ') : 'identic'}`)
}
