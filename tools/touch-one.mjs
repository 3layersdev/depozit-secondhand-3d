import puppeteer from 'puppeteer-core'
const url=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message))
await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2})
await pg.goto(url,{waitUntil:'domcontentloaded',timeout:60000})
await new Promise(r=>setTimeout(r,6000))
const cdp=await pg.createCDPSession(); const rows=[]
for(let i=0;i<4;i++){
  await cdp.send('Input.synthesizeScrollGesture',{x:195,y:600,yDistance:-380,gestureSourceType:'touch',speed:1500})
  await new Promise(r=>setTimeout(r,1700))
  rows.push(await pg.evaluate(()=>{const p=[...document.querySelectorAll('.panel')].map((p,i)=>{const c=p.querySelector('.reveal');if(!c)return null;const r=c.getBoundingClientRect();return{i,off:Math.round(r.top+r.height/2-innerHeight/2)}}).filter(Boolean).sort((a,b)=>Math.abs(a.off)-Math.abs(b.off))[0];return{y:Math.round(scrollY),idx:p?.i,off:p?.off}}))
}
await pg.screenshot({path:'shots2/touch-'+ (process.argv[3]||'x') +'.png'})
console.log(JSON.stringify({rows,errors:errs.length}))
await b.close()
