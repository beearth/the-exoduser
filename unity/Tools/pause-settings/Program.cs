using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

class Program
{
 static int checks;
 static void Check(bool actual,string label) { checks++;if(!actual)throw new Exception(label); }
 static void Near(double actual,double expected,string label) { Check(Math.Abs(actual-expected)<.000001,label); }
 static void Main(string[] args)
 {
  using(var doc=JsonDocument.Parse(File.ReadAllText(args[0])))
  {
   var root=doc.RootElement;var model=new NativeSettingsState();
   Check(model.SfxPercent==root.GetProperty("sfxVol").GetInt32(),"source SFX default");
   Check(model.BgmPercent==root.GetProperty("bgmVol").GetInt32(),"source BGM default");
   Check(model.FrameCap==root.GetProperty("fpsCap").GetInt32(),"source FPS default");
   var steps=root.GetProperty("fpsSteps");Check(steps.GetArrayLength()==NativeSettingsState.FrameCapCount,"source FPS choices");
   for(int i=0;i<steps.GetArrayLength();i++)
   {
    int cap=steps[i].GetInt32();Check(NativeSettingsState.GetFrameCap(i)==cap,"original FPS option "+i);
    Check(model.TrySetFrameCap(cap)&&model.FrameCap==cap,"FPS accepts source choice "+cap);
    Check(model.UnityFrameCap==(cap==0?-1:cap),"Unity unlimited adapter "+cap);
   }
   model.TrySetFrameCap(144);
   foreach(int invalid in new[]{-1,1,90,240,1000,int.MinValue,int.MaxValue})
    Check(!model.TrySetFrameCap(invalid)&&model.FrameCap==144,"invalid FPS preserves selection "+invalid);
   var existing=new NativeSettingsState(120);Check(existing.FrameCap==120,"adopt existing runtime cap without changing source default");
   foreach(var row in root.GetProperty("gainCases").EnumerateArray())
   {
    model.SetSfxPercent(row.GetProperty("percent").GetInt32());
    Near(model.SampleOutputGain(row.GetProperty("sampleVolume").GetSingle()),row.GetProperty("expected").GetDouble(),"original two-stage SFX gain");
   }
   model.SetSfxPercent(-80);Check(model.SfxPercent==0,"SFX lower boundary");
   model.SetSfxPercent(800);Check(model.SfxPercent==100,"SFX upper boundary");
   model.SetBgmPercent(-20);Near(model.BgmRelativeGain,0,"BGM mute");
   model.SetBgmPercent(60);Near(model.BgmRelativeGain,1,"existing BGM phase gain preserved at source default");
   model.SetBgmPercent(300);Check(model.BgmPercent==100,"BGM upper boundary");
   model.RestoreDefaults();Check(model.FrameCap==0&&model.SfxPercent==60&&model.BgmPercent==60,"restore source defaults");
   var separate=new NativeSettingsState();model.SetSfxPercent(0);Check(separate.SfxPercent==60,"independent session instances");
   var view=new NativePauseMenu(null,model,null,null,null,null);
   Check(!view.SettingsOpen&&!view.HandleEscape(),"main Escape remains owner responsibility");
   view.ShowSettings();Check(view.SettingsOpen&&view.HandleEscape()&&!view.SettingsOpen,"Escape from settings closes only submenu");
   view.ShowSettings();view.Reset();Check(!view.SettingsOpen,"page reset on leaving pause flow");
   Check(Object.ReferenceEquals(view.Settings,model),"UI uses host session model");
  }
  var receipt=new {passed=checks,failed=0,scope="Source defaults/gain/FPS and actual menu page state; UI compiled against installed Unity assemblies; no GPU or runtime callback claims"};
  string json=JsonSerializer.Serialize(receipt);File.WriteAllText(args[1],json+"\n");Console.WriteLine(json);
 }
}
