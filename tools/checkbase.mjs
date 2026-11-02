import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath:'/usr/bin/google-chrome', headless:'shell', args:['--no-sandbox','--disable-dev-shm-usage'] })
const p = await b.newPage()
await p.setViewport({width:1280,height:820})
const errs=[]
p.on('pageerror',e=>errs.push('pe:'+e.message.slice(0,90)))
p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text().slice(0,90))})
await p.goto('https://app.base44.com/apps/6ae82a20860deed733537d51/editor/preview',{waitUntil:'networkidle2',timeout:60000}).catch(e=>errs.push('nav:'+e.message.slice(0,60)))
await new Promise(r=>setTimeout(r,9000))
const info = await p.evaluate(()=>({url:location.href,title:document.title,
  iframes:[...document.querySelectorAll('iframe')].map(f=>({src:f.src.slice(0,90),w:f.clientWidth,h:f.clientHeight})),
  text:document.body.innerText.slice(0,200)}))
console.log(JSON.stringify({info,errs:errs.slice(0,5)},null,1))
await p.screenshot({path:'/tmp/base-preview.png'})
await b.close()
