// Shared capture runtime for the CDP client and Python Playwright recorder.
import fs from 'node:fs/promises';
import path from 'node:path';
export function createRealtimeTrailer({cdp,root}){
 const out=path.join(root,'tmp/trailer_v2');
 async function evaluate(expression){const r=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result?.value;}
 async function install(){return evaluate(`(()=>{
  if(window.__rt)return true;
  const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
  const ctx=canvas.getContext('2d',{alpha:false});
  const a=actx();mbus();const audio=a.createMediaStreamDestination();_comp.connect(audio);
  const original=_drawBurst,originalDraw=draw,originalDrawP=drawP;
  window.__rt={canvas,ctx,audio,original,originalDraw,active:false,events:[],samples:[]};
  // Suppress only the visual hit flicker. Collision/update always sees real iframes.
  drawP=function(){if(!window.__rt.active)return originalDrawP.apply(this,arguments);const saved=P.iframes;try{P.iframes=0;return originalDrawP.apply(this,arguments);}finally{P.iframes=saved;}};
  draw=function(){const r=window.__rt;if(r.active&&r.framing==='boss'){const b=ens.find(e=>e.ib&&e.alive);if(b){G.cam.x=(P.x+b.x)*.5;G.cam.y=(P.y+b.y)*.5-60;}}if(!r.active||r.damageText)return originalDraw.apply(this,arguments);const texts=G.txts;try{G.txts=[];return originalDraw.apply(this,arguments);}finally{G.txts=texts;}};
  _drawBurst=function(){original.apply(this,arguments);const r=window.__rt;if(!r.active)return;
   const now=performance.now(),t=(now-r.start)/1000;
   if(r.protect){P.mp=P.mmp;P.st=P.mst;}
   while(r.events.length&&r.events[0].at<=t){const e=r.events.shift();(0,eval)(e.code);}
   if(r.pan){const f=Math.min(1,t/r.seconds);G.cam.x=r.pan[0]+(r.pan[2]-r.pan[0])*f;G.cam.y=r.pan[1]+(r.pan[3]-r.pan[1])*f;G.shake=0;}
   ctx.fillStyle='#000';ctx.fillRect(0,0,1920,1080);
   for(const id of ['c','fogGL','burstCvs','ct','vfx3dCvs','boss3dCvs']){const c=document.getElementById(id);if(c&&c.width>0&&c.height>0&&getComputedStyle(c).display!=='none')ctx.drawImage(c,0,0,1920,1080);}
   if(r.rageHud){ctx.fillStyle='rgba(12,8,8,.8)';ctx.fillRect(790,944,340,42);ctx.fillStyle='#ed582f';ctx.fillRect(806,970,308*Math.min(1,P.rage/_rageMax()),4);ctx.fillStyle='#f2e7d5';ctx.font='bold 16px Malgun Gothic';ctx.textAlign='left';ctx.fillText('RAGE  '+Math.round(P.rage),806,963);}
   r.samples.push({t,gameTime:_gameTime,hp:P.hp,state:P.s,iframes:P.iframes,dead:!!P._dead,rage:P.rage,alive:ens.reduce((n,e)=>n+(e.alive?1:0),0),kills:G.kills||0,flames:(G._fireZones||[]).filter(z=>z.type==='assaultFlame').map(z=>z._afStk||0)});
  };
  return {audio:a.state,mime:MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')};
 })()`);}
 async function record({name,seconds,events=[],protect=false,pan=null,rageHud=false,framing=null}){
  await fs.mkdir(out,{recursive:true});await cdp.send('Page.bringToFront',{});
  await evaluate(`(()=>{
   window.__rtResult=null;
   const r=window.__rt;r.events=${JSON.stringify(events)};r.samples=[];r.seconds=${seconds};r.protect=${protect};r.pan=${JSON.stringify(pan)};r.rageHud=${rageHud};r.framing=${JSON.stringify(framing)};
   const video=r.canvas.captureStream(60);const stream=new MediaStream([...video.getVideoTracks(),...r.audio.stream.getAudioTracks()]);
   const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9,opus',videoBitsPerSecond:28000000,audioBitsPerSecond:256000});const chunks=[];
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onerror=e=>{window.__rtResult={error:String(e.error)}};
   recorder.onstop=async()=>{r.active=false;video.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:recorder.mimeType});window.__rtBlob=new Uint8Array(await blob.arrayBuffer());window.__rtResult={bytes:blob.size,samples:r.samples,seconds:(performance.now()-r.start)/1000};};
   r.start=performance.now();r.active=true;recorder.start();setTimeout(()=>recorder.stop(),${seconds*1000});
   return true;
  })()`);
  let result=null;const deadline=Date.now()+(seconds+20)*1000;
  while(!result){if(Date.now()>deadline)throw Error('Capture timed out');await new Promise(r=>setTimeout(r,500));result=await evaluate('window.__rtResult');}
  if(result.error)throw Error(result.error);
  const chunks=[];for(let offset=0;offset<result.bytes;offset+=524288){const b64=await evaluate(`(()=>{const a=window.__rtBlob.subarray(${offset},${offset+524288});let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s)})()`);chunks.push(Buffer.from(b64,'base64'));}
  await fs.writeFile(path.join(out,name+'.webm'),Buffer.concat(chunks));await fs.writeFile(path.join(out,name+'.json'),JSON.stringify({config:{name,seconds,events,protect,pan,rageHud,framing},...result},null,2));
  return {name,bytes:result.bytes,frames:result.samples.length,seconds:result.seconds,first:result.samples[0],last:result.samples.at(-1)};
 }
 return {evaluate,install,record};
}
