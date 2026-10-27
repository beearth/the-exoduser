using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Exoduser.UnityPort.Core
{
 public enum OptionKind { Range, Check, Select }
 // One web settings control (game.html #settings `opt*` id -> OPT key). Ranges/defaults are the web slider min/max/step and OPT literal.
 public sealed class OptionDef
 {
  public readonly string Id,Key,Format;
  public readonly int Tab,Min,Max,Step,Default;
  public readonly OptionKind Kind;
  public OptionDef(string id,string key,int tab,OptionKind kind,int min,int max,int step,int def,string format)
  { Id=id;Key=key;Tab=tab;Kind=kind;Min=min;Max=max;Step=step;Default=def;Format=format; }
  public int Clamp(int value){if(value<Min)value=Min;if(value>Max)value=Max;if(Step>1)value=Min+(int)Math.Round((value-Min)/(double)Step)*Step;return Math.Min(Max,value);}
 }
 // Native copy of the web OPT object: stored as the settings snapshot's "opt" extra with the web OPT key names.
 // FPS cap, SFX and BGM volume stay in NativeSettingsState (their own snapshot fields).
 public sealed class NativeOptionSet
 {
  public const string BgmTrackDefault="auto";
  // Order = the web DOM order inside each settings page (game options, screen effects, graphics, audio, controls).
  public static readonly OptionDef[] All={
   new OptionDef("optDiff","diff",0,OptionKind.Range,0,10,1,5,"diff"),
   new OptionDef("optAutoPot","autoPotThr",0,OptionKind.Range,30,99,1,99,"autopot"),
   new OptionDef("optMinRar","minPickRar",0,OptionKind.Range,0,4,1,0,"rar"),
   new OptionDef("optMinLv","minPickLvTier",0,OptionKind.Range,0,7,1,0,"minlv"),
   new OptionDef("optCrAutoFuse","crAutoFuse",0,OptionKind.Range,-1,3,1,-1,"fuse"),
   new OptionDef("optCrAutoEnh","crAutoEnh",0,OptionKind.Range,-1,4,1,-1,"enh"),
   new OptionDef("optXbowAuto","xbowAuto",0,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optBlPullMode","blPullMode",0,OptionKind.Check,0,1,1,0,""),
   new OptionDef("optBladeAuto","bladeAuto",0,OptionKind.Check,0,1,1,0,""),
   new OptionDef("optBossDbg","bossDebug",0,OptionKind.Check,0,1,1,0,""),
   new OptionDef("optShake","shake",1,OptionKind.Range,0,100,1,80,"pct"),
   new OptionDef("optTextScale","textScale",1,OptionKind.Range,80,160,10,100,"pct"),
   new OptionDef("optPanelFit","panelFit",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optParts","parts",1,OptionKind.Range,5,100,5,100,"pct"),
   new OptionDef("optResScale","resScale",1,OptionKind.Range,50,100,10,100,"pct"),
   new OptionDef("optIrisSz","irisSz",1,OptionKind.Range,1,100,1,20,"num"),
   new OptionDef("optBrightness","brightness",1,OptionKind.Range,70,130,1,100,"pct"),
   new OptionDef("optIrisGlow","irisGlow",1,OptionKind.Range,100,400,1,250,"num"),
   new OptionDef("optBloom","bloom",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optTrail","trail",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optSlash","slash",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optPostfx","postfx",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optDeathFx","deathFx",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optLighting","lighting",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optTorch","torch",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optAtmos","atmos",1,OptionKind.Select,0,2,1,2,"atmos"),
   new OptionDef("optAmbPart","ambPart",1,OptionKind.Check,0,1,1,0,""),
   new OptionDef("optFog","fog",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optGrain","grain",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optOutline","outline",1,OptionKind.Check,0,1,1,1,""),
   new OptionDef("optShowFps","showFps",1,OptionKind.Check,0,1,1,0,""),
   new OptionDef("optCursor","cursor",3,OptionKind.Select,0,1,1,0,"cursor"),
   new OptionDef("optCursorSize","cursorSize",3,OptionKind.Range,30,200,5,50,"pct")
  };
  // Web _GFX_PRESETS: bloom,trail,slash,postfx,deathFx,lighting,torch,ambPart,fog,grain,parts (names 최저/낮음/중간/높음/울트라).
  public static readonly string[] PresetKeys={"bloom","trail","slash","postfx","deathFx","lighting","torch","ambPart","fog","grain","parts"};
  public static readonly int[][] Presets={
   new[]{0,0,0,0,0,0,0,0,0,0,5},
   new[]{0,1,1,1,1,0,1,0,0,0,10},
   new[]{0,1,1,1,1,1,1,0,1,0,20},
   new[]{1,1,1,1,1,1,1,0,1,1,30},
   new[]{1,1,1,1,1,1,1,1,1,1,50}
  };
  readonly Dictionary<string,int> values=new Dictionary<string,int>();
  public string BgmTrack { get; set; }=BgmTrackDefault;
  public NativeOptionSet() { RestoreDefaults(); }
  public static OptionDef Find(string key){foreach(var d in All)if(d.Key==key||d.Id==key)return d;return null;}
  public int Get(string key){int v;if(values.TryGetValue(key,out v))return v;var d=Find(key);return d==null?0:d.Default;}
  public bool Check(string key){return Get(key)!=0;}
  public void Set(string key,int value){var d=Find(key);if(d==null)return;values[d.Key]=d.Clamp(value);}
  public void RestoreDefaults(){values.Clear();foreach(var d in All)values[d.Key]=d.Default;BgmTrack=BgmTrackDefault;}
  public void RestoreDefaults(int tab){foreach(var d in All)if(d.Tab==tab)values[d.Key]=d.Default;if(tab==2)BgmTrack=BgmTrackDefault;}
  // Web _detectPreset: highest preset whose eleven values all match, else -1.
  public int DetectPreset()
  {
   for(int i=Presets.Length-1;i>=0;i--){bool same=true;for(int k=0;k<PresetKeys.Length;k++)if(Get(PresetKeys[k])!=Presets[i][k]){same=false;break;}if(same)return i;}
   return -1;
  }
  public void ApplyPreset(int index){if(index<0||index>=Presets.Length)return;for(int k=0;k<PresetKeys.Length;k++)Set(PresetKeys[k],Presets[index][k]);}
  // Compact JSON object with web OPT names: bool for checks, autoPotThr as a fraction, bgmTrack as a string.
  public string Encode()
  {
   var b=new StringBuilder("{");bool first=true;
   foreach(var d in All){
    if(!first)b.Append(',');first=false;b.Append('"').Append(d.Key).Append("\":");
    int v=Get(d.Key);
    if(d.Kind==OptionKind.Check)b.Append(v!=0?"true":"false");
    else if(d.Key=="autoPotThr")b.Append((v/100.0).ToString("0.##",CultureInfo.InvariantCulture));
    else b.Append(v.ToString(CultureInfo.InvariantCulture));
   }
   b.Append(",\"bgmTrack\":\"");foreach(char c in BgmTrack){if(c=='"'||c=='\\')b.Append('\\');if(c>=32)b.Append(c);}b.Append("\"}");
   return b.ToString();
  }
  // Tolerant: unknown keys, wrong types and out-of-range values keep the current value.
  public void Decode(string json)
  {
   if(string.IsNullOrEmpty(json)||json[0]!='{')return;
   int p=1;
   while(p<json.Length){
    while(p<json.Length&&(json[p]==','||char.IsWhiteSpace(json[p])))p++;
    if(p>=json.Length||json[p]=='}')break;
    if(json[p]!='"')break;
    int e=json.IndexOf('"',p+1);if(e<0)break;string key=json.Substring(p+1,e-p-1);p=e+1;
    while(p<json.Length&&(json[p]==':'||char.IsWhiteSpace(json[p])))p++;
    string raw;
    if(p<json.Length&&json[p]=='"'){int q=p+1;var sb=new StringBuilder();while(q<json.Length&&json[q]!='"'){if(json[q]=='\\'&&q+1<json.Length)q++;sb.Append(json[q]);q++;}raw=sb.ToString();p=Math.Min(json.Length,q+1);
     if(key=="bgmTrack"&&raw.Length>0&&raw.Length<=160)BgmTrack=raw;continue;}
    int s=p;while(p<json.Length&&json[p]!=','&&json[p]!='}')p++;raw=json.Substring(s,p-s).Trim();
    var d=Find(key);if(d==null||d.Key!=key)continue;
    int v;double f;
    if(raw=="true")v=1;else if(raw=="false")v=0;
    else if(double.TryParse(raw,NumberStyles.Float,CultureInfo.InvariantCulture,out f)){v=(int)Math.Round(key=="autoPotThr"?f*100:f);}
    else continue;
    if(v<d.Min||v>d.Max)continue;
    values[d.Key]=d.Clamp(v);
   }
  }
 }
}
