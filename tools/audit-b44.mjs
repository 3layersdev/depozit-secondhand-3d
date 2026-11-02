import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']})
for (const [tag,vp] of [['desk',{width:1440,height:900}],['mob',{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2}]]) {
  const p=await b.newPage(); await p.setViewport(vp)
  const errs=[], failed=[]
  p.on('pageerror',e=>errs.push(e.message))
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))})
  p.on('requestfailed',r=>failed.push(`${r.failure()?.errorText} ${r.url().slice(0,90)}`))
  p.on('response',r=>{if(r.status()>=400)failed.push(`HTTP${r.status()} ${r.url().slice(0,90)}`)})
  await p.goto('https://depozit.base44.app/',{waitUntil:'networkidle2',timeout:60000}).catch(e=>errs.push('NAV '+e.message))
  await new Promise(r=>setTimeout(r,4000))
  await p.screenshot({path:`shots-b44/${tag}-top.png`})
  const facts=await p.evaluate(()=>({
    h: document.documentElement.scrollHeight,
    imgs: [...document.images].map(i=>({src:i.currentSrc||i.src, w:i.naturalWidth, h:i.naturalHeight})),
    iframes: [...document.querySelectorAll('iframe')].map(f=>f.src).slice(0,3),
    h1: document.querySelector('h1')?.innerText?.slice(0,80),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))
  const broken=facts.imgs.filter(i=>i.w<3).map(i=>i.src.slice(0,90))
  console.log(tag, JSON.stringify({h:facts.h, h1:facts.h1, iframes:facts.iframes.length, imgs:facts.imgs.length, broken, overflowX:facts.overflowX}))
  console.log(tag,'errors',errs.slice(0,5))
  console.log(tag,'failed',failed.slice(0,5))
  if(tag==='desk'){ // scroll through for full-page capture
    for(let i=1;i<=4;i++){ await p.evaluate(()=>window.scrollBy(0, innerHeight*0.9)); await new Promise(r=>setTimeout(r,900)); await p.screenshot({path:`shots-b44/desk-${i}.png`}) }
  } else {
    for(let i=1;i<=6;i++){ await p.evaluate(()=>window.scrollBy(0, innerHeight*0.85)); await new Promise(r=>setTimeout(r,700)); await p.screenshot({path:`shots-b44/mob-${i}.png`}) }
  }
  await p.close()
}
await b.close()
