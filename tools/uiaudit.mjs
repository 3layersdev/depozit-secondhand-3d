import puppeteer from 'puppeteer-core'
import { PNG } from 'pngjs'
import fs from 'fs'
const url = process.argv[2] || 'https://3layersdev.github.io/depozit-secondhand-3d/?qa=1'
const W = +process.argv[3] || 1440, H = +process.argv[4] || 900
const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'shell',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']})
const pg = await b.newPage()
await pg.setViewport({width:W,height:H,deviceScaleFactor:1,isMobile:W<600,hasTouch:W<600})
const errs=[]; pg.on('pageerror',e=>errs.push(String(e).slice(0,120)))
await pg.goto(url,{waitUntil:'domcontentloaded'})
await pg.waitForFunction(()=>document.documentElement.dataset.p!==undefined,{timeout:45000})
await new Promise(r=>setTimeout(r,6000))
const max = await pg.evaluate(()=>document.documentElement.scrollHeight-innerHeight)
const boxes = []
for (const t of [0.12,0.3,0.46,0.6,0.78,0.92]) {
  let lo=0,hi=max
  for(let i=0;i<15;i++){const m=(lo+hi)/2;await pg.evaluate(y=>scrollTo(0,y),m);await new Promise(r=>setTimeout(r,80));const p=parseFloat(await pg.evaluate(()=>document.documentElement.dataset.p||'0'));if(p<t)lo=m;else hi=m}
  await new Promise(r=>setTimeout(r,1200))
  const buf = await pg.screenshot()
  const png = PNG.sync.read(Buffer.from(buf))
  const nodes = await pg.evaluate((pts)=>{
    const out=[]
    const sel='h1,h2,h3,p,li,a,strong,span.eyebrow,[class*="kicker"],[class*="note"]'
    for (const el of document.querySelectorAll(sel)) {
      const cs=getComputedStyle(el), r=el.getBoundingClientRect()
      if (r.width<8||r.height<6) continue
      if (r.bottom<0||r.top>innerHeight) continue
      const txt=(el.textContent||'').trim().replace(/\s+/g,' ')
      if (!txt) continue
      if (cs.opacity==='0'||cs.visibility==='hidden') continue
      out.push({tag:el.tagName.toLowerCase(),cls:(el.className||'').toString().slice(0,40),
        txt:txt.slice(0,70),x:r.x,y:r.y,w:r.width,h:r.height,
        fs:parseFloat(cs.fontSize),lh:parseFloat(cs.lineHeight)||0,
        color:cs.color,bg:cs.backgroundColor,weight:cs.fontWeight,
        overflow: el.scrollWidth-el.clientWidth>2})
    }
    return out
  }, [])
  boxes.push({t, png, nodes})
}
// contrast estimate: text pixels vs surrounding, inside each node box
const lum = (r,g,b)=>{const f=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)}
const res=[]
for (const {t,png,nodes} of boxes) {
  for (const n of nodes) {
    const x0=Math.max(0,Math.round(n.x)), y0=Math.max(0,Math.round(n.y))
    const x1=Math.min(png.width,Math.round(n.x+n.w)), y1=Math.min(png.height,Math.round(n.y+n.h))
    if (x1-x0<6||y1-y0<6) continue
    const vals=[]
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(png.width*y+x)<<2;vals.push(lum(png.data[i],png.data[i+1],png.data[i+2]))}
    vals.sort((a,b)=>a-b)
    const q=(p)=>vals[Math.min(vals.length-1,Math.floor(vals.length*p))]
    const dark=q(0.08), light=q(0.92)
    const ratio=(Math.max(dark,light)+0.05)/(Math.min(dark,light)+0.05)
    res.push({t:Math.round(t*100),tag:n.tag,txt:n.txt,fs:n.fs,lh:n.lh,ratio:+ratio.toFixed(2),color:n.color,overflow:n.overflow})
  }
}
// structural checks
const struct = await pg.evaluate(()=>({
  hScroll: document.documentElement.scrollWidth-window.innerWidth,
  smallTargets:[...document.querySelectorAll('a,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.width<40||r.height<40)}).map(e=>(e.textContent||'').trim().slice(0,24)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)).slice(0,8),
  noAlt:[...document.images].filter(i=>!i.alt).length,
  imgs:document.images.length,
  headings:[...document.querySelectorAll('h1,h2,h3')].map(h=>h.tagName+' '+parseFloat(getComputedStyle(h).fontSize)+' '+(h.textContent||'').trim().slice(0,40)),
  bodyFont:getComputedStyle(document.body).fontFamily,
  maxLine: (()=>{let m=0;document.querySelectorAll('p').forEach(p=>{const s=getComputedStyle(p);const fs2=parseFloat(s.fontSize);m=Math.max(m,Math.round(p.getBoundingClientRect().width/fs2))});return m})()
}))
fs.writeFileSync(`shots3/audit-${W}.json`, JSON.stringify({errs,res,struct},null,1))
const bad = res.filter(r=>r.ratio<4.5)
console.log(JSON.stringify({n:res.length,lowContrast:bad.slice(0,10),struct,errs}))
await b.close()
