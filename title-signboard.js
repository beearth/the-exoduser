/* C2 Kling loop with measured, feathered skull-mouth waterfall masks. */
(function(scope){
 'use strict';
 const ROOT='assets/title-signboard/C2/';
 const moon=Object.freeze({x:1180,y:309,radius:79});
 const moonPlate=Object.freeze({x:1024.8927083333333,y:0,width:335.09166666666664,height:460.2208333333333});
 function moonPulse(t){return .02+.01*Math.sin(t*Math.PI/5);}
 function cloudFlow(t){return [7*Math.sin(t*.33),1.5*Math.sin(t*.27)];}
 function rect(w,h){const scale=Math.max(w/2036,h/1018);return {x:(w-2036*scale)/2,y:(h-1018*scale)/2,width:2036*scale,height:1018*scale,scale};}
 function videoWidth(w,h,dpr=1){const need=Math.max(w,h*2)*Math.min(dpr,1.5);return need<=1920?1920:need<=2560?2560:3840;}
 function videoSource(width){return 'video/title_motion_C2_close_'+width+'_20261102.mp4';}
 function advance(t,dt,paused){return t+(paused?0:Math.max(0,Math.min(.1,dt)));}
 function motionReason(p){return p.hidden?'hidden':p.reduce?'reduced-motion':p.tier==='C'||p.quality==='low'?'low-tier':p.atmos===0?'atmosphere-off':'motion';}
 function flowOffset(t,index){return t*(index===0?100:75);}
 const api=scope.TitleSignboard={rect,advance,motionReason,flowOffset,videoWidth,videoSource,moon,moonPulse,cloudFlow};

 function createCloudShader(doc,character=false){
  const canvas=doc.createElement('canvas');canvas.width=character?3840:2036;canvas.height=character?1920:1018;
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,preserveDrawingBuffer:true});if(!gl)return null;
  try{
   function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
   const vs=shader(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 uv;void main(){uv=(position+1.0)*.5;gl_Position=vec4(position,0.,1.);}');
   const fs=shader(gl.FRAGMENT_SHADER,character?`precision highp float;uniform sampler2D film;uniform float time;varying vec2 uv;
    void main(){vec2 q=vec2(uv.x*3840.,(1.-uv.y)*1920.);
     float outside=max(max(2390.-q.x,q.x-3530.),max(430.-q.y,q.y-1490.));
     float alpha=1.-smoothstep(0.,65.,outside);
     float box=smoothstep(2390.,2480.,q.x)*(1.-smoothstep(3440.,3530.,q.x))*smoothstep(430.,505.,q.y)*(1.-smoothstep(1415.,1490.,q.y));
     float hair=smoothstep(2830.,3180.,q.x)*(1.-smoothstep(880.,970.,q.y));
     float cape=smoothstep(3060.,3280.,q.x)*smoothstep(890.,980.,q.y)*(1.-smoothstep(1290.,1380.,q.y));
     float amount=box*max(hair,cape),phase=time*6.28318530718/(206./24.);
     vec2 delta=vec2(2.4*amount*sin(phase+(q.y-430.)/260.),-1.1*amount*sin(phase+(q.x-2700.)/220.))/vec2(3840.,1920.);
     gl_FragColor=vec4(texture2D(film,uv+delta).rgb,alpha);
    }`:'precision highp float;uniform sampler2D film;uniform sampler2D mask;uniform vec2 flow;varying vec2 uv;void main(){float a=texture2D(mask,uv).r;vec2 p=clamp(uv+vec2(flow.x/2036.,-flow.y/1018.)*a,vec2(.001),vec2(.999));gl_FragColor=vec4(texture2D(film,p).rgb,a);}');
   const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Cloud shader link');gl.useProgram(program);
   const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const loc=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
   const textures=[gl.createTexture(),gl.createTexture()];textures.forEach((t,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);});
   gl.uniform1i(gl.getUniformLocation(program,'film'),0);gl.uniform1i(gl.getUniformLocation(program,'mask'),1);const flow=gl.getUniformLocation(program,'flow'),time=gl.getUniformLocation(program,'time');let loaded=false,failed=false;
   return {canvas,draw(video,mask,t){if(failed||gl.isContextLost())return false;try{gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);if(!loaded&&!character){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,textures[1]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mask);}gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[0]);if(!character||!loaded)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);loaded=true;gl.uniform2fv(flow,cloudFlow(t));gl.uniform1f(time,t);gl.viewport(0,0,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLES,0,6);return true;}catch{failed=true;return false;}},destroy(){textures.forEach(t=>gl.deleteTexture(t));gl.deleteBuffer(b);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
  }catch{gl.getExtension('WEBGL_lose_context')?.loseContext();return null;}
 }
 if(!scope.document)return;
 api.create=function(host){
  const doc=scope.document,canvas=doc.createElement('canvas');canvas.id='titleSignboardCanvas';canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',display:'none'});
  host.insertBefore(canvas,doc.getElementById('splashTitleUI'));
  const cx=canvas.getContext('2d',{alpha:false}),still=new Image();
  still.src=ROOT+'still.webp?v=20261102-blade';
  const sky=new Image();sky.src=ROOT+'moon-static.webp';sky.onload=wake;
  sky.onerror=()=>{stats.error='Moon plate unavailable';wake();};
  const cloud=new Image();cloud.src=ROOT+'cloud-video-mask.png?v=20261102-clean';cloud.onload=wake;
  const cloudShader=createCloudShader(doc);
  const characterShader=createCloudShader(doc,true);
  const video=doc.createElement('video');video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='none';
  const stats={ready:false,frames:0,time:0,mode:'loading',error:null,renderMs:0,videoTime:0,videoFrames:0,flowFrames:0,cloudFrames:0,moonFrames:0,characterFrames:0,characterRenderer:'baked-displacement',pulseAlpha:0,cloudRenderer:'baked-flow'};
  const reduce=scope.matchMedia('(prefers-reduced-motion: reduce)');
  let active=false,destroyed=false,raf=0,last=0,dirty=true,hasVideo=false,playPending=false,policyTimer=0,lastMode='',selectedWidth=0,restoreTime=0;
  const falls=[{"id":"near","box":[862,319,54,241],"mouth":[876,329],"contact":[893,551],"speed":100},{"id":"far","box":[1041,381,41,200],"mouth":[1053,389],"contact":[1063,575],"speed":75}];
  const tile=doc.createElement('canvas');tile.width=128;tile.height=512;
  const tx=tile.getContext('2d'),pixels=tx.createImageData(128,512);
  for(let y=0;y<512;y++)for(let x=0;x<128;x++){
   const a=Math.sin(x*.36+Math.sin(y*Math.PI/128)*1.7),b=Math.sin(y*Math.PI/16+Math.sin(x*.17)*2.1),c=Math.sin(y*Math.PI/32-x*.31);
   const v=99+25*a+30*b+13*c,i=(y*128+x)*4;
   pixels.data[i]=v;pixels.data[i+1]=v*.29;pixels.data[i+2]=v*.27;pixels.data[i+3]=255;
  }
  tx.putImageData(pixels,0,0);
  falls.forEach(f=>{f.mask=new Image();f.mask.src=ROOT+'fall-'+f.id+'.png';f.canvas=doc.createElement('canvas');f.canvas.width=f.box[2];f.canvas.height=f.box[3];f.cx=f.canvas.getContext('2d');f.mask.onload=wake;f.mask.onerror=()=>{stats.error='Waterfall mask unavailable';};});
  function reason(){
   let opt={},local=false,tier='';
   try{opt=JSON.parse(scope.localStorage.getItem('hellcave_settings')||'{}').opt||{};local=scope.localStorage.getItem('exoduser_menu_reduce_motion')==='1';}catch{}
   try{if(typeof _hwTier!=='undefined')tier=_hwTier;}catch{}
   return motionReason({hidden:doc.hidden,reduce:reduce.matches||local||opt.reduceMotion,tier,quality:opt.quality,atmos:opt.atmos});
  }
  function sync(){
   if(destroyed)return;
   const mode=reason();if(mode!==lastMode){dirty=true;last=0;lastMode=mode;}
   if(!active||mode!=='motion'||stats.error){video.pause();}else if(!playPending){
    const width=videoWidth(host.clientWidth,host.clientHeight,scope.devicePixelRatio||1);
    if(selectedWidth!==width){restoreTime=video.currentTime||0;selectedWidth=width;stats.mediaWidth=width;video.src=videoSource(width)+'?v=20261102-blade';}
    if(!video.paused)return;
    video.muted=true;playPending=true;video.play().catch(e=>{if(active&&reason()==='motion'&&e.name!=='AbortError'){stats.error='Video playback unavailable';dirty=true;}}).finally(()=>{playPending=false;wake();});
   }
   if(dirty&&!raf&&active)raf=scope.requestAnimationFrame(draw);
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
   const mode=reason();stats.mode=stats.error?'still-fallback':mode;
   if(mode==='hidden'){video.pause();last=0;return;}
   const moving=mode==='motion'&&!stats.error;
   if(moving&&now-last<1000/30){raf=scope.requestAnimationFrame(draw);return;}
   const dt=last?(now-last)/1000:0;last=now;stats.time=advance(stats.time,dt,!moving);
   const w=host.clientWidth,h=host.clientHeight,k=Math.min(scope.devicePixelRatio||1,1.5,3840/w,2160/h);
   const rw=Math.round(w*k),rh=Math.round(h*k);
   if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;dirty=true;}
   if(!moving&&!dirty)return;
   const t=performance.now(),r=rect(w,h),videoReady=moving&&video.readyState>=2&&sky.complete&&sky.naturalWidth>0;
   if(moving&&hasVideo&&!videoReady&&!video.error){raf=scope.requestAnimationFrame(draw);return;}
   if(videoReady||still.complete&&still.naturalWidth){
    cx.setTransform(rw/w,0,0,rh/h,0,0);cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
    cx.drawImage(videoReady?video:still,r.x,r.y,r.width,r.height);
    cx.save();cx.translate(r.x,r.y);cx.scale(r.width/2036,r.height/1018);
    if(videoReady){hasVideo=true;stats.videoFrames++;stats.videoTime=video.currentTime;}
    if(videoReady){
     if(cloudShader&&cloud.complete&&cloud.naturalWidth&&cloudShader.draw(video,cloud,stats.time)){cx.drawImage(cloudShader.canvas,0,0,2036,1018);stats.cloudRenderer='webgl-flow';}
     stats.cloudFrames++;
    }
    // Disc only after cloud flow: neither the video nor its moving cloud overlay
    // can reintroduce the original moon. Until this plate loads, use the new still.
    if(videoReady){cx.drawImage(sky,moonPlate.x,moonPlate.y,moonPlate.width,moonPlate.height);stats.moonFrames++;}
    // A complete single-source still figure covers every video figure pixel.
    // Only the free hair/cape tips move; the back hub/blade, hands and feet stay rigid.
    if(videoReady&&still.complete&&still.naturalWidth&&characterShader&&characterShader.draw(still,null,stats.time)){
     cx.drawImage(characterShader.canvas,0,0,2036,1018);stats.characterFrames++;stats.characterRenderer='webgl-still-displacement';
    }
    stats.pulseAlpha=0;
    if(moving&&!stats.error){
     stats.pulseAlpha=moonPulse(stats.time);
     cx.save();cx.globalCompositeOperation='screen';cx.globalAlpha=stats.pulseAlpha;
     const glow=cx.createRadialGradient(moon.x,moon.y,0,moon.x,moon.y,145);
     glow.addColorStop(0,'rgba(227,116,91,.8)');glow.addColorStop(.55,'rgba(207,82,64,.6)');glow.addColorStop(1,'rgba(146,41,33,0)');
     cx.fillStyle=glow;cx.fillRect(moon.x-145,moon.y-145,290,290);cx.restore();
     falls.forEach((f,i)=>waterfall(f,i,stats.time));stats.flowFrames++;
    }
    cx.restore();canvas.style.display='block';stats.ready=true;stats.frames++;stats.renderMs+=performance.now()-t;dirty=false;
   }
   if(moving)raf=scope.requestAnimationFrame(draw);
  }
  function wake(){dirty=true;if(active&&!destroyed&&!raf)raf=scope.requestAnimationFrame(draw);}
  function refresh(){dirty=true;last=0;sync();}
  video.addEventListener('loadedmetadata',()=>{if(restoreTime>0&&Number.isFinite(video.duration))video.currentTime=restoreTime%video.duration;});
  video.addEventListener('loadeddata',wake);video.addEventListener('error',()=>{stats.error='Video load failed';hasVideo=false;video.pause();wake();});
  still.onload=wake;still.onerror=()=>{stats.stillError=true;wake();};
  doc.addEventListener('visibilitychange',refresh);reduce.addEventListener('change',refresh);scope.addEventListener('resize',refresh);scope.addEventListener('storage',refresh);
  const instance={stats,still,video,start(){active=true;sync();if(!policyTimer)policyTimer=scope.setInterval(sync,500);},stop(){active=false;video.pause();scope.cancelAnimationFrame(raf);raf=0;last=0;scope.clearInterval(policyTimer);policyTimer=0;canvas.style.display='none';},destroy(){
   this.stop();destroyed=true;if(cloudShader)cloudShader.destroy();if(characterShader)characterShader.destroy();video.removeAttribute('src');video.load();doc.removeEventListener('visibilitychange',refresh);reduce.removeEventListener('change',refresh);scope.removeEventListener('resize',refresh);scope.removeEventListener('storage',refresh);canvas.remove();
  }};
  api.current=instance;return instance;
 };
})(globalThis);
