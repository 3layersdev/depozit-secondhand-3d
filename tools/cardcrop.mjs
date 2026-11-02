import puppeteer from 'puppeteer-core'
import { execSync } from 'node:child_process'
const base=process.argv[2], tag=process.argv[3]||'light'
const ps=[0,0.13,0.30,0.46,0.62,0.78,0.93]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const out=[]
for (const p of ps){
  const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
  await pg.goto(base+'?qa=1',{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,5500))
  for(let i=0;i<Math.round(p/0.02);i++){ await pg.mouse.move(720,450); await pg.mouse.wheel({deltaY:120}); await new Promise(r=>setTimeout(r,80)) }
  await new Promise(r=>setTimeout(r,2400))
  const rect=await pg.evaluate(()=>{
    const cards=[...document.querySelectorAll('.card, .panel--hero .reveal, .contact')]
    const vis=cards.map(c=>({c,r:c.getBoundingClientRect()})).filter(x=>x.r.bottom>60&&x.r.top<innerHeight-40&&x.r.height>80)
      .sort((a,b)=>b.r.height-a.r.height)[0]
    return vis?{x:Math.max(0,vis.r.left),y:Math.max(0,vis.r.top),w:vis.r.width,h:vis.r.height}:null
  })
  const f=`shots2/cc-${tag}-${String(p).replace('.','')}.png`
  await pg.screenshot({path:f})
  if(rect) out.push({f,rect})
  await pg.close()
}
await b.close()
console.log(JSON.stringify(out))
