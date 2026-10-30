using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public enum PauseMenuCommand { None, Resume, Restart, ReturnLobby, Quit }

 // A complete pause/settings view. The game owner retains simulation and input ownership.
 public sealed partial class NativePauseMenu
 {
  readonly Font font;
  readonly NativeSettingsState settings;
  readonly Action<int> sfxChanged,bgmChanged,frameCapChanged;
  readonly Action<bool> fullscreenChanged;
  GUIStyle title,body,muted,button,tabButton,activeTab,fpsButton,activeFpsButton;
  bool ready;
  // A16: the same key-binding list now lives inside A15 Controls. The old
  // full-screen keyPage entry remains only for the existing isolated QA hook.
  NativeKeyBindList keyList;bool keyPage;float keyScroll,settingsScroll;GUIStyle keyLabelStyle;
  public bool KeyPageOpen{get{return keyPage;}}
  public bool KeyCaptureActive{get{return keyList!=null&&keyList.Listening&&(keyPage||page==PausePage.Settings&&tab==3);}}
  // A16 test hooks (pause smoke phase "keys"): open the page without the mouse, reach the list, force the scroll (clamped to the end).
  public NativeKeyBindList KeyListForTest{get{return keyList;}}
  public void OpenKeyPageForTest(){keyPage=true;keyScroll=0;if(keyList==null)keyList=new NativeKeyBindList(NativeKeyBindInput.Bindings);}
  public void BeginEmbeddedKeyCaptureForQa(string action,bool alternate){if(page!=PausePage.Settings||tab!=3)throw new InvalidOperationException("QA capture requires Controls tab");if(keyList==null)keyList=new NativeKeyBindList(NativeKeyBindInput.Bindings);keyList.BeginListening(action,alternate);}
  public void SetKeyScrollForTest(float value){keyScroll=value;}
  public bool English { get; set; }
  public string LocaleCode { get; set; }="ko";
  public bool HitTraceForQa {get;set;}
  public bool SettingsPersistenceEnabled {get;set;}
  public bool SettingsPersistenceProblem {get;set;}
  public bool SettingsPersistenceRecovered {get;set;}
  public bool SettingsHostApplyPending {get;set;}
  public bool SettingsHostApplyFailed {get;set;}
  public bool SettingsOpen { get { return page==PausePage.Settings; } }
  public NativeSettingsState Settings { get { return settings; } }
  public NativePauseMenu(Font font,NativeSettingsState settings,Action<int> sfxChanged,
                         Action<int> bgmChanged,Action<int> frameCapChanged,Action<bool> fullscreenChanged)
  {
   if(settings==null)throw new ArgumentNullException("settings");
   this.font=NativeSilverHellUi.Font()??font;this.settings=settings;this.sfxChanged=sfxChanged;
   this.bgmChanged=bgmChanged;this.frameCapChanged=frameCapChanged;this.fullscreenChanged=fullscreenChanged;
   navigation.SettingsRows=A15NavRows();
  }
  public void Reset() { navigation.Reset();keyPage=false;keyScroll=0;settingsScroll=0;openSelect=-1;resetConfirm=false;if(keyList!=null)keyList.CancelListening(); }
  public void ShowSettings() { page=PausePage.Settings;keyScroll=0;settingsScroll=0; }
  // Call once from the owner's Escape handler BEFORE toggling menu/Running.
  public bool HandleEscape()
  {
   return navigation.BackPage();
  }
  string T(string ko,string en) { return English?en:ko; }
  string Exact(string id,string ko,string en){return NativeA15SettingsLabels.Get(id,LocaleCode,ko,en);}
  void SelectExactLabelFont()
  {
   // Only these three Settings title labels need a regional font. These styles
   // belong to this menu, and switching back to ko restores the original Font.
   Font selected=LocaleCode=="el"||LocaleCode=="th"||LocaleCode=="zh"
    ?NativeA15SettingsLabels.FontForLocale(LocaleCode,font):font;
   title.font=selected;tabButton.font=selected;activeTab.font=selected;
  }
  void Init()
  {
   if(ready)return;ready=true;
   body=new GUIStyle(GUI.skin.label){font=font,fontSize=20,wordWrap=true};
   body.normal.textColor=new Color(226/255f,223/255f,217/255f);
   title=new GUIStyle(body){fontSize=32,fontStyle=FontStyle.Normal,alignment=TextAnchor.MiddleCenter};
   muted=new GUIStyle(body){fontSize=16};muted.normal.textColor=new Color(157/255f,160/255f,160/255f);
   button=new GUIStyle(GUI.skin.button){font=font,fontSize=20,padding=new RectOffset(12,12,8,8)};
   tabButton=new GUIStyle(button){fontSize=18};
   activeTab=new GUIStyle(tabButton);activeTab.normal.textColor=NativeSilverHellUi.Bright;
   fpsButton=new GUIStyle(tabButton){fontSize=16,padding=new RectOffset(4,4,8,8)};
   activeFpsButton=new GUIStyle(fpsButton);activeFpsButton.normal.textColor=NativeSilverHellUi.Bright;
  }
  static void Fill(Rect rect,Color color)
  {
   Color old=GUI.color;GUI.color=color;GUI.DrawTexture(rect,Texture2D.whiteTexture);GUI.color=old;
  }
  static void Border(Rect r,Color c)
  {
   Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);
   Fill(new Rect(r.x,r.y,1,r.height),c);Fill(new Rect(r.xMax-1,r.y,1,r.height),c);
  }
  public PauseMenuCommand Draw(bool dead,bool fullscreen)
  {
   Init();Matrix4x4 oldMatrix=GUI.matrix;Color oldColor=GUI.color;bool oldEnabled=GUI.enabled;
   try
   {
    if(keyPage&&page==PausePage.Settings){DrawKeyPage();return PauseMenuCommand.None;}
    if(Event.current.isKey&&!KeyCaptureActive)Event.current.Use();
    GUI.enabled=oldEnabled&&navigation.Focused&&!navigation.WaitingForRelease;
    GUI.matrix=Matrix4x4.identity;GUI.color=Color.white;
    Fill(new Rect(0,0,Screen.width,Screen.height),new Color(0,0,0,.72f));
    // Web common window tab bar at the settings-window position (1920x1080 design space).
    if(page==PausePage.Settings)return DrawSettingsA15(fullscreen);
    {float s1=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s1)/2,(Screen.height-1080*s1)/2,0),Quaternion.identity,Vector3.one*s1);NativePanelTabBar.Draw(NativePanelTabBar.Preset.Settings,"settings");GUI.matrix=Matrix4x4.identity;}
    float scale=Mathf.Min(Screen.width/1280f,Screen.height/720f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1280*scale)/2,(Screen.height-720*scale)/2,0),Quaternion.identity,Vector3.one*scale);
    var panel=new Rect(300,72,680,576);NativeSilverHellUi.Panel(panel,36,12);
    if(page==PausePage.Settings){DrawSettings(fullscreen);return PauseMenuCommand.None;}
    if(page==PausePage.Quit)return DrawQuit();
    NativeSilverHellUi.Label(new Rect(336,98,608,48),dead?T("쓰러졌습니다","You have fallen"):T("일시정지","Paused"),title);
    if(MenuButton(new Rect(388,184,504,68),dead?T("다시 시작","Restart"):T("계속하기","Resume"),0,button))return dead?PauseMenuCommand.Restart:PauseMenuCommand.Resume;
    if(MenuButton(new Rect(412,272,456,58),T("설정","Settings"),1,button))page=PausePage.Settings;
    if(MenuButton(new Rect(412,348,456,58),T("로비로 돌아가기","Return to lobby"),2,button))return PauseMenuCommand.ReturnLobby;
    if(MenuButton(new Rect(412,424,456,58),T("게임 종료","Quit game"),3,button))page=PausePage.Quit;
    NativeSilverHellUi.Label(new Rect(364,524,552,58),T("미리보기의 진행 상황은 저장되지 않습니다.","Progress in this preview is not saved."),muted);
    NativeSilverHellUi.Label(new Rect(364,600,552,28),dead?T("다시 시작하거나 로비로 돌아갈 수 있습니다.","Restart or return to the lobby."):T("↑↓ 선택 · Enter 확인 · ESC 뒤로 · TAB 인벤토리","↑↓ Select · Enter Confirm · ESC Back · TAB Inventory"),muted);
    return PauseMenuCommand.None;
   }
   finally { GUI.matrix=oldMatrix;GUI.color=oldColor;GUI.enabled=oldEnabled; }
  }
  void DrawSettings(bool fullscreen)
  {
   NativeSilverHellUi.Label(new Rect(336,98,608,48),T("설정","Settings"),title);
   string[] tabs={T("화면","Display"),T("소리","Audio"),T("조작 안내","Controls")};
   for(int i=0;i<tabs.Length;i++)if(MenuButton(new Rect(340+i*202,174,194,44),tabs[i],i,tab==i?activeTab:tabButton))tab=i;
   if(tab==0)DrawDisplay(fullscreen);else if(tab==1)DrawAudio();else DrawControls();
   NativeSilverHellUi.Label(new Rect(348,528,584,56),T("↑↓ 선택 · ←→ 값 조절 · Enter 확인\n","↑↓ Select · ←→ Adjust · Enter Confirm\n")+SettingsPersistenceNotice(),muted);
   if(MenuButton(new Rect(340,588,288,44),T("기본값 복원","Restore defaults"),navigation.Count-2,button))RestoreDefaults();
   if(MenuButton(new Rect(652,588,288,44),T("뒤로","Back"),navigation.Count-1,button))navigation.BackPage();
  }
  // A15: four web page headings with only the controls connected to this native host.
  PauseMenuCommand DrawSettingsA15(bool fullscreen)
  {
   SelectExactLabelFont();
   float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
   GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*scale)/2,(Screen.height-1080*scale)/2,0),Quaternion.identity,Vector3.one*scale);
   return DrawA15Window(fullscreen);
  }
  void DrawA15FrameCard(Rect card)
  {
   Fill(card,new Color(20/255f,23/255f,23/255f,.85f));Border(card,new Color(69/255f,72/255f,72/255f));NativeSilverHellUi.Label(new Rect(card.x+12,card.y+12,card.width-24,38),T("프레임 제한","Frame rate limit"),body);
   PointAt(card,4);FocusBorder(card,4);bool enabled=GUI.enabled;GUI.enabled=enabled&&frameCapChanged!=null;
   float buttonW=(card.width-36)/NativeSettingsState.FrameCapCount;
   for(int i=0;i<NativeSettingsState.FrameCapCount;i++){int cap=NativeSettingsState.GetFrameCap(i);string label=cap==0?T("무제한","Unlimited"):cap.ToString();if(NativeSilverHellUi.Button(new Rect(card.x+12+i*buttonW,card.y+78,buttonW-2,46),label,settings.FrameCap==cap?activeFpsButton:fpsButton)){settings.TrySetFrameCap(cap);frameCapChanged(cap);navigation.Fence();}}
   GUI.enabled=enabled;
  }
  void DrawA15FullscreenCard(Rect card,bool fullscreen,int cursor)
  {
   Fill(card,new Color(20/255f,23/255f,23/255f,.85f));Border(card,new Color(69/255f,72/255f,72/255f));NativeSilverHellUi.Label(new Rect(card.x+12,card.y+12,card.width-24,38),T("전체 화면","Fullscreen"),body);
   PointAt(card,cursor);FocusBorder(card,cursor);bool enabled=GUI.enabled;GUI.enabled=enabled&&fullscreenChanged!=null;
   bool next=GUI.Toggle(new Rect(card.x+12,card.y+76,card.width-24,48),fullscreen,fullscreen?T("켜짐","On"):T("꺼짐","Off"),button);
   if(next!=fullscreen&&fullscreenChanged!=null){fullscreenChanged(next);navigation.Fence();}GUI.enabled=enabled;
  }
  void DrawA15VolumeCard(Rect card,bool sfx)
  {
   int value=sfx?settings.SfxPercent:settings.BgmPercent,index=sfx?4:5;bool connected=sfx?sfxChanged!=null:bgmChanged!=null;
   Fill(card,new Color(20/255f,23/255f,23/255f,.85f));Border(card,new Color(69/255f,72/255f,72/255f));PointAt(card,index);FocusBorder(card,index);
   NativeSilverHellUi.Label(new Rect(card.x+12,card.y+12,card.width-140,38),sfx?T("효과음","Sound effects"):T("배경 음악","Background music"),body);NativeSilverHellUi.Label(new Rect(card.xMax-110,card.y+12,98,38),value+"%",body);
   bool enabled=GUI.enabled;GUI.enabled=enabled&&connected;int next=Mathf.RoundToInt(GUI.HorizontalSlider(new Rect(card.x+16,card.y+88,card.width-32,34),value,0,100));GUI.enabled=enabled;
   if(next!=value&&connected){if(sfx){settings.SetSfxPercent(next);sfxChanged(settings.SfxPercent);}else{settings.SetBgmPercent(next);bgmChanged(settings.BgmPercent);}}
  }
  void DrawEmbeddedBindings(Rect content)
  {
   if(keyList==null)keyList=new NativeKeyBindList(NativeKeyBindInput.Bindings);
   keyList.English=English;keyList.LocaleCode=LocaleCode;
   if(SettingsPersistenceProblem){keyList.SaveNote="키 설정을 저장하지 못했습니다 · 이번 실행의 값은 유지됩니다";keyList.SaveNoteEn="Key bindings could not be saved · current session values remain";}
   else if(SettingsPersistenceEnabled){keyList.SaveNote="키 설정 변경은 "+NativePlatformLabel.Ko+"에 자동 저장됩니다";keyList.SaveNoteEn="Key binding changes are saved on "+NativePlatformLabel.En+"";}
   else{keyList.SaveNote="검수 실행의 키 설정은 저장하지 않습니다";keyList.SaveNoteEn="Key bindings are not saved during this QA run";}
   float max=Mathf.Max(0,keyList.ContentHeight+28-content.height);
   if(Event.current.type==EventType.ScrollWheel&&content.Contains(Event.current.mousePosition)){keyScroll=Mathf.Clamp(keyScroll+Event.current.delta.y*40f,0,max);Event.current.Use();}
   keyScroll=Mathf.Clamp(keyScroll,0,max);
   TraceHitForQa("menu",content,max);
   GUI.BeginGroup(content);
   TraceHitForQa("group-before",content,max);
   keyList.Draw(new Vector2(12,14-keyScroll),new Rect(0,0,content.width,content.height));
   TraceHitForQa("group-after",content,max);
   GUI.EndGroup();
  }
  void TraceHitForQa(string phase,Rect content,float max)
  {
   if(!HitTraceForQa||Event.current==null||Event.current.rawType!=EventType.MouseDown)return;
   var e=Event.current;var m=GUI.matrix;var rows=keyList.Bindings.Listed;
   int shield=-1,parry=-1;for(int i=0;i<rows.Count;i++){if(rows[i]=="shield")shield=i;if(rows[i]=="parry")parry=i;}
   string shieldRect=shield>=0&&keyList.LastKeyRects.Count>shield*2?keyList.LastKeyRects[shield*2].ToString("F3"):"none";
   string parryRect=parry>=0&&keyList.LastKeyRects.Count>parry*2?keyList.LastKeyRects[parry*2].ToString("F3"):"none";
   Debug.Log("A15_HIT_MENU phase="+phase+" frame="+Time.frameCount+" type="+e.type+" raw="+e.rawType+" button="+e.button+" mouse="+e.mousePosition.ToString("F3")+" screen="+Screen.width+"x"+Screen.height+" matrix="+m.m00+","+m.m11+","+m.m03+","+m.m13+" content="+content.ToString("F3")+" scroll="+keyScroll+" max="+max+" listening="+keyList.Listening+" action="+keyList.ListeningAction+" consumed="+keyList.CaptureConsumedFrame+" shieldIndex="+shield+" shieldRect="+shieldRect+" parryIndex="+parry+" parryRect="+parryRect);
  }
  string SettingsPersistenceNotice()
  {
   if(SettingsHostApplyPending)return T("화면 설정을 적용하는 중입니다.","Applying display settings.");
   if(SettingsHostApplyFailed)return T("화면 변경을 적용하지 못했습니다. 현재 화면을 유지합니다.","Display change failed. The current display is retained.");
   if(SettingsPersistenceProblem)return T("설정 저장에 문제가 있습니다. 이번 실행의 값은 유지됩니다.","Settings could not be saved. Current session values are retained.");
   if(!SettingsPersistenceEnabled)return T("검수 실행의 설정은 저장하지 않습니다.","Settings are not saved during this QA run.");
   if(SettingsPersistenceRecovered)return T("설정 백업을 복원했습니다. 변경은 "+NativePlatformLabel.Ko+"에 저장됩니다.","Settings backup restored. Changes are saved on "+NativePlatformLabel.En+".");
   return T("설정은 "+NativePlatformLabel.Ko+"에 저장되어 다음 실행에도 적용됩니다.","Settings are saved on "+NativePlatformLabel.En+" for the next launch.");
  }
  void DrawDisplay(bool fullscreen)
  {
   NativeSilverHellUi.Label(new Rect(348,246,584,34),T("프레임 제한","Frame rate limit"),body);
   bool enabled=GUI.enabled;GUI.enabled=enabled&&frameCapChanged!=null;
   PointAt(new Rect(344,286,592,54),3);FocusBorder(new Rect(344,286,592,54),3);
   for(int i=0;i<NativeSettingsState.FrameCapCount;i++)
   {
    int cap=NativeSettingsState.GetFrameCap(i);
    string label=cap==0?T("무제한","Unlimited"):cap.ToString();
    if(NativeSilverHellUi.Button(new Rect(348+i*98,290,92,46),label,settings.FrameCap==cap?activeFpsButton:fpsButton))
    { settings.TrySetFrameCap(cap);frameCapChanged(cap);navigation.Fence(); }
   }
   GUI.enabled=enabled&&fullscreenChanged!=null;
   string fullscreenLabel=fullscreen?T("전체 화면: 켜짐","Fullscreen: On"):T("전체 화면: 꺼짐","Fullscreen: Off");
   PointAt(new Rect(348,372,584,42),4);FocusBorder(new Rect(348,372,584,42),4);
   bool next=GUI.Toggle(new Rect(348,372,584,42),fullscreen,fullscreenLabel,button);
   if(next!=fullscreen&&fullscreenChanged!=null){fullscreenChanged(next);navigation.Fence();}
   GUI.enabled=enabled;
  }
  void DrawAudio()
  {
   int sfx=VolumeRow(252,T("효과음","Sound effects"),settings.SfxPercent,sfxChanged!=null);
   if(sfx!=settings.SfxPercent){settings.SetSfxPercent(sfx);if(sfxChanged!=null)sfxChanged(sfx);}
   int bgm=VolumeRow(374,T("배경 음악","Background music"),settings.BgmPercent,bgmChanged!=null);
   if(bgm!=settings.BgmPercent){settings.SetBgmPercent(bgm);if(bgmChanged!=null)bgmChanged(bgm);}
  }
  int VolumeRow(float y,string name,int value,bool connected)
  {
   int cursor=y<300?3:4;PointAt(new Rect(344,y,592,90),cursor);FocusBorder(new Rect(344,y,592,90),cursor);
   NativeSilverHellUi.Label(new Rect(348,y,456,34),name,body);NativeSilverHellUi.Label(new Rect(830,y,104,34),value+"%",body);
   bool enabled=GUI.enabled;GUI.enabled=enabled&&connected;
   int next=Mathf.RoundToInt(GUI.HorizontalSlider(new Rect(350,y+54,580,34),value,0,100));GUI.enabled=enabled;
   return connected?next:value;
  }
  void DrawControls()
  {
   var bind=NativeKeyBindInput.Bindings;string KN(string action){return KeyBindings.KeyName(bind.Primary(action),English);}   // A16: shows the current web bindings
   string[] keys={KN("up")+" "+KN("left")+" "+KN("down")+" "+KN("right"),KN("weapon"),T("세 번째 공격 유지","Hold third attack"),KN("inventory"),KN("skill"),KN("settings")};
   string[] actions={T("이동","Move"),T("기본 공격 / 기검참","Attack / Ki Slash"),T("차지 후 놓아서 발사","Charge and release"),T("소지품 열기 / 닫기","Open / close inventory"),T("스킬 창 열기 / 닫기","Open / close skills"),T("닫기 / 일시정지","Back / Pause")};
   for(int i=0;i<keys.Length;i++)
   {
    NativeSilverHellUi.Label(new Rect(348,246+i*38,240,38),keys[i],body);NativeSilverHellUi.Label(new Rect(600,246+i*38,332,38),actions[i],body);
   }
   if(NativeSilverHellUi.Button(new Rect(348,480,584,40),T("키 설정 변경","Change key bindings"),button)){keyPage=true;keyScroll=0;if(keyList==null)keyList=new NativeKeyBindList(NativeKeyBindInput.Bindings);}
  }
  // Legacy A16 QA hook; normal settings draw the list inside Controls.
  void DrawKeyPage()
  {
   GUI.matrix=Matrix4x4.identity;GUI.color=Color.white;   // the caller's matrix is not reset yet at this point (Draw() sets identity after the early return)
   Fill(new Rect(0,0,Screen.width,Screen.height),new Color(0,0,0,.97f));
   float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
   keyList.English=English;keyList.LocaleCode=LocaleCode;
   if(SettingsPersistenceProblem){keyList.SaveNote="키 설정을 저장하지 못했습니다 · 이번 실행의 값은 유지됩니다";keyList.SaveNoteEn="Key bindings could not be saved · current session values remain";}
   else if(SettingsPersistenceEnabled){keyList.SaveNote="키 설정 변경은 "+NativePlatformLabel.Ko+"에 자동 저장됩니다";keyList.SaveNoteEn="Key binding changes are saved on "+NativePlatformLabel.En+"";}
   else{keyList.SaveNote="검수 실행의 키 설정은 저장하지 않습니다";keyList.SaveNoteEn="Key bindings are not saved during this QA run";}
   var pane=new Rect(45,60,1830,880);
   NativeSilverHellUi.Panel(pane,28,8);
   float max=Mathf.Max(0,keyList.ContentHeight+51+32-pane.height);
   if(Event.current.type==EventType.ScrollWheel&&pane.Contains(Event.current.mousePosition)){keyScroll=Mathf.Clamp(keyScroll+Event.current.delta.y*40f,0,max);Event.current.Use();}
   keyScroll=Mathf.Clamp(keyScroll,0,max);
   GUI.BeginGroup(pane);
   // web `#settings-page-controls .set-label` computed style: Noto Sans KR 600 16px, letter-spacing .64px, rgb(200,181,143), left aligned, box 1736x39 (padding 4/0/10), hairline rgb(73,65,54) below, list 12px under it
   if(keyLabelStyle==null){keyLabelStyle=new GUIStyle(GUI.skin.label){font=font,fontStyle=FontStyle.Normal,fontSize=16,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};keyLabelStyle.normal.textColor=NativeSilverHellUi.Text;}
   {float lx=42,ly=14-keyScroll+4;foreach(char ch in T("조작 키 설정 (클릭하여 변경)","Key bindings (click to change)")){string g=ch.ToString();NativeSilverHellUi.Label(new Rect(lx,ly,40,24),g,keyLabelStyle);lx+=keyLabelStyle.CalcSize(new GUIContent(g)).x+.64f;}
    Fill(new Rect(42,14-keyScroll+38,1736,1),new Color(94/255f,97/255f,97/255f));}
   keyList.Draw(new Vector2(42,14+51-keyScroll),new Rect(0,0,pane.width,pane.height));GUI.EndGroup();
   keyList.DrawToasts();
   if(MetalAction(new Rect(860,984,200,44),T("뒤로","Back"),false,false,button)&&!keyList.Listening)keyPage=false;
  }
  void RestoreDefaults()
  {
   // Preserve host values for unavailable controls instead of pretending to apply them.
   if(sfxChanged!=null){settings.SetSfxPercent(NativeSettingsState.DefaultSfxPercent);sfxChanged(settings.SfxPercent);}
   if(bgmChanged!=null){settings.SetBgmPercent(NativeSettingsState.DefaultBgmPercent);bgmChanged(settings.BgmPercent);}
   if(frameCapChanged!=null){settings.TrySetFrameCap(NativeSettingsState.DefaultFrameCap);frameCapChanged(settings.FrameCap);}
  }
  PauseMenuCommand DrawQuit()
  {
   NativeSilverHellUi.Label(new Rect(340,160,600,112),T("게임을 종료하시겠습니까?","Quit the game?"),title);
   NativeSilverHellUi.Label(new Rect(364,302,552,76),T("미리보기의 진행 상황은 저장되지 않습니다.","Progress in this preview is not saved."),body);
   if(MenuButton(new Rect(360,450,264,58),T("취소","Cancel"),0,button))navigation.BackPage();
   if(MenuButton(new Rect(656,450,264,58),T("종료","Quit"),1,button))return PauseMenuCommand.Quit;
   return PauseMenuCommand.None;
  }
 }
}
