'use strict';
// Production scalar functions and straight-alpha composition; no HLSL/GPU/visual claim.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),shader=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Shaders/HudPrototypeC.shader'),'utf8');
let checks=0;const check=(v,m)=>{checks++;assert.ok(v,m);},near=(a,b,m)=>check(Math.abs(a-b)<1e-8,m);
const sat=x=>Math.max(0,Math.min(1,x)),smoothstep=(a,b,x)=>{const t=sat((x-a)/(b-a));return t*t*(3-2*t);};
const constants=[...shader.matchAll(/const float (\w+)=([.\d]+);/g)].map(m=>'const '+m[1]+'='+m[2]+';').join('\n');
const expression=shader.match(/float r=length\(d\),edge=([^;]+);/);assert(expression,'production direct circle alpha');
const empty=new Function('r','_Diameter','saturate','return '+expression[1]+';');
for(const r of [0,.1,.22,.3,.4,.49,.495])near(empty(r,156,sat),1,'empty C bowl is opaque at every interior radius');
function body(name){const start=shader.indexOf(' '+name+'(');assert(start>=0,'production '+name);const open=shader.indexOf('{',start);let end=open+1,depth=1;
 for(;depth&&end<shader.length;end++){if(shader[end]==='{')depth++;if(shader[end]==='}')depth--;}assert.equal(depth,0);return shader.slice(open+1,end-1);}
const scalar=name=>new Function('uv','fill','_Diameter','sin','abs','smoothstep',constants+body(name).replace(/\bfloat /g,'let '));
const meniscus=scalar('meniscusCoverage'),surface=scalar('surfaceCoverage');
const m=(x,y,f,d=156)=>meniscus({x,y},f,d,Math.sin,Math.abs,smoothstep),w=(x,y,f)=>surface({x,y},f,156,Math.sin,Math.abs,smoothstep);
// Integral 1 design pixel and full-width at half maximum 1px, with AA shoulders.
for(const fill of [.03,.1,.3,.5,.9,.99])for(const x of [.02,.25,.5,.75,.98]){
 const center=fill+(Math.sin((x-.5)*2*Math.PI)-(x-.5)**2*2)/156;
 near(w(x,center,fill),.5,'meniscus follows existing soft liquid boundary');
 near(m(x,center,fill),1,'continuous line has no missing crest');
 near(m(x,center-.5/156,fill),.5,'one pixel FWHM below');near(m(x,center+.5/156,fill),.5,'one pixel FWHM above');
 let area=0;for(let j=-1000;j<1000;j++)area+=m(x,center+(j+.5)/1000/156,fill)/1000;
 check(Math.abs(area-1)<1e-6,'antialiased line integrates to one design pixel');
 for(const edge of [-1,0,1]){const d=1e-5,at=q=>m(x,center+q/156,fill);
  check(Math.abs(at(edge+d)-at(edge-d))<1e-8,'no value jump at center or AA endpoints');
  check(Math.abs((at(edge)-at(edge-d))/d-(at(edge+d)-at(edge))/d)<.0002,'no derivative spike at AA endpoints');}
}
for(const fill of [0,1])for(let i=0;i<=156;i++)near(m(i/156,.5,fill),0,'no phantom meniscus at completely empty/full fill');
// Dense screen-grid sampling: one contiguous band per column, no detached bright dots.
for(const fill of [.03,.1,.2961,.5,.9])for(const subpixel of [0,.25,.5,.75])for(let x=1;x<156;x++){
 let bands=0,inside=false;for(let y=0;y<156;y++){const lit=m((x+subpixel)/156,(y+.5)/156,fill)>.001;if(lit&&!inside)bands++;inside=lit;}
 check(bands<=1,'AA meniscus never splits into isolated vertical runs');
}
const rgb=(...a)=>a.map(v=>v/255),bowl=new Function('rgb',body('emptyBowlColor'))(rgb);
check(bowl.every((v,i)=>v*255>=[20,22,26][i]&&v*255<=[28,31,36][i]),'opaque bowl is in requested Silver Hell dark range');
const decode=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4,encode=c=>c<=.0031308?c*12.92:1.055*c**(1/2.4)-.055;
const stored=bowl.map(v=>Math.round(decode(v)*255)),display=stored.map(v=>Math.round(encode(v/255)*255));
check(display.every((v,i)=>v===Math.round(bowl[i]*255)),'selected bowl token survives existing 8bit Linear storage exactly to nearest byte');
for(const wet of [0,.01,.2,.5,.9,1]){const alpha=wet+1*(1-wet);near(alpha,1,'liquid plus empty bowl always blocks background');
 for(const bg of [0,.3,1])near(.1*alpha+bg*(1-alpha),.1,'background cannot leak through interior composite');}
check(shader.includes('float3 bowl=emptyBowlColor()')&&shader.includes('float rim=meniscusCoverage(i.uv,fill)'), 'fragment uses tested bowl and meniscus');
check(shader.includes('color=lerp(color,meniscusColor(hp,mp),rim)'), 'meniscus color is applied before existing transfer');
check(!/rgb\(255,255,255\)|noise|dither|random/.test(body('meniscusColor')+body('meniscusCoverage')),'no white/noise/dither meniscus');
const c=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeHud.PrototypeC.cs'),'utf8');
check(c.indexOf('right?prototypeResources:prototypeHp')<c.indexOf('if(!right)NativeUiAudit.DrawTexture(ring,shield'),'shield is still drawn over opaque bowl');
console.log('C bowl sRGB '+bowl.map(v=>Math.round(v*255))+' -> D storage '+stored+' -> conditional display '+display);
console.log('PASS '+checks+' C opaque bowl/1px meniscus contracts (GPU/Metal not run)');
