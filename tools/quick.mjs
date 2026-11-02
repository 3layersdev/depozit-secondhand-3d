import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}])
await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true})
await pg.goto(process.argv[2],{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,8000))
const y=()=>pg.evaluate(()=>Math.round(scrollY))
const out={}
out.start=await y()
await pg.keyboard.press('ArrowDown'); await new Promise(r=>setTimeout(r,1600)); out.key1=await y()
await pg.keyboard.press('ArrowDown'); await new Promise(r=>setTimeout(r,1600)); out.key2=await y()
// synthetic touch with our events
await pg.evaluate(()=>{
  const mk=(t,y,touches=true)=>new TouchEvent(t,{bubbles:true,cancelable:true,touches:touches?[new Touch({identifier:1,target:document.body,clientX:195,clientY:y})]:[],changedTouches:[new Touch({identifier:1,target:document.body,clientX:195,clientY:y})],targetTouches:[]})
  document.body.dispatchEvent(mk('touchstart',500))
  for(let i=1;i<=5;i++) document.body.dispatchEvent(mk('touchmove',500-40*i))
  window.scrollBy(0,200)
  document.body.dispatchEvent(mk('touchend',300,false))
})
await new Promise(r=>setTimeout(r,1800)); out.afterTouch=await y()
console.log(JSON.stringify(out))
await b.close()
