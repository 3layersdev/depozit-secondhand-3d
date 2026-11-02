import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars']})
const pg = await b.newPage()
await pg.setViewport({width:1440,height:900})
const errs=[]; pg.on('pageerror',e=>errs.push(e.message))
await pg.goto('http://127.0.0.1:4181/', {waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,6000))
const rows=[]
for (let i=0;i<9;i++){
  await pg.evaluate(()=>window.dispatchEvent(new WheelEvent('wheel',{deltaY:320, bubbles:true, cancelable:true})))
  await new Promise(r=>setTimeout(r,1100))
  const row = await pg.evaluate(()=>{
    const y = window.scrollY
    let best=null, bd=1e9
    document.querySelectorAll('.panel').forEach(p=>{
      const card = p.querySelector('.reveal') || p
      const r = card.getBoundingClientRect()
      const c = r.top + window.scrollY + r.height/2
      const d = Math.abs(c - (y + window.innerHeight/2))
      if (d < bd){ bd = d; best = {idx:[...document.querySelectorAll('.panel')].indexOf(p), off: Math.round(d), lbl:(card.querySelector('h2,h1')||{}).textContent?.slice(0,26)||''} }
    })
    return {y:Math.round(y), ...best}
  })
  rows.push(row)
}
console.log(JSON.stringify(rows,null,0).replace(/},/g,'},\n'))
console.log('pageerrors:', errs.length)
await b.close()
