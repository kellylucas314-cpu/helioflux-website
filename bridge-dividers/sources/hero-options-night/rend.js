// node rend.js <page> <query> <w> <h> still <t> <out.png>
// node rend.js <page> <query> <w> <h> video <fps> <start> <end> <framesdir>
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const here = __dirname;
const [page_, q, W, H, mode, a, b, c, d] = process.argv.slice(2);
const MIME = { '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png','.json':'application/json','.ttf':'font/ttf' };
const server = http.createServer((req,res)=>{ const p=path.join(here, decodeURIComponent(req.url.split('?')[0])); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);return res.end();} res.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'}); fs.createReadStream(p).pipe(res); });
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r)); const port=server.address().port;
  const browser = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars'] });
  const pg = await browser.newPage({ viewport:{width:+W,height:+H}, deviceScaleFactor:1 });
  pg.on('pageerror', e=>console.error('page error:', e.message)); pg.on('console', m=>{ if(m.type()==='error') console.error('console:', m.text()); });
  await pg.goto(`http://127.0.0.1:${port}/${page_}?export=1&dpr=1&hud=0&accents=0&${q}`);
  await pg.waitForFunction(()=>window.__ready===true,null,{timeout:180000});
  const dur = await pg.evaluate(()=>window.__duration); console.log('duration', dur);
  if (mode==='still') { await pg.evaluate(t=>window.__seek(t), +a); await pg.screenshot({path:b}); console.log('wrote', b); }
  else { const fps=+a, s=+b, e=(c==='end'?dur:+c), dir=d; fs.mkdirSync(dir,{recursive:true}); const n=Math.round((e-s)*fps); const t0=Date.now();
    for (let i=0;i<n;i++){ await pg.evaluate(t=>window.__seek(t), s+i/fps); await pg.screenshot({path:path.join(dir,`f_${String(i).padStart(5,'0')}.png`)}); if(i%60===0) console.log(`frame ${i}/${n} ${((Date.now()-t0)/1000).toFixed(0)}s`); }
    console.log('done', n); }
  await browser.close(); server.close();
})();
