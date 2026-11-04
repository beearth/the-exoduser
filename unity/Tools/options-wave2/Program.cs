// Options wave 2 Core contract (P31/P32 cursor steps, P18 graphics policy): Core-only, no Unity, no player, no user save folder.
// usage: dotnet OptionsWave2Tests.dll <Resources/Data/a15_options_web.json> <Resources/Art/ui/cursors dir>
using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort.Core;

static class Program
{
 static int count;
 static void Check(bool ok,string label){if(!ok)throw new Exception("FAIL "+label);count++;}
 static void Main(string[] args)
 {
  // ---- P31/P32: web size formula and the shipped steps
  Check(NativeCursorSteps.WebPixels(50)==32&&NativeCursorSteps.WebPixels(100)==64&&NativeCursorSteps.WebPixels(200)==128&&NativeCursorSteps.WebPixels(30)==19,"P32 web pixel size = round(64*size/100)");
  Check(NativeCursorSteps.StepFor(50)==32,"P32 default 50% = the 32 px step (same as the web)");
  Check(NativeCursorSteps.StepFor(200)==128&&NativeCursorSteps.StepFor(30)==20&&NativeCursorSteps.StepFor(100)==64,"P32 ends map to the shipped steps");
  int prev=0;for(int pct=30;pct<=200;pct+=5){int s=NativeCursorSteps.StepFor(pct);Check(Array.IndexOf(NativeCursorSteps.Steps,s)>=0,"P32 step shipped for "+pct);Check(s>=prev,"P32 steps never shrink while the slider grows: "+pct);prev=s;}
  Check(NativeCursorSteps.Steps.Distinct().Count()==NativeCursorSteps.Steps.Length&&NativeCursorSteps.Steps.OrderBy(x=>x).SequenceEqual(NativeCursorSteps.Steps),"P32 steps are sorted and unique");
  int hx,hy;NativeCursorSteps.Hotspot(32,out hx,out hy);Check(hx==7&&hy==0,"P31 hotspot = (round(out*13/56),0) like the web: "+hx+","+hy);
  var opt=new NativeOptionSet();Check(opt.Get("cursor")==0&&opt.Get("cursorSize")==50,"P31 defaults: dark red, 50%");
  Check(NativeCursorSteps.ResourcePath(0,32)=="Art/ui/cursors/cursor_dark_32"&&NativeCursorSteps.ResourcePath(1,128)=="Art/ui/cursors/cursor_purple_128","P31 resource names");
  // every shipped texture exists, is a square PNG of its step size, and ships a fixed-GUID meta
  string dir=Path.GetFullPath(args[1]);
  foreach(int kind in new[]{0,1})foreach(int step in NativeCursorSteps.Steps)
  {
   string file=Path.Combine(dir,"cursor_"+NativeCursorSteps.Kinds[kind]+"_"+step+".bytes");Check(File.Exists(file),"P31 file "+file);
   var b=File.ReadAllBytes(file);Check(b.Length>200&&b[0]==0x89&&b[1]==0x50&&b[2]==0x4E&&b[3]==0x47,"P31 PNG signature "+step);
   int w=(b[16]<<24)|(b[17]<<16)|(b[18]<<8)|b[19],h=(b[20]<<24)|(b[21]<<16)|(b[22]<<8)|b[23];Check(w==step&&h==step&&b[25]==6&&b[24]==8,"P31 RGBA8 "+step+"x"+step+" got "+w+"x"+h);
   string meta=File.ReadAllText(file+".meta");Check(System.Text.RegularExpressions.Regex.IsMatch(meta,@"guid: [0-9a-f]{32}")&&meta.Contains("TextScriptImporter"),"P31 meta "+step);
  }
  var guids=Directory.GetFiles(dir,"*.meta").Select(f=>System.Text.RegularExpressions.Regex.Match(File.ReadAllText(f),@"guid: ([0-9a-f]{32})").Groups[1].Value).ToArray();Check(guids.Distinct().Count()==guids.Length,"P31 GUIDs are unique");
  // ---- P18: policy
  string[] keys={"parts","resScale","irisSz","brightness","irisGlow","bloom","trail","slash","postfx","deathFx","lighting","torch","atmos","ambPart","fog","grain","outline","showFps","shake"};
  foreach(string k in NativeGraphicsPolicy.Unavailable)Check(NativeOptionSet.Find(k)!=null,"P18 unavailable key is a real option: "+k);
  foreach(string k in NativeGraphicsPolicy.Wired)Check(NativeOptionSet.Find(k)!=null&&NativeGraphicsPolicy.IsAvailable(k),"P18 wired key is a real, available option: "+k);
  Check(NativeGraphicsPolicy.Unavailable.Intersect(NativeGraphicsPolicy.Wired).Count()==0,"P18 no key is both wired and unavailable");
  foreach(var d in NativeOptionSet.All.Where(d=>d.Tab==1))Check(NativeGraphicsPolicy.Wired.Contains(d.Key)||NativeGraphicsPolicy.Unavailable.Contains(d.Key)||d.Key=="textScale"||d.Key=="panelFit","P18 every Display-tab option is wired or declared unavailable: "+d.Key);
  Check(!NativeGraphicsPolicy.IsAvailable("grain")&&!NativeGraphicsPolicy.IsAvailable("parts"),"P18 grain (dot rule) and particle amount are unavailable");
  Check(Math.Abs(NativeGraphicsPolicy.RenderScale(100)-1f)<1e-6&&Math.Abs(NativeGraphicsPolicy.RenderScale(50)-.5f)<1e-6&&NativeGraphicsPolicy.RenderScale(10)==.5f&&NativeGraphicsPolicy.RenderScale(500)==1f,"P14 render scale 50..100 %");
  // defaults leave the screen as it is: every wired switch defaults on, scale 100
  var o=new NativeOptionSet();Check(o.Check("bloom")&&o.Check("trail")&&o.Check("slash")&&o.Check("postfx")&&o.Check("fog")&&o.Get("resScale")==100,"P18 defaults = everything on, scale 100 (nothing is touched)");
  // saved values of unavailable rows still survive a save/load (nothing is stripped)
  var o2=new NativeOptionSet();o2.Set("grain",0);o2.Set("parts",30);var o3=new NativeOptionSet();o3.Decode(o2.Encode());Check(o3.Get("grain")==0&&o3.Get("parts")==30,"P18 unavailable rows keep their stored value");
  // ---- data: the two new texts exist in all 29 languages
  using(var doc=JsonDocument.Parse(File.ReadAllText(args[0])))
  {
   int codes=doc.RootElement.GetProperty("codes").GetArrayLength();Check(codes==29,"29 languages");
   foreach(string key in new[]{"m.resetConfirm","m.unavailable","b.resetYes","b.resetNo"})
   {
    bool found=false;foreach(var e in doc.RootElement.GetProperty("entries").EnumerateArray())if(e.GetProperty("key").GetString()==key){found=true;var t=e.GetProperty("texts");Check(t.GetArrayLength()==29,"29 texts "+key);for(int i=0;i<29;i++)Check(!string.IsNullOrWhiteSpace(t[i].GetString()),"text "+key+"["+i+"]");}
    Check(found,"entry "+key);
   }
  }
  Console.WriteLine("{\"coreChecks\":"+count+"}");
 }
}
