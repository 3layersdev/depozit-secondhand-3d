import puppeteer from 'puppeteer-core'
const base=process.argv[2], tag=process.argv[3]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
const errs=[],warns=[]
pg.on('pageerror',e=>errs.push(e.message))
pg.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text().slice(0,160)); if(m.type()==='warning') warns.push(m.text().slice(0,120)) })
pg.on('requestfailed',r=>errs.push('net: '+r.url().slice(-60)))
await pg.goto(base+'?qa=1',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,6000))
const beats=[]; const shots=[]
for(let i=0;i<=20;i++){
  const p=+(i*0.05).toFixed(2)
  if(i>0){ for(let k=0;k<2;k++){ await pg.mouse.move(700,450); await pg.mouse.wheel({deltaY:120}); await new Promise(r=>setTimeout(r,70)) } }
  await new Promise(r=>setTimeout(r,1100))
  const st=await pg.evaluate(()=>({p:+(document.documentElement.dataset.p||0), qa:window.__qa||{}, stats:window.__stats||{},
    visible:[...document.querySelectorAll('.reveal')].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight-80&&r.bottom>80}).map(e=>e.closest('section')?.id)}))
  beats.push(st)
  if(i%2===1){ await pg.screenshot({path:`shots2/${tag}-b${String(p).replace('.','')}.png`}); shots.push(p) }
}
// one-wheel = one chapter test
const step=await pg.evaluate(async()=>{
  const before=+document.documentElement.dataset.p
  window.dispatchEvent(new Event('resize'))
  return before
})
console.log(JSON.stringify({tag,errs:[...new Set(errs)].slice(0,10),warns:[...new Set(warns)].slice(0,4),
  beats:beats.map(b=>({p:b.p,vis:b.visible.join('|'),fps:b.stats.fps,calls:b.stats.calls,tris:b.stats.tris,meshes:b.stats.meshes,door:+(b.qa.door??-1).toFixed(2)})),
  shots}))
await b.close()
