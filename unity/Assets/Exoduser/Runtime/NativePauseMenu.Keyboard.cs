using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativePauseMenu
 {
  readonly PauseNavigation navigation=new PauseNavigation();
  public PauseNavigation Navigation {get{return navigation;}}
  PausePage page {get{return navigation.Page;}set{navigation.Open(value);}}
  int tab {get{return navigation.Tab;}set{navigation.SelectTab(value);}}
  public void SetFocus(bool focused){navigation.SetFocus(focused);}
  static readonly KeyCode[] menuKeys={KeyCode.Escape,KeyCode.Return,KeyCode.KeypadEnter,KeyCode.Space,KeyCode.Tab,KeyCode.UpArrow,KeyCode.DownArrow,KeyCode.LeftArrow,KeyCode.RightArrow,KeyCode.Home,KeyCode.End};
  public PauseMenuCommand PollKeys(bool dead,bool fullscreen)
  {
   bool held=Input.GetMouseButton(0);foreach(var key in menuKeys)held|=Input.GetKey(key);navigation.ObserveReleased(held);
   if(!navigation.Focused||navigation.WaitingForRelease)return PauseMenuCommand.None;
   // Web togglePanel: another window's key switches straight to that window (menu items move with the arrow keys only).
   if(Input.GetKeyDown(KeyCode.Tab)){NativePanelTabBar.Request("invPanel");return PauseMenuCommand.None;}
   if(Input.GetKeyDown(KeyCode.K)){NativePanelTabBar.Request("skillPanel");return PauseMenuCommand.None;}
   PauseKey? input=null;
   if(Input.GetKeyDown(KeyCode.Escape))input=PauseKey.Back;
   else if(Input.GetKeyDown(KeyCode.UpArrow))input=PauseKey.Up;
   else if(Input.GetKeyDown(KeyCode.DownArrow))input=PauseKey.Down;
   else if(Input.GetKeyDown(KeyCode.LeftArrow))input=PauseKey.Left;
   else if(Input.GetKeyDown(KeyCode.RightArrow))input=PauseKey.Right;
   else if(Input.GetKeyDown(KeyCode.Home))input=PauseKey.Home;
   else if(Input.GetKeyDown(KeyCode.End))input=PauseKey.End;
   else if(Input.GetKeyDown(KeyCode.Return)||Input.GetKeyDown(KeyCode.KeypadEnter)||Input.GetKeyDown(KeyCode.Space))input=PauseKey.Accept;
   return input.HasValue?HandleKey(input.Value,dead,fullscreen):PauseMenuCommand.None;
  }
  public PauseMenuCommand HandleKey(PauseKey input,bool dead,bool fullscreen)
  {
   switch(navigation.Handle(input,dead)){
    case PauseAction.Resume:return PauseMenuCommand.Resume;
    case PauseAction.Restart:return PauseMenuCommand.Restart;
    case PauseAction.ReturnLobby:return PauseMenuCommand.ReturnLobby;
    case PauseAction.Quit:return PauseMenuCommand.Quit;
    case PauseAction.Defaults:RestoreDefaults();break;
    case PauseAction.ToggleFullscreen:if(fullscreenChanged!=null)fullscreenChanged(!fullscreen);break;
    case PauseAction.FramePrevious:StepFrameCap(-1);break;
    case PauseAction.FrameNext:StepFrameCap(1);break;
    case PauseAction.SfxDown:StepVolume(true,-5);break;
    case PauseAction.SfxUp:StepVolume(true,5);break;
    case PauseAction.BgmDown:StepVolume(false,-5);break;
    case PauseAction.BgmUp:StepVolume(false,5);break;
   }
   return PauseMenuCommand.None;
  }
  void StepFrameCap(int delta){if(frameCapChanged==null)return;for(int i=0;i<NativeSettingsState.FrameCapCount;i++)if(NativeSettingsState.GetFrameCap(i)==settings.FrameCap){int cap=NativeSettingsState.GetFrameCap(Mathf.Clamp(i+delta,0,NativeSettingsState.FrameCapCount-1));if(cap!=settings.FrameCap){settings.TrySetFrameCap(cap);frameCapChanged(cap);}return;}}
  void StepVolume(bool sfx,int delta){if(sfx){if(sfxChanged==null)return;settings.SetSfxPercent(settings.SfxPercent+delta);sfxChanged(settings.SfxPercent);}else{if(bgmChanged==null)return;settings.SetBgmPercent(settings.BgmPercent+delta);bgmChanged(settings.BgmPercent);}}
  void PointAt(Rect rect,int index){if(Event.current.type==EventType.MouseDown&&rect.Contains(Event.current.mousePosition))navigation.PointAt(index);}
  void FocusBorder(Rect rect,int index){if(navigation.Focused&&navigation.Cursor==index)Border(new Rect(rect.x-3,rect.y-3,rect.width+6,rect.height+6),new Color(.94f,.73f,.4f));}
  bool MenuButton(Rect rect,string text,int index,GUIStyle style){PointAt(rect,index);bool clicked=GUI.Button(rect,text,style);FocusBorder(rect,index);if(clicked)navigation.Fence();return clicked;}
 }
}
