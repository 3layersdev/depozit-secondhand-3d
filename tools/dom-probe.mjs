import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']})
for (const [w,h,mob] of [[390,844,true],[1440,900,false]]){
  const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text())})
  await pg.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob})
  await pg.goto('http://127.0.0.1:4181/depozit-secondhand-3d/',{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,11000))
  console.log(w, JSON.stringify(await pg.evaluate(()=>({panels:document.querySelectorAll('.panel').length,sh:document.documentElement.scrollHeight,cls:document.body.className,canvas:!!document.querySelector('canvas'),txt:(document.querySelector('main')?.innerText||'').slice(0,60)}))), 'errs', errs.length, errs[0]||'')
  await pg.close()
}
await b.close()
