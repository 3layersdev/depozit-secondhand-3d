import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']})
const pg=await b.newPage()
await pg.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true})
const errs=[]; pg.on('pageerror',e=>errs.push(String(e).slice(0,120)))
await pg.goto('https://3layersdev.github.io/depozit-secondhand-3d/?qa=1',{waitUntil:'domcontentloaded'})
await pg.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:40000})
await new Promise(r=>setTimeout(r,7000))
const max=await pg.evaluate(()=>document.documentElement.scrollHeight-innerHeight)
for(const t of [0.3,0.46]){
  let lo=0,hi=max
  for(let i=0;i<16;i++){const m=(lo+hi)/2;await pg.evaluate(y=>scrollTo(0,y),m);await new Promise(r=>setTimeout(r,90));const p=parseFloat(await pg.evaluate(()=>document.documentElement.dataset.p||'0'));if(p<t)lo=m;else hi=m}
  await new Promise(r=>setTimeout(r,1600))
  await pg.screenshot({path:`shots3/mob-${t}.png`})
}
console.log(JSON.stringify({errs}))
await b.close()
