using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public enum PauseMenuCommand { None, Resume, Restart, ReturnLobby, Quit }

 // A complete pause/settings view. The game owner retains simulation and input ownership.
 public sealed class NativePauseMenu
 {
  enum Page { Main, Settings, Quit }
  readonly Font font;
  readonly NativeSettingsState settings;
  readonly Action<int> sfxChanged,bgmChanged,frameCapChanged;
  readonly Action<bool> fullscreenChanged;
  Page page;
  int tab;
  GUIStyle title,body,muted,button,tabButton,activeTab,fpsButton,activeFpsButton;
  bool ready;
  public bool English { get; set; }
  public bool SettingsOpen { get { return page==Page.Settings; } }
  public NativeSettingsState Settings { get { return settings; } }
  public NativePauseMenu(Font font,NativeSettingsState settings,Action<int> sfxChanged,
                         Action<int> bgmChanged,Action<int> frameCapChanged,Action<bool> fullscreenChanged)
  {
   if(settings==null)throw new ArgumentNullException("settings");
   this.font=font;this.settings=settings;this.sfxChanged=sfxChanged;
   this.bgmChanged=bgmChanged;this.frameCapChanged=frameCapChanged;this.fullscreenChanged=fullscreenChanged;
  }
  public void Reset() { page=Page.Main; }
  public void ShowSettings() { page=Page.Settings; }
  // Call once from the owner's Escape handler BEFORE toggling menu/Running.
  public bool HandleEscape()
  {
   if(page==Page.Main)return false;
   page=Page.Main;return true;
  }
  string T(string ko,string en) { return English?en:ko; }
  void Init()
  {
   if(ready)return;ready=true;
   body=new GUIStyle(GUI.skin.label){font=font,fontSize=20,wordWrap=true};
   body.normal.textColor=new Color(.91f,.87f,.80f);
   title=new GUIStyle(body){fontSize=32,fontStyle=FontStyle.Bold,alignment=TextAnchor.MiddleCenter};
   muted=new GUIStyle(body){fontSize=16};muted.normal.textColor=new Color(.66f,.62f,.55f);
   button=new GUIStyle(GUI.skin.button){font=font,fontSize=20,padding=new RectOffset(12,12,8,8)};
   tabButton=new GUIStyle(button){fontSize=18};
   activeTab=new GUIStyle(tabButton);activeTab.normal.textColor=new Color(.95f,.77f,.43f);
   fpsButton=new GUIStyle(tabButton){fontSize=16,padding=new RectOffset(4,4,8,8)};
   activeFpsButton=new GUIStyle(fpsButton);activeFpsButton.normal.textColor=new Color(.95f,.77f,.43f);
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
    GUI.matrix=Matrix4x4.identity;GUI.color=Color.white;
    Fill(new Rect(0,0,Screen.width,Screen.height),new Color(0,0,0,.72f));
    float scale=Mathf.Min(Screen.width/1280f,Screen.height/720f);
    GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1280*scale)/2,(Screen.height-720*scale)/2,0),Quaternion.identity,Vector3.one*scale);
    var panel=new Rect(300,72,680,576);Fill(panel,new Color(.055f,.047f,.043f,.98f));
    Border(panel,new Color(.48f,.36f,.23f));Fill(new Rect(328,151,624,1),new Color(.48f,.36f,.23f,.65f));
    if(page==Page.Settings){DrawSettings(fullscreen);return PauseMenuCommand.None;}
    if(page==Page.Quit)return DrawQuit();
    GUI.Label(new Rect(336,98,608,48),dead?T("쓰러졌습니다","You have fallen"):T("일시정지","Paused"),title);
    if(GUI.Button(new Rect(388,196,504,58),dead?T("다시 시작","Restart"):T("계속하기","Resume"),button))return dead?PauseMenuCommand.Restart:PauseMenuCommand.Resume;
    if(GUI.Button(new Rect(388,272,504,58),T("설정","Settings"),button))page=Page.Settings;
    if(GUI.Button(new Rect(388,348,504,58),T("로비로 돌아가기","Return to lobby"),button))return PauseMenuCommand.ReturnLobby;
    if(GUI.Button(new Rect(388,424,504,58),T("게임 종료","Quit game"),button))page=Page.Quit;
    GUI.Label(new Rect(364,524,552,58),T("미리보기의 진행 상황은 저장되지 않습니다.","Progress in this preview is not saved."),muted);
    GUI.Label(new Rect(364,600,552,28),dead?T("다시 시작하거나 로비로 돌아갈 수 있습니다.","Restart or return to the lobby."):T("ESC  계속하기 / 뒤로","ESC  Resume / Back"),muted);
    return PauseMenuCommand.None;
   }
   finally { GUI.matrix=oldMatrix;GUI.color=oldColor;GUI.enabled=oldEnabled; }
  }
  void DrawSettings(bool fullscreen)
  {
   GUI.Label(new Rect(336,98,608,48),T("설정","Settings"),title);
   string[] tabs={T("화면","Display"),T("소리","Audio"),T("조작 안내","Controls")};
   for(int i=0;i<tabs.Length;i++)if(GUI.Button(new Rect(340+i*202,174,194,44),tabs[i],tab==i?activeTab:tabButton))tab=i;
   if(tab==0)DrawDisplay(fullscreen);else if(tab==1)DrawAudio();else DrawControls();
   GUI.Label(new Rect(348,540,584,40),T("설정은 현재 실행에 적용됩니다.","Settings apply to the current session."),muted);
   if(GUI.Button(new Rect(340,588,288,44),T("기본값 복원","Restore defaults"),button))RestoreDefaults();
   if(GUI.Button(new Rect(652,588,288,44),T("뒤로","Back"),button))page=Page.Main;
  }
  void DrawDisplay(bool fullscreen)
  {
   GUI.Label(new Rect(348,246,584,34),T("프레임 제한","Frame rate limit"),body);
   bool enabled=GUI.enabled;GUI.enabled=enabled&&frameCapChanged!=null;
   for(int i=0;i<NativeSettingsState.FrameCapCount;i++)
   {
    int cap=NativeSettingsState.GetFrameCap(i);
    string label=cap==0?T("무제한","Unlimited"):cap.ToString();
    if(GUI.Button(new Rect(348+i*98,290,92,46),label,settings.FrameCap==cap?activeFpsButton:fpsButton))
    { settings.TrySetFrameCap(cap);frameCapChanged(cap); }
   }
   GUI.enabled=enabled&&fullscreenChanged!=null;
   string fullscreenLabel=fullscreen?T("전체 화면: 켜짐","Fullscreen: On"):T("전체 화면: 꺼짐","Fullscreen: Off");
   bool next=GUI.Toggle(new Rect(348,372,584,42),fullscreen,fullscreenLabel,button);
   if(next!=fullscreen&&fullscreenChanged!=null)fullscreenChanged(next);
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
   GUI.Label(new Rect(348,y,456,34),name,body);GUI.Label(new Rect(830,y,104,34),value+"%",body);
   bool enabled=GUI.enabled;GUI.enabled=enabled&&connected;
   int next=Mathf.RoundToInt(GUI.HorizontalSlider(new Rect(350,y+54,580,34),value,0,100));GUI.enabled=enabled;
   return connected?next:value;
  }
  void DrawControls()
  {
   string[] keys={"W A S D",T("마우스 왼쪽","Left mouse"),T("세 번째 공격 유지","Hold third attack"),"TAB","ESC"};
   string[] actions={T("이동","Move"),T("기본 공격 / 기검참","Attack / Ki Slash"),T("차지 후 놓아서 발사","Charge and release"),T("소지품 열기 / 닫기","Open / close inventory"),T("닫기 / 일시정지","Back / Pause")};
   for(int i=0;i<keys.Length;i++)
   {
    GUI.Label(new Rect(348,246+i*54,240,44),keys[i],body);GUI.Label(new Rect(600,246+i*54,332,44),actions[i],body);
   }
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
   GUI.Label(new Rect(340,160,600,112),T("게임을 종료하시겠습니까?","Quit the game?"),title);
   GUI.Label(new Rect(364,302,552,76),T("미리보기의 진행 상황은 저장되지 않습니다.","Progress in this preview is not saved."),body);
   if(GUI.Button(new Rect(360,450,264,58),T("취소","Cancel"),button))page=Page.Main;
   if(GUI.Button(new Rect(656,450,264,58),T("종료","Quit"),button))return PauseMenuCommand.Quit;
   return PauseMenuCommand.None;
  }
 }
}
