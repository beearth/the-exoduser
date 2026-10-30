using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 // Original frontend media in native Unity. Save/auth backends are deliberately not invoked.
 public sealed partial class NativeLobby:MonoBehaviour
 {
  public const string WorldMovie="world_intro_v22b_steam.mp4";
  public const string WorldMovieSha256="3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f";
  public const long WorldMovieBytes=102204634;
  // Exact canonical audio is delayed 0.400s against the preserved source cue clock.
  public const double WorldCueOffset=.4;
  public LobbyFlow Flow{get;private set;}=new LobbyFlow();
  public bool IsBlocking{get{return active&&Flow.Page!=LobbyPage.Playing;}}
  public NativeLobbyVideo CurrentVideo{get{return movie;}}
  public string VideoError{get{return movie==null?"":movie.Error;}}
  public string SubtitleText{get;private set;}="";
  public string Language{get;private set;}="ko";
  public string StageName{get{return StartupEntryActive?StartupStage:splash==1?"FDG":splash==2?"SplashTitle":Flow.Page.ToString();}}
  public bool CaptionVisible{get;private set;}
  public bool WorldEndedNaturally{get;private set;}
  public Action CinematicCompleted{get;set;}
  // Only the explicit CLI verifier owns input while it is running. Normal
  // clients and the lobby left open after verification retain all controls.
  public bool AutomatedInput{get;set;}
  int introKeyLogs;   // WebGL diagnosis (DT-16): the first splash key-downs, whether they were taken, and the frame time around them
  public bool OriginalArtDrawn{get;private set;}
  readonly bool diagnosticPreview=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-ui-diagnostics")>=0;
  readonly bool arabicCaptionPreview=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-arabic-caption-preview")>=0;
  NativeArabicCaptionOverlay arabicCaptionOverlay;
  internal bool DiagnosticUiEnabled{get{return diagnosticPreview;}}
  float musicBaseGain,bgmRelativeGain=1;
  public void SetBgmPercent(int percent){bgmRelativeGain=Mathf.Clamp(percent,0,100)/60f;if(music!=null)music.volume=musicBaseGain*bgmRelativeGain;}
  void MusicGain(float gain){musicBaseGain=gain;if(music!=null)music.volume=gain*bgmRelativeGain;}
  NativeLobbyVideo movie;AudioSource music;LobbySubtitleData subtitles;Action enter;bool active,ready,musicDucked,showLanguages,focused=true,musicWasPlayingOnBlur,titleSdFallback,musicPausedForVideo;int splash,inputFence=-1;readonly FdgPlaybackWatchdog fdgWatchdog=new FdgPlaybackWatchdog();float since,musicFade,holdDelta;LobbyPage displayed;GUIStyle normal,small,heading,caption,captionShadow,ukCaption,ukCaptionShadow,button;GUIStyle zhCaption,zhCaptionShadow,zhtCaption,zhtCaptionShadow,jaCaption,jaCaptionShadow,thCaption,thCaptionShadow;Texture2D logo,enterArt,brand,lobbyPoster,gatePoster,splashTitle,splashBrand,fdgEmblem,ancestor,ancestorFirst,enterButton,lobbyPanel,lobbyBanner,disabledEnter;GUIStyle lobbyText,lobbyMicro,lobbyPromo,lobbyPromoDetail,lobbyTitle,lobbySub,lobbyMode,lobbyFooter,lobbyPlus;bool lobbyQuitPrompt,languageInputFence;int languageCursor;readonly string[] tracks={"prologue_theme","prologue_theme_abyssal_fracture","prologue_theme_rebirth_gate_1","prologue_theme_rebirth_gate_2"};
  public void Initialize(Action enterNativeTest){enter=enterNativeTest;if(ready)return;ready=true;movie=new NativeLobbyVideo(transform);movie.SetPlaybackAllowed(focused);music=gameObject.AddComponent<AudioSource>();music.playOnAwake=false;music.loop=true;music.spatialBlend=0;var data=Resources.Load<TextAsset>("Data/lobby_frontend");if(data!=null)subtitles=JsonUtility.FromJson<LobbySubtitleData>(data.text);logo=Art("title_logo");enterArt=Art("enter_art");brand=Art("brand_logo");lobbyPoster=Art("lobby_poster");gatePoster=Art("gate_poster");splashTitle=Art("splash_title");splashBrand=Art("splash_brand");fdgEmblem=Art("fdg_emblem");ancestor=Art("varkan_idle");ancestorFirst=Art("varkan_first");enterButton=Art("lobby_enter");lobbyPanel=Art("lobby_panel");lobbyBanner=Art("lobby_banner");disabledEnter=Art("lobby_enter_disabled");InitializeCharacterStore();if(arabicCaptionPreview){SetLanguage("ar");arabicCaptionOverlay=gameObject.AddComponent<NativeArabicCaptionOverlay>();arabicCaptionOverlay.Initialize(this);}}
  Texture2D Art(string path){return Resources.Load<Texture2D>("Art/lobby/"+path);}
  public void Begin(){CancelStartupEntry();CancelCharacterStory();if(!ready)Initialize(null);active=true;WorldEndedNaturally=false;Flow=new LobbyFlow();splash=1;since=0;fdgWatchdog.Reset();StopMusic();movie.Open("fdg_intro.mp4",false,true,false);movie.Volume(1);}
  public void AdvanceSplash(){inputFence=Time.frameCount;if(splash==1){splash=2;since=0;titleSdFallback=false;titleRowsBuiltFor=-1;titleRows.Clear();movie.Open(TitleMovie,true,true,false);}else if(splash==2){splash=0;OpenForPage();}}
  public void StartGate(){if(splash!=0||Flow.Page!=LobbyPage.Title||Time.frameCount==inputFence)return;PlayStartupEnter();StartMusic(tracks[UnityEngine.Random.Range(0,tracks.Length)],.6f);Flow.EnterGate();OpenForPage();}
  public void FinishIntro(bool manualLastCue=false){var before=Flow.Page;bool videoError=movie==null||movie.Error.Length>0;splash=0;Flow.FinishIntro();if(IntroCompletionWasEarned(before,Flow.Page,false,videoError,manualLastCue))CinematicCompleted?.Invoke();OpenForPage();}
  public void ShowLobby(){CancelStartupEntry();CancelCharacterStory();active=true;splash=0;Flow.ShowLobby();OpenForPage();}
  public void ReplayIntro(){CancelStartupEntry();CancelCharacterStory();WorldEndedNaturally=false;active=true;splash=0;Flow.Replay();OpenForPage();}
  public void SelectPreview(){ActiveCharacterName="";Flow.SelectPreview();}
  public bool EnterNativeTest(){if(!Flow.EnterTest())return false;CloseCharacterPresentationVideo();movie.Close();if(!keepStartupStageMusic)StopMusic();enter?.Invoke();return true;}
  public void SetLanguage(string code){code=LobbyLanguage.Normalize(code);if(subtitles!=null&&subtitles.captions!=null)foreach(var language in subtitles.captions)if(language.code==code){Language=code;return;}if(code=="ko"||code=="en")Language=code;}
  public void SetMix(float voice,float bgm){Flow.SetMix(voice,bgm);musicDucked=true;MusicGain((float)Flow.MusicGain);movie.Volume((float)Flow.VoiceGain);}
  public static bool IntroCompletionWasEarned(LobbyPage before,LobbyPage after,bool explicitHold,bool videoError,bool manualLastCue=false){return after==LobbyPage.Lobby&&(explicitHold?(before==LobbyPage.Title||before==LobbyPage.Gate||before==LobbyPage.WorldIntro):before==LobbyPage.WorldIntro&&(manualLastCue||!videoError));}
  public void NextCut(){if(Flow.Page!=LobbyPage.WorldIntro||!movie.Prepared)return;double next=Flow.NextCut(Math.Max(0,movie.Time-WorldCueOffset));if(next<0)FinishIntro(true);else movie.Seek(next+WorldCueOffset);}
  // DBT-8: a failed stage movie is retried (spaced) up to NativeLobbyVideo.MaxRequests requests in all, then the stage is skipped to the next one (world intro -> lobby).
  float videoErrorFor;
  void HandleVideoFailure(float dt)
  {
   if(movie.Error.Length==0){videoErrorFor=0;return;}
   videoErrorFor+=dt;if(videoErrorFor<1.5f)return;videoErrorFor=0;
   if(Flow.Page!=LobbyPage.WorldIntro)return;
   if(movie.CanRetry){OpenForPage();return;}
   Debug.Log("LOBBY_STAGE_SKIP WorldIntro -> Lobby (movie unavailable)");FinishIntro();
  }
  public void TogglePlayback(){if(Flow.Page!=LobbyPage.WorldIntro)return;if(VideoError.Length>0){NativeLobbyVideo.RetryNow();OpenForPage();return;}movie.Toggle();if(movie.Player!=null&&movie.Player.isPlaying)music.UnPause();else music.Pause();}
  void StartMusic(string key,float gain){StopMusic();music.clip=Resources.Load<AudioClip>("Audio/Lobby/"+key);MusicGain(gain);if(music.clip!=null)music.Play();}
  void StopMusic(){if(music!=null)music.Stop();}
  void OpenForPage(){if(Flow.Page!=LobbyPage.Lobby)CloseCharacterPresentationVideo();since=0;displayed=Flow.Page;SubtitleText="";showLanguages=false;languageInputFence=false;switch(Flow.Page){case LobbyPage.Title:StopMusic();movie.Close();break;case LobbyPage.Gate:movie.Mute(false);movie.Play();movie.Volume(.6f);StartMusic(tracks[UnityEngine.Random.Range(0,tracks.Length)],.6f);break;case LobbyPage.WorldIntro:WorldEndedNaturally=false;movie.Open(WorldMovie,false,false,false);movie.Volume((float)Flow.VoiceGain);musicFade=0;musicDucked=false;break;case LobbyPage.Lobby:silverSlotSummaries.Clear();movie.Open("lobby_varkan_crypt_loop_v2_unity.mp4",true,true,false);StartMusic("lobby",.65f);break;}}
  void Update(){UpdateCharacterFence();if(!IsBlocking||!ready)return;float dt=Time.unscaledDeltaTime;if(StartupEntryActive){UpdateStartupEntry(dt);return;}if(!focused)return;if(CharacterStoryActive){UpdateCharacterStory(dt);return;}if(languageInputFence&&!LobbyKeys.Held(KeyCode.Escape)&&!LobbyKeys.Held(KeyCode.Space)&&!LobbyKeys.Held(KeyCode.Return)&&!LobbyKeys.Held(KeyCode.KeypadEnter)&&!LobbyKeys.Held(KeyCode.RightArrow))languageInputFence=false;since+=dt;if(splash>0){if(splash==2&&movie.Error.Length>0&&!titleSdFallback)titleSdFallback=true;if(splash==1){bool complete=fdgWatchdog.Tick(since,movie.Time,movie.Error.Length>0,movie.Ended);if(fdgWatchdog.FallingBack)movie.Pause();if(complete)AdvanceSplash();}if(splash==2){UpdateTitleMenu(dt);return;}if(!AutomatedInput&&LobbyKeys.AnyDown){bool taken=Time.frameCount!=inputFence;if(introKeyLogs<12){introKeyLogs++;Debug.Log("LOBBY_KEY splash="+splash+" frame="+Time.frameCount+" fence="+inputFence+" accepted="+taken+" t="+Time.unscaledTime.ToString("0.00")+" dt="+dt.ToString("0.000"));}if(taken)AdvanceSplash();}return;}if(Flow.Page!=displayed){OpenForPage();return;}if(!AutomatedInput&&Flow.Page==LobbyPage.Title&&(LobbyKeys.Down(KeyCode.Return)||LobbyKeys.Down(KeyCode.Space)))StartGate();if(Flow.Page==LobbyPage.Gate){Flow.TickGate(since,movie.Time,movie.Error.Length>0,movie.Duration);if(movie.Ended)Flow.TickGate(since,100,false,8);if(Flow.Page!=displayed){OpenForPage();return;}}if(Flow.Page==LobbyPage.WorldIntro){if(movie.Ended){WorldEndedNaturally=true;FinishIntro();return;}HandleVideoFailure(dt);if(Flow.Page!=LobbyPage.WorldIntro)return;if(movie.Error.Length>0){music.Pause();musicPausedForVideo=true;}else if(movie.Prepared&&movie.Player.isPlaying&&musicPausedForVideo){music.UnPause();musicPausedForVideo=false;}if(movie.Error.Length==0&&movie.Prepared&&movie.Player.isPlaying&&!musicDucked){musicFade+=dt;MusicGain(Mathf.Lerp(.6f,(float)Flow.MusicGain,Mathf.Min(1,musicFade)));if(musicFade>=1)musicDucked=true;}if(!AutomatedInput&&!showLanguages&&!languageInputFence&&(LobbyKeys.Down(KeyCode.Return)||LobbyKeys.Down(KeyCode.RightArrow)||LobbyKeys.Down(KeyCode.Space)))NextCut();UpdateCaption();}var beforeHold=Flow.Page;Flow.HoldSkip(!AutomatedInput&&!showLanguages&&!languageInputFence&&(LobbyKeys.Held(KeyCode.Escape)||LobbyKeys.Held(KeyCode.Space)),dt);if(IntroCompletionWasEarned(beforeHold,Flow.Page,true,false))CinematicCompleted?.Invoke();holdDelta=(float)Flow.SkipProgress;if(Flow.Page!=displayed)OpenForPage();}
  void UpdateCaption(){SubtitleText="";if(subtitles==null||subtitles.captions==null)return;foreach(var language in subtitles.captions)if(language.code==Language){foreach(var cue in language.cues)if(movie.Time-WorldCueOffset>=cue.start&&movie.Time-WorldCueOffset<cue.end){SubtitleText=cue.text;return;}return;}}
  void OnApplicationFocus(bool focus){SetPlaybackFocus(focus);}
  public void SetPlaybackFocus(bool focus)
  {
   if(focused==focus)return;
   focused=focus;SetStartupAudioFocus(focus);if(!focus){frontendPad.Reset();if(warriorStory!=null)warriorStory.CancelHold();}if(movie==null||music==null)return;
   movie.SetPlaybackAllowed(focus);
   if(!focus){musicWasPlayingOnBlur=music.isPlaying;music.Pause();}
   else if(musicWasPlayingOnBlur)
   {
    if(Flow.Page!=LobbyPage.WorldIntro||(movie.Error.Length==0&&movie.Prepared&&movie.Player.isPlaying))music.UnPause();
    else musicPausedForVideo=true;
    musicWasPlayingOnBlur=false;
   }
  }

  void OnDestroy(){DestroyStartupPresentationTextures();movie?.Dispose();StopMusic();if(gateShade!=null)Destroy(gateShade);if(invitationShade!=null)Destroy(invitationShade);}
  void Styles()
  {
   if(normal!=null)return;
   var font=Resources.Load<Font>("Art/fonts/NotoSansKR");
   normal=new GUIStyle(GUI.skin.label){font=font,fontSize=23,wordWrap=true};normal.normal.textColor=new Color(.82f,.75f,.65f);
   small=new GUIStyle(normal){fontSize=17};heading=new GUIStyle(normal){fontSize=36,fontStyle=FontStyle.Bold};
   caption=new GUIStyle(normal){font=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular"),fontSize=50,alignment=TextAnchor.LowerCenter,wordWrap=true};
   caption.normal.textColor=new Color(.933f,.898f,.835f);captionShadow=new GUIStyle(caption);captionShadow.normal.textColor=Color.black;
   var ukFont=Resources.Load<Font>("Art/fonts/NativeCaptionNotoSerif");
   if(ukFont!=null){ukCaption=new GUIStyle(caption){font=ukFont};ukCaptionShadow=new GUIStyle(ukCaption);ukCaptionShadow.normal.textColor=Color.black;}
   CreateRegionalCaptionStyles("Art/fonts/NotoSerifCJKsc-Regular",out zhCaption,out zhCaptionShadow);
   CreateRegionalCaptionStyles("Art/fonts/NotoSerifCJKtc-Regular",out zhtCaption,out zhtCaptionShadow);
   CreateRegionalCaptionStyles("Art/fonts/NotoSerifCJKjp-Regular",out jaCaption,out jaCaptionShadow);
   CreateRegionalCaptionStyles("Art/fonts/NotoSerifThai-Regular",out thCaption,out thCaptionShadow);
   button=new GUIStyle(GUI.skin.button){font=font,fontSize=23,padding=new RectOffset(14,14,8,8)};
  }
  void CreateRegionalCaptionStyles(string resource,out GUIStyle main,out GUIStyle shadow)
  {
   main=null;shadow=null;
   var regionalFont=Resources.Load<Font>(resource);
   if(regionalFont==null)return;
   main=new GUIStyle(caption){font=regionalFont};
   shadow=new GUIStyle(main);shadow.normal.textColor=Color.black;
  }
  // These exact subtitle codes have missing source-font glyphs, while the existing Noto Serif font covers every visible cue character.
  static bool UseNotoCaptionForLanguage(string code)
  {
   switch(code){
    case "es":case "fr":case "de":case "ptbr":case "it":case "ru":case "uk":case "pl":case "cs":case "hu":
    case "ro":case "bg":case "el":case "tr":case "vi":case "sv":case "da":case "no":case "fi":case "nl":return true;
    default:return false;
   }
  }
  GUIStyle CaptionStyleForLanguage()
  {
   switch(Language){case "zh":if(zhCaption!=null)return zhCaption;break;case "zht":if(zhtCaption!=null)return zhtCaption;break;case "ja":if(jaCaption!=null)return jaCaption;break;case "th":if(thCaption!=null)return thCaption;break;}
   return UseNotoCaptionForLanguage(Language)&&ukCaption!=null?ukCaption:caption;
  }
  GUIStyle CaptionShadowForLanguage()
  {
   switch(Language){case "zh":if(zhCaptionShadow!=null)return zhCaptionShadow;break;case "zht":if(zhtCaptionShadow!=null)return zhtCaptionShadow;break;case "ja":if(jaCaptionShadow!=null)return jaCaptionShadow;break;case "th":if(thCaptionShadow!=null)return thCaptionShadow;break;}
   return UseNotoCaptionForLanguage(Language)&&ukCaptionShadow!=null?ukCaptionShadow:captionShadow;
  }
  public void Draw(){if(!IsBlocking||!ready)return;Styles();var old=GUI.matrix;var tint=GUI.color;bool enabled=GUI.enabled;int priorDepth=GUI.depth;GUI.matrix=Matrix4x4.identity;if(!StartupWorldVisible)Fill(new Rect(0,0,Screen.width,Screen.height),Color.black);float fit=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*fit)/2,(Screen.height-1080*fit)/2,0),Quaternion.identity,new Vector3(fit,fit,1));OriginalArtDrawn=false;CaptionVisible=false;if(!StartupWorldVisible)Fill(new Rect(0,0,1920,1080),Color.black);if(StartupEntryActive)DrawStartupEntry();else if(CharacterStoryActive)DrawCharacterStory();else if(splash==1){if(fdgWatchdog.FallingBack)Image(new Rect(0,0,1920,1080),fdgEmblem);else DrawMovie(new Rect(0,0,1920,1080),fdgEmblem,false);Label(new Rect(0,955,1920,60),K("아무 키나 눌러 계속","Press any key to continue"),small,TextAnchor.MiddleCenter);}else if(splash==2){DrawTitleSplash();}else if(Flow.Page==LobbyPage.Lobby)DrawLobby();else{DrawCinematicMovie();if(Flow.Page==LobbyPage.Title||Flow.Page==LobbyPage.Gate)DrawGatePresentation();if(Flow.Page==LobbyPage.WorldIntro)DrawWorldIntro();if(Flow.Page!=LobbyPage.Lobby&&Flow.Page!=LobbyPage.Title){DrawCinematicSkip();}}GUI.color=tint;GUI.enabled=enabled;GUI.depth=priorDepth;GUI.matrix=old;}
  void OnGUI(){if(AutomatedInput&&(Event.current.isKey||Event.current.isMouse||Event.current.type==EventType.ScrollWheel))Event.current.Use();Draw();}
  string K(string ko,string en){return Language=="ko"?ko:en;}
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  static void Label(Rect r,string text,GUIStyle style,TextAnchor alignment){var old=style.alignment;var color=style.normal.textColor;try{style.alignment=alignment;style.normal.textColor=NativeSilverHellUi.TextColor(color);NativeUiAudit.Label(r,text,style);}finally{style.alignment=old;style.normal.textColor=color;}}
  void Image(Rect r,Texture t,ScaleMode mode=ScaleMode.ScaleToFit){if(t==null)return;GUI.DrawTexture(r,t,mode,true);OriginalArtDrawn=true;}
  void DrawMovie(Rect box,Texture fallback,bool cover){var texture=movie.Error.Length==0&&movie.Prepared&&movie.Frame>=0?movie.Texture:fallback;Image(box,texture,cover?ScaleMode.ScaleAndCrop:ScaleMode.ScaleToFit);}
  void DrawGate(){var frame=new Rect(34.2857f,0,1851.4286f,1080);float titleWidth=frame.width*.52f;float height=logo==null?300:titleWidth*logo.height/logo.width;Image(new Rect(frame.x+frame.width*.533f-titleWidth/2,1080*.37f-height/2,titleWidth,height),logo);var r=new Rect(frame.x+frame.width*.533f-120,1080*.8f-80,240,160);Image(r,enterArt);if(NativeUiAudit.Button(r,"",GUIStyle.none))StartGate();if(enterArt==null)Label(r,"ENTER",heading,TextAnchor.MiddleCenter);}
  void DrawSplash(){Texture tex=movie.Error.Length==0&&movie.Prepared&&movie.Frame>=0?movie.Texture:splashTitle;if(tex==null)return;bool video=tex==movie.Texture;float sy=video?78f/768:80f/793,sh=video?616f/768:636f/793;float dw=1080f*tex.width/(tex.height*sh),dx=Mathf.Max((1920-dw)/2,-dw*.1f);GUI.DrawTextureWithTexCoords(new Rect(dx,0,dw,1080),tex,new Rect(0,1-sy-sh,1,sh),true);OriginalArtDrawn=true;if(splashBrand!=null)Image(new Rect(dx,-80f/636*1080,dw,dw*793/1983),splashBrand);}
  void DrawWorldIntro()
  {
   LobbyStyles();bool popupWasOpen=showLanguages;HandleLanguagePopupKeys();bool previousEnabled=GUI.enabled;
   var captionStyle=CaptionStyleForLanguage();var shadowStyle=CaptionShadowForLanguage();float h=captionStyle.CalcHeight(new GUIContent(SubtitleText),1612);Rect r=new Rect(154,940-h,1612,h);
   if(SubtitleText.Length>0&&!(Language=="ar"&&arabicCaptionOverlay!=null&&arabicCaptionOverlay.Ready)){for(int dx=-2;dx<=2;dx+=2)for(int dy=-2;dy<=2;dy+=2)NativeUiAudit.Label(new Rect(r.x+dx,r.y+dy,r.width,r.height),SubtitleText,shadowStyle);NativeUiAudit.Label(r,SubtitleText,captionStyle);CaptionVisible=true;}
   if(SubtitleText.Length>0&&Language=="ar"&&arabicCaptionOverlay!=null&&arabicCaptionOverlay.Ready){arabicCaptionOverlay.DrawComposite(new Rect(0,0,1920,1080));CaptionVisible=true;}
   DrawCinematicLanguage();
   GUI.enabled=previousEnabled&&!showLanguages;
   // Source hides worldIntroMix during normal playback; show recovery only when paused/error.
   bool playing=movie.Prepared&&movie.Player!=null&&movie.Player.isPlaying;
   if((VideoError.Length>0||(movie.Prepared&&!playing))&&NativeUiAudit.Button(new Rect(28,26,240,48),VideoError.Length>0?K("재생 / 재시도","Play / retry"):playing?K("일시정지","Pause"):K("재생","Play"),button))TogglePlayback();
   if(VideoError.Length>0)Label(new Rect(28,86,1300,100),K("영상 재생 실패 — 재시도하거나 ESC를 길게 눌러 나가세요.","Video playback failed — retry or hold ESC to continue."),normal,TextAnchor.UpperLeft);
   GUI.enabled=previousEnabled;
   if(showLanguages){
    DrawLanguages(new Rect(1683.2f,32.4f,160,29));
   }
   if(!popupWasOpen&&!showLanguages&&!languageInputFence&&Event.current.type==EventType.MouseDown&&Event.current.button==0&&Event.current.mousePosition.y>270&&Event.current.mousePosition.y<970){NextCut();Event.current.Use();}
  }

  void LobbyStyles()
  {
   if(lobbyText!=null)return;
   // Keep lobby font weights local: the shared variable font defaults to Thin.
   var regular=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??normal.font;
   var semiBold=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold");
   var bold=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Bold");
   lobbyText=new GUIStyle(normal){font=semiBold??bold??regular,fontSize=15,fontStyle=semiBold==null&&bold==null?FontStyle.Bold:FontStyle.Normal,wordWrap=false,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero,clipping=TextClipping.Overflow};lobbyText.normal.textColor=new Color(.933f,.894f,.831f);
   lobbyMicro=new GUIStyle(lobbyText){font=regular,fontSize=12,fontStyle=FontStyle.Normal};lobbyMicro.normal.textColor=new Color(.722f,.639f,.525f);
   lobbyPromo=new GUIStyle(lobbyText){font=bold??regular,fontSize=14,fontStyle=bold==null?FontStyle.Bold:FontStyle.Normal};lobbyPromo.normal.textColor=new Color(.867f,.776f,.596f);
   lobbyPromoDetail=new GUIStyle(lobbyMicro){fontSize=11};lobbyPromoDetail.normal.textColor=new Color(.722f,.686f,.624f);
   lobbyMode=new GUIStyle(lobbyPromo){fontSize=11};lobbyMode.normal.textColor=new Color(.706f,.549f,.431f,.55f);
   lobbyFooter=new GUIStyle(lobbyMicro){fontSize=10};lobbyFooter.normal.textColor=new Color(.49f,.392f,.275f,.32f);
   lobbyTitle=new GUIStyle(lobbyMicro){font=NativeSilverHellUi.Font()??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular"),fontSize=45,fontStyle=FontStyle.Normal};lobbyTitle.normal.textColor=NativeSilverHellUi.Text;
   lobbySub=new GUIStyle(lobbyTitle){fontSize=13};lobbySub.normal.textColor=NativeSilverHellUi.Dim;
   lobbyPlus=new GUIStyle(lobbyMicro){fontSize=25};lobbyPlus.normal.textColor=new Color(.706f,.549f,.431f,.4f);
  }
  void UpdateLobbyTextScale()
  {
   // Web lobby text stays in CSS pixels. Keep small IMGUI labels readable when the 1920 design is fitted to a smaller window.
   float fit=Mathf.Min(Screen.width/1920f,Screen.height/1080f),unit=1/Mathf.Max(.1f,fit);
   lobbyText.fontSize=Mathf.RoundToInt(Mathf.Max(15,12*unit));
   lobbyMicro.fontSize=Mathf.RoundToInt(12*unit);
   lobbyMode.fontSize=Mathf.RoundToInt(Mathf.Max(11,11.5f*unit));
   lobbyPromo.fontSize=Mathf.RoundToInt(Mathf.Max(14,12*unit));
   lobbyPromoDetail.fontSize=Mathf.RoundToInt(Mathf.Max(11,12*unit));
   characterSmall.fontSize=Mathf.RoundToInt(Mathf.Max(20,16*unit));
  }
  void DrawLobby()
  {
   LobbyStyles();CharacterStyles();UpdateLobbyTextScale();OpenPatchNotesForQaOnce();HandlePatchNotesKeys();if(!patchNotesOpen&&Event.current.type!=EventType.Used){HandleCharacterKeys();HandleLanguagePopupKeys();}bool priorEnabled=GUI.enabled,previousEnabled=priorEnabled&&!patchNotesOpen;GUI.enabled=previousEnabled&&!lobbyQuitPrompt&&!CharacterModalOpen;DrawLobbyBackground();DrawSelectedCharacter();
   DrawSilverLobbyBody(previousEnabled);
   GUI.enabled=previousEnabled&&!lobbyQuitPrompt&&!CharacterModalOpen;
   if(showLanguages){
    // Use IMGUI hit testing so dismissal follows the same scaled coordinates as buttons.
    DrawLanguages(new Rect(1424,188,140,36));
   }
   GUI.enabled=previousEnabled&&!patchNotesOpen;
   DrawCharacterModal();
   if(lobbyQuitPrompt&&DismissOutside(new Rect(710,427,500,226)))lobbyQuitPrompt=false;
   if(lobbyQuitPrompt)DrawLobbyQuitPrompt();
   GUI.enabled=priorEnabled;DrawPatchNotesPanel();
  }
  void DrawLobbyQuitPrompt()
  {
   Fill(new Rect(0,0,1920,1080),new Color(0,0,0,.75f));NativeSilverHellUi.Panel(new Rect(710,427,500,226),28,8);
   var heading=new GUIStyle(normal){font=NativeSilverHellUi.Font()??normal.font,fontSize=24,fontStyle=FontStyle.Normal,wordWrap=true};heading.normal.textColor=NativeSilverHellUi.Bright;
   Label(new Rect(740,457,440,60),K("게임을 종료하시겠습니까?","Quit the game?"),heading,TextAnchor.MiddleCenter);
   if(LobbyQuitButton(new Rect(755,552,180,48),K("취소","Cancel"),false))lobbyQuitPrompt=false;
   if(LobbyQuitButton(new Rect(985,548,200,56),K("종료","Quit"),true))Application.Quit();
  }
  bool LobbyQuitButton(Rect r,string text,bool primary)
  {
   bool hover=r.Contains(Event.current.mousePosition),pressed=!AutomatedInput&&hover&&ExoInput.Mouse(0);
   if(hover&&!pressed)NativeSilverHellUi.ButtonFocus(r);NativeSilverHellUi.ActionPlate(r,primary,hover?1:0,pressed,28,6);
   var label=new GUIStyle(normal){font=NativeSilverHellUi.Font()??normal.font,fontSize=18,fontStyle=FontStyle.Normal};label.normal.textColor=NativeSilverHellUi.Bright;Label(r,text,label,TextAnchor.MiddleCenter);
   return NativeUiAudit.Button(r,GUIContent.none,GUIStyle.none);
  }
  string LobbyLanguageLabel(string code)
  {
   // The bundled KR font lacks characters in these six native labels.
   // Use readable menu-language names until full multilingual typography is available.
   switch(code){
    case "zh":return K("중국어 간체","Chinese (Simplified)");
    case "th":return K("태국어","Thai");
    case "uk":return K("우크라이나어","Ukrainian");
    case "cs":return K("체코어","Czech");
    case "el":return K("그리스어","Greek");
    case "ar":return K("아랍어","Arabic");
    default:return LobbyLanguage.GetDisplayName(code);
   }
  }
  static bool DismissOutside(Rect popup)
  {
   bool dismiss=NativeUiAudit.Button(new Rect(0,0,1920,popup.yMin),"",GUIStyle.none);
   dismiss|=NativeUiAudit.Button(new Rect(0,popup.yMax,1920,1080-popup.yMax),"",GUIStyle.none);
   dismiss|=NativeUiAudit.Button(new Rect(0,popup.yMin,popup.xMin,popup.height),"",GUIStyle.none);
   dismiss|=NativeUiAudit.Button(new Rect(popup.xMax,popup.yMin,1920-popup.xMax,popup.height),"",GUIStyle.none);
   return dismiss;
  }
  void DrawLobbyBackground()
  {
   Texture tex=movie.Error.Length==0&&movie.Prepared&&movie.Frame>=0?movie.Texture:lobbyPoster;if(tex==null)return;
   float scale=Mathf.Max(1920f/tex.width,1080f/tex.height),sw=1920/(scale*tex.width),sh=1080/(scale*tex.height);
   GUI.DrawTextureWithTexCoords(new Rect(0,0,1920,1080),tex,new Rect((1-sw)*.5f,(1-sh)*.25f,sw,sh),true);OriginalArtDrawn=true;
  }
  static void Border(Rect r,Color color,float width){Fill(new Rect(r.x,r.y,r.width,width),color);Fill(new Rect(r.x,r.yMax-width,r.width,width),color);Fill(new Rect(r.x,r.y,width,r.height),color);Fill(new Rect(r.xMax-width,r.y,width,r.height),color);}
  static void DashedBorder(Rect r,Color color){for(float x=r.x;x<r.xMax;x+=5){float w=Mathf.Min(3,r.xMax-x);Fill(new Rect(x,r.y,w,1),color);Fill(new Rect(x,r.yMax-1,w,1),color);}for(float y=r.y;y<r.yMax;y+=5){float h=Mathf.Min(3,r.yMax-y);Fill(new Rect(r.x,y,1,h),color);Fill(new Rect(r.xMax-1,y,1,h),color);}}
  static void Line(Vector2 from,Vector2 to,Color color,float width){var matrix=GUI.matrix;GUIUtility.RotateAroundPivot(Mathf.Atan2(to.y-from.y,to.x-from.x)*Mathf.Rad2Deg,from);Fill(new Rect(from.x,from.y,(to-from).magnitude,width),color);GUI.matrix=matrix;}
  void DrawPower(Rect rect){var center=rect.center;var color=new Color(.722f,.639f,.525f);for(int i=0;i<48;i++){float a=Mathf.PI*2*i/48,b=Mathf.PI*2*(i+1)/48;Line(center+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*17.5f,center+new Vector2(Mathf.Cos(b),Mathf.Sin(b))*17.5f,new Color(.467f,.376f,.278f,.4f),1);}for(int i=0;i<24;i++){float a=(40+280f*i/24)*Mathf.Deg2Rad,b=(40+280f*(i+1)/24)*Mathf.Deg2Rad;Line(center+new Vector2(Mathf.Sin(a),-Mathf.Cos(a))*8,center+new Vector2(Mathf.Sin(b),-Mathf.Cos(b))*8,color,1.8f);}Line(center+new Vector2(0,-10),center+new Vector2(0,1),color,1.8f);}
  static void TrackedLabel(Rect rect,string text,GUIStyle style,float spacing)
  {
   if(string.IsNullOrEmpty(text))return;
   float width=0,height=Mathf.Max(rect.height,style.lineHeight);
   foreach(char ch in text){var size=style.CalcSize(new GUIContent(ch.ToString()));width+=size.x+spacing;height=Mathf.Max(height,size.y);}
   float x=rect.center.x-(width-spacing)/2,y=rect.center.y-height*.5f;
   // CSS line boxes anchor the layout; Unity's glyph metrics determine the draw box.
   foreach(char ch in text){float w=style.CalcSize(new GUIContent(ch.ToString())).x;Label(new Rect(x,y,w,height),ch.ToString(),style,TextAnchor.MiddleCenter);x+=w+spacing;}
  }

  void DrawAncestor(){float scale=Mathf.Max(1920f/1920,1080f/1088),footY=Mathf.Min(1080*.89f,Mathf.Max(1080*.76f,1088*scale*.84f+(1080-1088*scale)*.75f));float h=Mathf.Min(1080*.8f,footY-28),w=h*384/624,footX=Mathf.Max(w*.52f+12,Mathf.Min(1920*.65f-w*.48f-12,1920*scale*.33f+(1920-1920*scale)*.5f));Rect r=new Rect(footX-182.43863f/384*w,footY-603.68209f/624*h,w,h);if(ancestor!=null){int frame=(int)(Time.unscaledTime*24)%96;GUI.DrawTextureWithTexCoords(r,ancestor,new Rect(frame%8/8f,1-(frame/8+1)/12f,1/8f,1/12f),true);OriginalArtDrawn=true;}else Image(r,ancestorFirst);var oldColor=lobbyMicro.normal.textColor;TrackedLabel(new Rect(footX-350,935.6f,700,18.2f),K("선대 소환체","ANCESTRAL SUMMON"),lobbySub,2);TrackedLabel(new Rect(footX-350,957.8f,700,69),K("묘왕 바르칸","Varkan, the Tomb King"),lobbyTitle,Language=="ko"?11.2f:3);lobbyMicro.normal.textColor=NativeSilverHellUi.Dim;TrackedLabel(new Rect(footX-350,1030.8f,700,16.8f),K("플레이어가 소환하는 선대의 영체","A spirit summoned by the player."),lobbyMicro,.4f);lobbyMicro.normal.textColor=oldColor;}
 }
}
