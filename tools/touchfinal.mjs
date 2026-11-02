import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}])
await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2})
const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,120)))
await pg.goto(process.argv[2],{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,9000))
const y=()=>pg.evaluate(()=>Math.round(scrollY))
const swipe=async(dir)=>{ const from=dir>0?700:250, to=dir>0?250:700
  await pg.touchscreen.touchStart(195,from)
  for(let i=1;i<=8;i++){ await pg.touchscreen.touchMove(195, from+(to-from)*i/8); await new Promise(r=>setTimeout(r,18)) }
  await pg.touchscreen.touchEnd(); await new Promise(r=>setTimeout(r,3200)) }
const out=[await y()]
for(let i=0;i<3;i++){ await swipe(1); out.push(await y()) }
for(let i=0;i<2;i++){ await swipe(-1); out.push(await y()) }
console.log(JSON.stringify({out,errs}))
await b.close()
