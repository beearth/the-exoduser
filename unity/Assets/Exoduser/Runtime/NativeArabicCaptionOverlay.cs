using UnityEngine;
using UnityEngine.TextCore.Text;
using UnityEngine.UIElements;
using Exoduser.UnityPort.Core;
using FontAsset = UnityEngine.TextCore.Text.FontAsset;

namespace Exoduser.UnityPort
{
 // Isolated Arabic subtitle preview. Other languages continue through NativeLobby IMGUI.
 public sealed class NativeArabicCaptionOverlay : MonoBehaviour
 {
  NativeLobby lobby;
  UIDocument document;
  PanelSettings panel;
  RenderTexture target;
  Label caption;
  public bool Ready { get; private set; }

  public void Initialize(NativeLobby owner)
  {
   lobby=owner;
   panel=Resources.Load<PanelSettings>("Art/fonts/ArabicCaptionPanel");
   var font=Resources.Load<FontAsset>("Art/fonts/ArabicCaptionNaskhDynamic");
   if(panel==null||font==null||font.atlasPopulationMode!=AtlasPopulationMode.Dynamic){Debug.LogError("Arabic caption preview assets unavailable or not dynamic");return;}
   EnsureTarget();
   document=gameObject.AddComponent<UIDocument>();
   document.panelSettings=panel;
   var root=document.rootVisualElement;
   if(root==null){Debug.LogError("Arabic caption preview panel unavailable");return;}
   root.pickingMode=PickingMode.Ignore;
   root.style.width=Length.Percent(100);
   root.style.height=Length.Percent(100);
   caption=new Label();
   caption.name="ArabicWorldCaption";
   caption.pickingMode=PickingMode.Ignore;
   caption.enableRichText=false;
   caption.languageDirection=LanguageDirection.RTL;
   caption.style.position=Position.Absolute;
   caption.style.left=Length.Percent(8);
   caption.style.right=Length.Percent(8);
   caption.style.bottom=Length.Percent(18);
   caption.style.unityFontDefinition=FontDefinition.FromSDFFont(font);
   caption.style.unityTextGenerator=new StyleEnum<TextGeneratorType>(TextGeneratorType.Advanced);
   caption.style.unityTextAlign=TextAnchor.MiddleCenter;
   caption.style.whiteSpace=WhiteSpace.Normal;
   caption.style.color=new Color(.933f,.898f,.835f);
   caption.style.backgroundColor=new Color(0,0,0,.46f);
   caption.style.paddingLeft=8;
   caption.style.paddingRight=8;
   caption.style.paddingTop=2;
   caption.style.paddingBottom=2;
   caption.style.display=DisplayStyle.None;
   root.Add(caption);
   Ready=true;
  }

  void EnsureTarget()
  {
   if(panel==null)return;
   if(target!=null&&target.width==Screen.width&&target.height==Screen.height)return;
   if(target!=null){panel.targetTexture=null;target.Release();Destroy(target);}
   target=new RenderTexture(Screen.width,Screen.height,0,RenderTextureFormat.ARGB32);
   target.name="ArabicCaptionOverlay";target.Create();
   panel.clearColor=true;panel.colorClearValue=Color.clear;panel.targetTexture=target;
  }

  public void DrawComposite(Rect screenRect)
  {
   if(Ready&&target!=null)GUI.DrawTexture(screenRect,target,ScaleMode.StretchToFill,true);
  }

  void LateUpdate()
  {
   if(!Ready||lobby==null)return;
   EnsureTarget();
   bool visible=lobby.IsBlocking&&lobby.Flow.Page==LobbyPage.WorldIntro&&lobby.Language=="ar"&&lobby.SubtitleText.Length>0;
   caption.style.display=visible?DisplayStyle.Flex:DisplayStyle.None;
   if(!visible)return;
   if(caption.text!=lobby.SubtitleText)caption.text=lobby.SubtitleText;
   caption.languageDirection=ContainsArabicScript(lobby.SubtitleText)?LanguageDirection.RTL:LanguageDirection.LTR;
   caption.style.fontSize=Mathf.Clamp(Screen.height*.054f,32f,50f);
  }

  static bool ContainsArabicScript(string text)
  {
   for(int i=0;i<text.Length;i++)if(text[i]>='\u0600'&&text[i]<='\u06ff')return true;
   return false;
  }

  void OnDestroy()
  {
   if(panel!=null&&panel.targetTexture==target)panel.targetTexture=null;
   if(target!=null){target.Release();Destroy(target);}
  }
 }
}
