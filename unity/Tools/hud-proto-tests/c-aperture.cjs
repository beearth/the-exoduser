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
const residues=[[282,146],[292,150],[179,156],[219,128],[209,130],[318,152],[316,149],[314,147]];
const protectedPoints=[[239,124],[237,129],[238,130],[237,131],[235,130],[236,132],[237,133],[234,128]];
for(const file of ['ui_globe_hp.png','ui_globe_mp.png']){const image=png(path.join(root,'unity/Assets/Exoduser/Resources/Art/ui',file));
 const dot=sampled(image,282,146).map(v=>Math.round(v*255));check(dot.join(',')==='219,219,200,14','known colored residual remains in untouched source');
 const active=new Uint8Array(image.width*image.height),interior=new Uint8Array(active.length);
 const stats={source:file,insideBefore:0,insideAfter:0,brightPartialBefore:0,brightPartialAfter:0,protectedPixels:0,protectedAlphaLoss:0};
 for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){const m=measure(image,x,y);
  check(m.after>=-1e-12&&m.after<=m.before+1e-12,'aperture never adds opacity');
  const index=y*image.width+x;active[index]=m.after>.005?1:0;interior[index]=active[index]&&m.radius<=71.5?1:0;
  if(m.radius<=71.5){if(m.before>.005)stats.insideBefore++;if(m.after>.005)stats.insideAfter++;
   if(m.l>=.45&&m.rgba[3]<=.90){if(m.before>.005)stats.brightPartialBefore++;if(m.after>.005)stats.brightPartialAfter++;near(m.after,0,'interior bright partial-alpha residue is clear');}}
  if(m.l<=.25||m.rgba[3]>=.98){stats.protectedPixels++;stats.protectedAlphaLoss+=m.before-m.after;near(m.after,m.before,'opaque/dark sculpted detail retains H5 alpha');}
  if(m.radius>=73.5)near(m.after,m.before,'outside aperture feather remains H5 alpha');
  const disabled=cover({x:(x+.5)/image.width,y:1-(y+.5)/image.height},m.rgba[3],m.l,0);
  near(disabled,1,'non-frame silver ornaments bypass aperture');
 }
 check(stats.brightPartialBefore>2500&&stats.brightPartialAfter===0,'all classified interior bright partial residues cleared');
 check(stats.insideAfter>0&&stats.insideAfter<stats.insideBefore,'opaque fang and dark detail remain: whole interior is not cut out');
 near(stats.protectedAlphaLoss,0,'protected original alpha mass is unchanged');
 const visited=new Uint8Array(active.length);let sharedComponents=0,sharedComponentSize=0,sharedInterior=0;
 for(let seed=0;seed<active.length;seed++){if(!active[seed]||visited[seed])continue;const queue=[seed];visited[seed]=1;let innerCount=0;
  for(let at=0;at<queue.length;at++){const i=queue[at],x=i%image.width,y=Math.floor(i/image.width);innerCount+=interior[i];
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=image.width||ny>=image.height)continue;
    const neighbor=ny*image.width+nx;if(active[neighbor]&&!visited[neighbor]){visited[neighbor]=1;queue.push(neighbor);}}}
  if(innerCount){sharedComponents++;sharedComponentSize=queue.length;sharedInterior+=innerCount;}}
 check(sharedComponents===1&&sharedInterior===stats.insideAfter,'remaining interior sculpture shares one original-art connected component');
 check(sharedComponentSize>1000,'remaining interior is attached to the frame, not an isolated small dot cluster');
 stats.sharedFrameComponents=sharedComponents;stats.sharedFrameSize=sharedComponentSize;
 for(const [x,y]of residues){const m=measure(image,x,y);check(m.before>.005,'known residual exists before aperture');near(m.after,0,'known colored dot/gray arc is cleared');
  for(const linear of [false,true])for(const dx of [-.25,0,.25])for(const dy of [-.25,0,.25]){const neighbor=measure(image,x+dx,y+dy,linear);
   check(neighbor.l>=.45&&neighbor.rgba[3]<=.90&&neighbor.radius<=71.5,'residual bilinear neighborhood remains inside classified interior');
   near(neighbor.after,0,'bilinear neighborhood cannot reintroduce a residual point');}}
 for(const [x,y]of protectedPoints){const m=measure(image,x,y);near(m.after,m.before,'known fang or dark AA border is preserved');}
 console.log('C aperture source audit '+JSON.stringify(stats));
}
// C1 continuity of the radial feather, plus exact endpoint behavior. Distances are logical 263px frame units.
const radial=r=>cover({x:(135.5+r)/263,y:1-139.15/263},.5,.6);
near(radial(71.5),0,'inner boundary is fully open');near(radial(73.5),1,'outer boundary is untouched');near(radial(72.5),.5,'two-logical-pixel radial feather midpoint');
for(const r of [71.5,73.5]){const e=1e-4,left=(radial(r)-radial(r-e))/e,right=(radial(r+e)-radial(r))/e;
 check(Math.abs(left-right)<.0002,'radial feather has no first-derivative jump');check(Math.abs(radial(r+e)-radial(r-e))<1e-7,'radial feather has no alpha discontinuity');}
const center={x:135.5/263,y:1-139.15/263};
for(const [label,fn,bounds]of [['luminance',l=>cover(center,.5,l),[.25,.45]],['source alpha',a=>cover(center,a,.6),[.90,.98]]]){
 for(const boundary of bounds){const e=1e-6,left=(fn(boundary)-fn(boundary-e))/e,right=(fn(boundary+e)-fn(boundary))/e;
  check(Math.abs(fn(boundary+e)-fn(boundary-e))<1e-8,label+' protection is continuous at its endpoint');
  check(Math.abs(left-right)<.0006,label+' protection has zero endpoint slope from both sides');}}
near(cover(center,.5,.25),1,'dark-AA luminance boundary is fully protected');near(cover(center,.5,.45),0,'bright partial alpha is fully open');
near(cover(center,.90,.6),0,'partial-alpha boundary is fully open');near(cover(center,.98,.6),1,'opaque-alpha boundary is fully protected');
for(const a of [0,.25,.5,.9,.98,1])for(const l of [0,.25,.45,.75,1]){let prior=0;for(let r=70;r<=75;r+=.05){const next=cover({x:(135.5+r)/263,y:1-139.15/263},a,l);check(next>=prior-1e-9,'guard changes monotonically across radial feather');prior=next;}}
check(hud.includes('prototypeCMaterial.SetFloat("_FrameAperture",frameAperture?1:0)'),'C silver conversion writes explicit aperture state every call');
for(const sourceName of ['hpFrame','mpFrame'])check(new RegExp('PrototypeCSilver\\('+sourceName+'[^;]+frameAperture:true\\)').test(hud),'only full '+sourceName+' opts into aperture');
check((hud.match(/frameAperture:true/g)||[]).length===2,'gargoyles and crest do not opt into aperture');
check(shader.includes('float sourceAlpha=art.a')&&shader.includes('art.a*=frameApertureCoverage(uv,sourceAlpha,l)'),'guard uses original source alpha after unchanged H5 matte');
const methodStart=hud.indexOf('        RenderTexture PrototypeCSilver('),methodOpen=hud.indexOf('{',methodStart);let methodEnd=methodOpen+1,depth=1;
for(;depth&&methodEnd<hud.length;methodEnd++){if(hud[methodEnd]==='{')depth++;if(hud[methodEnd]==='}')depth--;}
check(methodStart>=0&&depth===0,'production CSilver method is extractable');
const out=path.join(root,'unity/Library/HudProtoTests');fs.mkdirSync(out,{recursive:true});
const testSource=path.join(out,'CApertureWiring.cs'),dll=path.join(out,'CApertureWiring.dll');
fs.writeFileSync(testSource,`using System;using System.Collections.Generic;
class Texture {public int width=465,height=469;} class RenderTexture:Texture {}
struct Rect {public float x,y,width,height;public float yMax{get{return y+height;}}public Rect(float x,float y,float w,float h){this.x=x;this.y=y;width=w;height=h;}}
struct Vector4 {public float x,y,z,w;public Vector4(float x,float y,float z,float w){this.x=x;this.y=y;this.z=z;this.w=w;}}
static class Mathf {public static int RoundToInt(float value){return (int)Math.Round(value);}}
class Material {public Dictionary<string,float> scalars=new Dictionary<string,float>();public Vector4 uv;public void SetFloat(string name,float value){scalars[name]=value;}public void SetVector(string name,Vector4 value){uv=value;}}
class CApertureWiring {
 Material prototypeCMaterial=new Material();List<float> flags=new List<float>();List<int> modes=new List<int>();
 RenderTexture PrototypeCArtTarget(string name,int width,int height){return new RenderTexture{width=width,height=height};}
 void PrototypeCBlit(RenderTexture target,int mode,Texture source){flags.Add(prototypeCMaterial.scalars["_FrameAperture"]);modes.Add(mode);}
 ${hud.slice(methodStart,methodEnd)}
 static int checks;static void Check(bool ok,string message){checks++;if(!ok)throw new Exception(message);}
 static void Main(){var c=new CApertureWiring();var source=new Texture();var full=new Rect(0,0,465,469);
  c.PrototypeCSilver(source,"HP",full,frameAperture:true);c.PrototypeCSilver(source,"MP",full,frameAperture:true);
  c.PrototypeCSilver(source,"gargoyle L",new Rect(150,75,215,245),false,.28f);
  c.PrototypeCSilver(source,"gargoyle R",new Rect(150,75,215,245),true,.28f);
  c.PrototypeCSilver(source,"crest",new Rect(1120,100,220,62),false,0,.20f);
  int[] expected={1,1,0,0,0};for(int i=0;i<expected.Length;i++){Check(c.flags[i]==expected[i],"each original-art blit explicitly opts in or clears aperture state");Check(c.modes[i]==2,"source silver branch mode preserved");}
  Check(c.prototypeCMaterial.scalars["_Flip"]==0&&c.prototypeCMaterial.scalars["_FadeRight"]==0&&Math.Abs(c.prototypeCMaterial.scalars["_FadeBottom"]-.20f)<.000001f,"crest crop/mirror/fade settings preserved");
  Console.WriteLine("PASS "+checks+" C production original-art aperture wiring contracts");
 }
}`);
const dotnet=process.env.EXO_DOTNET||'C:/Program Files/dotnet/dotnet.exe',base=path.dirname(dotnet);
const sdk=path.join(base,'sdk/8.0.301/Roslyn/bincore/csc.dll'),refs=path.join(base,'packs/Microsoft.NETCore.App.Ref/8.0.6/ref/net8.0');
const args=[sdk,'/nologo','/target:exe','/out:'+dll,...fs.readdirSync(refs).filter(f=>f.endsWith('.dll')).map(f=>'/reference:'+path.join(refs,f)),testSource];
let result=cp.spawnSync(dotnet,args,{encoding:'utf8',windowsHide:true});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);
fs.writeFileSync(path.join(out,'CApertureWiring.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.6'}}}));
result=cp.spawnSync(dotnet,[dll],{encoding:'utf8',windowsHide:true});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);
console.log('PASS '+checks+' C aperture original-PNG/function/wiring contracts (Unity/Metal/framebuffer not executed)');
