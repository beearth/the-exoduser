/* Supplied final Kling loop, unprocessed; only the skull-waterfall flow is overlaid. */
(function(scope){
 'use strict';
 const ROOT='assets/title-signboard/C2/';
 const moon=Object.freeze({x:1178,y:308,radius:80});
 function rect(w,h){const scale=Math.max(w/2036,h/1016);return {x:(w-2036*scale)/2,y:(h-1016*scale)/2,width:2036*scale,height:1016*scale,scale};}
 function videoSource(){return 'video/title_motion_C2_final_20261102.mp4';}
 function advance(t,dt,paused){return t+(paused?0:Math.max(0,Math.min(.1,dt)));}
 function motionReason(p){return p.hidden?'hidden':p.reduce?'reduced-motion':p.tier==='C'||p.quality==='low'?'low-tier':p.atmos===0?'atmosphere-off':'motion';}
 function flowOffset(t,index){return t*(index===0?100:75);}
 const api=scope.TitleSignboard={rect,advance,motionReason,flowOffset,videoSource,moon};
 if(!scope.document)return;
 api.create=function(host){
  const doc=scope.document,canvas=doc.createElement('canvas');canvas.id='titleSignboardCanvas';canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',display:'none'});
  host.insertBefore(canvas,doc.getElementById('splashTitleUI'));
  const cx=canvas.getContext('2d',{alpha:false});
  const video=doc.createElement('video');video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='none';
  const stats={ready:false,frames:0,time:0,mode:'loading',error:null,flowError:null,renderMs:0,videoTime:0,videoFrames:0,flowFrames:0};
  const reduce=scope.matchMedia('(prefers-reduced-motion: reduce)');
  let active=false,destroyed=false,raf=0,last=0,dirty=true,playPending=false,policyTimer=0,lastMode='';
  const falls=[{"id":"near","box":[860,320,60,253],"mouth":[877,328],"contact":[895,560],"speed":100},{"id":"far","box":[1043,385,44,203],"mouth":[1056,392],"contact":[1066,579],"speed":75}];
  const tile=doc.createElement('canvas');tile.width=128;tile.height=512;
  const tx=tile.getContext('2d'),pixels=tx.createImageData(128,512);
  for(let y=0;y<512;y++)for(let x=0;x<128;x++){
   const a=Math.sin(x*.36+Math.sin(y*Math.PI/128)*1.7),b=Math.sin(y*Math.PI/16+Math.sin(x*.17)*2.1),c=Math.sin(y*Math.PI/32-x*.31);
   const v=99+25*a+30*b+13*c,i=(y*128+x)*4;
   pixels.data[i]=v;pixels.data[i+1]=v*.29;pixels.data[i+2]=v*.27;pixels.data[i+3]=255;
  }
  tx.putImageData(pixels,0,0);
  falls.forEach(f=>{f.mask=new Image();f.mask.src=ROOT+'fall-'+f.id+'.png?v=20261102-final';f.canvas=doc.createElement('canvas');f.canvas.width=f.box[2];f.canvas.height=f.box[3];f.cx=f.canvas.getContext('2d');f.mask.onload=wake;f.mask.onerror=()=>{stats.flowError='Waterfall mask unavailable';wake();};});
  function reason(){
   let opt={},local=false,tier='';
   try{opt=JSON.parse(scope.localStorage.getItem('hellcave_settings')||'{}').opt||{};local=scope.localStorage.getItem('exoduser_menu_reduce_motion')==='1';}catch{}
   try{if(typeof _hwTier!=='undefined')tier=_hwTier;}catch{}
   return motionReason({hidden:doc.hidden,reduce:reduce.matches||local||opt.reduceMotion,tier,quality:opt.quality,atmos:opt.atmos});
  }
  function sync(){
   if(destroyed||!active)return;
   // Load the same video frame even when motion is disabled. No separate still asset.
   if(!video.getAttribute('src')){video.preload='auto';video.src=videoSource();video.load();}
   const mode=reason();if(mode!==lastMode){dirty=true;last=0;lastMode=mode;}
   if(mode!=='motion'||stats.error){video.pause();}else if(!playPending&&video.paused){
    video.muted=true;playPending=true;
    video.play().catch(e=>{if(active&&reason()==='motion'&&e.name!=='AbortError'){stats.error='Video playback unavailable';dirty=true;}}).finally(()=>{playPending=false;wake();});
   }
   if(dirty&&!raf)raf=scope.requestAnimationFrame(draw);
  }
  function waterfall(f,index,t){
   if(!f.mask.complete||!f.mask.naturalWidth)return;
   const [x,y,w,h]=f.box,c=f.cx,offset=flowOffset(t,index)%512;
   c.clearRect(0,0,w,h);c.globalCompositeOperation='source-over';
   for(let k=-1;k<3;k++)c.drawImage(tile,0,offset+k*512,w,512);
   c.globalCompositeOperation='destination-in';c.drawImage(f.mask,0,0);c.globalCompositeOperation='source-over';
   cx.globalAlpha=.38;cx.drawImage(f.canvas,x,y);cx.globalAlpha=1;
   const [mx,my]=f.mouth,g=cx.createRadialGradient(mx,my,1,mx,my,26);g.addColorStop(0,'rgba(119,26,23,.15)');g.addColorStop(1,'rgba(72,20,20,0)');cx.fillStyle=g;cx.fillRect(mx-26,my-26,52,52);
   const [bx,by]=f.contact;
   for(let k=0;k<3;k++){
    const phase=(t*.55+k/3)%1;cx.strokeStyle='rgba(136,70,62,'+((1-phase)*.12)+')';cx.lineWidth=1.2;cx.beginPath();cx.ellipse(bx,by+phase*7,12+phase*43,2+phase*6,0,0,Math.PI*2);cx.stroke();
   }
   const mist=cx.createRadialGradient(bx,by-5,1,bx,by-5,43);mist.addColorStop(0,'rgba(146,105,98,.09)');mist.addColorStop(1,'rgba(84,48,46,0)');cx.fillStyle=mist;cx.fillRect(bx-43,by-48,86,86);
  }
  function draw(now){
   raf=0;if(!active||destroyed)return;
   const mode=reason();stats.mode=stats.error?'media-error':mode;
   if(mode==='hidden'){video.pause();last=0;return;}
   const moving=mode==='motion'&&!stats.error;
   if(moving&&last&&now-last<1000/30){raf=scope.requestAnimationFrame(draw);return;}
   const dt=last?(now-last)/1000:0;last=now;stats.time=advance(stats.time,dt,!moving);
   const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
   const k=Math.min(scope.devicePixelRatio||1,1.5,3840/w,2160/h),rw=Math.round(w*k),rh=Math.round(h*k);
   if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;dirty=true;}
   if(!moving&&!dirty)return;
   const t=performance.now(),r=rect(w,h);
   if(video.readyState>=2){
    cx.setTransform(rw/w,0,0,rh/h,0,0);cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
    cx.drawImage(video,r.x,r.y,r.width,r.height);
    stats.videoFrames++;stats.videoTime=video.currentTime;
    if(moving&&!stats.flowError){
     cx.save();cx.translate(r.x,r.y);cx.scale(r.scale,r.scale);
     falls.forEach((f,i)=>waterfall(f,i,stats.time));stats.flowFrames++;
     cx.restore();
    }
    canvas.style.display='block';stats.ready=true;stats.frames++;stats.renderMs+=performance.now()-t;dirty=false;
   }else if(stats.error){
    cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#000';cx.fillRect(0,0,rw,rh);
    canvas.style.display='block';stats.ready=true;dirty=false;
   }
   if(moving)raf=scope.requestAnimationFrame(draw);
  }
  function wake(){dirty=true;if(active&&!destroyed&&!raf)raf=scope.requestAnimationFrame(draw);}
  function refresh(){dirty=true;last=0;sync();}
  video.addEventListener('loadeddata',wake);
  video.addEventListener('error',()=>{stats.error='Video load failed';video.pause();wake();});
  doc.addEventListener('visibilitychange',refresh);reduce.addEventListener('change',refresh);scope.addEventListener('resize',refresh);scope.addEventListener('storage',refresh);
  const instance={stats,video,start(){if(destroyed)return;active=true;sync();if(!policyTimer)policyTimer=scope.setInterval(sync,500);},stop(){active=false;video.pause();scope.cancelAnimationFrame(raf);raf=0;last=0;scope.clearInterval(policyTimer);policyTimer=0;canvas.style.display='none';},destroy(){
   this.stop();destroyed=true;video.removeAttribute('src');video.load();doc.removeEventListener('visibilitychange',refresh);reduce.removeEventListener('change',refresh);scope.removeEventListener('resize',refresh);scope.removeEventListener('storage',refresh);canvas.remove();
  }};
  api.current=instance;return instance;
 };
})(globalThis);
