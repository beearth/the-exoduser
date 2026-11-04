'use strict';
// Offline contracts only: executes production scalar shader functions and production C support raster code.
// This does not compile HLSL or claim a Unity/Metal/1x visual pass.
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../..');
const shader=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Shaders/HudPrototypeC.shader'),'utf8');
let checks=0;function check(x,message){checks++;assert.ok(x,message);}
function near(a,b,message){check(Math.abs(a-b)<1e-6,message+': '+a+' != '+b);}
function body(name){const start=shader.indexOf(' '+name+'(');assert.ok(start>=0,'production function '+name);
 const open=shader.indexOf('{',start);let depth=1,end=open+1;for(;depth&&end<shader.length;end++){if(shader[end]==='{')depth++;if(shader[end]==='}')depth--;}
 assert.equal(depth,0,'balanced production function');return shader.slice(open+1,end-1);}
const saturate=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),rgb=(r,g,b)=>[r/255,g/255,b/255];
const smoothstep=(a,b,x)=>{const t=saturate((x-a)/(b-a));return t*t*(3-2*t);};
const constants=Array.from(shader.matchAll(/const float (\w+)=([.\d]+);/g)).map(m=>'const '+m[1]+'='+m[2]+';').join('\n');
const cover=new Function('uv','fill','_Diameter','sin','smoothstep',constants+'\n'+body('surfaceCoverage').replace(/\bfloat /g,'let '));
const wet=(x,y,fill)=>cover({x,y},fill,156,Math.sin,smoothstep);
for(const x of [.1,.5,.9])for(const y of [.05,.5,.95]){near(wet(x,y,0),0,'zero resource has no liquid');near(wet(x,y,1),1,'full resource has no unfilled cap');}
near(wet(.5,.5,.5),.5,'display fill is unchanged at center of soft surface');
check(wet(.5,.47,.5)>.99&&wet(.5,.53,.5)<.01,'two-pixel surface does not smear the displayed fill');
check(Math.abs(wet(.25,.5,.5)-wet(.75,.5,.5))>.1,'surface is curved/wavy rather than a horizontal hard cutoff');
for(const fill of [.05,.25,.75,.95]){let last=1;for(let y=0;y<=1;y+=.02){const a=wet(.5,y,fill);check(a<=last+1e-8,'coverage monotonically falls above liquid');last=a;}}
const gradients=['mpGradient','stGradient'].map(name=>new Function('h','rgb','lerp','saturate',body(name)));
const sample=(n,h)=>gradients[n](h,rgb,lerp,saturate);
const expected=[[[22,33,46],[59,95,134],[127,156,188]],[[18,32,25],[62,94,74],[122,150,128]]];
for(let n=0;n<2;n++)for(let j=0;j<3;j++)sample(n,[0,.45,.8][j]).forEach((v,k)=>near(v*255,expected[n][j][k],'candidate token endpoint'));
for(const h of [0,.2,.45,.6,.8,1]){const mp=sample(0,h),st=sample(1,h);check(mp[2]>mp[1]&&st[1]>st[2],'blue MP and verdigris ST retain different dominant channels');check(st[1]-st[2]<.15,'ST is muted verdigris, never primary green');}
check(!/float shine|color=lerp\(color,rgb\(246,245,242\)/.test(shader),'C liquid has no glass highlight or white waterline');
const emptyExpression=shader.match(/float radial=(.*?),emptyAlpha=(.*?);/);assert.ok(emptyExpression,'production curved bowl alpha');
const empty=new Function('r','smoothstep','lerp',constants+';const radial='+emptyExpression[1]+';return '+emptyExpression[2]+';');
const scalarLerp=(a,b,t)=>a+(b-a)*t;
near(empty(0,smoothstep,scalarLerp),.08,'empty bowl center leaves92percent background');near(empty(.5,smoothstep,scalarLerp),.42,'empty bowl perimeter stays translucent');
check(empty(.4,smoothstep,scalarLerp)>empty(.25,smoothstep,scalarLerp),'empty alpha changes radially, not a flat dark panel');
check(shader.includes('innerAlpha')&&shader.includes('art.a=smoothstep(.04,.20,min(art.a,innerAlpha))'),'C-only art trims source alpha fringe');
check(shader.includes('1-_HpTranslate'),'C reads existing HP display projection');

const out=path.join(root,'unity/Library/HudProtoTests');fs.mkdirSync(out,{recursive:true});
const testSource=path.join(out,'CArtContracts.cs'),dll=path.join(out,'CArtContracts.dll');
fs.writeFileSync(testSource,String.raw`
using System;
namespace UnityEngine {
 public enum ColorSpace { Gamma,Linear }
 public static class QualitySettings {public static ColorSpace activeColorSpace=ColorSpace.Gamma;}
 public struct Color {public float r,g,b,a;public Color(float r,float g,float b,float a=1){this.r=r;this.g=g;this.b=b;this.a=a;}public Color linear {get{return this;}}}
 public static class Mathf {
  public static int CeilToInt(float x){return (int)Math.Ceiling(x);}public static float Min(float a,float b){return Math.Min(a,b);}
  public static float Max(float a,float b){return Math.Max(a,b);}public static float Abs(float x){return Math.Abs(x);}
  public static float Clamp01(float x){return Max(0,Min(1,x));}public static float Lerp(float a,float b,float x){return a+(b-a)*Clamp01(x);}
 }
 public class Texture2D {public readonly int width,height;readonly Func<float,float,Color> sample;
  public Texture2D(int w,int h,Func<float,float,Color> s){width=w;height=h;sample=s;}
  public Color At(float x,float y){return sample(x*2/width,y*2/height);}}
}
namespace Exoduser.UnityPort {
 static class NativeSilverHellUi {internal static UnityEngine.Texture2D Effect(int w,int h,Func<float,float,UnityEngine.Color> f){return new UnityEngine.Texture2D(w,h,f);}}
 static class NativeHudPrototypeArt {internal static UnityEngine.Color C(int r,int g,int b,float a=1){return new UnityEngine.Color(r/255f,g/255f,b/255f,a);}}
 class CArtContracts {
  static int checks;static void Check(bool value,string message){checks++;if(!value)throw new Exception(message);}
  static void Main(){var plate=NativeHudPrototypeCArt.Plate(709,74,12);var support=NativeHudPrototypeCArt.Plate(109,74,8,true);
   Check(plate.width==1418&&plate.height==148,"A plate bounds rasterized at2x");
   Check(plate.At(.2f,.2f).a==0,"chamfer outside stays clear");
   for(int y=5;y<70;y+=5)for(int x=15;x<695;x+=20){float a=plate.At(x,y).a;Check(a>=.10f&&a<=.22f,"plate interior preserves78percent or more floor");}
   float layered=support.At(54,36).a+plate.At(384,36).a*(1-support.At(54,36).a);
   Check(layered<.32f,"aligned mouse support plus plate preserves most floor");
   var rail=NativeHudPrototypeCArt.Rail(1107.8914f,99.22286f,1008.6686f);int transparent=0;
   for(int x=0;x<1107;x++){if(rail.At(x,8).a==0)transparent++;}
   Check(transparent>1070,"lower rail is clear except narrow contact feet");
   Check(rail.At(554,8).a==0,"no black bar under center");Check(rail.At(554,.5f).a>0,"thin grounding line remains");
   Check(rail.At(0,.5f).a==0,"rail ends fade rather than hard cut");
   Console.WriteLine("PASS "+checks+" C production support raster contracts");
  }
 }
}
`);
const dotnet=process.env.EXO_DOTNET||'C:/Program Files/dotnet/dotnet.exe',base=path.dirname(dotnet);
const sdk=path.join(base,'sdk/8.0.301/Roslyn/bincore/csc.dll'),refs=path.join(base,'packs/Microsoft.NETCore.App.Ref/8.0.6/ref/net8.0');
const args=[sdk,'/nologo','/target:exe','/out:'+dll,...fs.readdirSync(refs).filter(f=>f.endsWith('.dll')).map(f=>'/reference:'+path.join(refs,f)),testSource,path.join(root,'unity/Assets/Exoduser/Runtime/NativeHudPrototypeCArt.cs')];
let result=cp.spawnSync(dotnet,args,{encoding:'utf8',windowsHide:true});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);
fs.writeFileSync(path.join(out,'CArtContracts.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.6'}}}));
result=cp.spawnSync(dotnet,[dll],{encoding:'utf8',windowsHide:true});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);
console.log('PASS '+checks+' C production shader scalar/color contracts (HLSL/Metal/visual not executed)');
