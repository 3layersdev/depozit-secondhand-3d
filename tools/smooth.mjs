import puppeteer from 'puppeteer-core'

const urls = {
  golden: 'http://127.0.0.1:4195/depozit-secondhand-3d/',
  noir: 'http://127.0.0.1:4195/depozit-secondhand-3d-noir/',
}
const b = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
})
for (const [name, url] of Object.entries(urls)) {
  const pg = await b.newPage()
  await pg.setViewport({ width: 1440, height: 900 })
  await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 5000))

  const style = await pg.evaluate(() => {
    const g = (s) => {
      const el = document.querySelector(s)
      if (!el) return 'lipsa'
      const cs = getComputedStyle(el)
      return (cs.backdropFilter || 'none') + ' | shadow:' + (cs.boxShadow || 'none').split('),').length
    }
    let bf = 0
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el)
      if (cs.backdropFilter && cs.backdropFilter !== 'none') bf++
    })
    return {
      card: g('.card'),
      header: g('.header'),
      rail: g('.rail'),
      backdropNodes: bf,
      halo: getComputedStyle(document.querySelector('.card')).textShadow,
    }
  })

  // frame timing while the tween runs
  const frames = await pg.evaluate(async () => {
    const times = []
    let stop = false
    const tick = (t) => {
      times.push(t)
      if (!stop) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 140, bubbles: true, cancelable: true }))
    await new Promise((r) => setTimeout(r, 1600))
    stop = true
    const d = []
    for (let i = 1; i < times.length; i++) d.push(times[i] - times[i - 1])
    d.sort((a, b) => a - b)
    const avg = d.reduce((s, v) => s + v, 0) / d.length
    const p95 = d[Math.floor(d.length * 0.95)] ?? 0
    const long = d.filter((v) => v > 32).length
    return { n: d.length, avg: Math.round(avg * 10) / 10, p95: Math.round(p95 * 10) / 10, long, max: Math.round(d[d.length - 1] * 10) / 10 }
  })

  console.log(name, JSON.stringify({ style, frames }))
  await pg.close()
}
await b.close()
