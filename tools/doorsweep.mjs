import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1280,height:800})
await pg.goto('http://127.0.0.1:4181/?qa=1',{waitUntil:'domcontentloaded'})
await pg.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:30000})
await new Promise(r=>setTimeout(r,2500))
const max=await pg.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight)
const rows=[]
for(let i=0;i<=14;i++){
  const p=0.1+i*0.03
  await pg.evaluate(y=>window.scrollTo(0,y),Math.round(max*p))
  await new Promise(r=>setTimeout(r,700))
  const q=await pg.evaluate(()=>JSON.stringify((window.__qa||{})))
  rows.push([p.toFixed(2),q])
  if(i%2===0) await pg.screenshot({path:`shots3/truck-${(0.1+i*0.03).toFixed(2)}.png`})
}
console.log(rows.map(r=>r.join(' ')).join('\n'))
await b.close()
