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

const outer=new Function('uv','filteredAlpha','l','_FrameAperture','smoothstep','lerp','max','sqrt',body('frameOuterCoverage').replace(/\bfloat /g,'let '));
const image=png(path.join(root,'unity/Assets/Exoduser/Resources/Art/ui/ui_globe_mp.png'));
const hpBytes=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Art/ui/ui_globe_hp.png'));
check(hpBytes.equals(fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Art/ui/ui_globe_mp.png'))),'HP/MP original artwork is identical');
const frameX=1293.9342857142856,frameY=837.5542857142857,size=263*156/175;
for(let y=897;y<=899;y++)for(let x=1392;x<=1394;x++){
 const uv={x:(x+.5-frameX)/size,y:1-(y+.5-frameY)/size};
 const sx=uv.x*image.width-.5,sy=(1-uv.y)*image.height-.5;
 for(const linear of [false,true]){const m=measure(image,sx,sy,linear);
  near(m.rgba[3],1,'reported hole neighborhood is opaque original artwork');
  near(m.after,1,'H5 matte and H6 inner guard preserve the reported frame body');
  near(outer(uv,m.after,m.l,1,smoothstep,lerp,Math.max,Math.sqrt),1,'H7 outer guard preserves the reported frame body');
 }
}
const orb=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Shaders/HudOrb.shader'),'utf8');
const a=orb.indexOf('float cell=max(_MobilityCell'),b=orb.indexOf('col=lerp',a);check(a>=0&&b>a,'production mobility notch arithmetic found');
const notch=new Function('angle','_MobilityCell','frac','max',orb.slice(a,b).replace(/\bfloat /g,'let ')+'return notch;'),frac=x=>x-Math.floor(x);
const scale=156/175,ringSize=153*scale,cx=frameX+(48+11+153/2)*scale,cy=frameY+(44+18.65+153/2)*scale;
function at(x,y){const angle=frac(Math.atan2((x-cx)/ringSize,-(y-cy)/ringSize)/(2*Math.PI)+1);return {angle,notch:notch(angle,.2,frac,Math.max)};}
const center=at(1393.5,898.5);near(center.notch,.9,'reported position overlaps the existing mobility notch');check(center.angle>.94&&center.angle<.96,'position is at the final cell notch');
near(at(1394.5,898.5).notch,0,'adjacent pixel leaves the narrow notch');
check(hud.indexOf('right?prototypeCRightFrame:prototypeCLeftFrame')<hud.indexOf('DrawTexture(ring,mobility'),'mobility notch is drawn over opaque frame artwork');
const shared=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeHud.cs'),'utf8');
check(shared.includes('ChainDash.GaugeCost[1]/s.HarpGaugeMax'),'notch cell is linked to Core gauge cost / maximum');
console.log('Reported MP hole: original alpha1 / all guards1, HP counterpart ~484,898; notch angle '+(center.angle*360)+' degrees; notch=.9');
console.log('PASS '+checks+' C frame-body/mobility-notch source contracts (capture gauge and GPU unobserved)');
