import puppeteer from 'puppeteer-core'
const [base,cam,tgt,wheels,name]=process.argv.slice(2)
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1200,height:800})
await pg.goto(`${base}?qa=1&cam=${cam}&tgt=${tgt}`,{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,5000))
for(let i=0;i<+wheels;i++){ await pg.mouse.move(600,400); await pg.mouse.wheel({deltaY:120}); await new Promise(r=>setTimeout(r,80)) }
await new Promise(r=>setTimeout(r,3000))
await pg.screenshot({path:`shots2/${name}.png`})
console.log(name, await pg.evaluate(()=>JSON.stringify({p:document.documentElement.dataset.p,d:(window.__qa||{}).door,s:(window.__qa||{}).slats})))
await b.close()
