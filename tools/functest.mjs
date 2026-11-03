import puppeteer from 'puppeteer-core'

const base = process.argv[2] || 'http://127.0.0.1:4195/depozit-secondhand-3d/'
const b = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
})
const pg = await b.newPage()
await pg.setViewport({ width: 1440, height: 900 })
const errs = []
pg.on('pageerror', (e) => errs.push(e.message.slice(0, 80)))
pg.on('console', (m) => {
  if (m.type() === 'error') errs.push(m.text().slice(0, 80))
})
await pg.goto(base, { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 6000))

// 1) formular: submit gol -> erori, apoi completat -> whatsapp compus
const form = await pg.evaluate(async () => {
  const formEl = document.querySelector('.offerform')
  const btn = formEl.querySelector('button[type=submit]')
  btn.click()
  await new Promise((r) => setTimeout(r, 120))
  const errsShown = [...formEl.querySelectorAll('.field__error')].map((e) => e.textContent.trim())
  const statusInvalid = formEl.querySelector('.offerform__status').textContent.trim()

  const set = (sel, val) => {
    const el = formEl.querySelector(sel)
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement : HTMLInputElement
    Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, val)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }
  const inputs = formEl.querySelectorAll('.field__input')
  set('.field__input', 'Adrian Popescu')
  set('input[inputmode=tel]', '0744123456')
  set('select', 'Damă')
  await new Promise((r) => setTimeout(r, 150))

  let opened = null
  window.open = (u) => {
    opened = u
    return null
  }
  btn.click()
  await new Promise((r) => setTimeout(r, 150))
  return {
    errsShown,
    statusInvalid,
    opened: opened ? opened.slice(0, 120) : null,
    statusAfter: formEl.querySelector('.offerform__status').textContent.trim().slice(0, 90),
    fields: inputs.length,
  }
})

// 2) tastatură: primul tab = skip link, apoi focusul se vede
const kb = await pg.evaluate(async () => {
  document.body.focus()
  const seq = []
  for (let i = 0; i < 4; i++) {
    const el = document.activeElement
    seq.push(el ? (el.className || el.tagName).toString().split(' ')[0] : '-')
    await new Promise((r) => setTimeout(r, 60))
    // simulăm Tab prin focus pe următorul element focusabil
    const all = [...document.querySelectorAll('a,button,input,select,textarea,summary')].filter(
      (e) => e.offsetParent !== null && !e.disabled,
    )
    const idx = all.indexOf(document.activeElement)
    all[Math.min(all.length - 1, idx + 1)]?.focus()
  }
  const outline = getComputedStyle(document.activeElement).outlineWidth
  return { seq, outline }
})

// 3) linkuri interne: toate ancorele trebuie să aibă țintă
const anchors = await pg.evaluate(() =>
  [...document.querySelectorAll('a[href^="#"]')].map((a) => ({
    href: a.getAttribute('href'),
    ok: !!document.querySelector(a.getAttribute('href')),
    text: a.textContent.trim().slice(0, 40),
  })),
)

// 4) metrici de încărcare
const metrics = await pg.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0]
  const lcp = performance.getEntriesByType('largest-contentful-paint').pop()
  const paints = performance.getEntriesByType('paint')
  return {
    domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
    load: Math.round(nav.loadEventEnd),
    fcp: Math.round(paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? 0),
    lcp: Math.round(lcp?.startTime ?? 0),
    js: performance.getEntriesByType('resource').filter((r) => r.name.endsWith('.js')).length,
    kb: Math.round(
      performance.getEntriesByType('resource').filter((r) => r.name.endsWith('.js')).reduce((s, r) => s + (r.transferSize || 0), 0) / 1024,
    ),
  }
})

console.log(JSON.stringify({ form, kb, anchors, metrics, errs: errs.slice(0, 3) }, null, 1))
await b.close()
