using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // Pause main page and quit confirm in the web silver hell grammar, drawn in the 1920x1080 design space with web pixel sizes:
 //  - window: silver frame like #gcModal (panel_frame 150 / 52px / 18px), padding 38 / 42
 //  - title: the shared 64px title band (40px eye medallion + Hahmlet 300 22px + gold hairline cut at the centre), UI_COMPOSITION 2026-10-31
 //  - buttons: one width, silver plaque (btn_plaque 0 174 / 32px / 8px) for every button; the primary keeps the plaque and only gets the
 //    faint crimson halo of .gc-ok; Hahmlet 400 17px letter-spacing .16em, #e6e3dc (selected #f2f0ec); selection = brightness(1.18) + guide glow
 //  - notes: Hahmlet 400 14px #a7a49d centred; key names in Cinzel (--sh-latin)
 // Input is blocked by consuming pointer events while unfocused / waiting for key release, never by the IMGUI disabled tint.
 public sealed partial class NativePauseMenu
 {
  static readonly Color ShBone=new Color(230/255f,227/255f,220/255f),ShNote=new Color(167/255f,164/255f,157/255f);
  GUIStyle shButton,shNote,shBody;
  const float ShButtonW=360,ShButtonH=44,ShButtonGap=14,ShPadY=38,ShPadX=42;

  void InitSilver()
  {
   if(shButton!=null)return;
   var body=NativeSilverHellUi.Font(true);
   shButton=new GUIStyle(GUIStyle.none){font=body,fontSize=17,alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Overflow};
   shNote=new GUIStyle(GUIStyle.none){font=body,fontSize=14,alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Overflow};shNote.normal.textColor=ShNote;
   shBody=new GUIStyle(shNote){fontSize=15};shBody.normal.textColor=new Color(214/255f,211/255f,205/255f);
  }
  static bool PointerEvent(EventType t){return t==EventType.MouseDown||t==EventType.MouseUp||t==EventType.MouseDrag||t==EventType.ScrollWheel||t==EventType.ContextClick;}
  static void DesignMatrix(){float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);}

  PauseMenuCommand DrawMainSilver(bool dead)
  {
   InitSilver();DesignMatrix();
   float boxW=ShButtonW+2*ShPadX+76,boxH=ShPadY+64+28+(4*ShButtonH+3*ShButtonGap)+30+24+24+ShPadY;
   var box=new Rect(960-boxW/2,540-boxH/2+20,boxW,boxH);
   NativeSilverHellUi.Panel(box,52,18);
   NativePanelTitle.Draw(new Rect(box.x+ShPadX,box.y+ShPadY,box.width-2*ShPadX,64),dead?T("쓰러졌습니다","You have fallen"):T("일시정지","Paused"));
   float x=960-ShButtonW/2,y=box.y+ShPadY+64+28;
   string[] labels={dead?T("다시 시작","Restart"):T("계속하기","Resume"),T("설정","Settings"),T("로비로 돌아가기","Return to lobby"),T("게임 종료","Quit game")};
   int clicked=-1;
   for(int i=0;i<4;i++){if(SilverButton(new Rect(x,y,ShButtonW,ShButtonH),labels[i],i,i==0))clicked=i;y+=ShButtonH+ShButtonGap;}
   y+=30-ShButtonGap;
   NativeSilverHellUi.Label(new Rect(box.x+ShPadX,y,box.width-2*ShPadX,24),T("미리보기의 진행 상황은 저장되지 않습니다.","Progress in this preview is not saved."),shNote);y+=24;
   if(dead)NativeSilverHellUi.Label(new Rect(box.x+ShPadX,y,box.width-2*ShPadX,24),T("다시 시작하거나 로비로 돌아갈 수 있습니다.","Restart or return to the lobby."),shNote);
   else KeyHint(new Rect(box.x+ShPadX,y,box.width-2*ShPadX,24),English?new[]{"↑↓"," Select · ","Enter"," Confirm · ","ESC"," Back · ","TAB"," Inventory"}:new[]{"↑↓"," 선택 · ","Enter"," 확인 · ","ESC"," 뒤로 · ","TAB"," 인벤토리"});
   switch(clicked){
    case 0:return dead?PauseMenuCommand.Restart:PauseMenuCommand.Resume;
    case 1:page=PausePage.Settings;break;
    case 2:return PauseMenuCommand.ReturnLobby;
    case 3:page=PausePage.Quit;break;
   }
   return PauseMenuCommand.None;
  }

  PauseMenuCommand DrawQuitSilver()
  {
   InitSilver();DesignMatrix();
   float boxW=ShButtonW+2*ShPadX+76,boxH=ShPadY+64+20+26+28+ShButtonH+ShPadY;
   var box=new Rect(960-boxW/2,540-boxH/2+20,boxW,boxH);
   NativeSilverHellUi.Panel(box,52,18);
   NativePanelTitle.Draw(new Rect(box.x+ShPadX,box.y+ShPadY,box.width-2*ShPadX,64),T("게임을 종료하시겠습니까?","Quit the game?"));
   float y=box.y+ShPadY+64+20;
   NativeSilverHellUi.Label(new Rect(box.x+ShPadX,y,box.width-2*ShPadX,26),T("미리보기의 진행 상황은 저장되지 않습니다.","Progress in this preview is not saved."),shBody);y+=26+28;
   // web #gcModal order: cancel left (order 0), confirm right (order 1), gap 16
   const float w=172;
   if(SilverButton(new Rect(960-8-w,y,w,ShButtonH),T("취소","Cancel"),0,false)){navigation.BackPage();return PauseMenuCommand.None;}
   if(SilverButton(new Rect(960+8,y,w,ShButtonH),T("종료","Quit"),1,true))return PauseMenuCommand.Quit;
   return PauseMenuCommand.None;
  }

  bool SilverButton(Rect r,string text,int index,bool primary)
  {
   PointAt(r,index);
   bool selected=navigation.Focused&&navigation.Cursor==index;
   bool hover=r.Contains(Event.current.mousePosition)&&navigation.Focused&&!navigation.WaitingForRelease;
   bool pressed=hover&&ExoInput.Mouse(0);
   if(primary)NativeSilverHellUi.PrimaryGlow(r);
   if((selected||hover)&&!pressed)NativeSilverHellUi.ButtonFocus(r);
   NativeSilverHellUi.ActionPlate(r,false,selected||hover?1f:.55f,pressed,32,8);   // .55 = brightness 1.0, 1 = web :hover brightness(1.18)
   shButton.normal.textColor=selected||hover||primary?NativeSilverHellUi.Bright:ShBone;
   NativeSilverHellUi.SpacedLabel(r,text,shButton,17*.16f);
   bool clicked=NativeUiAudit.Button(r,GUIContent.none,GUIStyle.none);
   if(clicked)navigation.Fence();
   return clicked;
  }

  // Alternating runs: even index = key name (Cinzel 13px), odd index = Hahmlet note text; centred as one line.
  void KeyHint(Rect r,string[] runs)
  {
   var key=new GUIStyle(shNote){font=NativeSilverHellUi.Latin(),fontSize=13};
   float total=0;var widths=new float[runs.Length];
   var styles=new GUIStyle[runs.Length];
   for(int i=0;i<runs.Length;i++){var st=i%2==0&&IsLatin(runs[i])?key:new GUIStyle(shNote){font=NativeSilverHellUi.TextFont(shNote.font,runs[i])};styles[i]=st;widths[i]=st.CalcSize(new GUIContent(runs[i])).x;total+=widths[i];}
   float x=r.center.x-total/2;
   for(int i=0;i<runs.Length;i++){var one=new GUIStyle(styles[i]){alignment=TextAnchor.MiddleLeft};NativeSilverHellUi.Label(new Rect(x,r.y,widths[i]+2,r.height),runs[i],one);x+=widths[i];}
  }
  static bool IsLatin(string s){foreach(char c in s)if(!(c>='A'&&c<='Z'||c>='a'&&c<='z'))return false;return s.Length>0;}
 }
}
