using System;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Build kind (web `EXODUSER_BUILD_TARGET` full|demo + the ea label of index.html `_LOBBY_BUILD`, plus the `?bic` booth flag): one definition read by every display that differs
 // between builds. Definitions come from Data/buildflavor_web.json (web lines recorded there). Resolution order: command line `--unity-build-flavor <full|demo|bic|ea>`
 // > embedded Data/build_flavor.json "selected" (written by the build script patch, committed as "full") > full.
 // Restrictions that Unity has no system for yet (level cap, demo affix ban, demo fuse allow-list) are exposed as definitions only and listed in NotPorted.
 public sealed class BuildFlavor {
  public enum Kind {Full,Demo,Bic,Ea}
  [Serializable] sealed class ClearFinal {public int stage;public string[] sub,button;}
  [Serializable] sealed class Release {public bool packaged;public int appId,depotId,port;public string saveNamespace,entry;}
  [Serializable] sealed class Def {public string label,limits,note;public string[] loginHeading;public bool demoMode;public int levelCap;public ClearFinal clearFinal;public Release release;}
  [Serializable] sealed class Flavors {public Def full,demo,bic,ea;}
  [Serializable] sealed class Lists {public string[] affixBanned,fuseAllowed;}
  [Serializable] sealed class OverlayDef {public float x,y,fontSize,letterSpacing,lineHeight;public float[] color,limitsColor;public string modeOffline,modeOnline;}
  [Serializable] sealed class CornerDef {public float fontSize,letterSpacing,rightEdge;public float[] color;}
  [Serializable] sealed class LobbyDef {public OverlayDef overlay;public CornerDef corner;}
  [Serializable] sealed class Defs {public string @default;public Flavors flavors;public Lists demoLists;public LobbyDef lobby;}
  [Serializable] sealed class Selected {public string selected;}
  [Serializable] sealed class ReleaseInfo {public string version,date,channel;}
  public const string Argument="--unity-build-flavor";
  // Definitions that exist in the web build but have no Unity system yet (shown as "미이식", never as a fake restriction).
  public static readonly string[] NotPorted={"데모 어픽스 금지 7종","데모 합성 허용 22종","로그인·데모 입장 버튼(Unity 로비에 로그인 없음)","EA 패키지 식별자"};

  static Defs defs;static ReleaseInfo release;static BuildFlavor current;
  readonly Def def;
  public readonly Kind Id;
  BuildFlavor(Kind id,Def d){Id=id;def=d;}

  static void Load(){
   if(defs!=null)return;
   defs=JsonUtility.FromJson<Defs>(Resources.Load<TextAsset>("Data/buildflavor_web").text);
   var rel=Resources.Load<TextAsset>("Data/release_web");release=rel!=null?JsonUtility.FromJson<ReleaseInfo>(rel.text):new ReleaseInfo{version="",date=""};
  }
  static Kind Parse(string name,out bool known){
   known=true;switch((name??"").Trim().ToLowerInvariant()){case "full":case "official":return Kind.Full;case "demo":return Kind.Demo;case "bic":return Kind.Bic;case "ea":case "earlyaccess":return Kind.Ea;}
   known=false;return Kind.Full;
  }
  static Def DefOf(Kind k){switch(k){case Kind.Demo:return defs.flavors.demo;case Kind.Bic:return defs.flavors.bic;case Kind.Ea:return defs.flavors.ea;default:return defs.flavors.full;}}
  // The flavor name that will be used and where it came from ("command line", "embedded build_flavor.json", "default").
  public static string ResolveName(out string source){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Argument);
   if(i>=0&&i+1<a.Length){source="command line";return a[i+1];}
   var embedded=Resources.Load<TextAsset>("Data/build_flavor");
   if(embedded!=null){var s=JsonUtility.FromJson<Selected>(embedded.text);if(s!=null&&!string.IsNullOrEmpty(s.selected)){source="embedded Data/build_flavor.json";return s.selected;}}
   source="default";return "full";
  }
  public static BuildFlavor Current{get{
   if(current==null){
    Load();string src;string name=ResolveName(out src);bool known;var k=Parse(name,out known);
    if(!known)Debug.LogWarning("Unknown build flavor '"+name+"' ("+src+"); using full");
    current=new BuildFlavor(k,DefOf(k));
   }
   return current;
  }}
  public static string SelectedSource{get{string s;ResolveName(out s);return s;}}
  // Verification only: force a flavor (the capture host cycles through all four).
  public static void Override(Kind k){Load();current=new BuildFlavor(k,DefOf(k));}
  public static void ResetOverride(){current=null;}

  public string Name{get{return Id.ToString().ToLowerInvariant();}}
  public string Label{get{return def.label;}}                 // web _LOBBY_VER_LABEL
  public string Limits{get{return def.limits;}}               // web _LOBBY_VER_LIMITS
  public string LoginHeading(bool english){return def.loginHeading[english?1:0];}
  public bool DemoMode{get{return def.demoMode;}}             // web _DEMO_MODE
  public int LevelCap{get{return def.levelCap;}}              // 0 = none. Applied to SimulationConfig.LevelCap by NativeGame (web addExp demo cap)
  public string[] AffixBanned{get{return def.demoMode?defs.demoLists.affixBanned:new string[0];}}
  public string[] FuseAllowed{get{return def.demoMode?defs.demoLists.fuseAllowed:new string[0];}}
  public bool Packaged{get{return def.release.packaged;}}
  public int AppId{get{return def.release.appId;}}
  public int DepotId{get{return def.release.depotId;}}
  public int Port{get{return def.release.port;}}
  public string SaveNamespace{get{return def.release.saveNamespace;}}
  public string Entry{get{return def.release.entry;}}
  public string Note{get{return def.note;}}
  // web: _DEMO_MODE && G.stage===_DEMO_LAST_STAGE (stage 0) turns the zone clear into the "end of demo" panel
  // JsonUtility turns a JSON null into a default object, so presence is judged by the sub text
  bool HasClearFinal{get{return def.clearFinal!=null&&def.clearFinal.sub!=null&&def.clearFinal.sub.Length>0;}}
  public bool DemoEndAtStage(int stageIndex){return HasClearFinal&&def.clearFinal.stage==stageIndex;}
  public string DemoEndSub(bool english){var s=HasClearFinal?def.clearFinal.sub:null;return s==null?null:(english&&s.Length>1&&!string.IsNullOrEmpty(s[1])?s[1]:s[0]);}
  public string DemoEndButton(bool english){var s=HasClearFinal?def.clearFinal.button:null;return s==null?null:(english&&s.Length>1&&!string.IsNullOrEmpty(s[1])?s[1]:s[0]);}
  // web: 'v'+version+' · '+date without dashes (index.html _LOBBY_VER)
  public static string ReleaseVersion{get{Load();return release.version??"";}}   // release-version.json (web EXODUSER_RELEASE.version)
  public static string VersionLine{get{Load();return "v"+release.version+" · "+(release.date??"").Replace("-","");}}
  public static LobbyLabelStyle LobbyStyle{get{Load();return new LobbyLabelStyle{overlayX=defs.lobby.overlay.x,overlayY=defs.lobby.overlay.y,fontSize=defs.lobby.overlay.fontSize,ls=defs.lobby.overlay.letterSpacing,lineHeight=defs.lobby.overlay.lineHeight,color=ToColor(defs.lobby.overlay.color),limitsColor=ToColor(defs.lobby.overlay.limitsColor),modeOffline=defs.lobby.overlay.modeOffline,modeOnline=defs.lobby.overlay.modeOnline,cornerSize=defs.lobby.corner.fontSize,cornerLs=defs.lobby.corner.letterSpacing,cornerRight=defs.lobby.corner.rightEdge,cornerColor=ToColor(defs.lobby.corner.color)};}}
  static Color ToColor(float[] c){return new Color(c[0]/255f,c[1]/255f,c[2]/255f,c[3]);}
  public struct LobbyLabelStyle {public float overlayX,overlayY,fontSize,ls,lineHeight,cornerSize,cornerLs,cornerRight;public Color color,limitsColor,cornerColor;public string modeOffline,modeOnline;}
 }
}
