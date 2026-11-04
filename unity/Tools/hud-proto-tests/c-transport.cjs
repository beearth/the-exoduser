'use strict';
// Executes the production transfer function and C target/blit methods with small offline stubs.
// The IMGUI native _ManualTex2SRGB uniform, Metal shader compilation and framebuffer are not simulated.
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../..');
const shader=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Shaders/HudPrototypeC.shader'),'utf8');
const source=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeHud.PrototypeC.cs'),'utf8');
let checks=0;function check(value,message){checks++;assert.ok(value,message);}
function method(text,name,whole=false){const start=text.indexOf(' '+name+'(');assert.ok(start>=0,'production method '+name);
 const open=text.indexOf('{',start);let depth=1,end=open+1;
 for(;depth&&end<text.length;end++){if(text[end]==='{')depth++;if(text[end]==='}')depth--;}
 assert.equal(depth,0,'balanced method '+name);return whole?text.slice(text.lastIndexOf('\n',start)+1,end):text.slice(open+1,end-1);}
const linearChannel=new Function('c','pow',method(shader,'linearChannel'));
const decode=c=>linearChannel(c,Math.pow),encode=c=>c<=.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-.055;
function transfer(linear){let body=method(shader,'outputColor');
 body=linear?body.replace(/#ifndef UNITY_COLORSPACE_GAMMA|#endif/g,''):body.replace(/#ifndef UNITY_COLORSPACE_GAMMA[\s\S]*?#endif/g,'');
 const run=new Function('c','linearChannel','float3',body);
 return (v,a)=>{const color={r:v[0],g:v[1],b:v[2],a};Object.defineProperty(color,'rgb',{set(value){[this.r,this.g,this.b]=value;},get(){return [this.r,this.g,this.b];}});
  return run(color,decode,(...args)=>args);};}
const linear=transfer(true),gamma=transfer(false),quant=c=>Math.round(Math.max(0,Math.min(1,c))*255);
for(let i=0;i<=255;i++)for(const alpha of [0,.1,.5,1]){
 const rgb=[i/255,(255-i)/255,((i*43)%256)/255],l=linear(rgb,alpha),g=gamma(rgb,alpha);
 for(let c=0;c<3;c++){const k=['r','g','b'][c];
  check(Math.abs(g[k]-rgb[c])<1e-12,'Gamma output retains source color');
  check(Math.abs(l[k]-decode(decode(rgb[c])))<1e-12,'Linear C shader compensates explicit sRGB RT write to match CPU texture storage');
  check(quant(encode(l[k]))===quant(decode(rgb[c])),'GPU and CPU C textures have identical eight-bit storage for every channel code');}
 check(l.a===alpha&&g.a===alpha,'transfer never changes straight alpha');
}
for(const rgb of [[61,10,18],[59,95,134],[62,94,74]]){
 const l=linear(rgb.map(x=>x/255),1),stored=['r','g','b'].map(k=>quant(encode(l[k]))),display=stored.map(x=>quant(encode(x/255)));
 console.log('C token '+rgb.join(',')+' => CPU/GPU storage '+stored.join(',')+' => conditional GUI display '+display.join(','));
}
check(source.includes('prototypeHp=PrototypeCTarget(')&&source.includes('prototypeResources=PrototypeCTarget('),'both C liquids use explicit C target creation');
check(source.includes('prototypeSlots[i]=PrototypeTarget('),'A/B socket target path remains shared and unchanged');
const target=method(source,'PrototypeCTarget',true),blit=method(source,'PrototypeCBlit',true),artTarget=method(source,'PrototypeCArtTarget',true);
const out=path.join(root,'unity/Library/HudProtoTests');fs.mkdirSync(out,{recursive:true});
const testSource=path.join(out,'CTransportContracts.cs'),dll=path.join(out,'CTransportContracts.dll');
fs.writeFileSync(testSource,`using System;using System.Collections.Generic;using UnityEngine;
namespace UnityEngine {
 public enum ColorSpace {Gamma,Linear} public static class QualitySettings {public static ColorSpace activeColorSpace;}
 public enum RenderTextureFormat {ARGB32} public enum RenderTextureReadWrite {Default,sRGB,Linear}
 public enum FilterMode {Bilinear} public enum TextureWrapMode {Clamp}
 public class Texture {} public class Texture2D:Texture {public static Texture whiteTexture=new Texture();}
 public class RenderTexture:Texture {public static RenderTexture active,lastCreated;public static int createFailure;public readonly int width,height,depth;public readonly RenderTextureFormat format;public readonly RenderTextureReadWrite readWrite;
  public string name;public FilterMode filterMode;public TextureWrapMode wrapMode;public bool released,destroyed;
  public RenderTexture(int w,int h,int d,RenderTextureFormat f,RenderTextureReadWrite rw=RenderTextureReadWrite.Default){width=w;height=h;depth=d;format=f;readWrite=rw;lastCreated=this;}
  public bool Create(){if(createFailure==2)throw new InvalidOperationException("simulated allocation exception");return createFailure==0;}
  public void Release(){released=true;}}
 public class Material {public int mode;public void SetFloat(string name,float value){mode=(int)value;}}
 public static class GL {public static bool sRGBWrite;}
 public static class Graphics {public static bool fail,observedSRGB;public static Texture observedSource;
  public static void Blit(Texture source,RenderTexture target,Material material,int pass){RenderTexture.active=target;observedSRGB=GL.sRGBWrite;observedSource=source;if(fail)throw new InvalidOperationException("simulated blit failure");}}
}
class CTransportContracts {
 Material prototypeCMaterial=new Material();List<RenderTexture> prototypeCArtwork=new List<RenderTexture>();
 static void Release(RenderTexture target){target.destroyed=true;}
 ${target}
 ${artTarget}
 ${blit}
 static int checks;static void Check(bool value,string message){checks++;if(!value)throw new Exception(message);}
 static void Main(){var hud=new CTransportContracts();var target=PrototypeCTarget("C liquid",512,512);
  Check(target.readWrite==RenderTextureReadWrite.sRGB,"C targets explicitly use sRGB storage");
  Check(target.width==512&&target.height==512&&target.depth==0&&target.format==RenderTextureFormat.ARGB32,"C target keeps existing resolution/format");
  Check(hud.prototypeCArtwork.Count==0,"C liquid lifetime remains owned by common liquid disposal");
  var art=hud.PrototypeCArtTarget("C original art",263,263);Check(art.readWrite==RenderTextureReadWrite.sRGB,"C ornament target uses same storage contract");
  Check(hud.prototypeCArtwork.Count==1&&hud.prototypeCArtwork[0]==art,"C artwork is registered exactly once");
  foreach(var failure in new[]{1,2}){RenderTexture.createFailure=failure;bool caught=false;
   try{hud.PrototypeCArtTarget("allocation failure",263,263);}catch(InvalidOperationException){caught=true;}
   Check(caught,"failed or throwing Create propagates an error");
   Check(RenderTexture.lastCreated.released&&RenderTexture.lastCreated.destroyed,"failed unregistered target releases its GPU handle and Unity object");
   Check(hud.prototypeCArtwork.Count==1,"failed targets never enter the artwork ownership list");
  }
  RenderTexture.createFailure=0;
  foreach(var space in new[]{ColorSpace.Gamma,ColorSpace.Linear})foreach(var oldWrite in new[]{false,true})foreach(var fail in new[]{false,true}){
   QualitySettings.activeColorSpace=space;GL.sRGBWrite=oldWrite;Graphics.fail=fail;
   var previous=PrototypeCTarget("old",1,1);RenderTexture.active=previous;bool caught=false;
   try{hud.PrototypeCBlit(target,2);}catch(InvalidOperationException){caught=true;}
   Check(caught==fail,"only the simulated blit failure propagates");
   Check(Graphics.observedSRGB==(space==ColorSpace.Linear),"C blit explicitly sets RT sRGB conversion for project space");
   Check(GL.sRGBWrite==oldWrite,"C blit restores prior sRGB state on normal and exception paths");
   Check(RenderTexture.active==previous,"C blit restores prior target on normal and exception paths");
   Check(hud.prototypeCMaterial.mode==2&&Graphics.observedSource==Texture2D.whiteTexture,"mode and null-source behavior are preserved");
  }
  Console.WriteLine("PASS "+checks+" C production target/blit state contracts");
 }
}`);
const dotnet=process.env.EXO_DOTNET||'C:/Program Files/dotnet/dotnet.exe',base=path.dirname(dotnet);
const sdk=path.join(base,'sdk/8.0.301/Roslyn/bincore/csc.dll'),refs=path.join(base,'packs/Microsoft.NETCore.App.Ref/8.0.6/ref/net8.0');
const args=[sdk,'/nologo','/target:exe','/out:'+dll,...fs.readdirSync(refs).filter(f=>f.endsWith('.dll')).map(f=>'/reference:'+path.join(refs,f)),testSource];
let result=cp.spawnSync(dotnet,args,{encoding:'utf8',windowsHide:true});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);
fs.writeFileSync(path.join(out,'CTransportContracts.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.6'}}}));
result=cp.spawnSync(dotnet,[dll],{encoding:'utf8',windowsHide:true});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);
console.log('PASS '+checks+' C production color transfer contracts (native IMGUI/Metal/framebuffer not executed)');
