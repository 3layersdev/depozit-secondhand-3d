import puppeteer from 'puppeteer-core'
const url=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
const errs=[]; pg.on('pageerror',e=>errs.push(e.message))
await pg.goto(url,{waitUntil:'domcontentloaded',timeout:60000})
await new Promise(r=>setTimeout(r,5500))
const rows=[]
for (let i=0;i<4;i++){
  await pg.mouse.move(700,450); await pg.mouse.wheel({deltaY:340})
  await new Promise(r=>setTimeout(r,1500))
  rows.push(await pg.evaluate(()=>{
    const panels=[...document.querySelectorAll('.panel')]
    const best=panels.map((p,i)=>{const c=p.querySelector('.reveal');if(!c)return null;const r=c.getBoundingClientRect()
      return {i,off:Math.round(r.top+r.height/2-innerHeight/2),lbl:p.querySelector('h1,h2')?.textContent?.slice(0,18)}}).filter(Boolean)
      .sort((a,b)=>Math.abs(a.off)-Math.abs(b.off))[0]
    return {y:Math.round(scrollY), idx:best?.i, off:best?.off, lbl:best?.lbl}
  }))
}
const bg=await pg.evaluate(()=>getComputedStyle(document.body).backgroundColor)
console.log(JSON.stringify({url,bg,rows,errors:errs.length,first:errs[0]||null},null,0))
await pg.screenshot({path:process.argv[3]||'shots2/live.png'})
await b.close()
