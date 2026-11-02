import puppeteer from 'puppeteer-core'
const url=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2})
const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,100)))
await pg.goto(url,{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,9000))
const read=async()=>pg.evaluate(()=>{
  const cards=[...document.querySelectorAll('section.panel')].map(s=>{const c=s.querySelector('.reveal')||s;const r=c.getBoundingClientRect();return {id:s.id,off:Math.round(r.top+r.height/2-innerHeight/2)}})
  const near=cards.slice().sort((a,b)=>Math.abs(a.off)-Math.abs(b.off))[0]
  return {y:Math.round(scrollY),card:near.id,off:near.off}
})
const client=await pg.target().createCDPSession()
const gesture=async(dist)=>{
  await client.send('Input.synthesizeScrollGesture',{x:195,y:420,yDistance:dist,gestureSourceType:'touch',speed:1200,preventFling:false})
  await new Promise(r=>setTimeout(r,2000))
}
const out=[]
out.push(await read())
for(let i=0;i<3;i++){ await gesture(-420); out.push(await read()) }
for(let i=0;i<2;i++){ await gesture(420); out.push(await read()) }
console.log(JSON.stringify({out,errs}))
await b.close()
