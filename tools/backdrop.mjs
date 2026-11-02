import puppeteer from 'puppeteer-core'
const base=process.argv[2], tag=process.argv[3]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
await pg.goto(base+'?qa=1',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,5000))
const out=[]
for(const target of [0.075,0.31,0.46,0.6,0.73,0.9]){
  const cur=await pg.evaluate(()=>+document.documentElement.dataset.p||0)
  const need=Math.round((target-cur)/0.02)
  for(let i=0;i<Math.abs(need);i++){ await pg.mouse.move(720,450); await pg.mouse.wheel({deltaY:need>0?120:-120}); await new Promise(r=>setTimeout(r,60)) }
  await new Promise(r=>setTimeout(r,1500))
  const info=await pg.evaluate(()=>{
    const cards=[...document.querySelectorAll('.card, .panel--hero .reveal, .contact')]
    const scored=cards.map(c=>{const r=c.getBoundingClientRect();return {c,r,d:Math.abs((r.top+r.bottom)/2-innerHeight/2)}}).sort((a,b)=>a.d-b.d)[0]
    if(!scored||scored.r.height<120) return null
    const r=scored.r
    const t=scored.c.querySelector('.chapter__title, h1, .contact__title, h2, p')
    const cs=getComputedStyle(scored.c)
    return {id:scored.c.closest('section')?.id, rect:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
      color:t?getComputedStyle(t).color:null, bg:cs.backgroundImage.slice(0,120), bf:cs.backdropFilter}
  })
  if(!info) continue
  const p=await pg.evaluate(()=>document.documentElement.dataset.p)
  await pg.evaluate(()=>{document.querySelectorAll('.card,.panel--hero .reveal,.contact').forEach(e=>e.style.visibility='hidden')})
  const f=`shots2/bd-${tag}-${String(p).replace('.','')}.png`
  await pg.screenshot({path:f})
  await pg.evaluate(()=>{document.querySelectorAll('.card,.panel--hero .reveal,.contact').forEach(e=>e.style.visibility='')})
  out.push({p:+p,...info,file:f})
}
console.log(JSON.stringify(out))
await b.close()
