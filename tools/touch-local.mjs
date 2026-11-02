import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message))
await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2})
await pg.goto('http://127.0.0.1:4181/depozit-secondhand-3d/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,6000))
const cdp=await pg.createCDPSession(); const rows=[]
for(let i=0;i<3;i++){
  await cdp.send('Input.synthesizeScrollGesture',{x:195,y:600,yDistance:-420,gestureSourceType:'touch',speed:1400})
  await new Promise(r=>setTimeout(r,1900))
  rows.push(await pg.evaluate(()=>{const p=[...document.querySelectorAll('.panel')].map((p,i)=>{const c=p.querySelector('.reveal');if(!c)return null;const r=c.getBoundingClientRect();return{i,off:Math.round(r.top+r.height/2-innerHeight/2)}}).filter(Boolean).sort((a,b)=>Math.abs(a.off)-Math.abs(b.off))[0];return{y:Math.round(scrollY),idx:p?.i,off:p?.off}}))
}
console.log(JSON.stringify({rows,errors:errs.length,first:errs[0]||null}))
await pg.screenshot({path:'shots2/m-touch.png'})
await b.close()
