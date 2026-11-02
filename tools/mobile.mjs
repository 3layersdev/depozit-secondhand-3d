import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
mkdirSync('shots-m',{recursive:true})
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const p=await b.newPage()
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true})
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
await p.goto('http://127.0.0.1:4181/?qa=1',{waitUntil:'domcontentloaded',timeout:45000})
await new Promise(r=>setTimeout(r,3500))
const info=await p.evaluate(()=>({
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  wide: [...document.querySelectorAll('body *')].filter(el=>{
    const r=el.getBoundingClientRect(); return r.width>0 && (r.right>window.innerWidth+2 || r.left<-2)
  }).slice(0,6).map(el=>`${el.tagName}.${(el.className||'').toString().split(' ')[0]} ${Math.round(el.getBoundingClientRect().left)}..${Math.round(el.getBoundingClientRect().right)}`),
  panels: [...document.querySelectorAll('.panel')].map(el=>({h:Math.round(el.offsetHeight), top:Math.round(el.getBoundingClientRect().top+scrollY)})),
  vh: innerHeight,
}))
console.log(JSON.stringify(info,null,1))
for (const [i,pn] of info.panels.entries()){
  await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}), pn.top)
  await new Promise(r=>setTimeout(r,900))
  await p.screenshot({path:`shots-m/m${i}.png`})
}
console.log('errors',errs.slice(0,4))
await b.close()
