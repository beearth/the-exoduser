/* Verify corrected B figure remains available without WebGL and hash served assets. */
const fs=require('node:fs/promises'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root='I:/EXODUSER-Storage/codex-takeover/title-final-three-20261102',url='http://127.0.0.1:3398/';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const m=JSON.parse(await fs.readFile('assets/title-signboard/C2/manifest.json','utf8')),receipt={assets:[]};
 for(const f of ['title-signboard.js','assets/title-signboard/C2/still.webp',...Object.values(m.variants).map(v=>v.path)]){
  const r=await fetch(url+f);assert.equal(r.status,200);const served=hash(Buffer.from(await r.arrayBuffer())),local=hash(await fs.readFile(f));assert.equal(served,local);receipt.assets.push({path:f,sha256:local});
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--autoplay-policy=no-user-gesture-required']});
 try{
  const p=await browser.newPage({viewport:{width:3840,height:1080}});
  await p.addInitScript(()=>{const native=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:native.call(this,type,...args);};});
  await p.goto(url+'index.html?test=1');await p.waitForFunction(()=>TitleSignboard.current?.stats.videoFrames>6);
  receipt.fallback=await p.evaluate(()=>({...TitleSignboard.current.stats,muted:TitleSignboard.current.video.muted}));
  assert.equal(receipt.fallback.error,null);assert.equal(receipt.fallback.characterRenderer,'baked-displacement');assert.equal(receipt.fallback.cloudRenderer,'baked-flow');assert.equal(receipt.fallback.muted,true);
  await p.screenshot({path:root+'/webgl-disabled-fallback-3840.png'});
 }finally{await browser.close();}
 await fs.writeFile(root+'/served-assets-and-webgl-fallback.json',JSON.stringify(receipt,null,2));console.log('서빙5개 SHA일치, WebGL불가 B사전렌더 폴백 통과');
})().catch(e=>{console.error(e);process.exitCode=1;});
