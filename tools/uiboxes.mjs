import puppeteer from 'puppeteer-core'
import fs from 'fs'

const url = process.argv[2]
const W = +(process.argv[3] || 1440)
const H = +(process.argv[4] || 900)

const COLECT = `
(() => {
  const out = [];
  const sel = 'h1,h2,h3,p,li,a,strong,span,button,label,div';
  for (const el of document.querySelectorAll(sel)) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 8) continue;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const txt = (el.textContent || '').trim().replace(/\\s+/g, ' ');
    if (!txt || txt.length > 200) continue;
    if (cs.opacity === '0' || cs.visibility === 'hidden' || cs.display === 'none') continue;
    const bg = cs.backgroundColor;
    if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().slice(0, 34),
      txt: txt.slice(0, 60),
      x: r.x, y: r.y, w: r.width, h: r.height,
      fs: +parseFloat(cs.fontSize).toFixed(1),
      color: cs.color, weight: cs.fontWeight,
    });
  }
  return out;
})()
`

const STRUCT = `
(() => {
  const small = [...document.querySelectorAll('a,button')]
    .filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.width < 41 || r.height < 41);
    })
    .map(e => ((e.textContent || '').trim().slice(0, 20) || 'x') + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))
    .slice(0, 10);
  let widest = 0;
  document.querySelectorAll('p').forEach(p => {
    const w = p.getBoundingClientRect().width / parseFloat(getComputedStyle(p).fontSize);
    if (w > widest) widest = w;
  });
  return {
    hScroll: document.documentElement.scrollWidth - innerWidth,
    small,
    noAlt: [...document.images].filter(i => !i.alt).length,
    imgs: document.images.length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName + '@' + parseFloat(getComputedStyle(h).fontSize) + ' ' + (h.textContent || '').trim().slice(0, 30)),
    font: getComputedStyle(document.body).fontFamily,
    widestLineCh: Math.round(widest),
  };
})()
`

const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'shell', args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'] })
const pg = await b.newPage()
await pg.setViewport({ width: W, height: H, deviceScaleFactor: 1, isMobile: W < 600, hasTouch: W < 600 })
const errs = []
pg.on('pageerror', e => errs.push(String(e).slice(0, 120)))
await pg.goto(url, { waitUntil: 'domcontentloaded' })
await pg.waitForFunction(() => document.documentElement.dataset.p !== undefined, { timeout: 45000 })
await new Promise(r => setTimeout(r, 6000))
const max = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const shots = []
for (const t of [0.3, 0.46, 0.78]) {
  let lo = 0, hi = max
  for (let i = 0; i < 15; i++) {
    const m = (lo + hi) / 2
    await pg.evaluate(y => scrollTo(0, y), m)
    await new Promise(r => setTimeout(r, 80))
    const p = parseFloat(await pg.evaluate(() => document.documentElement.dataset.p || '0'))
    if (p < t) lo = m; else hi = m
  }
  await new Promise(r => setTimeout(r, 1300))
  const f = `shots3/ui-${W}-${Math.round(t * 100)}.png`
  await pg.screenshot({ path: f })
  const nodes = await pg.evaluate(COLECT)
  shots.push({ t, f, nodes })
}
const struct = await pg.evaluate(STRUCT)
fs.writeFileSync(`shots3/ui-${W}.json`, JSON.stringify({ errs, shots, struct }))
console.log(JSON.stringify({ errs, struct }))
await b.close()
