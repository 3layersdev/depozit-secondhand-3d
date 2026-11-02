import puppeteer from 'puppeteer-core'
const BEATS=[[0,.16],[.16,.32],[.32,.484],[.484,.64],[.64,.77],[.77,.9],[.9,1]]
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']})
const p=await b.newPage(); await p.setViewport({width:1440,height:900})
p.on('pageerror',e=>console.log('PAGEERR',e.message))
p.on('error',e=>console.log('CRASH',e.message))
await p.goto('https://3layersdev.github.io/depozit-secondhand-3d/?qa=1',{waitUntil:'domcontentloaded',timeout:45000})
await p.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:25000})
await new Promise(r=>setTimeout(r,1500))
const info=await p.evaluate(()=>{
  const panels=[...document.querySelectorAll('.panel')]
  return {tops:panels.map(el=>el.getBoundingClientRect().top+window.scrollY), max:document.documentElement.scrollHeight-window.innerHeight}
})
const targets=process.argv.slice(2).map(Number)
for(const t of targets){
  let i=BEATS.findIndex(([a,b2])=>t>=a&&t<b2); if(i<0)i=BEATS.length-1
  const [a,b2]=BEATS[i]; const frac=(t-a)/(b2-a)
  const top=info.tops[i], next=info.tops[i+1]??info.max
  const y=Math.round(top+frac*(next-top-1))
  await p.evaluate(v=>window.scrollTo(0,v),y)
  await new Promise(r=>setTimeout(r,600))
  const q=await p.evaluate(()=>window.__qa)
  const pv=await p.evaluate(()=>document.documentElement.dataset.p)
  console.log(`want=${t} got=${pv} truck=(${q.truckX.toFixed(2)},${q.truckZ.toFixed(2)}) head=${(q.heading*180/Math.PI).toFixed(1)}deg door=${q.door.toFixed(2)} slats=${q.slats}`)
}
await b.close()
