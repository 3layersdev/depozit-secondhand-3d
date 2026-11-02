import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
await pg.goto(process.argv[2]+'?qa=1',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,5000))
for(let i=0;i<23;i++){ await pg.mouse.move(700,450); await pg.mouse.wheel({deltaY:120}); await new Promise(r=>setTimeout(r,80)) }
await new Promise(r=>setTimeout(r,2500))
console.log(JSON.stringify(await pg.evaluate(()=>({p:document.documentElement.dataset.p, qa:window.__qa}))))
await b.close()
