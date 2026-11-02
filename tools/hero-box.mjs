import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']})
for (const [w,h] of [[1440,900],[1280,800],[390,844]]) {
  const pg=await b.newPage(); await pg.setViewport({width:w,height:h})
  await pg.goto('http://127.0.0.1:4181/',{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,5200))
  const out=await pg.evaluate(()=>{
    const card=document.querySelector('.panel--hero .reveal')
    const h1=document.querySelector('.panel--hero .h1')
    const head=document.querySelector('.header')
    const r=card.getBoundingClientRect(), r1=h1.getBoundingClientRect(), rh=head?.getBoundingClientRect()
    return {scrollY:Math.round(scrollY), cardTop:Math.round(r.top), cardH:Math.round(r.height),
      h1Top:Math.round(r1.top), h1H:Math.round(r1.height), lines:[...document.querySelectorAll('.panel--hero .h1 span')].map(s=>Math.round(s.getBoundingClientRect().top)),
      headerH:rh?Math.round(rh.height):null, viewport:innerHeight}
  })
  console.log(w+'x'+h, JSON.stringify(out)); await pg.close()
}
await b.close()
