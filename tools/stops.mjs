import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']})
const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
await pg.goto('http://127.0.0.1:4181/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,5000))
console.log(await pg.evaluate(()=>{
  const limit=Math.round(document.documentElement.scrollHeight-innerHeight)
  return [...document.querySelectorAll('.panel')].map((p,i)=>{
    const cards=[...p.querySelectorAll('.reveal')]
    return {i, per:cards.length, stops:cards.map(c=>{
      const r=c.getBoundingClientRect(); const centre=r.top+scrollY+r.height/2
      return Math.round(Math.min(limit,Math.max(0,centre-innerHeight/2)))
    }), h:cards.map(c=>Math.round(c.getBoundingClientRect().height))}
  }).concat([{limit}])
}))
await b.close()
