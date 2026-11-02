import puppeteer from 'puppeteer-core'
const url=process.argv[2]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const read=async(pg)=>pg.evaluate(()=>{
  const list=[...document.querySelectorAll('section.panel')].map(s=>{const r=s.getBoundingClientRect();return {id:s.id,c:Math.round(r.top+r.height/2)}})
  const near=list.slice().sort((a,b)=>Math.abs(a.c-innerHeight/2)-Math.abs(b.c-innerHeight/2))[0]
  return {y:Math.round(scrollY),centered:near.id,off:Math.abs(near.c-Math.round(innerHeight/2))}
})
const out={wheel:[],keys:[],touch:[]}
// desktop wheel
let pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
await pg.goto(url,{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,5500))
for(let k=0;k<3;k++){ await pg.mouse.move(720,450); await pg.mouse.wheel({deltaY:120}); await new Promise(r=>setTimeout(r,1800)); out.wheel.push(await read(pg)) }
await pg.mouse.wheel({deltaY:-120}); await new Promise(r=>setTimeout(r,1800)); out.wheel.push(await read(pg))
await pg.close()
// keyboard
pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
await pg.goto(url,{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,5500))
for(let k=0;k<2;k++){ await pg.keyboard.press('ArrowDown'); await new Promise(r=>setTimeout(r,1800)); out.keys.push(await read(pg)) }
await pg.close()
// touch swipe (one gesture)
pg=await b.newPage(); await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2})
await pg.goto(url,{waitUntil:'domcontentloaded'}); await new Promise(r=>setTimeout(r,5500))
const t=await pg.touchscreen
const swipe=async(dir)=>{ const x=195; const from=dir>0?600:240, to=dir>0?240:600
  await pg.touchscreen.touchStart(x,from); 
  for(let i=1;i<=6;i++){ await pg.touchscreen.touchMove(x, from+(to-from)*i/6); await new Promise(r=>setTimeout(r,16)) }
  await pg.touchscreen.touchEnd(); await new Promise(r=>setTimeout(r,1800)) }
for(let k=0;k<2;k++){ await swipe(1); out.touch.push(await read(pg)) }
await swipe(-1); out.touch.push(await read(pg))
await pg.close(); await b.close()
console.log(JSON.stringify(out))
