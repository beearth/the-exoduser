'use strict';
// Executes production C cooldown methods with offline drawing stubs. No font rasterization/IMGUI/Metal.
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../..'),dir=path.join(root,'unity/Assets/Exoduser/Runtime');
const source=fs.readFileSync(path.join(dir,'NativeHud.PrototypeC.cs'),'utf8'),common=fs.readFileSync(path.join(dir,'NativeHud.Prototype.cs'),'utf8');
let checks=0;function check(v,m){checks++;assert.ok(v,m);}
check(source.includes('for(int i=0;i<13;i++)PrototypeCSlot(i,activeAttack,simulation);'),'C must execute its contrast path (expected RED before H7)');
function method(text,name){const m=new RegExp('^[ \\t]*(?:static )?(?:void|Texture2D) '+name+'\\(','m').exec(text);
 assert.ok(m,'production method '+name);let open=text.indexOf('{',m.index),end=open+1,depth=1;
 for(;depth;end++){if(text[end]==='{')depth++;if(text[end]==='}')depth--;}return text.slice(m.index,end);}
const slot=method(source,'PrototypeCSlot'),paint=method(source,'PrototypeCCooldown'),bake=method(source,'BakePrototypeCCooldownDisc');
const oldSlot=method(common,'PrototypeSlot'),oldCooldown=/if\(cd>0&&total>0\)\{float font=Mathf\.Round\(r\.width\*\.36f\);PrototypeText[\s\S]*?HudPrototypeShadow\.Cooldown\);\}/;
check(oldCooldown.test(oldSlot),'shared countdown expression recognized');
check(slot.replace('PrototypeCSlot(','PrototypeSlot(').replace('if(cd>0&&total>0)PrototypeCCooldown(r,cd);','COOLDOWN')===oldSlot.replace(oldCooldown,'COOLDOWN'),'every non-countdown slot operation unchanged');
check(common===cp.execFileSync('git',['show','8169df9af:unity/Assets/Exoduser/Runtime/NativeHud.Prototype.cs'],{cwd:root,encoding:'utf8',windowsHide:true}),'shared A/B methods byte-identical');
check(source.includes('prototypeCCooldownDisc=null;'),'C disc reference cleared on disposal');
check(common.includes('font=body?prototypeBody:regular?prototypeRegular:prototypeSemibold'),'default Cinzel semibold retained');
const out=path.join(root,'unity/Library/HudProtoTests');fs.mkdirSync(out,{recursive:true});
const testSource=path.join(out,'CCooldownContracts.cs'),dll=path.join(out,'CCooldownContracts.dll');
fs.writeFileSync(testSource,`using System;using System.Collections.Generic;
class Texture2D {public Func<float,float,Color> sample;public int width,height;}
class RenderTexture:Texture2D {}
struct Color {public float r,g,b,a;public Color(float r,float g,float b,float a=1){this.r=r;this.g=g;this.b=b;this.a=a;}}
struct Point {public float x,y;public Point(float x,float y){this.x=x;this.y=y;}}
struct Rect {public float x,y,width,height;public Rect(float x,float y,float w,float h){this.x=x;this.y=y;width=w;height=h;}public Point center=>new Point(x+width/2,y+height/2);public float yMax=>y+height;}
static class Mathf {public static float Round(float n)=>(float)Math.Round(n);public static int CeilToInt(float n)=>(int)Math.Ceiling(n);public static float Clamp01(float n)=>Math.Max(0,Math.Min(1,n));public static float Sqrt(float n)=>(float)Math.Sqrt(n);}
enum ScaleMode {StretchToFill} enum EventType {Repaint,Layout} enum HudPrototypeShadow {None,Cooldown}
class Event {public static Event current=new Event();public EventType type=EventType.Repaint;}
class GUIStyle {public static GUIStyle none=new GUIStyle();}static class Time {public static float unscaledTime=5;}
static class Resources {public static T Load<T>(string path)where T:class=>new Texture2D()as T;}
class Material {public Dictionary<string,float> values=new Dictionary<string,float>();public void SetFloat(string name,float value){values[name]=value;}}
class Simulation {public float cd,total=60,Rage=10,RageMaximum=100;public float SkillCooldown(string id,out float t){t=total;return cd;}}
class Layout {public Rect Slot(int index)=>new Rect(100+index*49,200,44,44);}
class Draw {public string kind,text;public Rect rect;public Color color;public HudPrototypeShadow shadow;public bool regular,body;}
static class NativeUiAudit {public static List<Draw> calls=new List<Draw>();public static void DrawTexture(Rect r,Texture2D t,ScaleMode mode,bool alpha){calls.Add(new Draw{kind=t is RenderTexture?"socket":"disc",rect=r});}}
static class NativeSilverHellUi {public static bool pressed;public static int buttons;public static Texture2D Effect(int w,int h,Func<float,float,Color> sample)=>new Texture2D{width=w,height=h,sample=sample};public static bool Button(Rect r,string text,GUIStyle style){buttons++;return pressed;}}
class Contracts {
 Layout prototypeLayout=new Layout();Dictionary<string,Texture2D>slotIcons=new Dictionary<string,Texture2D>();Material prototypeMaterial=new Material();
 RenderTexture[] prototypeSlots=new RenderTexture[13];Texture2D prototypeCCooldownDisc;List<Texture2D>owned=new List<Texture2D>();
 bool IconDrawn;float statusSelectionUntil;Action<int>SlotSelected;int keyCalls,mobilityCalls,blits;
 static Rect ProtoRect(Rect r)=>r;static Color ProtoColor(int r,int g,int b,float a=1)=>new Color(r/255f,g/255f,b/255f,a);
 static string SlotSkillId(Simulation s,int index)=>"skill"+index;static float RageFill(float rage,float max)=>rage/max;
 static float MobilityRatio(Simulation s)=>.75f;void PrototypeFill(Rect r,Color color){mobilityCalls++;}
 void PrototypeBlit(RenderTexture target,int mode,Texture2D art){blits++;}
 Texture2D OwnPrototypeArt(Texture2D t){owned.Add(t);return t;}void PrototypeKey(int i,Rect r,bool full){keyCalls++;}
 void PrototypeText(Rect r,string text,float size,float tracking,Color color,bool regular=false,bool body=false,HudPrototypeShadow shadow=HudPrototypeShadow.None){
 NativeUiAudit.calls.Add(new Draw{kind="text",rect=r,text=text,color=color,shadow=shadow,regular=regular,body=body});}
 ${bake}
 ${paint}
 ${slot}
 static int checks;static void Check(bool v,string m){checks++;if(!v)throw new Exception(m);}
 static bool Near(float a,float b)=>Math.Abs(a-b)<.00001;
 static void Main(){
 var h=new Contracts();for(int i=0;i<13;i++)h.prototypeSlots[i]=new RenderTexture();
 var rect=new Rect(10,20,44,44);
 foreach(var ticks in new[]{1f,60f,61f,240f,1140f}){
  NativeUiAudit.calls.Clear();h.PrototypeCCooldown(rect,ticks);var a=NativeUiAudit.calls;
  Check(a.Count==10,"disc + 8 offset fills + central fill");Check(a[0].kind=="disc","disc paints first");
  Check(a[0].rect.x==10&&a[0].rect.y==20&&a[0].rect.width==44&&a[0].rect.height==44,"whole icon rect");
  var center=a[9];Check(center.kind=="text"&&center.text==Math.Ceiling(ticks/60).ToString(),"unchanged ceil seconds");
  var offsets=new HashSet<string>();for(int i=1;i<9;i++){var d=a[i];float dx=d.rect.x-center.rect.x,dy=d.rect.y-center.rect.y;
   Check(Math.Abs(dx)<=1&&Math.Abs(dy)<=1&&(dx!=0||dy!=0),"1px eight-neighbor outline");
   Check(d.color.r<.1f&&d.color.g<.1f&&d.color.b<.1f&&d.color.a==1,"dark opaque outline");
   Check(d.text==center.text&&d.shadow==HudPrototypeShadow.None&&!d.regular&&!d.body,"same Cinzel, no extra shadow");offsets.Add(dx+","+dy);}
  Check(offsets.Count==8,"eight distinct offsets");Check(Near(center.color.r,230/255f)&&center.color.a==1,"unchanged text color");
 }
 Check(h.owned.Count==1,"disc owned exactly once");var disc=h.prototypeCCooldownDisc;
 Check(disc.width==88&&disc.height==88,"2x artwork");
 for(int y=0;y<=88;y++)for(int x=0;x<=88;x++){
  float u=x/88f,v=y/88f,dx=(u-.5f)*44,dy=(v-.5f)*44,r=(float)Math.Sqrt(dx*dx+dy*dy);var c=disc.sample(u,v);
  Check(c.r==0&&c.g==0&&c.b==0,"black independent of color space");Check(c.a>=0&&c.a<=.550001f,"alpha <= .55");
  if(r<=17.5f)Check(Near(c.a,.55f),"entire icon interior darkened");if(r>=18.5f)Check(c.a==0,"socket rim preserved");
 }
 for(int i=0;i<100;i++){float r=17.5f+i*.01f,n=r+.01f,a=disc.sample(.5f+r/44,.5f).a,b=disc.sample(.5f+n/44,.5f).a;
  Check(b<=a+.00001f&&a-b<.0056f,"monotonic 1px antialiasing");}
 foreach(var eventType in new[]{EventType.Layout,EventType.Repaint})foreach(var ticks in new[]{0f,1f,61f,1140f})foreach(var total in new[]{0f,1200f}){
  Event.current.type=eventType;NativeUiAudit.calls.Clear();h.PrototypeCSlot(4,"kiSlash",new Simulation{cd=ticks,total=total});
  Check(NativeUiAudit.calls.FindAll(d=>d.kind=="disc").Count==(ticks>0&&total>0?1:0),"old cd/total gate retained");
 }
 Event.current.type=EventType.Repaint;NativeSilverHellUi.pressed=true;int chosen=-1;h.SlotSelected=i=>chosen=i;
 h.PrototypeCSlot(6,"kiSlash",new Simulation{cd=61,total=1200});Check(chosen==6&&h.IconDrawn&&Near(h.statusSelectionUntil,6.6f),"active click/selection retained");
 int before=h.mobilityCalls;h.PrototypeCSlot(8,"kiSlash",new Simulation());Check(h.mobilityCalls==before+2,"mobility gauge retained");
 NativeUiAudit.calls.Clear();h.PrototypeCSlot(12,"kiSlash",new Simulation{cd=0});Check(NativeUiAudit.calls.Exists(d=>d.kind=="text"&&d.text=="10%"),"rage text retained");
 NativeUiAudit.calls.Clear();h.PrototypeCSlot(4,"kiSlash",null);Check(NativeUiAudit.calls.Count==1,"null simulation socket only");
 Check(h.keyCalls==20&&NativeSilverHellUi.buttons==20,"one key and click per slot");
 Console.WriteLine("PASS "+checks+" C production cooldown draw/alpha/slot contracts");
 }
}`);

const dotnet=process.env.EXO_DOTNET||'C:/Program Files/dotnet/dotnet.exe',basePath=path.dirname(dotnet);
const sdk=path.join(basePath,'sdk/8.0.301/Roslyn/bincore/csc.dll'),refs=path.join(basePath,'packs/Microsoft.NETCore.App.Ref/8.0.6/ref/net8.0');
let r=cp.spawnSync(dotnet,[sdk,'/nologo','/target:exe','/out:'+dll,...fs.readdirSync(refs).filter(f=>f.endsWith('.dll')).map(f=>'/reference:'+path.join(refs,f)),testSource],{encoding:'utf8',windowsHide:true});
process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');if(r.status!==0)process.exit(r.status||1);
fs.writeFileSync(path.join(out,'CCooldownContracts.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.6'}}}));
r=cp.spawnSync(dotnet,[dll],{encoding:'utf8',windowsHide:true});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');if(r.status!==0)process.exit(r.status||1);
console.log('PASS '+checks+' C/shared-slot/font preservation contracts');
