using System;
namespace Exoduser.UnityPort.Core
{
 public enum FrontendEntryPage { Idle,Loading,Nemesis,Guide,Curtain,Complete }
 [Serializable] public sealed class StartupIntroData { public string schema,sourceSha256;public StartupIntroLanguage[] languages; }
 [Serializable] public sealed class StartupIntroLanguage { public string code;public StartupIntroLine[] lines; }
 [Serializable] public sealed class StartupIntroLine { public string id,img,speaker,text,sfx;public float t,dur;public bool exit;public StartupCamera cam;public StartupFade fade;public StartupVfx vfx;public StartupText text_cfg; }
 [Serializable] public sealed class StartupCamera {public float zs=1,ze=1,px,py;public string ease;}
 [Serializable] public sealed class StartupFade {public float @in,@out;public string type;}
 [Serializable] public sealed class StartupVfx {public float vig,chrom,shake,flicker;public string grade,glowPulse;public bool glowEye,particle,sparkHL;}
 [Serializable] public sealed class StartupText {public string reveal;public float speed;public bool shadow,glow;}
 // Presentation clock only. Never owns Simulation, roster transactions or browser saves.
 public sealed class FrontendEntryFlow
 {
  public FrontendEntryPage Page{get;private set;}
  public int LineIndex{get;private set;}
  public int GuideStep{get;private set;}
  public double Elapsed{get;private set;}
  public double HoldProgress{get;private set;}
  public bool FullText{get;private set;}
  public bool Active{get{return Page!=FrontendEntryPage.Idle&&Page!=FrontendEntryPage.Complete;}}
  StartupIntroLine[] lines;double guideReady;
  public StartupIntroLine Line{get{return lines!=null&&LineIndex<lines.Length?lines[LineIndex]:null;}}
  public void Begin(StartupIntroLine[] source,bool loadingAlreadyShown){if(source==null||source.Length==0)throw new ArgumentException("Missing source intro");lines=source;LineIndex=0;GuideStep=0;FullText=false;HoldProgress=0;Elapsed=0;Page=loadingAlreadyShown?FrontendEntryPage.Nemesis:FrontendEntryPage.Loading;}
  public int VisibleCharacters {get{var l=Line;if(l==null||l.text==null)return 0;int count=l.text.Replace("\n","").Length;return FullText?count:Math.Min(count,(int)(Elapsed*1000/(l.text_cfg!=null&&l.text_cfg.speed>0?l.text_cfg.speed:50)));}}
  public void Tick(double delta,bool held,bool focused){if(!Active)return;if(!focused){HoldProgress=0;return;}delta=Math.Max(0,delta);Elapsed+=delta;
   if(Page==FrontendEntryPage.Loading&&Elapsed>=1.2){Page=FrontendEntryPage.Nemesis;Elapsed=0;}
   else if(Page==FrontendEntryPage.Nemesis){var l=Line;if(l==null){ShowGuide();return;}if(held){HoldProgress=Math.Min(1,HoldProgress+Math.Min(.1,delta)/2);if(HoldProgress>=1){ShowGuide();return;}}else HoldProgress=0;if(l.exit){if(Elapsed>=((l.fade!=null&&l.fade.@out>0?l.fade.@out:1500)/1000))ShowGuide();}else if(string.IsNullOrEmpty(l.text)||string.IsNullOrEmpty(l.speaker)){if(Elapsed>=l.dur/1000)NextLine();}}
   else if(Page==FrontendEntryPage.Guide){if(held){HoldProgress=Math.Min(1,HoldProgress+delta/2);if(HoldProgress>=1)FinishGuide();}else HoldProgress=0;}
   else if(Page==FrontendEntryPage.Curtain&&Elapsed>=.9){Page=FrontendEntryPage.Complete;Elapsed=0;}
  }
  public void Advance(){if(Page==FrontendEntryPage.Nemesis){var l=Line;if(l!=null&&!string.IsNullOrEmpty(l.text)&&!string.IsNullOrEmpty(l.speaker)&&VisibleCharacters<l.text.Replace("\n","").Length&&!FullText){FullText=true;return;}NextLine();}else if(Page==FrontendEntryPage.Guide&&Elapsed>=guideReady){guideReady=Elapsed+.25;if(++GuideStep>=4)FinishGuide();}}
  void NextLine(){LineIndex++;Elapsed=0;FullText=false;HoldProgress=0;if(lines==null||LineIndex>=lines.Length)ShowGuide();}
  public void Skip(){if(Page==FrontendEntryPage.Nemesis)ShowGuide();else if(Page==FrontendEntryPage.Guide)FinishGuide();}
  void ShowGuide(){Page=FrontendEntryPage.Guide;GuideStep=0;Elapsed=0;guideReady=.25;HoldProgress=0;}
  void FinishGuide(){Page=FrontendEntryPage.Curtain;Elapsed=0;HoldProgress=0;}
  public void Cancel(){Page=FrontendEntryPage.Idle;HoldProgress=0;}
 }
}
