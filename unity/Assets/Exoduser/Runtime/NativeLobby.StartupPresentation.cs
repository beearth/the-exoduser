using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  readonly FrontendEntryFlow startup=new FrontendEntryFlow();StartupIntroData startupData;
  Texture2D[] nemesisArt;Texture2D loadingLogo,startupBarrier,startupShade,startupSubtitleGradient,startupGuideGradient;AudioSource startupAudio;AudioClip enterSound,wakeupSound;
  FrontendEntryPage startupShown;int startupLine=-1;float nemesisMusicDelay=-1,stageMusicDelay=-1,startupSfxGain=.6f;bool guideSkipFocus,startupInputFence,keepStartupStageMusic,startupVoiceWasPlaying;
  readonly FrontendPadPolicy frontendPad=new FrontendPadPolicy();
  FrontendPadFrame ReadFrontendPadFrame(){if(frontendPadQaEnabled)return ReadFrontendPadQaFrame();return new FrontendPadFrame{
   Number=Time.frameCount,
   ConfirmDown=ExoInput.KeyDown(KeyCode.JoystickButton0),ConfirmHeld=ExoInput.Key(KeyCode.JoystickButton0),
   CancelHeld=ExoInput.Key(KeyCode.JoystickButton1),
   StartDown=ExoInput.KeyDown(KeyCode.JoystickButton7)||ExoInput.KeyDown(KeyCode.JoystickButton9),
   StartHeld=ExoInput.Key(KeyCode.JoystickButton7)||ExoInput.Key(KeyCode.JoystickButton9)
  };}
  GUIStyle startupBody,startupName,startupHint,guideTitle,guideDialogue,guideText,guideKey,guideProgress,guideAction;
  internal FrontendEntryFlow StartupCaptureState {get{return startup;}}
  internal void CloseStartupCaptureMedia(){CancelStartupEntry();CancelCharacterStory();CloseCharacterPresentationVideo();movie.Close();StopMusic();}
  public Action StartupGameplayPrepare {private get;set;}
  public bool StartupGameplayPrepared {get;private set;}
  public bool StartupEntryActive{get{return startup.Active;}}
  public bool StartupWorldVisible{get{return startup.Page==FrontendEntryPage.Guide||startup.Page==FrontendEntryPage.Curtain;}}
  public bool StartupHudVisible{get{return startup.Page==FrontendEntryPage.Curtain;}}
  public string StartupStage{get{return startup.Active?startup.Page.ToString():"";}}
  public void SetStartupSfxPercent(int percent){startupSfxGain=Mathf.Clamp(percent,0,100)/100f;}
  void EnsureStartupMedia(){if(startupAudio!=null)return;startupAudio=gameObject.AddComponent<AudioSource>();startupAudio.playOnAwake=false;startupAudio.spatialBlend=0;enterSound=Resources.Load<AudioClip>("Audio/Startup/enter");wakeupSound=Resources.Load<AudioClip>("Audio/Startup/wakeup");}
  void PlayStartupEnter(){EnsureStartupMedia();startupAudio.Stop();startupAudio.clip=enterSound;startupAudio.volume=1;if(enterSound!=null)startupAudio.PlayOneShot(enterSound,2);}
  bool LegacyFrontendFixture(){foreach(var arg in Environment.GetCommandLineArgs())if(arg.StartsWith("--unity-",StringComparison.Ordinal)&&arg.EndsWith("-smoke",StringComparison.Ordinal))return true;return false;}
  // E03: set by NativeGame. A character with a combat save continues straight into the run (the story / first practice belong to a new character).
  public System.Func<string,bool> HasCombatSave;
  public System.Action<string> CharacterDeleted;
  public bool BeginCharacterEntry(bool loadingAlreadyShown)
  {
   if(Flow.Page!=LobbyPage.Lobby||startup.Active||Characters.SelectedIndex<0)return false;
   ActiveCharacterName=Characters.SelectedName;
   if(AutomatedInput||LegacyFrontendFixture()){Flow.SelectPreview();return EnterNativeTest();}
   if(HasCombatSave!=null&&HasCombatSave(ActiveCharacterName)){StartupGameplayPrepared=false;keepStartupStageMusic=false;CancelCharacterStory();Flow.SelectPreview();return EnterNativeTest();}
   if(startupData==null){var source=Resources.Load<TextAsset>("Data/startup_intro");if(source!=null)startupData=JsonUtility.FromJson<StartupIntroData>(source.text);}
   StartupIntroLine[] lines=null;if(startupData!=null&&startupData.languages!=null){foreach(var language in startupData.languages)if(language.code==Language)lines=language.lines;if(lines==null)foreach(var language in startupData.languages)if(language.code=="en")lines=language.lines;}
   if(lines==null||lines.Length==0){characterError=K("입장 이야기 자료를 읽지 못했습니다.","Entry story data could not be loaded.");return false;}
   if(nemesisArt==null){nemesisArt=new Texture2D[21];for(int i=0;i<21;i++)nemesisArt[i]=Resources.Load<Texture2D>("Art/Startup/Nemesis/"+i.ToString("00"));loadingLogo=Resources.Load<Texture2D>("Art/Startup/loading_logo");}
   keepStartupStageMusic=false;StartupGameplayPrepared=false;
   if(!loadingAlreadyShown)PlayStartupEnter();CloseCharacterPresentationVideo();CancelCharacterStory();movie.Close();StopMusic();
   startup.Begin(lines,loadingAlreadyShown);startupShown=FrontendEntryPage.Idle;startupLine=-1;guideSkipFocus=false;startupInputFence=true;frontendPad.Reset();nemesisMusicDelay=-1;stageMusicDelay=-1;EnsureStartupMedia();return true;
  }
  void StartStartupMusic(string key,float gain){StopMusic();music.clip=Resources.Load<AudioClip>("Audio/Startup/"+key);MusicGain(gain);if(music.clip!=null)music.Play();}
  void SetStartupAudioFocus(bool focus){if(startupAudio==null)return;if(!focus){startupVoiceWasPlaying=startupAudio.isPlaying;startupAudio.Pause();}else if(startupVoiceWasPlaying){startupAudio.UnPause();startupVoiceWasPlaying=false;}}
  public void StopStageMusic(){keepStartupStageMusic=false;StopMusic();}   // RM-1 sound: the in-game BGM bus takes over from the startup stage music
  void CancelStartupEntry(){StartupGameplayPrepared=false;keepStartupStageMusic=false;startup.Cancel();frontendPad.Reset();if(startupAudio!=null)startupAudio.Stop();nemesisMusicDelay=-1;stageMusicDelay=-1;}
  void UpdateStartupEntry(float delta)
  {
   if(!startup.Active)return;
   if(!focused){frontendPad.Reset();startup.Tick(0,false,false);return;}
   if(startupInputFence&&!ExoInput.AnyKey&&!ExoInput.Mouse(0))startupInputFence=false;
   var before=startup.Page;
   var pad=startup.Page==FrontendEntryPage.Nemesis||startup.Page==FrontendEntryPage.Guide
    ?frontendPad.Step(startup.Page==FrontendEntryPage.Guide?FrontendPadPhase.Guide:FrontendPadPhase.Nemesis,ReadFrontendPadFrame(),!AutomatedInput&&!startupInputFence)
    :default(FrontendPadDecision);
   if(!AutomatedInput&&!startupInputFence){
    if(ExoInput.KeyDown(KeyCode.Escape)||pad.Skip)startup.Skip();
    else if(startup.Page==FrontendEntryPage.Nemesis&&(ExoInput.KeyDown(KeyCode.Return)||ExoInput.KeyDown(KeyCode.KeypadEnter)||ExoInput.KeyDown(KeyCode.Z)||pad.Next))startup.Advance();
    else if(startup.Page==FrontendEntryPage.Guide){if(ExoInput.KeyDown(KeyCode.Tab))guideSkipFocus=!guideSkipFocus;else if(pad.Next)startup.Advance();else if(ExoInput.KeyDown(KeyCode.Return)||ExoInput.KeyDown(KeyCode.KeypadEnter)||ExoInput.KeyDown(KeyCode.Space)){if(guideSkipFocus)startup.Skip();else startup.Advance();}}
   }
   bool held=!AutomatedInput&&!startupInputFence&&(ExoInput.Key(KeyCode.Space)||pad.Hold);
   startup.Tick(delta,held,focused);
   if(startup.Page!=before){startupInputFence=true;guideSkipFocus=false;frontendPad.Reset();}
   if(startup.Page!=startupShown){startupShown=startup.Page;if(startupShown==FrontendEntryPage.Nemesis){nemesisMusicDelay=.4f;StopMusic();}else if(startupShown==FrontendEntryPage.Guide){StartupGameplayPrepare?.Invoke();StartupGameplayPrepared=true;nemesisMusicDelay=-1;stageMusicDelay=.6f;EnsureStartupMedia();if(wakeupSound!=null)startupAudio.PlayOneShot(wakeupSound,startupSfxGain*startupSfxGain);} }
   if(nemesisMusicDelay>=0){nemesisMusicDelay-=delta;if(nemesisMusicDelay<0)StartStartupMusic("nemesis",.6f);}
   // The source fades Nemesis out and requests the stage track after 600ms.
   if(stageMusicDelay>=0){stageMusicDelay-=delta;if(music!=null)MusicGain(.6f*Mathf.Clamp01(stageMusicDelay/.5f));if(stageMusicDelay<0){StartStartupMusic("stage_first",.6f);keepStartupStageMusic=true;}}
   if(startup.Page==FrontendEntryPage.Complete){startup.Cancel();frontendPad.Reset();Flow.SelectPreview();EnterNativeTest();startupInputFence=true;}
  }
  void StartupStyles(){if(startupBody!=null)return;LobbyStyles();var f=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??normal.font;
   startupBody=new GUIStyle(normal){font=f,fontSize=19,wordWrap=true,richText=true};startupBody.normal.textColor=Color.white;
   startupName=new GUIStyle(startupBody){fontSize=24,fontStyle=FontStyle.Bold};startupHint=new GUIStyle(startupBody){fontSize=11,alignment=TextAnchor.MiddleRight};
   guideTitle=new GUIStyle(startupBody){fontSize=28,fontStyle=FontStyle.Bold};guideTitle.normal.textColor=new Color(.867f,.827f,.745f);
   guideDialogue=new GUIStyle(guideTitle){font=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular")??f,fontSize=42};guideDialogue.normal.textColor=new Color(.855f,.824f,.757f);
   guideText=new GUIStyle(startupBody){fontSize=21};guideText.normal.textColor=new Color(.776f,.722f,.620f);
   guideKey=new GUIStyle(guideText){fontSize=18};guideKey.normal.textColor=new Color(.792f,.663f,.424f);
   guideProgress=new GUIStyle(guideKey){fontSize=12};guideAction=new GUIStyle(guideText){fontSize=16,alignment=TextAnchor.MiddleCenter};}
  static float StartupEase(float t,string ease){switch(ease){case "in":return t*t;case "out":return 1-(1-t)*(1-t);case "inout":return t<.5f?2*t*t:1-Mathf.Pow(-2*t+2,2)/2;default:return t;}}
  void DrawStartupEntry()
  {
   int previousDepth=GUI.depth;
   try{GUI.depth=-100;DrawStartupEntryContents();}
   finally{GUI.depth=previousDepth;}
  }
  void DrawStartupEntryContents()
  {
   StartupStyles();
   if(startup.Page==FrontendEntryPage.Loading){DrawEntryLoadingLogo();return;}
   if(startup.Page==FrontendEntryPage.Nemesis){DrawNemesis();return;}
   if(startup.Page==FrontendEntryPage.Guide){DrawStartupGuide();return;}
   if(startup.Page==FrontendEntryPage.Curtain){var matrix=GUI.matrix;try{GUI.matrix=NativeUiViewport.Matrix;DrawStartupBarrier();}finally{GUI.matrix=matrix;}if(startup.Elapsed<.4)DrawStartupGuide(Mathf.Clamp01(1-(float)startup.Elapsed/.4f),false);}
  }
  void DrawEntryLoadingLogo(){EnsureSilverArt();if(loadingLogo==null)loadingLogo=Resources.Load<Texture2D>("Art/Startup/loading_logo");Fill(new Rect(0,0,1920,1080),Color.black);NativeSilverHellUi.Panel(new Rect(600,250,720,540),36,12,false);Image(new Rect(660,280,600,337.5f),gateSigil??loadingLogo);var st=new GUIStyle(startupBody){font=NativeSilverHellUi.Font()??startupBody.font,fontSize=22,fontStyle=FontStyle.Normal};st.normal.textColor=NativeSilverHellUi.Bright;SilverLabel(new Rect(640,680,640,40),K("불러오는 중","LOADING"),st,TextAnchor.MiddleCenter);}
  void DrawNemesis()
  {
   Fill(new Rect(0,0,1920,1080),Color.black);var l=startup.Line;if(l==null)return;float elapsed=(float)startup.Elapsed*1000;
   if(l.exit){if(startupLine>=0&&startupLine<21)Image(new Rect(0,0,1920,1080),nemesisArt[startupLine],ScaleMode.ScaleAndCrop);Fill(new Rect(0,0,1920,1080),new Color(0,0,0,Mathf.Clamp01(elapsed/(l.fade!=null&&l.fade.@out>0?l.fade.@out:1500))));return;}
   int image;if(!string.IsNullOrEmpty(l.img)&&int.TryParse(l.img.Replace(".png",""),out image)&&image>=0&&image<21){startupLine=image;var tex=nemesisArt[image];if(tex!=null){var cam=l.cam;float t=StartupEase(Mathf.Clamp01(elapsed/Mathf.Max(1,l.dur)),cam==null?"linear":cam.ease),zoom=cam==null?1:Mathf.Lerp(cam.zs,cam.ze,t),px=cam==null?0:cam.px*t,py=cam==null?0:cam.py*t;
    float mag=l.vfx==null?0:l.vfx.shake,clock=Time.unscaledTime*1000;px+=(int)(Mathf.Sin(clock*.047f)*mag*2);py+=(int)(Mathf.Cos(clock*.053f)*mag*2);
    float ratio=(float)tex.width/tex.height,w=ratio>1920f/1080?1080*ratio:1920,h=ratio>1920f/1080?1080:1920/ratio,dx=(1920-w)/2,dy=ratio>1920f/1080?0:(1080-h)*.1f;
    float fi=l.fade!=null&&l.fade.@in>0?l.fade.@in:400,fo=l.fade==null?0:l.fade.@out,alpha=Mathf.Min(1,elapsed/fi);if(fo>0&&elapsed>l.dur-fo)alpha=Mathf.Min(alpha,(l.dur-elapsed)/fo);
    var color=GUI.color;Color grade=Color.white;if(l.vfx!=null&&l.vfx.grade=="purple")grade=new Color(.65f+.314f*.35f,.65f+.157f*.35f,.65f+.471f*.35f);else if(l.vfx!=null&&l.vfx.grade=="purple_blood")grade=new Color(.6f+.392f*.4f,.6f+.118f*.4f,.6f+.235f*.4f);GUI.color=new Color(grade.r,grade.g,grade.b,Mathf.Clamp01(alpha));NativeUiAudit.DrawTexture(new Rect(960+(dx-960)*zoom+px,540+(dy-540)*zoom+py,w*zoom,h*zoom),tex);GUI.color=color;OriginalArtDrawn=true;
    if(l.vfx!=null){DrawStartupVignette(l.vfx.vig);}
   }}
   if(!string.IsNullOrEmpty(l.speaker)&&!string.IsNullOrEmpty(l.text)){
    // Wrap the full text before revealing characters, keeping line breaks stable.
    float bodyH=startupBody.CalcHeight(new GUIContent(l.text),1612.8f),subH=Mathf.Max(237.6f,(37.8f+bodyH+27)/.75f),top=1080-subH;
    EnsureStartupGradients();NativeUiAudit.DrawTexture(new Rect(0,top,1920,subH),startupSubtitleGradient);
    Color c=l.speaker=="GODDESS"?new Color(.753f,.518f,.988f):l.speaker=="HECTOR"?new Color(.984f,.573f,.235f):new Color(.91f,.831f,.722f);startupName.normal.textColor=c;
    string who=l.speaker=="GODDESS"?K("네메시아","Nemesia"):l.speaker=="HECTOR"?K("핵터","Hector"):K("디로이","Diroy");float y=top+subH*.25f;
    Label(new Rect(153.6f,y-14,1612.8f,32),who,startupName,TextAnchor.MiddleLeft);Fill(new Rect(153.6f,y+16.2f,startupName.CalcSize(new GUIContent(who)).x,1),new Color(c.r,c.g,c.b,.4f));
    string visible=RevealStartupText(l.text,startup.VisibleCharacters);Label(new Rect(153.6f,y+37.8f,1612.8f,bodyH+20),visible,startupBody,TextAnchor.UpperLeft);
    if(startup.VisibleCharacters>=l.text.Replace("\n","").Length&&((int)(Time.unscaledTime*2)%2)==1)Label(new Rect(1740,1080-subH*.2f,40,30),"▼",startupHint,TextAnchor.MiddleCenter);
   }
   bool pad=frontendPadQaEnabled||ExoInput.PadConnected;
   float hold=(float)startup.HoldProgress;var hintColor=GUI.color;GUI.color=new Color(1,1,1,hold>0?.8f:.25f+.1f*Mathf.Sin(Time.unscaledTime*2));Label(new Rect(1300,1032,600,24),pad?K("A 다음 / B 길게 / Start 건너뛰기","A Next / Hold B / Start Skip"):K("SPACE 길게 눌러 건너뛰기","Hold SPACE to skip"),startupHint,TextAnchor.MiddleRight);GUI.color=hintColor;Fill(new Rect(1780,1052,120,3),new Color(1,1,1,.15f));Fill(new Rect(1780,1052,120*hold,3),new Color(1,1,1,.8f));
   var e=Event.current;if(insideSafe&&!startupInputFence&&e.type==EventType.MouseDown&&e.button==0){startup.Advance();e.Use();}
  }
  static string RevealStartupText(string full,int count){int at=0,visible=0;while(at<full.Length&&(visible<count||full[at]=='\n')){if(full[at]!='\n')visible++;at++;}return full.Substring(0,at)+"<color=#00000000>"+full.Substring(at)+"</color>";}
  void DrawStartupVignette(float strength){if(strength<=0)return;if(startupShade==null){startupShade=new Texture2D(128,72,TextureFormat.RGBA32,false);for(int y=0;y<72;y++)for(int x=0;x<128;x++){float d=Vector2.Distance(new Vector2(x/127f,(y/71f)*.5625f),new Vector2(.5f,.28125f));startupShade.SetPixel(x,y,new Color(0,0,0,Mathf.Clamp01((d-.2f)/.5f)));}startupShade.Apply();}var c=GUI.color;GUI.color=new Color(1,1,1,strength);Image(new Rect(0,0,1920,1080),startupShade,ScaleMode.StretchToFill);GUI.color=c;}
  Texture2D StartupGradient(int width,int height,Func<float,float,Color> color)
  {
   var texture=new Texture2D(width,height,TextureFormat.RGBA32,false);texture.wrapMode=TextureWrapMode.Clamp;texture.filterMode=FilterMode.Bilinear;
   for(int y=0;y<height;y++)for(int x=0;x<width;x++)texture.SetPixel(x,y,color(x/(float)Mathf.Max(1,width-1),1-y/(float)Mathf.Max(1,height-1)));
   texture.Apply();return texture;
  }
  void EnsureStartupGradients()
  {
   if(startupSubtitleGradient==null)startupSubtitleGradient=StartupGradient(1,256,(x,t)=>new Color(0,0,0,t<.3f?t/.3f*.7f:Mathf.Lerp(.7f,.9f,(t-.3f)/.7f)));
   if(startupGuideGradient==null)startupGuideGradient=StartupGradient(512,1,(x,t)=>x<.46f?Color.Lerp(new Color(0,0,0,.9f),new Color(4/255f,3/255f,3/255f,.68f),x/.46f):Color.Lerp(new Color(4/255f,3/255f,3/255f,.68f),new Color(0,0,0,.82f),(x-.46f)/.54f));
  }
  void DestroyStartupPresentationTextures(){foreach(var tex in new[]{startupShade,startupSubtitleGradient,startupGuideGradient})if(tex!=null)Destroy(tex);}
  static readonly string[][] GuideDialogue={new[]{"눈을 떠","Open your eyes"},new[]{"정신 차려","Get a grip"},new[]{"이제 진짜 지옥이야","This is real hell"},new[]{"야! 몬스터다!!!","Hey! Monsters!!!"}};
  static readonly string[][] GuideTitles={new[]{"이동과 공격","Move & attack"},new[]{"패링과 이동","Parry & movement"},new[]{"스킬","Skills"},new[]{"살아남아","Stay alive"}};
  static readonly string[][][] GuideRows={
   new[]{new[]{"W / S / A / D","L 스틱","이동","Move"},new[]{"좌클릭","A","무기 공격","Weapon attack"},new[]{"우클릭","R3","마법 (탭=투사체, 홀드=빔)","Magic (tap: projectile, hold: beam)"}},
   new[]{new[]{"Q","Y","마법 패링 · 보호막","Magic parry / shield"},new[]{"E","X","칼등 처내기","Weapon parry"},new[]{"L-SHIFT","LB","사슬 이동","Chain movement"},new[]{"방향키 더블탭 / Space+방향키","LS 더블탭 / B+LS","전격이동","Flash Step"}},
   new[]{new[]{"SPACE","B","지옥강타 · 분노 폭발","Hell Slam / rage burst"},new[]{"1","LT+A","가시덫","Spike Trap"},new[]{"F","LT","회복의 영역","Healing Domain"},new[]{"CTRL","RB","CT 스킬 (뇌전걸음 / 얼음보주)","CT skill (Ghost Walk / Ice Orb)"},new[]{"T",null,"석궁 자동발사","Automatic crossbow"}},
   new[]{new[]{"R","L3","아이템 줍기","Pick up items"},new[]{"TAB","D-pad →","인벤토리","Inventory"},new[]{"ESC","Start","설정","Settings"}}
  };
  Vector2 guideScroll;int guidePhysicalStep=-1;
  static float GuideClamp(float min,float responsive,float max){return Mathf.Max(min,Mathf.Min(responsive,max));}
  List<string> GuidePhysicalLines(string text,GUIStyle style,float fontPx,float spacing,float width)
  {
   style.fontSize=100;var result=new List<string>();string current="";
   foreach(char ch in text){if(ch=='\n'){result.Add(current);current="";continue;}string next=current+ch;if(current.Length>0&&GuidePhysicalWidth(next,style,fontPx,spacing)>width){result.Add(current.TrimEnd());current=ch==' '?"":ch.ToString();}else current=next;}
   result.Add(current);return result;
  }
  float GuidePhysicalWidth(string text,GUIStyle style,float px,float spacing){style.fontSize=100;float w=0;foreach(char ch in text)w+=style.CalcSize(new GUIContent(ch.ToString())).x*px/100+spacing;return Mathf.Max(0,w-spacing);}
  void GuidePhysicalText(Rect r,string text,GUIStyle style,float px,float spacing,float lineHeight)
  {
   var lines=GuidePhysicalLines(text,style,px,spacing,r.width);float y=r.y;
   // Keep glyphs, rules and buttons in the scroll view's one physical coordinate space.
   // GUIStyle uses integer font sizes; never scale GUI.matrix inside a clipped group.
   style.fontSize=Mathf.RoundToInt(px);
   var sourceColor=style.normal.textColor;style.normal.textColor=NativeSilverHellUi.TextColor(sourceColor);
   try{foreach(var line in lines){float x=r.x;foreach(char ch in line){float cw=style.CalcSize(new GUIContent(ch.ToString())).x;NativeUiAudit.Label(new Rect(x,y,cw+4,lineHeight+4),ch.ToString(),style);x+=cw+spacing;}y+=lineHeight;}}finally{style.normal.textColor=sourceColor;}
  }
  float startupGuideOpacity=1;bool startupGuideDrawBarrier=true;
  void DrawStartupGuide(float opacity=1,bool drawBarrier=true)
  {
   var matrix=GUI.matrix;var tint=GUI.color;float previousOpacity=startupGuideOpacity;bool previousBarrier=startupGuideDrawBarrier;
   try{GUI.matrix=NativeUiViewport.Matrix;startupGuideOpacity=opacity;startupGuideDrawBarrier=drawBarrier;GUI.color=new Color(tint.r,tint.g,tint.b,tint.a*opacity);DrawStartupGuidePhysical();}
   finally{GUI.matrix=matrix;GUI.color=tint;startupGuideOpacity=previousOpacity;startupGuideDrawBarrier=previousBarrier;}
  }
  void DrawStartupBarrier(){if(startupBarrier==null)startupBarrier=Resources.Load<Texture2D>("Art/Startup/bonfire_barrier");if(startupBarrier==null)return;float size=560*(1+Mathf.Sin(Time.unscaledTime*1000/300)*.03f);var color=GUI.color;GUI.color=new Color(color.r,color.g,color.b,color.a*.9f);NativeUiAudit.DrawTexture(new Rect((NativeUiSafeArea.DesignWidth-size)/2,(NativeUiSafeArea.DesignHeight-size)/2,size,size),startupBarrier,ScaleMode.StretchToFill);GUI.color=color;}
  void DrawStartupGuidePhysical()
  {
   float sw=NativeUiSafeArea.DesignWidth,sh=NativeUiSafeArea.DesignHeight;bool insideSafe=new Rect(0,0,sw,sh).Contains(Event.current.mousePosition);
   if(startupGuideDrawBarrier)DrawStartupBarrier();
   EnsureStartupGradients();NativeUiAudit.DrawTexture(new Rect(0,0,sw,sh),startupGuideGradient);
   int step=startup.Page==FrontendEntryPage.Curtain?Mathf.Clamp(guidePhysicalStep,0,3):startup.GuideStep;if(guidePhysicalStep!=step){guidePhysicalStep=step;guideScroll=Vector2.zero;}
   bool pad=ExoInput.PadConnected;
   float panelW=Mathf.Min(720,Mathf.Max(120,sw-96)),w=panelW-106,keyW=Mathf.Max(160,w*.38f),descW=Mathf.Max(20,w-keyW-20);
   float dialogueFont=GuideClamp(28.8f,sw*.026f,41.6f),titleFont=GuideClamp(20.8f,sw*.018f,28),bodyFont=GuideClamp(16,sw*.0135f,20.8f),keyFont=bodyFont*.86f;
   float dialogueH=dialogueFont*1.25f,titleH=titleFont*(37f/28),lineH=bodyFont*1.65f;
   var serif=NativeSilverHellUi.Font()??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular")??guideText.font;
   foreach(var st in new[]{guideDialogue,guideTitle,guideText,guideKey,guideProgress,guideAction}){st.padding=new RectOffset();st.margin=new RectOffset();st.alignment=TextAnchor.UpperLeft;st.wordWrap=false;st.fontStyle=FontStyle.Normal;}
   guideText.font=serif;guideKey.font=serif;guideTitle.font=serif;guideDialogue.font=serif;guideText.normal.textColor=new Color(188/255f,185/255f,179/255f,.82f);guideKey.normal.textColor=new Color(170/255f,173/255f,173/255f,.86f);guideTitle.normal.textColor=new Color(215/255f,212/255f,206/255f,.91f);guideDialogue.normal.textColor=new Color(213/255f,210/255f,204/255f,.94f);guideProgress.font=Resources.Load<Font>("Art/fonts/Cinzel-400")??serif;guideProgress.normal.textColor=new Color(141/255f,144/255f,144/255f);
   var keys=new List<string>();var descriptions=new List<string>();var heights=new List<float>();float bodyH=0;
   foreach(var row in GuideRows[step]){if(pad&&row[1]==null)continue;string key=pad?row[1]:Language!="ko"&&row[0]=="좌클릭"?"LMB":Language!="ko"&&row[0]=="우클릭"?"RMB":row[0],desc=K(row[2],row[3]);if(key.Contains(" / ")&&GuidePhysicalWidth(key,guideKey,keyFont,keyFont*.08f)>keyW)key=key.Replace(" / ","\n");float h=Mathf.Max(GuidePhysicalLines(key,guideKey,keyFont,keyFont*.08f,keyW).Count*lineH,GuidePhysicalLines(desc,guideText,bodyFont,bodyFont*.04f,descW).Count*lineH);keys.Add(key);descriptions.Add(desc);heights.Add(h);bodyH+=h;}
   bodyH+=Mathf.Max(0,heights.Count-1)*9;
   string note=K("물약은 자동 사용","Potions activate automatically"),hint=pad?K("A · 다음 / Start · 건너뛰기","A · Next / Start · Skip"):K("클릭 / Enter / Space · 다음    Space 길게 / ESC · 건너뛰기","Click / Enter / Space · Next    Hold Space / ESC · Skip");
   float noteH=step==3?GuidePhysicalLines(note,guideText,15.2f,0,w).Count*20.52f:0,hintH=GuidePhysicalLines(hint,guideText,13.6f,.544f,w).Count*17;
   // Source normal line boxes: progress16; empty English line still contributes margin-top10.
   float total=2+34+16+12+dialogueH+10+24+22+titleH+14+bodyH+(step==3?16+noteH:0)+20+hintH+22+46+40;
   float visibleH=Mathf.Min(total,Mathf.Max(80,sh-48)),left=(sw-panelW)/2,top=(sh-visibleH)/2;
   NativeSilverHellUi.Panel(new Rect(left,top,panelW,visibleH));
   guideScroll=NativeUiAudit.BeginScrollView(new Rect(left,top,panelW,visibleH),guideScroll,new Rect(0,0,panelW-(total>visibleH?16:0),total),false,total>visibleH);
   var hintStyle=new GUIStyle(guideText){font=serif};hintStyle.normal.textColor=new Color(141/255f,144/255f,144/255f);
   float x=53,y=35;GuidePhysicalText(new Rect(x,y,w,16),(step+1)+" / 4",guideProgress,12,3,16);y+=28;
   GuidePhysicalText(new Rect(x,y+10,w,dialogueH),K(GuideDialogue[step][0],GuideDialogue[step][1]),guideDialogue,dialogueFont,dialogueFont*.12f,dialogueH);y+=dialogueH+10+24;
   Fill(new Rect(x,y-6,64,1),new Color(143/255f,146/255f,146/255f,.62f*startupGuideOpacity));y+=22;
   GuidePhysicalText(new Rect(x,y+6,w,titleH),K(GuideTitles[step][0],GuideTitles[step][1]),guideTitle,titleFont,titleFont*.14f,titleH);y+=titleH+14;
   for(int i=0;i<keys.Count;i++){GuidePhysicalText(new Rect(x,y+6,keyW,heights[i]),keys[i],guideKey,keyFont,keyFont*.08f,lineH);GuidePhysicalText(new Rect(x+keyW+20,y+6,descW,heights[i]),descriptions[i],guideText,bodyFont,bodyFont*.04f,lineH);y+=heights[i]+(i+1<keys.Count?9:0);}
   if(step==3){y+=16;GuidePhysicalText(new Rect(x,y,w,noteH),note,guideText,15.2f,0,20.52f);y+=noteH;}
   y+=20;GuidePhysicalText(new Rect(x,y,w,hintH),hint,hintStyle,13.6f,.544f,17);y+=hintH+22;
   Rect skip=new Rect(x,y,Language=="ko"?178.72f:168,46),next=new Rect(x+w-192,y,192,52);DrawGuideButton(skip,K("건너뛰기","Skip"),guideSkipFocus);DrawGuideButton(next,step==3?K("시작","Start"):K("다음","Next"),!guideSkipFocus,true);
   Fill(new Rect(skip.x,skip.y,skip.width*(float)startup.HoldProgress,skip.height),new Color(.72f,.74f,.74f,.20f*startupGuideOpacity));
   var e=Event.current;if(!startupInputFence&&e.type==EventType.MouseDown&&e.button==0){if(skip.Contains(e.mousePosition))startup.Skip();else startup.Advance();e.Use();}
   NativeUiAudit.EndScrollView();
  }
  void DrawGuideButton(Rect r,string text,bool focus,bool primary=false){bool hover=r.Contains(Event.current.mousePosition);var old=GUI.color;if(focus||hover)NativeSilverHellUi.ButtonFocus(r);NativeSilverHellUi.ActionPlate(r,primary,focus||hover?1:0,!AutomatedInput&&hover&&ExoInput.Mouse(0));GUI.color=old;var f=NativeSilverHellUi.Font()??guideText.font;float spacing=16*.24f,width=SpacedWidth(f,16,text,spacing)-spacing;DrawSpaced(r.center.x-width/2,r.y,r.height,text,f,16,spacing,(focus||hover)?new Color(242/255f,237/255f,226/255f):new Color(223/255f,214/255f,194/255f),true);}
 }
}
