import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath:'/usr/bin/google-chrome', headless:'shell',
  args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars'] })
const errs=[]
for (const [tag,w,h] of [['d',1440,900],['m',390,844]]) {
  const p = await b.newPage()
  await p.setViewport({width:w,height:h,deviceScaleFactor:1,isMobile:tag==='m',hasTouch:tag==='m'})
  p.on('pageerror',e=>errs.push(tag+' pe:'+e.message.slice(0,80)))
  p.on('console',m=>{if(m.type()==='error')errs.push(tag+' c:'+m.text().slice(0,80))})
  await p.goto('https://depozit.base44.app/',{waitUntil:'networkidle2',timeout:60000}).catch(e=>errs.push(tag+' nav:'+e.message.slice(0,50)))
  await new Promise(r=>setTimeout(r,8000))
  const info = await p.evaluate(()=>({title:document.title,
    bodyOuter:document.body.clientWidth+'x'+document.body.clientHeight,
    iframes:[...document.querySelectorAll('iframe')].map(f=>({src:f.src.slice(0,80),w:f.clientWidth,h:f.clientHeight,style:f.getAttribute('style')?.slice(0,80)})),
    htmlBg:getComputedStyle(document.body).backgroundColor,
    text:document.body.innerText.replace(/\s+/g,' ').slice(0,260)}))
  console.log(tag, JSON.stringify(info,null,1))
  await p.screenshot({path:`/tmp/dz-${tag}.png`})
  await p.close()
}
console.log('ERRS', errs.slice(0,6))
await b.close()
