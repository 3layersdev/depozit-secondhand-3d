import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1280,height:800})
const errs=[]; pg.on('pageerror',e=>errs.push(String(e).slice(0,160)))
await pg.goto('http://127.0.0.1:4190/?qa=1',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,12000))
const r=await pg.evaluate(()=>({
  pbr:[...new Set(performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.includes('media/pbr')).map(n=>n.split('/').pop().split('-')[0]))],
  n:performance.getEntriesByType('resource').filter(e=>e.name.includes('media/pbr')).length,
  stats:window.__stats||null, p:document.documentElement.dataset.p
}))
console.log(JSON.stringify({...r,errs:errs.slice(0,2)}))
await b.close()
