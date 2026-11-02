import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath:'/usr/bin/google-chrome', headless:'shell',
  args:['--no-sandbox','--disable-dev-shm-usage','--lang=en-US'] })
const p = await b.newPage()
await p.setViewport({width:1280,height:900})
await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36')
for (const url of ['https://www.facebook.com/depozitsecondhandromania/photos','https://m.facebook.com/depozitsecondhandromania/photos']) {
  try {
    await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000})
    await new Promise(r=>setTimeout(r,5000))
    const res = await p.evaluate(() => {
      const imgs=[...document.querySelectorAll('img')].map(i=>i.src).filter(s=>s.includes('scontent'))
      return { url: location.href, title: document.title, imgs: [...new Set(imgs)].slice(0,20),
        text: document.body.innerText.slice(0,300), login: /log in|conecteaz|password/i.test(document.body.innerText.slice(0,400)) }
    })
    console.log(JSON.stringify(res,null,1))
  } catch(e) { console.log('ERR', url, e.message.slice(0,120)) }
}
await b.close()
