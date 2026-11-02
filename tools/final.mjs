import puppeteer from 'puppeteer-core'
const url=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}])
await pg.setViewport({width:1440,height:900})
const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,120)))
await pg.goto(url,{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,9000))
const y=()=>pg.evaluate(()=>Math.round(scrollY))
const out={wheel:[],keys:[]}
out.wheel.push(await y())
for(let i=0;i<3;i++){ await pg.mouse.move(720,450); await pg.mouse.wheel({deltaY:120}); await new Promise(r=>setTimeout(r,3200)); out.wheel.push(await y()) }
for(let i=0;i<2;i++){ await pg.mouse.wheel({deltaY:-120}); await new Promise(r=>setTimeout(r,3200)); out.wheel.push(await y()) }
await pg.evaluate(()=>window.scrollTo(0,0)); await new Promise(r=>setTimeout(r,2500))
out.keys.push(await y())
for(let i=0;i<2;i++){ await pg.keyboard.press('ArrowDown'); await new Promise(r=>setTimeout(r,3200)); out.keys.push(await y()) }
await pg.keyboard.press('ArrowUp'); await new Promise(r=>setTimeout(r,3200)); out.keys.push(await y())
console.log(JSON.stringify({out,errs}))
await b.close()
