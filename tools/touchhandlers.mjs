import puppeteer from 'puppeteer-core'
const url=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]); await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true})
const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,120)))
await pg.goto(url,{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,8000))
const state=async()=>pg.evaluate(()=>{
  const cards=[...document.querySelectorAll('section.panel')].map(s=>{const c=s.querySelector('.reveal')||s;const r=c.getBoundingClientRect();return {id:s.id,off:Math.round(r.top+r.height/2-innerHeight/2)}})
  const near=cards.slice().sort((a,b)=>Math.abs(a.off)-Math.abs(b.off))[0]
  return {y:Math.round(scrollY),card:near.id,off:near.off}
})
const swipe=async(dy)=>{ // dy<0 = finger moves up (forward)
  await pg.evaluate((dy)=>{
    const mk=(type,y)=>new TouchEvent(type,{bubbles:true,cancelable:true,touches:[],changedTouches:[new Touch({identifier:1,target:document.body,clientX:195,clientY:y})],targetTouches:[]})
    const startY=500
    document.body.dispatchEvent(mk('touchstart',startY))
    // finger travel + the native scroll the browser would apply for it
    for(let i=1;i<=5;i++){
      const y=startY+dy*i/5
      document.body.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,touches:[new Touch({identifier:1,target:document.body,clientX:195,clientY:y})],changedTouches:[new Touch({identifier:1,target:document.body,clientX:195,clientY:y})],targetTouches:[]}))
    }
    window.scrollBy(0,-dy)  // finger up scrolls the page down
    document.body.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[new Touch({identifier:1,target:document.body,clientX:195,clientY:startY+dy})],targetTouches:[]}))
  },dy)
  await new Promise(r=>setTimeout(r,1900))
}
console.log('reduced:', await pg.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches))
const out=[]
out.push(await state())
for(let i=0;i<3;i++){ await swipe(-260); out.push(await state()) }
for(let i=0;i<2;i++){ await swipe(260); out.push(await state()) }
console.log(JSON.stringify({out,errs}))
await b.close()
