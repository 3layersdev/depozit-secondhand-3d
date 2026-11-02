import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']})
const p = await b.newPage(); await p.setViewport({width:1440,height:900})
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
await p.goto('http://127.0.0.1:4181/?qa=1',{waitUntil:'domcontentloaded',timeout:60000})
await p.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:30000})
await new Promise(r=>setTimeout(r,1800))
const max = await p.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight)
const seek = async (target)=>{
  let lo=0, hi=max
  for (let i=0;i<18;i++){ const mid=(lo+hi)/2; await p.evaluate(y=>window.scrollTo(0,y),mid)
    await new Promise(r=>setTimeout(r,60))
    const cur = await p.evaluate(()=>parseFloat(document.documentElement.dataset.p))
    if (cur < target) lo=mid; else hi=mid }
  await new Promise(r=>setTimeout(r,700))
  return p.evaluate(()=>window.__qa)
}
const out=[]
for (const t of [0.06,0.14,0.2,0.245,0.36,0.44]) out.push(await seek(t))
const rows = out.map(r=>`p=${r.p.toFixed(3)} truck=(${r.truckX.toFixed(2)}, ${r.truckZ.toFixed(2)}) head=${(r.heading*180/Math.PI).toFixed(1)}° door=${r.door.toFixed(2)} slats=${r.slats}`)
console.log(rows.join('\n'))
// heading must match direction of travel between consecutive samples
console.log('errors', errs.slice(0,4))
await b.close()
