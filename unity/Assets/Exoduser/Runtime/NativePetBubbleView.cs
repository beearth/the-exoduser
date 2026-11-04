using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // Existing web portrait PNGs include the complete painted frame. No generated plate.
 public sealed class NativePetBubbleView
 {
  Texture2D crow,cat;GUIStyle body;
  public Rect LastFrame{get;private set;}
  public Rect LastTextBox{get;private set;}
  public string LastText{get;private set;}
  public bool ArtLoaded=>crow!=null&&cat!=null;
  public static string BindingLabel(string action,string locale)
  {
   var keys=NativeKeyBindInput.Bindings;string code=keys.Primary(action)??keys.Secondary(action);
   string ko=KeyBindings.KeyName(code,false),en=KeyBindings.KeyName(code,true);
   // Unity's gameplay input has no web GP_KEY combat mapping. Show actual bindings, never a fictitious LB.
   return NativeA15SettingsLabels.GetKeyByKo(ko,locale,en);
  }
  public void Draw(NativePetBubbleQueue queue,string locale,bool guideOpen)
  {
   if(!queue.Visible)return;
   if(crow==null)crow=Resources.Load<Texture2D>("Art/PetBubble/crow");
   if(cat==null)cat=Resources.Load<Texture2D>("Art/PetBubble/cat");
   bool isCrow=queue.Speaker=="crow";var texture=isCrow?crow:cat;if(texture==null)return;
   var text=NativePetBubbleHints.Resolve(NativePetBubbleCatalog.Text(queue.Key,locale),action=>BindingLabel(action,locale));
   LastText=text;
   if(body==null)body=new GUIStyle(GUIStyle.none){font=NativeSilverHellUi.Font(),fontSize=22,wordWrap=true,alignment=TextAnchor.MiddleLeft,clipping=TextClipping.Clip};
   body.normal.textColor=new Color(217/255f,214/255f,208/255f,1);
   const float scale=1.5f;
   float w=480*scale,h=320*scale;
   bool left=isCrow||guideOpen;
   LastFrame=new Rect(left?20:NativeUiViewport.Edges.Width-20-w,NativeUiSafeArea.DesignHeight-220-h,w,h);
   var source=isCrow?new Rect(92,237,306,51):new Rect(122,250,190,42);
   LastTextBox=new Rect(LastFrame.x+source.x*scale,LastFrame.y+source.y*scale,source.width*scale,source.height*scale);
   var style=NativeDemoText.Style(body,text);
   while(style.fontSize>12&&style.CalcHeight(new GUIContent(text),LastTextBox.width)>LastTextBox.height)style.fontSize--;
   var matrix=GUI.matrix;var color=GUI.color;
   try{
    GUI.matrix=NativeUiViewport.EdgeMatrix;
    GUI.color=new Color(color.r,color.g,color.b,color.a*queue.Opacity);
    NativeUiAudit.DrawTexture(LastFrame,texture);
    NativeDemoText.Label(LastTextBox,text,style,"pet-bubble-text");
    NativeUiAudit.Region(LastFrame,"component","pet-bubble",queue.Id+"/"+queue.Speaker);
   }finally{GUI.color=color;GUI.matrix=matrix;}
  }
 }
}
