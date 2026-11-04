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
   bool held=ExoInput.Mouse(0);foreach(var key in menuKeys)held|=ExoInput.Key(key);navigation.ObserveReleased(held);
   if(!navigation.Focused||navigation.WaitingForRelease)return PauseMenuCommand.None;
   if(openSelect>=0){A15PopupKeys();return PauseMenuCommand.None;}
   // OnGUI may finish capture before Update polls this same OS key. Keep it out of menu navigation.
   if(keyList!=null&&Time.frameCount<=keyList.CaptureConsumedFrame+1)return PauseMenuCommand.None;
   // The embedded binding list receives KeyDown in OnGUI before menu navigation may use it.
   if(page==PausePage.Settings&&tab==3&&keyList!=null&&keyList.Listening)return PauseMenuCommand.None;
   // A16: the key-binding page owns the keyboard: while a key is waiting nothing else reacts, otherwise ESC closes the page.
   if(keyPage){if(keyList!=null&&keyList.Listening)return PauseMenuCommand.None;if(ExoInput.KeyDown(KeyCode.Escape))keyPage=false;return PauseMenuCommand.None;}
   // Web togglePanel: another window's key switches straight to that window (menu items move with the arrow keys only).
   if(ExoInput.KeyDown(KeyCode.Tab)){
    if(page==PausePage.Settings)return HandleKey(PauseKey.Next,dead,fullscreen);
    NativePanelTabBar.Request("invPanel");return PauseMenuCommand.None;
   }
   if(ExoInput.KeyDown(KeyCode.K)){NativePanelTabBar.Request("skillPanel");return PauseMenuCommand.None;}
   PauseKey? input=null;
   if(ExoInput.KeyDown(KeyCode.Escape))input=PauseKey.Back;
   else if(ExoInput.KeyDown(KeyCode.UpArrow))input=PauseKey.Up;
   else if(ExoInput.KeyDown(KeyCode.DownArrow))input=PauseKey.Down;
   else if(ExoInput.KeyDown(KeyCode.LeftArrow))input=PauseKey.Left;
   else if(ExoInput.KeyDown(KeyCode.RightArrow))input=PauseKey.Right;
   else if(ExoInput.KeyDown(KeyCode.Home))input=PauseKey.Home;
   else if(ExoInput.KeyDown(KeyCode.End))input=PauseKey.End;
   else if(ExoInput.KeyDown(KeyCode.Return)||ExoInput.KeyDown(KeyCode.KeypadEnter)||ExoInput.KeyDown(KeyCode.Space))input=PauseKey.Accept;
   return input.HasValue?HandleKey(input.Value,dead,fullscreen):PauseMenuCommand.None;
  }
  public PauseMenuCommand HandleKey(PauseKey input,bool dead,bool fullscreen)
  {
   int previousTab=tab;
   var action=navigation.Handle(input,dead);
   if(tab!=previousTab){settingsScroll=0;keyScroll=0;}
   switch(action){
    case PauseAction.Resume:return PauseMenuCommand.Resume;
    case PauseAction.Restart:return PauseMenuCommand.Restart;
    case PauseAction.ReturnLobby:return PauseMenuCommand.ReturnLobby;
    case PauseAction.Quit:return PauseMenuCommand.Quit;
    case PauseAction.Defaults:RestoreDefaults();break;
    case PauseAction.ToggleFullscreen:if(fullscreenChanged!=null)fullscreenChanged(!fullscreen);break;
    case PauseAction.FramePrevious:StepFrameCap(-1);break;
    case PauseAction.FrameNext:StepFrameCap(1);break;
    case PauseAction.SfxDown:StepVolume(true,-1);break;
    case PauseAction.SfxUp:StepVolume(true,1);break;
    case PauseAction.BgmDown:StepVolume(false,-1);break;
    case PauseAction.BgmUp:StepVolume(false,1);break;
    case PauseAction.RowLeft:case PauseAction.RowRight:case PauseAction.RowAccept:A15RowKey(action,fullscreen);break;
   }
   return PauseMenuCommand.None;
  }
  void StepFrameCap(int delta){if(frameCapChanged==null)return;for(int i=0;i<NativeSettingsState.FrameCapCount;i++)if(NativeSettingsState.GetFrameCap(i)==settings.FrameCap){int cap=NativeSettingsState.GetFrameCap(Mathf.Clamp(i+delta,0,NativeSettingsState.FrameCapCount-1));if(cap!=settings.FrameCap){settings.TrySetFrameCap(cap);frameCapChanged(cap);}return;}}
  void StepVolume(bool sfx,int delta){if(sfx){if(sfxChanged==null)return;int before=settings.SfxPercent;settings.SetSfxPercent(before+delta);if(settings.SfxPercent!=before)sfxChanged(settings.SfxPercent);}else{if(bgmChanged==null)return;int before=settings.BgmPercent;settings.SetBgmPercent(before+delta);if(settings.BgmPercent!=before)bgmChanged(settings.BgmPercent);}}
  void PointAt(Rect rect,int index){if(Event.current.type==EventType.MouseDown&&rect.Contains(Event.current.mousePosition))navigation.PointAt(index);}
  void FocusBorder(Rect rect,int index){if(navigation.Focused&&navigation.Cursor==index)Border(new Rect(rect.x-3,rect.y-3,rect.width+6,rect.height+6),NativeSilverHellUi.Bright);}
  bool inputLive=true;
  bool MetalAction(Rect rect,string text,bool primary,bool selected,GUIStyle style){
   bool live=GUI.enabled&&inputLive;bool hover=live&&rect.Contains(Event.current.mousePosition);bool pressed=hover&&ExoInput.Mouse(0);bool lit=hover||selected;
   if(live&&lit&&!pressed)NativeSilverHellUi.ButtonFocus(rect);
   // The shared solid iron face owns opacity; emphasis stays inside its silver edge.
   NativeSilverHellUi.ActionPlate(rect,primary,lit?1:0,pressed,36,8,settingsChip:page==PausePage.Settings);
   // .sh-btn text: Hahmlet 400, letter-spacing .16em, #d6d3cd (selected/primary #f2f0ec). GUIStyle.none: no skin background behind the plate.
   Color col=lit||primary?NativeSilverHellUi.Bright:new Color(214/255f,211/255f,205/255f);
   SpacedLabel(rect,text,17,col);
   bool clicked=NativeUiAudit.Button(rect,GUIContent.none,GUIStyle.none);return clicked&&live;
  }
  GUIStyle spaced;
  void SpacedLabel(Rect r,string text,int size,Color col){
   if(spaced==null)spaced=new GUIStyle(GUIStyle.none){alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};
   spaced.font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(true),text);spaced.fontSize=size;spaced.normal.textColor=col;
   // Glyph x = advance of the prefix (measured with a sentinel so trailing spaces count) + i*gap: per-glyph widths overstate gaps.
   float gap=size*.16f,bar=spaced.CalcSize(new GUIContent("|")).x;
   float Adv(int n){return n==0?0:spaced.CalcSize(new GUIContent(text.Substring(0,n)+"|")).x-bar;}
   float w=Adv(text.Length)+gap*(text.Length-1),x0=r.center.x-w/2f;
   for(int i=0;i<text.Length;i++){if(char.IsWhiteSpace(text[i]))continue;float x=x0+Adv(i)+gap*i;NativeSilverHellUi.Label(new Rect(x,r.y,size*2,r.height),text[i].ToString(),spaced);}
  }
  GUIStyle hint;
  // .sh-body family: Hahmlet 400, #a7a49d, centred.
  GUIStyle Hint(int size,Color? col=null){
   if(hint==null)hint=new GUIStyle(GUIStyle.none){alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};
   hint.font=NativeSilverHellUi.Font(true);hint.fontSize=size;hint.normal.textColor=col??new Color(167/255f,164/255f,157/255f);return hint;
  }
  bool MenuButton(Rect rect,string text,int index,GUIStyle style){PointAt(rect,index);bool primary=page==PausePage.Main&&index==0||page==PausePage.Quit&&index==1;bool clicked=MetalAction(rect,text,primary,navigation.Focused&&navigation.Cursor==index,style);if(clicked)navigation.Fence();return clicked;}
 }
}
