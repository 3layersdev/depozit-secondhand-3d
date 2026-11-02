import puppeteer from 'puppeteer-core'
const [url]=process.argv.slice(2)
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:1280,height:800})
const pbr=[]
pg.on('response',r=>{if(r.url().includes('/media/pbr/'))pbr.push(r.status()+' '+r.url().split('/').pop())})
await pg.goto(url,{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,18000))
const st=await pg.evaluate(()=>window.__stats||null)
console.log(JSON.stringify({pbr:pbr.length,ok:pbr.filter(x=>x.startsWith('200')).length,files:pbr.slice(0,3),stats:st}))
await b.close()
