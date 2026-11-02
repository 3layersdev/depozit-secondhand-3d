import puppeteer from 'puppeteer-core'
const base=process.argv[2]; const out=process.argv[3]; const ps=(process.argv[4]||'0,0.1,0.34,0.62').split(',').map(Number)
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
for (const p of ps){
  const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message))
  await pg.setViewport({width:1440,height:900})
  await pg.goto(base+'?qa=1',{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,6000))
  if(p>0){ for(let i=0;i<Math.round(p/0.02);i++){ await pg.mouse.move(720,450); await pg.mouse.wheel({deltaY:120}); await new Promise(r=>setTimeout(r,90)) } }
  await new Promise(r=>setTimeout(r,2600))
  await pg.screenshot({path:`${out}-${String(p).replace('.','_')}.png`})
  console.log(out,p,'errs',errs.length,errs[0]||'')
  await pg.close()
}
await b.close()
