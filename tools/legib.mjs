import puppeteer from 'puppeteer-core'
const base=process.argv[2], tag=process.argv[3], W=+process.argv[4]||1440, H=+process.argv[5]||900
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:W,height:H})
await pg.goto(base+'?qa=1',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,5000))
const out=[]
for(const target of [0.0,0.075,0.31,0.46,0.6,0.73,0.9]){
  const cur=await pg.evaluate(()=>+document.documentElement.dataset.p||0)
  const need=Math.round((target-cur)/0.02)
  for(let i=0;i<Math.abs(need);i++){ await pg.mouse.move(W/2,H/2); await pg.mouse.wheel({deltaY:need>0?120:-120}); await new Promise(r=>setTimeout(r,60)) }
  await new Promise(r=>setTimeout(r,1600))
  const info=await pg.evaluate(()=>{
    const cards=[...document.querySelectorAll('.card, .panel--hero .reveal, .contact')]
    const c=cards.map(c=>({c,r:c.getBoundingClientRect()})).filter(x=>x.r.top>40&&x.r.bottom<innerHeight-20&&x.r.height>150)[0]
    if(!c) return null
    const t=c.c.querySelector('.chapter__title, h1, .contact__title, .contact h2')||c.c.querySelector('p,li')
    const cs=t?getComputedStyle(t):null
    return {id:c.c.closest('section')?.id, rect:{x:Math.round(c.r.left),y:Math.round(c.r.top),w:Math.round(c.r.width),h:Math.round(c.r.height)},
      color:cs?cs.color:null, fs:cs?cs.fontSize:null, weight:cs?cs.fontWeight:null}
  })
  const p=(await pg.evaluate(()=>document.documentElement.dataset.p))
  const f=`shots2/lg-${tag}-${W}-${String(p).replace('.','')}.png`
  await pg.screenshot({path:f})
  if(info) out.push({p:+p,...info,file:f})
}
console.log(JSON.stringify(out))
await b.close()
