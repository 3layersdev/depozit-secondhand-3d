import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1280,height:800})
await pg.goto('http://127.0.0.1:4181/?qa=1',{waitUntil:'domcontentloaded'})
await pg.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:30000})
await new Promise(r=>setTimeout(r,2500))
const max=await pg.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight)
for(const t of [0.16,0.24,0.30]){
  let lo=0,hi=max
  for(let i=0;i<14;i++){const mid=(lo+hi)/2;await pg.evaluate(y=>window.scrollTo(0,y),mid);await new Promise(r=>setTimeout(r,90));const p=parseFloat(await pg.evaluate(()=>document.documentElement.dataset.p||'0'));if(p<t)lo=mid;else hi=mid}
  await new Promise(r=>setTimeout(r,1800))
  await pg.screenshot({path:`shots3/door-${t}.png`})
  console.log(t, await pg.evaluate(()=>JSON.stringify({p:document.documentElement.dataset.p,d:(window.__qa||{}).door})))
}
await b.close()
