'use strict';
// Reads the unchanged original PNGs and executes the production C frame aperture function.
// Source texel/linear-sample contracts only; this does not render a Unity or Metal framebuffer.
const fs=require('fs'),path=require('path'),zlib=require('zlib'),cp=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../..');
const shader=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Shaders/HudPrototypeC.shader'),'utf8');
const hud=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeHud.PrototypeC.cs'),'utf8');
let checks=0;function check(ok,message){checks++;assert.ok(ok,message);}
function near(a,b,message,tolerance=1e-9){check(Math.abs(a-b)<tolerance,message+': '+a+' != '+b);}
function body(name){const start=shader.indexOf(' '+name+'(');assert.ok(start>=0,'production function '+name);
 const open=shader.indexOf('{',start);let depth=1,end=open+1;
 for(;depth&&end<shader.length;end++){if(shader[end]==='{')depth++;if(shader[end]==='}')depth--;}
 assert.equal(depth,0,'balanced production function '+name);return shader.slice(open+1,end-1);}
const clamp=x=>Math.max(0,Math.min(1,x)),smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const lerp=(a,b,t)=>a+(b-a)*t;
const matte=new Function('l','chroma','sourceAlpha','smoothstep',body('matteAlpha').replace(/\bfloat /g,'let '));
const aperture=new Function('uv','sourceAlpha','l','_FrameAperture','smoothstep','lerp','max','sqrt',body('frameApertureCoverage').replace(/\bfloat /g,'let '));
const cover=(uv,a,l,on=1)=>aperture(uv,a,l,on,smoothstep,lerp,Math.max,Math.sqrt);
function png(file){const b=fs.readFileSync(file);check(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'original PNG signature');
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20);check(width===465&&height===469&&b[24]===8&&b[25]===6&&b[28]===0,'original full-frame RGBA8 layout');
 const chunks=[];for(let at=8;at<b.length;){const length=b.readUInt32BE(at);if(b.toString('ascii',at+4,at+8)==='IDAT')chunks.push(b.subarray(at+8,at+8+length));at+=length+12;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(height*stride);
 check(raw.length===(stride+1)*height,'complete original PNG scanlines');
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];check(filter<=4,'PNG row filter is supported');
  for(let x=0;x<stride;x++){const a=x>=4?pixels[y*stride+x-4]:0,b=y?pixels[(y-1)*stride+x]:0,c=y&&x>=4?pixels[(y-1)*stride+x-4]:0;
   pixels[y*stride+x]=(raw[y*(stride+1)+x+1]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}}
 return {width,height,pixels};}
const decode=c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4),encode=c=>c<=.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-.055;
function sampled(image,x,y,linear=false){const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,result=[0,0,0,0];
 for(let iy=0;iy<=1;iy++)for(let ix=0;ix<=1;ix++){const index=(Math.max(0,Math.min(image.height-1,y0+iy))*image.width+Math.max(0,Math.min(image.width-1,x0+ix)))*4;
  const weight=(ix?fx:1-fx)*(iy?fy:1-fy);for(let c=0;c<4;c++){const v=image.pixels[index+c]/255;result[c]+=weight*(linear&&c<3?decode(v):v);}}
 if(linear)for(let c=0;c<3;c++)result[c]=encode(result[c]);return result;}
function measure(image,x,y,linear=false,on=1){const rgba=sampled(image,x,y,linear),l=rgba[0]*.2126+rgba[1]*.7152+rgba[2]*.0722;
 const chroma=Math.max(...rgba.slice(0,3))-Math.min(...rgba.slice(0,3)),uv={x:(x+.5)/image.width,y:1-(y+.5)/image.height};
 const radius=Math.hypot(uv.x*263-135.5,(1-uv.y)*263-139.15),before=matte(l,chroma,rgba[3],smoothstep),factor=cover(uv,rgba[3],l,on);
 return {rgba,l,radius,before,factor,after:before*factor};}

const start=shader.indexOf(' frameOuterCoverage(');
const outer=start<0?()=>1:new Function('uv','filteredAlpha','l','_FrameAperture','smoothstep','lerp','max','sqrt',body('frameOuterCoverage').replace(/\bfloat /g,'let '));
const factor=(uv,a,l,on=1)=>outer(uv,a,l,on,smoothstep,lerp,Math.max,Math.sqrt);
const uvAt=(image,x,y)=>({x:(x+.5)/image.width,y:1-(y+.5)/image.height});
const result=(image,x,y,linear=false)=>{const m=measure(image,x,y,linear);return {...m,final:m.after*factor(uvAt(image,x,y),m.after,m.l)};};
const hp=png(path.join(root,'unity/Assets/Exoduser/Resources/Art/ui/ui_globe_hp.png'));
for(const [x,y] of [[415,322],[428,300],[45,296],[44,298]]){const m=result(hp,x,y);
 check(m.after>.005&&m.after<=.08,'reported outer faint pixel reproduced before guard');
 near(m.final,0,'reported outer faint pixel cleared, including low-gray HP samples');
}
for(const [name,xOrigin,xMin,xMax] of [['HP',384.488571,385,420],['MPST',1293.934286,1500,1535]]){
 const image=png(path.join(root,'unity/Assets/Exoduser/Resources/Art/ui',name==='HP'?'ui_globe_hp.png':'ui_globe_mp.png'));
 const active=new Uint8Array(image.width*image.height);
 const stats={name,roiFaintBefore:0,roiFaintRetained:0,roiAlphaBefore:0,roiAlphaAfter:0,protectedAlphaLoss:0,removedBrightOuter:0};
 for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){const m=result(image,x,y),uv=uvAt(image,x,y);active[y*image.width+x]=m.final>.005?1:0;
  check(m.final>=-1e-12&&m.final<=m.after+1e-12,'outer guard never adds opacity');
  if(m.radius<=73.5)near(m.final,m.after,'accepted H6 interior aperture stays unchanged');
  if(m.l<=.20||m.after>=.24){near(m.final,m.after,'dark sculpted AA and alpha>=.24 remain byte-value equivalent');stats.protectedAlphaLoss+=m.after-m.final;}
  if(m.radius>=75.5&&m.l>=.30&&m.after<=.08){near(m.final,0,'classified faint outer matte is cleared');if(m.after>.005)stats.removedBrightOuter++;}
  near(factor(uv,m.after,m.l,0),1,'non-frame silver artwork bypasses outer guard');
  const sx=xOrigin+uv.x*(263*156/175),sy=837.554286+(1-uv.y)*(263*156/175);
  if(sx>=xMin&&sx<=xMax&&sy>=970&&sy<=1010){stats.roiAlphaBefore+=m.after;stats.roiAlphaAfter+=m.final;
   if(m.after>.005&&m.after<=.08){stats.roiFaintBefore++;if(m.final>.005)stats.roiFaintRetained++;}}
 }
 check(stats.roiFaintBefore>300&&stats.roiFaintRetained===0,'both ROI preexisting faint samples are removed');
 near(stats.protectedAlphaLoss,0,'protected AA alpha mass unchanged');
 for(const [x,y] of [[192,3],[191,4]]){const m=result(image,x,y);check(m.after>0&&m.after<=.08,'real thin dark horn AA exists');near(m.final,m.after,'real thin dark horn AA not cut');}
 for(const [x,y]of [[415,322],[428,300],[45,296],[44,298]])for(const linear of [false,true])for(const dx of [-.25,0,.25])for(const dy of [-.25,0,.25]){
  const m=result(image,x+dx,y+dy,linear);
  check(m.final<=m.after+1e-12,'bilinear neighborhoods cannot gain halo alpha');
  if(m.radius>=75.5&&m.after<=.08&&m.l>=.30)near(m.final,0,'Gamma/Linear bilinear faint matte stays suppressed');
 }
 const seen=new Uint8Array(active.length);let components=0,largest=0;
 for(let seed=0;seed<active.length;seed++){if(!active[seed]||seen[seed])continue;components++;seen[seed]=1;const queue=[seed];
  for(let at=0;at<queue.length;at++){const i=queue[at],x=i%image.width,y=Math.floor(i/image.width);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=image.width||ny>=image.height)continue;
    const ni=ny*image.width+nx;if(active[ni]&&!seen[ni]){seen[ni]=1;queue.push(ni);}}}
  largest=Math.max(largest,queue.length);}
 check(components===1&&largest>70000,'remaining alpha>0.005 artwork is one metal component, no disconnected islands');
 stats.components=components;stats.largest=largest;
 console.log('C outer source audit '+JSON.stringify(stats));
}
const uv=r=>({x:(135.5+r)/263,y:1-139.15/263});
for(const [label,fn,bounds] of [
 ['alpha',a=>factor(uv(110),a,.6),[.16,.24]],
 ['luma',l=>factor(uv(110),.04,l),[.20,.30]],
 ['radius',r=>factor(uv(r),.04,.6),[73.5,75.5]]]){
 for(const b of bounds){const e=1e-6,left=(fn(b)-fn(b-e))/e,right=(fn(b+e)-fn(b))/e;
  check(Math.abs(fn(b+e)-fn(b-e))<1e-8,label+' guard has no value discontinuity');
  check(Math.abs(left-right)<.002,label+' endpoint derivative is continuous');}
}
for(const l of [.1,.2,.25,.3,.8]){let previous=0;for(let i=0;i<=1000;i++){const a=i/1000,out=a*factor(uv(110),a,l);
 check(out>=previous-1e-12,'alpha ramp never folds into separated coverage bands');previous=out;}}
check(shader.includes('art.a*=frameOuterCoverage(uv,art.a,l)'),'fragment uses post-matte/aperture alpha, not raw source alpha');
console.log('PASS '+checks+' C outer matte/AA/source contracts (screen dots still require Mac)');
