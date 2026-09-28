// Developer-only instrumentation loaded into the disposable 127.0.0.1:3338 tab.
// Records the real game's canvas layers and final WebAudio mix. No generated footage.
(()=>{
  if(location.origin!=='http://127.0.0.1:3338')throw Error('Capture origin required');
  if(window.__expoCapture)throw Error('Already installed');
  const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
  const ctx=canvas.getContext('2d',{alpha:false});
  const audioContext=actx();mbus();
  const audio=audioContext.createMediaStreamDestination();_comp.connect(audio);
  const original=_drawBurst;
  const r=window.__expoCapture={canvas,audio,active:false,samples:[],events:[],result:null};
  _drawBurst=function(){
    original.apply(this,arguments);
    if(!r.active)return;
    // Capture-only protection; attacks, AI and VFX still use the real runtime.
    P.hp=P.mhp;
    const elapsed=(performance.now()-r.started)/1000;
    while(r.events.length&&r.events[0].at<=elapsed){r.events.shift().run();}
    ctx.fillStyle='#000';ctx.fillRect(0,0,1920,1080);
    for(const id of ['c','fogGL','burstCvs','ct','vfx3dCvs','boss3dCvs']){
      const layer=document.getElementById(id);
      if(layer&&layer.width>1&&layer.height>1&&getComputedStyle(layer).display!=='none')ctx.drawImage(layer,0,0,1920,1080);
    }
    r.samples.push({t:elapsed,gameTime:_gameTime,x:P.x,y:P.y,hp:P.hp,alive:ens.filter(e=>e.alive).length,kills:G.kills||0});
  };
  r.stage=function(count=64,radius=400){
    G.on=true;G.paused=false;OPT.diff=5;G._stageDiffOff=0;
    G._fbSpawned=true;G._fdSpawned=true;G._fieldBosses=[];G._fieldBoss=null;G._fireDevils=[];G.spawnHoles=[];
    ens.length=0;projs.length=0;pProjs.length=0;worldItems.length=0;G._fireZones=[];G.txts.length=0;
    _vfxAnims.length=0;_fireExps.length=0;_corpses.forEach(c=>c.active=false);
    G._gSlamWave=null;G._flashT=0;G.chromaT=0;G.shake=0;G.hitStop=0;G.slowMo=0;
    P.x=3740;P.y=6900;G.cam.x=P.x;G.cam.y=P.y;P.s='idle';P.st2=0;P.mhp=1000000;P.hp=P.mhp;
    P.mp=P.mmp;P.st=P.mst;P.iframes=0;P._dead=false;P._ioActive=false;P._ioCd=0;P._gslCd=0;P._ancCd=0;
    G.mats=10000;P.rage=0;
    for(const k in K)K[k]=false;for(let i=0;i<3;i++){MB[i]=false;MBjust[i]=false;}
    for(let i=0;i<count;i++){
      const a=i*2.3999632297,d=radius+(i%9)*24;
      const e=mkEn(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,0,[0,1,3,4,6,7][i%6],false,[EL.P,EL.F,EL.I,EL.L,EL.D][i%5]);
      if(e)ens.push(e);
    }
    _shDirty=true;shRebuild();rz();
    mouse.x=VW*.68;mouse.y=VH*.42;
    return {count:ens.length,difficulty:OPT.diff,level:P.lv};
  };
  r.record=async function(name,seconds,events=[]){
    if(r.active)throw Error('Recording already active');
    await audioContext.resume();
    const video=canvas.captureStream(30);
    const stream=new MediaStream([...video.getVideoTracks(),...audio.stream.getAudioTracks()]);
    const mime='video/webm;codecs=vp9,opus';
    if(!MediaRecorder.isTypeSupported(mime))throw Error('VP9 capture unavailable');
    const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:30000000,audioBitsPerSecond:256000});
    const chunks=[];r.samples=[];r.events=events;r.result=null;r.started=performance.now();r.active=true;
    rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    rec.onerror=e=>{r.active=false;r.result={error:String(e.error)}};
    rec.onstop=async()=>{
      r.active=false;video.getTracks().forEach(t=>t.stop());
      for(const k in K)K[k]=false;for(let i=0;i<3;i++)MB[i]=false;
      const blob=new Blob(chunks,{type:mime});
      const report={name,seconds,bytes:blob.size,width:canvas.width,height:canvas.height,targetFps:30,
        layers:['c','fogGL','burstCvs','ct','vfx3dCvs','boss3dCvs'],domHudIncluded:false,
        source:'current game.html runtime',audio:'current game WebAudio compressor output',samples:r.samples};
      try{
        if(r.samples.length<seconds*20||r.samples.at(-1).t<seconds-.5)throw Error('Incomplete or stalled runtime capture');
        const a=await fetch('/__recording?name='+name+'.webm',{method:'POST',body:blob});
        const b=await fetch('/__recording?name='+name+'.json',{method:'POST',body:JSON.stringify(report)});
        if(!a.ok||!b.ok)throw Error('Capture save failed');
        r.result={ok:true,name,bytes:blob.size,frames:r.samples.length,first:r.samples[0],last:r.samples.at(-1)};
      }catch(e){r.result={error:String(e)}}
    };
    rec.start();setTimeout(()=>{if(rec.state==='recording')rec.stop()},seconds*1000);
    return {recording:true,name,seconds};
  };
  return {installed:true};
})();
