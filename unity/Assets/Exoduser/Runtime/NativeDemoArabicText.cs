using System.Collections.Generic;
using UnityEngine;
using UnityEngine.TextCore.Text;
using UnityEngine.UIElements;
using FontAsset=UnityEngine.TextCore.Text.FontAsset;

namespace Exoduser.UnityPort
{
 // Reuses the project's Advanced/RTL caption stack in isolated, bounded render targets.
 // Each label is composited at its IMGUI location/depth, so it cannot float above a modal.
 internal static class NativeDemoArabicText
 {
  sealed class Slot {public GameObject owner;public PanelSettings panel;public RenderTexture target;public Label label;public int frame;}
  static readonly Dictionary<string,Slot> cache=new Dictionary<string,Slot>();
  static PanelSettings template;static FontAsset font;
  static bool Arabic(string text){foreach(char c in text)if(c>='\u0600'&&c<='\u06ff')return true;return false;}
  static void Release(Slot s){if(s.panel!=null)s.panel.targetTexture=null;if(s.target!=null){s.target.Release();Object.Destroy(s.target);}Object.Destroy(s.owner);Object.Destroy(s.panel);}
  internal static bool Draw(Rect rect,string text,GUIStyle style,string paintId)
  {
   if(!Arabic(text))return false;
   if(Event.current.type!=EventType.Repaint)return true;
   if(template==null)template=Resources.Load<PanelSettings>("Art/fonts/ArabicCaptionPanel");
   if(font==null)font=Resources.Load<FontAsset>("Art/fonts/ArabicCaptionNaskhDynamic");
   if(template==null||font==null)throw new System.InvalidOperationException("Arabic advanced caption assets unavailable");
   float scale=Mathf.Max(.01f,GUI.matrix.MultiplyVector(Vector3.up).magnitude);
   int width=Mathf.Max(1,Mathf.CeilToInt(rect.width*scale)),height=Mathf.Max(1,Mathf.CeilToInt(rect.height*scale));
   var col=style.normal.textColor;string key=(paintId??text)+"|"+width+"|"+height+"|"+style.fontSize+"|"+style.fontStyle+"|"+col.r+"|"+col.g+"|"+col.b;
   if(!cache.TryGetValue(key,out var slot))
   {
    if(cache.Count>=24){string oldest=null;int frame=int.MaxValue;foreach(var pair in cache)if(pair.Value.frame<frame){oldest=pair.Key;frame=pair.Value.frame;}Release(cache[oldest]);cache.Remove(oldest);}
    slot=new Slot{owner=new GameObject("Demo Arabic text"),panel=Object.Instantiate(template)};Object.DontDestroyOnLoad(slot.owner);
    slot.target=new RenderTexture(width,height,0,RenderTextureFormat.ARGB32){name="DemoArabicLabel",filterMode=FilterMode.Bilinear};slot.target.Create();
    var previousTarget=RenderTexture.active;try{RenderTexture.active=slot.target;GL.Clear(true,true,Color.clear);}finally{RenderTexture.active=previousTarget;}
    slot.panel.targetTexture=slot.target;slot.panel.clearColor=true;slot.panel.colorClearValue=Color.clear;slot.panel.scaleMode=PanelScaleMode.ConstantPixelSize;slot.panel.scale=1;
    var document=slot.owner.AddComponent<UIDocument>();document.panelSettings=slot.panel;var root=document.rootVisualElement;root.pickingMode=PickingMode.Ignore;
    root.style.width=width;root.style.height=height;
    slot.label=new Label{pickingMode=PickingMode.Ignore,languageDirection=LanguageDirection.RTL};
    slot.label.style.position=Position.Absolute;slot.label.style.left=0;slot.label.style.top=0;slot.label.style.width=width;slot.label.style.height=height;
    slot.label.style.unityFontDefinition=FontDefinition.FromSDFFont(font);slot.label.style.unityTextGenerator=new StyleEnum<TextGeneratorType>(TextGeneratorType.Advanced);
    slot.label.style.marginLeft=0;slot.label.style.marginRight=0;slot.label.style.marginTop=0;slot.label.style.marginBottom=0;
    slot.label.style.paddingLeft=0;slot.label.style.paddingRight=0;slot.label.style.paddingTop=0;slot.label.style.paddingBottom=0;
    root.Add(slot.label);cache.Add(key,slot);
   }
   slot.frame=Time.frameCount;slot.label.text=text;slot.label.enableRichText=style.richText;
   slot.label.style.fontSize=style.fontSize*scale;slot.label.style.unityFontStyleAndWeight=style.fontStyle;slot.label.style.unityTextAlign=style.alignment;
   slot.label.style.whiteSpace=style.wordWrap?WhiteSpace.Normal:WhiteSpace.NoWrap;slot.label.style.color=new Color(col.r,col.g,col.b,1);
   var tint=GUI.color;GUI.color=new Color(tint.r,tint.g,tint.b,tint.a*col.a);NativeUiAudit.DrawTexture(rect,slot.target,ScaleMode.StretchToFill,true);GUI.color=tint;
   return true;
  }
 }
}
