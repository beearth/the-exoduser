/* Approved A title painting. All motion is spatially masked; no video or outpaint joins. */
(function(scope){
 'use strict';
 const ROOT='assets/title-signboard/A/';
 function rect(w,h){const scale=Math.max(w/7680,h/2160);return {x:(w-7680*scale)/2,y:(h-2160*scale)/2,width:7680*scale,height:2160*scale,scale};}
 function advance(t,dt,paused){return t+(paused?0:Math.max(0,Math.min(.1,dt)));}
 const api=scope.TitleSignboard={rect,advance};
 if(!scope.document)return;
 const fragment=`precision highp float;
 varying vec2 uv;
 uniform sampler2D plate,hero,masks,hands;
 uniform vec2 view;
 uniform vec4 crop;
 uniform float seconds;
 float band(float a,float b,float c,float d,float x){return smoothstep(a,b,x)*(1.-smoothstep(c,d,x));}
 vec4 over(vec4 a,vec4 b){return vec4(mix(a.rgb,b.rgb,b.a),1.);}
 vec4 hand(vec2 p,vec2 base,float width,float cell,float phase){
  float rise=.5+.5*sin(seconds*.48+phase);
  float height=width*3.5555556*1.78;
  vec2 q=(p-vec2(base.x-width*.5,base.y-height*(.26+.74*rise)))/vec2(width,height);
  if(q.x<0.||q.x>1.||q.y<0.||q.y>1.||p.y>base.y)return vec4(0.);
  q.x+=sin(q.y*7.+seconds*1.15+phase)*.018*(1.-q.y);
  vec4 c=texture2D(hands,vec2((clamp(q.x,0.,1.)+cell)/6.,q.y));
  c.rgb*=vec3(.75,.49,.43);c.a*=smoothstep(0.,.016,base.y-p.y)*(.36+.38*rise);
  return c;
 }
 void main(){
  vec2 p=(uv*view-crop.xy)/crop.zw;
  vec3 mask=texture2D(masks,p).rgb;
  vec2 moon=(p-vec2(.416,.193))*vec2(3.5555556,1.);
  float disc=1.-smoothstep(.116,.127,length(moon));
  float sky=mask.r*(1.-disc);
  vec2 q=p;
  // Three cloud depths advect at different speeds, with fixed skyline and moon.
  float depth=band(.0,.025,.32,.49,p.y);
  q.x+=sky*depth*(sin(seconds*.075+p.y*14.)*.0038+sin(seconds*.123+p.y*29.)*.0015+sin(seconds*.045+p.y*7.)*.002);
  q.y+=sky*depth*sin(seconds*.095+p.x*18.)*.0016;
  // Red river: downstream advection and small cross-current ripples, masked to water.
  float river=mask.g;
  q.x+=river*sin(p.y*190.-seconds*1.45+p.x*24.)*.0008;
  q.y+=river*(sin(p.y*82.-seconds*.72)*.0017+sin(p.x*170.+seconds*.9)*.0005);
  vec4 color=texture2D(plate,q);
  float pulse=sin(seconds*.66)*.5+.5;
  float through=sin(p.x*29.+p.y*13.-seconds*.29)*sin(p.x*14.-p.y*24.+seconds*.17);
  color.rgb*=1.+disc*(pulse-.5)*.11;
  color.rgb+=vec3(.042,.005,.002)*sky*(.45+.55*through)*(1.-smoothstep(.12,.74,length(moon)));
  color.rgb+=vec3(.022,.003,.001)*mask.b*sin(seconds*.66+through*.4);
  float streak=pow(.5+.5*sin(p.y*410.-seconds*1.8+sin(p.x*96.)),12.);
  color.rgb+=vec3(.065,.014,.008)*river*streak*(.6+.4*sin(seconds*.8+p.y*30.));
  color=over(color,hand(p,vec2(.418,.908),.019,2.,.3));
  color=over(color,hand(p,vec2(.384,.964),.023,3.,2.8));
  color=over(color,hand(p,vec2(.451,.803),.0105,4.,4.4));
  color=over(color,hand(p,vec2(.441,.855),.014,1.,1.7));
  color=over(color,hand(p,vec2(.392,.918),.015,5.,5.4));
  color=over(color,hand(p,vec2(.457,.716),.007,0.,3.9));
  // Only the free hair and cloth ends bend. Face, hands, weapon and boots are rigid.
  vec2 hp=p;
  float hair=band(.604,.622,.716,.742,p.x)*band(.145,.175,.335,.365,p.y);
  float cloth=band(.618,.645,.739,.769,p.x)*band(.435,.49,.79,.84,p.y);
  hp.x+=(hair*.0018+cloth*.0021)*sin(seconds*1.05+p.y*12.);
  hp.y+=(hair*.0035+cloth*.003)*sin(seconds*.83+p.x*18.);
  color=over(color,texture2D(hero,hp));
  gl_FragColor=vec4(color.rgb,1.);
 }`;
 api.create=function(host){
  const doc=scope.document,canvas=doc.createElement('canvas');
  canvas.id='titleSignboardCanvas';canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',display:'none'});
  host.insertBefore(canvas,doc.getElementById('splashTitleUI'));
  const stats={ready:false,frames:0,time:0,mode:'loading',error:null,renderMs:0};
  const fallback=new Image();fallback.src=ROOT+'still.webp';
  const reduce=scope.matchMedia('(prefers-reduced-motion: reduce)');
  let gl=null,program=null,textures=[],active=false,destroyed=false,dirty=true,last=0,raf=0;
  function freeze(){let local=false;try{local=localStorage.getItem('exoduser_menu_reduce_motion')==='1';}catch{}return doc.hidden||reduce.matches||local;}
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  function draw(now){
   raf=0;if(!active||destroyed||!gl||!stats.ready)return;
   if(doc.hidden){last=0;return;}
   const paused=freeze();if(!paused&&now-last<1000/30){raf=requestAnimationFrame(draw);return;}
   const dt=last?(now-last)/1000:0;last=now;
   stats.time=advance(stats.time,dt,paused);stats.mode=paused?'reduced-motion':'layered';
   const w=host.clientWidth,h=host.clientHeight,dpr=Math.min(scope.devicePixelRatio||1,1.5),k=Math.min(dpr,5760/w,2160/h);
   const rw=Math.round(w*k),rh=Math.round(h*k);
   if(canvas.width!==rw||canvas.height!==rh){canvas.width=rw;canvas.height=rh;dirty=true;}
   if(!paused||dirty){
    const t=performance.now(),r=rect(w,h);gl.viewport(0,0,rw,rh);gl.useProgram(program);
    gl.uniform2f(gl.getUniformLocation(program,'view'),w,h);
    gl.uniform4f(gl.getUniformLocation(program,'crop'),r.x,r.y,r.width,r.height);
    gl.uniform1f(gl.getUniformLocation(program,'seconds'),stats.time);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);stats.frames++;stats.renderMs+=performance.now()-t;dirty=false;
   }
   canvas.style.display='block';if(!paused)raf=requestAnimationFrame(draw);
  }
  function wake(){dirty=true;last=0;if(active&&!raf)raf=requestAnimationFrame(draw);}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stats.ready=false;stats.mode='still';canvas.style.display='none';cancelAnimationFrame(raf);raf=0;});
  async function init(){
   try{
    gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
    if(!gl)throw Error('WebGL unavailable');
    const vs=shader(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 uv;void main(){uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);gl_Position=vec4(position,0.,1.);}');
    const fs=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);api.buffer=b;
    const files=['background.webp','silvertail.webp','motion-mask.png','hands.png'];
    const imgs=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Layer load failed: '+file));img.src=ROOT+file;})));
    if(destroyed)return;
    imgs.forEach((img,i)=>{
     const max=gl.getParameter(gl.MAX_TEXTURE_SIZE);let input=img;
     if(img.width>max||img.height>max){const c=doc.createElement('canvas'),s=Math.min(max/img.width,max/img.height);c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);input=c;}
     const tex=gl.createTexture();textures.push(tex);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,input);gl.uniform1i(gl.getUniformLocation(program,['plate','hero','masks','hands'][i]),i);
    });
    stats.ready=true;wake();
   }catch(e){stats.error=e.message;stats.mode='still';canvas.style.display='none';}
  }
  function cleanup(){active=false;destroyed=true;cancelAnimationFrame(raf);doc.removeEventListener('visibilitychange',wake);reduce.removeEventListener('change',wake);scope.removeEventListener('resize',wake);scope.removeEventListener('storage',wake);if(gl){textures.forEach(t=>gl.deleteTexture(t));if(program)gl.deleteProgram(program);if(api.buffer)gl.deleteBuffer(api.buffer);gl.getExtension('WEBGL_lose_context')?.loseContext();}canvas.remove();}
  doc.addEventListener('visibilitychange',wake);reduce.addEventListener('change',wake);scope.addEventListener('resize',wake);scope.addEventListener('storage',wake);
  const instance={stats,still:fallback,start(){active=true;wake();},stop(){active=false;cancelAnimationFrame(raf);raf=0;last=0;canvas.style.display='none';},destroy:cleanup};
  api.current=instance;init();return instance;
 };
})(globalThis);
