import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--enable-unsafe-swiftshader']})
const pg=await b.newPage(); await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true})
const logs=[]
pg.on('console',m=>logs.push(m.type()+': '+m.text().slice(0,200)))
pg.on('pageerror',e=>logs.push('pageerror: '+e.stack?.split('\n').slice(0,3).join(' | ')))
await pg.goto(process.argv[2],{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,8000))
console.log(JSON.stringify({logs:logs.slice(0,8), panels:await pg.evaluate(()=>document.querySelectorAll('section.panel').length), html:await pg.evaluate(()=>document.body.innerHTML.length)}))
await b.close()
