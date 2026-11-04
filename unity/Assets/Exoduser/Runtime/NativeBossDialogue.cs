using UnityEngine;

namespace Exoduser.UnityPort
{
 // Web #bossLine: bottom19%, max860px, silver hairlines, serif body, 3.2s.
 public sealed class NativeBossDialogue
 {
  string key;float since;Texture2D band,line;GUIStyle body,name;
  public bool Active{get{return key!=null&&Time.unscaledTime-since<3.2f;}}
  public void Reset(){key=null;}
  public void Show(string lineKey){key=lineKey;since=Time.unscaledTime;}
  public void Dispose(){if(band!=null)Object.Destroy(band);if(line!=null)Object.Destroy(line);}
  public void Draw(string locale,string bossName)
  {
   if(!Active)return;string text=NativeDemoText.BossLine(key,locale);if(string.IsNullOrEmpty(text))return;
   if(body==null){body=new GUIStyle(GUIStyle.none){font=NativeSilverHellUi.Font(true),fontSize=21,alignment=TextAnchor.MiddleCenter,wordWrap=true,clipping=TextClipping.Clip};name=new GUIStyle(body){font=Resources.Load<Font>("Art/fonts/Cinzel-VariableFont_wght")??body.font,fontSize=11,wordWrap=false};}
   if(band==null){band=NativeSilverHellUi.Effect(256,1,(x,y)=>{float f=Mathf.Clamp01(Mathf.Min(x,1-x)/.16f);return new Color(7/255f,6/255f,6/255f,.74f*f);});line=NativeSilverHellUi.Effect(256,1,(x,y)=>new Color(146/255f,149/255f,149/255f,.5f*Mathf.Sin(Mathf.PI*x)));}
   float age=(Time.unscaledTime-since)/3.2f,alpha=age<.14f?Mathf.SmoothStep(0,1,age/.14f):age<=.78f?1:1-Mathf.SmoothStep(0,1,(age-.78f)/.22f);
   float shift=age<.14f?8*(1-alpha):age>.78f?-4*(1-alpha):0;
   float width=Mathf.Min(NativeUiViewport.ScreenInDesign.width*.8f,860),inner=width-112;
   var fitted=NativeDemoText.Style(body,text);float height=Mathf.Max(32,fitted.CalcHeight(new GUIContent(text),inner));
   var box=new Rect(960-width/2,1080*(1-.19f)-(25+18+height)+shift,width,25+18+height);
   var tint=GUI.color;GUI.color=new Color(tint.r,tint.g,tint.b,tint.a*alpha);
   NativeUiAudit.DrawTexture(box,band);NativeUiAudit.DrawTexture(new Rect(box.x+width*.06f,box.y,width*.88f,1),line);NativeUiAudit.DrawTexture(new Rect(box.x+width*.06f,box.yMax-1,width*.88f,1),line);
   name.normal.textColor=new Color(152/255f,155/255f,155/255f,.72f);body.normal.textColor=new Color(217/255f,214/255f,208/255f,.93f);
   NativeDemoText.Label(new Rect(box.x+56,box.y+12,inner,12),bossName,name,"boss-line-name");
   NativeDemoText.Label(new Rect(box.x+56,box.y+30,inner,height),text,body,"boss-line-text");
   NativeUiAudit.Region(box,"component","boss-dialogue","웹 bottom19% 보스 한 줄");GUI.color=tint;
  }
 }
}
