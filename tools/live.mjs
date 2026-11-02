import puppeteer from 'puppeteer-core'
const url=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
const errs=[], bad=[]
pg.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,160)) })
pg.on('pageerror',e=>errs.push('pageerror: '+e.message.slice(0,160)))
pg.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url().slice(-60)) })
await pg.goto(url,{waitUntil:'domcontentloaded',timeout:45000})
await new Promise(r=>setTimeout(r,6000))
const steps=[]
for(let k=0;k<6;k++){
  await pg.mouse.move(720,450)
  await pg.mouse.wheel({deltaY:140}); await new Promise(r=>setTimeout(r,1400))
  steps.push(await pg.evaluate(()=>({p:document.documentElement.dataset.p,panel:(document.querySelector('.panel:not([aria-hidden])')||{}).id||[...document.querySelectorAll('section.panel')].filter(s=>{const r=s.getBoundingClientRect();return r.top<innerHeight*.6&&r.bottom>innerHeight*.4})[0]?.id, stats:window.__stats||null})))
}
console.log(JSON.stringify({errs:errs.slice(0,5),bad:bad.slice(0,5),steps}))
await b.close()
