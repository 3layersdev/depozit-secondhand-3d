import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const pg = await b.newPage()
await pg.setViewport({width:1280,height:800})
await pg.goto('http://127.0.0.1:4181/?qa=1', {waitUntil:'domcontentloaded'})
await pg.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:30000})
await new Promise(r=>setTimeout(r,1500))
const max = await pg.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight)
for (const target of [0.28,0.32,0.36,0.40,0.44,0.48,0.52]) {
  let lo=0, hi=max
  for (let i=0;i<14;i++){
    const mid=(lo+hi)/2
    await pg.evaluate(y=>window.scrollTo(0,y), mid)
    await new Promise(r=>setTimeout(r,90))
    const p=parseFloat(await pg.evaluate(()=>document.documentElement.dataset.p||'0'))
    if (p<target) lo=mid; else hi=mid
  }
  await new Promise(r=>setTimeout(r,260))
  const qa=await pg.evaluate(()=>window.__qa||{})
  console.log(target.toFixed(2), JSON.stringify(qa))
}
await b.close()
