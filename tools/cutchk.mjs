import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1280,height:800})
await pg.goto('http://127.0.0.1:4182/?qa=1',{waitUntil:'domcontentloaded'})
await pg.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:30000})
await new Promise(r=>setTimeout(r,2500))
const max=await pg.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight)
for(const p of [0.475,0.482,0.486,0.495,0.51,0.56,0.62]){
  await pg.evaluate(y=>window.scrollTo(0,y),Math.round(max*p))
  await new Promise(r=>setTimeout(r,1400))
  await pg.screenshot({path:`shots3/cut-${p.toFixed(3)}.png`})
  console.log(p.toFixed(3), await pg.evaluate(()=>document.documentElement.dataset.p))
}
await b.close()
