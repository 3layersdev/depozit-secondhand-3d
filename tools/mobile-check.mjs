import puppeteer from 'puppeteer-core'
const urls=[['https://3layersdev.github.io/depozit-secondhand-3d/','light'],['https://3layersdev.github.io/depozit-secondhand-3d-noir/','noir']]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
for (const [u,tag] of urls){
  const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message))
  await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2})
  await pg.goto(u,{waitUntil:'domcontentloaded',timeout:60000})
  await new Promise(r=>setTimeout(r,6000))
  const rows=[]
  for(let i=0;i<3;i++){
    await pg.evaluate(()=>window.scrollBy(0,520)); await new Promise(r=>setTimeout(r,1500))
    rows.push(await pg.evaluate(()=>{
      const p=[...document.querySelectorAll('.panel')].map((p,i)=>{const c=p.querySelector('.reveal');if(!c)return null;const r=c.getBoundingClientRect();return{i,off:Math.round(r.top+r.height/2-innerHeight/2)}}).filter(Boolean).sort((a,b)=>Math.abs(a.off)-Math.abs(b.off))[0]
      const c=document.querySelector('.reveal.is-visible'); const cs=c?getComputedStyle(c):null
      return {y:Math.round(scrollY),idx:p?.i,off:p?.off,cardW:cs?Math.round(c.getBoundingClientRect().width):null}
    }))
  }
  await pg.screenshot({path:`shots2/m-${tag}.png`})
  console.log(tag, JSON.stringify({rows,errors:errs.length}))
  await pg.close()
}
await b.close()
