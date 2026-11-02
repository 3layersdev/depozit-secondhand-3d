import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage']})
const pg=await b.newPage(); await pg.setViewport({width:1440,height:900})
const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())})
await pg.goto('http://127.0.0.1:4181/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,6000))
console.log(await pg.evaluate(()=>{
  const panels=[...document.querySelectorAll('.panel')]
  return {scrollH:document.documentElement.scrollHeight, innerH:innerHeight, panels:panels.length,
    reveals:document.querySelectorAll('.reveal').length,
    bodyOverflow:getComputedStyle(document.body).overflow, htmlOverflow:getComputedStyle(document.documentElement).overflow,
    cards:panels.map(p=>{const c=p.querySelector('.reveal');return c?Math.round(c.getBoundingClientRect().height):null})}
}))
console.log('errors',errs.slice(0,3))
await b.close()
