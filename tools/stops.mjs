import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}])
await pg.setViewport({width:+process.argv[3]||390,height:+process.argv[4]||844,isMobile:true,hasTouch:true})
await pg.goto(process.argv[2],{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,8000))
console.log(JSON.stringify(await pg.evaluate(()=>{
  const limit=Math.max(0,Math.round(document.documentElement.scrollHeight-innerHeight))
  const list=[...document.querySelectorAll('.panel')].map(panel=>{
    const card=panel.querySelector('.reveal')||panel
    const r=card.getBoundingClientRect()
    const centre=r.top+scrollY+r.height/2
    return {id:panel.id,stop:Math.round(Math.min(limit,Math.max(0,centre-innerHeight/2))),cardTop:Math.round(r.top+scrollY),h:Math.round(r.height)}
  })
  return {limit,list,docH:document.documentElement.scrollHeight,vh:innerHeight}
})))
await b.close()
