import puppeteer from 'puppeteer-core'
const base=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const ps=[0,0.13,0.30,0.46,0.62,0.78,0.93]
for (const p of ps){
  const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
  await pg.goto(base+'?qa=1',{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,5200))
  for(let i=0;i<Math.round(p/0.02);i++){ await pg.mouse.move(720,450); await pg.mouse.wheel({deltaY:120}); await new Promise(r=>setTimeout(r,70)) }
  await new Promise(r=>setTimeout(r,2200))
  const info=await pg.evaluate(()=>{
    const t=document.querySelector('.panel:nth-of-type(1)')
    const cards=[...document.querySelectorAll('.card, .panel--hero .reveal, .contact')]
    const c=cards.map(c=>({c,r:c.getBoundingClientRect()})).filter(x=>x.r.top<innerHeight-60&&x.r.bottom>60&&x.r.height>100)[0]
    if(!c) return null
    const title=c.c.querySelector('.chapter__title, h1, .contact__title')||c.c
    const col=getComputedStyle(title).color
    const sh=getComputedStyle(c.c).boxShadow.slice(0,20)
    return {rect:{x:Math.round(c.r.left),y:Math.round(c.r.top),w:Math.round(c.r.width),h:Math.round(c.r.height)},col,alpha:getComputedStyle(c.c).backdropFilter,sh}
  })
  await pg.screenshot({path:`shots2/ct-${String(p).replace('.','')}.png`})
  console.log(p, JSON.stringify(info))
  await pg.close()
}
await b.close()
