import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}])
await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true})
await pg.goto(process.argv[2],{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,8000))
const traj=await pg.evaluate(async()=>{
  const out=[]
  const t0=performance.now()
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}))
  for(let i=0;i<26;i++){ await new Promise(r=>setTimeout(r,100)); out.push([Math.round(performance.now()-t0),Math.round(scrollY)]) }
  return out
})
console.log(JSON.stringify(traj))
await b.close()
