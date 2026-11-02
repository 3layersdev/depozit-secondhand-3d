import puppeteer from 'puppeteer-core'
import { createWriteStream, mkdirSync } from 'node:fs'
const b = await puppeteer.launch({ executablePath:'/usr/bin/google-chrome', headless:'shell',
  args:['--no-sandbox','--disable-dev-shm-usage','--lang=en-US','--window-size=1400,1000'] })
const p = await b.newPage()
await p.setViewport({width:1400,height:1000})
await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36')
const imgs = new Map()
p.on('response', async (r) => {
  const u = r.url()
  if (!u.includes('scontent') || !/\.(jpg|jpeg|webp|png)/.test(u.split('?')[0])) return
  const len = Number(r.headers()['content-length'] || 0)
  if (len > 60000) imgs.set(u.split('?')[0].split('/').pop(), { u, len })
})
async function scrape(url, scrolls = 12) {
  await p.goto(url, { waitUntil:'domcontentloaded', timeout:45000 }).catch(()=>{})
  for (let i=0;i<scrolls;i++){ await p.evaluate(()=>window.scrollBy(0,1200)); await new Promise(r=>setTimeout(r,900)) }
  await p.evaluate(()=>window.scrollTo(0,0))
  await new Promise(r=>setTimeout(r,1500))
}
await scrape('https://www.facebook.com/depozitsecondhandromania/')
await scrape('https://www.facebook.com/depozitsecondhandromania/photos', 8)
const html = await p.content()
const vids = [...html.matchAll(/"(?:playable_url|browser_native_hd_url|browser_native_sd_url)\\?"\s*:\s*"([^"]+)"/g)].map(m=>m[1].replace(/\\\\u0025/g,'%').replace(/\\\\\//g,'/'))
const list = [...imgs.values()].sort((a,b)=>b.len-a.len)
mkdirSync('public/media/fb',{recursive:true})
let i=0
for (const it of list.slice(0,14)) { i++; const f=`public/media/fb/lb-${String(i).padStart(2,'0')}.jpg`
  await p.evaluate(async (src,path)=>{ const r=await fetch(src); const b=await r.blob();
    return new Promise(res=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(b) }) }, it.u, f).then(async d=>{
      if (typeof d==='string' && d.startsWith('data:')) { const buf=Buffer.from(d.split(',')[1],'base64'); (await import('node:fs')).writeFileSync(f, buf) } }).catch(()=>{})
}
console.log(JSON.stringify({ large: list.slice(0,14).map(x=>({k:x.u.split('/').pop().slice(0,40), len:x.len})),
  vids: [...new Set(vids)].slice(0,5), saved: i }, null, 1))
await b.close()
