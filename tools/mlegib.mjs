import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const out=[]
for(const p of [0.30,0.62]){
  const pg=await b.newPage(); await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2})
  await pg.goto('https://3layersdev.github.io/depozit-secondhand-3d/?qa=1',{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,7000))
  const y=await pg.evaluate(f=>Math.round((document.documentElement.scrollHeight-innerHeight)*f),p)
  await pg.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,3000))
  const r=await pg.evaluate(()=>{const r=[...document.querySelectorAll('.card, .panel--hero .reveal, .contact')].map(c=>({c,rc:c.getBoundingClientRect()})).filter(x=>x.rc.top<innerHeight-100&&x.rc.bottom>60&&x.rc.width>200)[0];if(!r)return null;const t=r.c.querySelector('.chapter__title,h1,.contact__title')||r.c;return {x:Math.round(r.rc.left),y:Math.round(r.rc.top),w:Math.round(r.rc.width),h:Math.round(r.rc.height),color:getComputedStyle(t).color}})
  await pg.screenshot({path:`shots3/m-${String(p).replace('.','')}.png`})
  out.push({p,...r})
  await pg.close()
}
console.log(JSON.stringify(out))
await b.close()
