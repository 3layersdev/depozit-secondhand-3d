import puppeteer from 'puppeteer-core'
const [base,tag]=process.argv.slice(2)
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1280,height:800})
await pg.goto(base+'?qa=1',{waitUntil:'domcontentloaded'})
await pg.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:40000})
await new Promise(r=>setTimeout(r,6000))
const max=await pg.evaluate(()=>document.documentElement.scrollHeight-innerHeight)
for(const t of [0.3,0.42,0.46]){
  let lo=0,hi=max
  for(let i=0;i<16;i++){const mid=(lo+hi)/2;await pg.evaluate(y=>window.scrollTo(0,y),mid);await new Promise(r=>setTimeout(r,90));const p=parseFloat(await pg.evaluate(()=>document.documentElement.dataset.p||'0'));if(p<t)lo=mid;else hi=mid}
  await new Promise(r=>setTimeout(r,1800))
  await pg.screenshot({path:`shots3/${tag}-${t.toFixed(2)}.png`})
  console.log(t, await pg.evaluate(()=>JSON.stringify({p:document.documentElement.dataset.p,q:window.__qa,f:window.__frame})))
}
await b.close()
