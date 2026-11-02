import puppeteer from 'puppeteer-core'
const base=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const out=[]
for(const p of [0.02,0.16,0.30,0.46,0.62,0.78,0.95]){
  const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
  await pg.goto(base+'?qa=1',{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,6000))
  // land on the chapter that owns this progress
  const target=await pg.evaluate((p)=>{
    const max=document.documentElement.scrollHeight-innerHeight
    return Math.round(max*p)
  },p)
  await pg.evaluate(y=>window.scrollTo(0,y),target)
  await new Promise(r=>setTimeout(r,2500))
  const info=await pg.evaluate(()=>{
    const cards=[...document.querySelectorAll('.card, .panel--hero .reveal, .contact')]
    const vis=cards.map(c=>({c,r:c.getBoundingClientRect()})).filter(x=>x.r.top<innerHeight-80&&x.r.bottom>40&&x.r.width>200)
    if(!vis.length) return null
    const {c,r}=vis[0]
    const title=c.querySelector('.chapter__title, h1, .contact__title')||c
    const cs=getComputedStyle(title)
    return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),color:cs.color,size:cs.fontSize,panel:(c.closest('section')||{}).id||'?'}
  })
  if(!info){ out.push({p,skip:true}); await pg.close(); continue }
  await pg.screenshot({path:`shots3/leg-${String(p).replace('.','')}.png`})
  out.push({p,...info,file:`shots3/leg-${String(p).replace('.','')}.png`})
  await pg.close()
}
console.log(JSON.stringify(out))
await b.close()
