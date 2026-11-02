import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1280,height:800})
await pg.goto('http://127.0.0.1:4182/?qa=1',{waitUntil:'domcontentloaded'})
await pg.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:30000})
await new Promise(r=>setTimeout(r,2500))
const max=await pg.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight)
for(const p of [0.1,0.18,0.24,0.3,0.36,0.4,0.44,0.48]){
  await pg.evaluate(y=>window.scrollTo(0,y),Math.round(max*p))
  await new Promise(r=>setTimeout(r,1500))
  const d=await pg.evaluate(()=>JSON.stringify({q:window.__qa,f:window.__frame}))
  await pg.screenshot({path:`shots3/reg-${p.toFixed(2)}.png`})
  console.log(p.toFixed(2), d)
}
await b.close()
