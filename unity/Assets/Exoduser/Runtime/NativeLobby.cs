using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 // Original frontend media in native Unity. Save/auth backends are deliberately not invoked.
 public sealed class NativeLobby:MonoBehaviour
 {
  public LobbyFlow Flow{get;private set;}=new LobbyFlow();
  public bool IsBlocking{get{return active&&Flow.Page!=LobbyPage.Playing;}}
  public NativeLobbyVideo CurrentVideo{get{return movie;}}
  public string VideoError{get{return movie==null?"":movie.Error;}}
  public string SubtitleText{get;private set;}="";
  public string Language{get;private set;}="ko";
  public string StageName{get{return splash==1?"FDG":splash==2?"SplashTitle":Flow.Page.ToString();}}
  public bool CaptionVisible{get;private set;}
  public bool WorldEndedNaturally{get;private set;}
  public bool OriginalArtDrawn{get;private set;}
  NativeLobbyVideo movie;AudioSource music;LobbySubtitleData subtitles;Action enter;bool active,ready,musicDucked,showLanguages,focused=true,musicWasPlayingOnBlur,titleSdFallback,musicPausedForVideo;int splash,inputFence=-1;readonly FdgPlaybackWatchdog fdgWatchdog=new FdgPlaybackWatchdog();float since,musicFade,holdDelta;LobbyPage displayed;GUIStyle normal,small,heading,caption,button;Texture2D logo,enterArt,brand,lobbyPoster,gatePoster,splashTitle,splashBrand,fdgEmblem,ancestor,ancestorFirst,enterButton;readonly string[] tracks={"prologue_theme","prologue_theme_abyssal_fracture","prologue_theme_rebirth_gate_1","prologue_theme_rebirth_gate_2"};
  public void Initialize(Action enterNativeTest){enter=enterNativeTest;if(ready)return;ready=true;movie=new NativeLobbyVideo(transform);movie.SetPlaybackAllowed(focused);music=gameObject.AddComponent<AudioSource>();music.playOnAwake=false;music.loop=true;music.spatialBlend=0;var data=Resources.Load<TextAsset>("Data/lobby_frontend");if(data!=null)subtitles=JsonUtility.FromJson<LobbySubtitleData>(data.text);logo=Art("title_logo");enterArt=Art("enter_art");brand=Art("brand_logo");lobbyPoster=Art("lobby_poster");gatePoster=Art("gate_poster");splashTitle=Art("splash_title");splashBrand=Art("splash_brand");fdgEmblem=Art("fdg_emblem");ancestor=Art("varkan_idle");ancestorFirst=Art("varkan_first");enterButton=Art("lobby_enter");}
  Texture2D Art(string path){return Resources.Load<Texture2D>("Art/lobby/"+path);}
  public void Begin(){if(!ready)Initialize(null);active=true;WorldEndedNaturally=false;Flow=new LobbyFlow();splash=1;since=0;fdgWatchdog.Reset();StopMusic();movie.Open("fdg_intro.mp4",false,false,false);movie.Volume(1);}
  public void AdvanceSplash(){inputFence=Time.frameCount;if(splash==1){splash=2;since=0;titleSdFallback=false;movie.Open("title_motion_hd_20260929.mp4",true,true,false);}else if(splash==2){splash=0;OpenForPage();}}
  public void StartGate(){if(splash!=0||Flow.Page!=LobbyPage.Title||Time.frameCount==inputFence)return;Flow.EnterGate();OpenForPage();}
  public void FinishIntro(){splash=0;Flow.FinishIntro();OpenForPage();}
  public void ShowLobby(){active=true;splash=0;Flow.ShowLobby();OpenForPage();}
  public void ReplayIntro(){WorldEndedNaturally=false;active=true;splash=0;Flow.Replay();OpenForPage();}
  public void SelectPreview(){Flow.SelectPreview();}
  public bool EnterNativeTest(){if(!Flow.EnterTest())return false;movie.Close();StopMusic();enter?.Invoke();return true;}
  public void SetLanguage(string code){if(subtitles!=null)foreach(var language in subtitles.captions)if(language.code==code){Language=code;return;}if(code=="ko"||code=="en")Language=code;}
  public void SetMix(float voice,float bgm){Flow.SetMix(voice,bgm);musicDucked=true;music.volume=(float)Flow.MusicGain;movie.Volume((float)Flow.VoiceGain);}
  public void NextCut(){if(Flow.Page!=LobbyPage.WorldIntro||!movie.Prepared)return;double next=Flow.NextCut(movie.Time);if(next<0)FinishIntro();else movie.Seek(next);}
  public void TogglePlayback(){if(Flow.Page!=LobbyPage.WorldIntro)return;if(VideoError.Length>0){OpenForPage();return;}movie.Toggle();if(movie.Player!=null&&movie.Player.isPlaying)music.UnPause();else music.Pause();}
  void StartMusic(string key,float gain){StopMusic();music.clip=Resources.Load<AudioClip>("Audio/Lobby/"+key);music.volume=gain;if(music.clip!=null)music.Play();}
  void StopMusic(){if(music!=null)music.Stop();}
  void OpenForPage(){since=0;displayed=Flow.Page;SubtitleText="";showLanguages=false;switch(Flow.Page){case LobbyPage.Title:StopMusic();movie.Open("intro.mp4",false,true,true);break;case LobbyPage.Gate:movie.Mute(false);movie.Play();movie.Volume(.6f);StartMusic(tracks[UnityEngine.Random.Range(0,tracks.Length)],.6f);break;case LobbyPage.WorldIntro:WorldEndedNaturally=false;movie.Open("world_intro_v17_blood_en.mp4",false,false,false);movie.Volume((float)Flow.VoiceGain);musicFade=0;musicDucked=false;break;case LobbyPage.Lobby:movie.Open("lobby_varkan_crypt_loop_v2.mp4",true,true,false);StartMusic("lobby",.65f);break;}}
  void Update(){if(!IsBlocking||!ready)return;float dt=Time.unscaledDeltaTime;if(!focused)return;since+=dt;if(splash>0){if(splash==2&&movie.Error.Length>0&&!titleSdFallback){titleSdFallback=true;movie.Open("title_motion_20260929.mp4",true,true,false);}if(splash==1){bool complete=fdgWatchdog.Tick(since,movie.Time,movie.Error.Length>0,movie.Ended);if(fdgWatchdog.FallingBack)movie.Pause();if(complete)AdvanceSplash();}if(Input.anyKeyDown&&Time.frameCount!=inputFence)AdvanceSplash();return;}if(Flow.Page!=displayed){OpenForPage();return;}if(Flow.Page==LobbyPage.Title&&(Input.GetKeyDown(KeyCode.Return)||Input.GetKeyDown(KeyCode.Space)))StartGate();if(Flow.Page==LobbyPage.Gate){Flow.TickGate(since,movie.Time,movie.Error.Length>0,movie.Duration);if(movie.Ended)Flow.TickGate(since,100,false,8);if(Flow.Page!=displayed){OpenForPage();return;}}if(Flow.Page==LobbyPage.WorldIntro){if(movie.Ended){WorldEndedNaturally=true;FinishIntro();return;}if(movie.Error.Length>0){music.Pause();musicPausedForVideo=true;}else if(movie.Prepared&&movie.Player.isPlaying&&musicPausedForVideo){music.UnPause();musicPausedForVideo=false;}if(movie.Error.Length==0&&movie.Prepared&&movie.Player.isPlaying&&!musicDucked){musicFade+=dt;music.volume=Mathf.Lerp(.6f,(float)Flow.MusicGain,Mathf.Min(1,musicFade));if(musicFade>=1)musicDucked=true;}if(Input.GetKeyDown(KeyCode.Return)||Input.GetKeyDown(KeyCode.RightArrow)||Input.GetKeyDown(KeyCode.Space))NextCut();UpdateCaption();}Flow.HoldSkip(Input.GetKey(KeyCode.Escape)||Input.GetKey(KeyCode.Space),dt);holdDelta=(float)Flow.SkipProgress;if(Flow.Page!=displayed)OpenForPage();}
  void UpdateCaption(){SubtitleText="";if(subtitles==null||subtitles.captions==null)return;foreach(var language in subtitles.captions)if(language.code==Language){foreach(var cue in language.cues)if(movie.Time>=cue.start&&movie.Time<cue.end){SubtitleText=cue.text;return;}return;}}
  void OnApplicationFocus(bool focus){SetPlaybackFocus(focus);}
  public void SetPlaybackFocus(bool focus)
  {
   if(focused==focus)return;
   focused=focus;if(movie==null||music==null)return;
   movie.SetPlaybackAllowed(focus);
   if(!focus){musicWasPlayingOnBlur=music.isPlaying;music.Pause();}
   else if(musicWasPlayingOnBlur)
   {
    if(Flow.Page!=LobbyPage.WorldIntro||(movie.Error.Length==0&&movie.Prepared&&movie.Player.isPlaying))music.UnPause();
    else musicPausedForVideo=true;
    musicWasPlayingOnBlur=false;
   }
  }

  void OnDestroy(){movie?.Dispose();StopMusic();}
  void Styles(){if(normal!=null)return;var font=Resources.Load<Font>("Art/fonts/NotoSansKR");normal=new GUIStyle(GUI.skin.label){font=font,fontSize=23,wordWrap=true};normal.normal.textColor=new Color(.82f,.75f,.65f);small=new GUIStyle(normal){fontSize=17};heading=new GUIStyle(normal){fontSize=36,fontStyle=FontStyle.Bold};caption=new GUIStyle(normal){font=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular"),fontSize=50,alignment=TextAnchor.LowerCenter,wordWrap=true};caption.normal.textColor=new Color(.933f,.898f,.835f);button=new GUIStyle(GUI.skin.button){font=font,fontSize=23,padding=new RectOffset(14,14,8,8)};}
  public void Draw(){if(!IsBlocking||!ready)return;Styles();var old=GUI.matrix;var tint=GUI.color;bool enabled=GUI.enabled;GUI.matrix=Matrix4x4.identity;Fill(new Rect(0,0,Screen.width,Screen.height),Color.black);float fit=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*fit)/2,(Screen.height-1080*fit)/2,0),Quaternion.identity,new Vector3(fit,fit,1));OriginalArtDrawn=false;CaptionVisible=false;Fill(new Rect(0,0,1920,1080),Color.black);if(splash==1){if(fdgWatchdog.FallingBack)Image(new Rect(0,0,1920,1080),fdgEmblem);else DrawMovie(new Rect(0,0,1920,1080),fdgEmblem,false);Label(new Rect(0,955,1920,60),K("아무 키나 눌러 계속","Press any key to continue"),small,TextAnchor.MiddleCenter);}else if(splash==2){DrawSplash();if(since>1.2f)Label(new Rect(0,980,1920,48),K("아무 키나 눌러 계속","Press any key to continue"),normal,TextAnchor.MiddleCenter);}else if(Flow.Page==LobbyPage.Lobby)DrawLobby();else{DrawMovie(new Rect(0,0,1920,1080),gatePoster,false);if(Flow.Page==LobbyPage.Title)DrawGate();if(Flow.Page==LobbyPage.WorldIntro)DrawWorldIntro();if(Flow.Page!=LobbyPage.Lobby){Label(new Rect(1570,990,330,45),K("SPACE / ESC 길게 누르기","Hold SPACE / ESC"),small,TextAnchor.MiddleCenter);Fill(new Rect(1600,1038,270*Mathf.Clamp01(holdDelta),3),new Color(.8f,.7f,.5f));}}GUI.color=tint;GUI.enabled=enabled;GUI.matrix=old;}
  void OnGUI(){Draw();}
  string K(string ko,string en){return Language=="ko"?ko:en;}
  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  static void Label(Rect r,string text,GUIStyle style,TextAnchor alignment){var old=style.alignment;style.alignment=alignment;GUI.Label(r,text,style);style.alignment=old;}
  void Image(Rect r,Texture t,ScaleMode mode=ScaleMode.ScaleToFit){if(t==null)return;GUI.DrawTexture(r,t,mode,true);OriginalArtDrawn=true;}
  void DrawMovie(Rect box,Texture fallback,bool cover){var texture=movie.Error.Length==0&&movie.Prepared&&movie.Frame>=0?movie.Texture:fallback;Image(box,texture,cover?ScaleMode.ScaleAndCrop:ScaleMode.ScaleToFit);}
  void DrawGate(){var frame=new Rect(34.2857f,0,1851.4286f,1080);float titleWidth=frame.width*.52f;float height=logo==null?300:titleWidth*logo.height/logo.width;Image(new Rect(frame.x+frame.width*.533f-titleWidth/2,1080*.37f-height/2,titleWidth,height),logo);var r=new Rect(frame.x+frame.width*.533f-120,1080*.8f-80,240,160);Image(r,enterArt);if(GUI.Button(r,"",GUIStyle.none))StartGate();if(enterArt==null)Label(r,"ENTER",heading,TextAnchor.MiddleCenter);}
  void DrawSplash(){Texture tex=movie.Error.Length==0&&movie.Prepared&&movie.Frame>=0?movie.Texture:splashTitle;if(tex==null)return;bool video=tex==movie.Texture;float sy=video?78f/768:80f/793,sh=video?616f/768:636f/793;float dw=1080f*tex.width/(tex.height*sh),dx=Mathf.Max((1920-dw)/2,-dw*.1f);GUI.DrawTextureWithTexCoords(new Rect(dx,0,dw,1080),tex,new Rect(0,1-sy-sh,1,sh),true);OriginalArtDrawn=true;if(splashBrand!=null)Image(new Rect(dx,-80f/636*1080,dw,dw*793/1983),splashBrand);}
  void DrawWorldIntro()
  {
   float h=caption.CalcHeight(new GUIContent(SubtitleText),1612);Rect r=new Rect(154,940-h,1612,h);
   if(SubtitleText.Length>0){var color=caption.normal.textColor;caption.normal.textColor=Color.black;for(int dx=-2;dx<=2;dx+=2)for(int dy=-2;dy<=2;dy+=2)GUI.Label(new Rect(r.x+dx,r.y+dy,r.width,r.height),SubtitleText,caption);caption.normal.textColor=color;GUI.Label(r,SubtitleText,caption);CaptionVisible=true;}
   if(GUI.Button(new Rect(1730,24,160,48),Language.ToUpperInvariant(),button))showLanguages=!showLanguages;
   if(showLanguages&&subtitles!=null){for(int i=0;i<subtitles.captions.Length;i++){int row=i/8,col=i%8;if(GUI.Button(new Rect(1030+col*105,82+row*48,100,44),subtitles.captions[i].code.ToUpperInvariant(),button)){SetLanguage(subtitles.captions[i].code);showLanguages=false;}}}
   // Production source hides its mix controls until paused/error. Preview-only sliders
   // remain an explicit API for the isolated verifier, rather than persistent player UI.
   bool attention=VideoError.Length>0||(movie.Prepared&&movie.Player!=null&&!movie.Player.isPlaying);
   if(attention&&GUI.Button(new Rect(28,26,240,48),VideoError.Length>0?K("재생 / 재시도","Play / retry"):K("재생","Play"),button))TogglePlayback();
   if(VideoError.Length>0)Label(new Rect(28,86,1300,100),K("영상 재생 실패 — 재시도하거나 ESC를 길게 눌러 나가세요.","Video playback failed — retry or hold ESC to continue."),normal,TextAnchor.UpperLeft);
   if(Event.current.type==EventType.MouseDown&&Event.current.button==0&&Event.current.mousePosition.y>270&&Event.current.mousePosition.y<970){NextCut();Event.current.Use();}
  }

  void DrawLobby(){bool previousEnabled=GUI.enabled;DrawMovie(new Rect(0,0,1920,1080),lobbyPoster,true);DrawAncestor();float right=560,left=1920-right;Fill(new Rect(left,0,right,1080),new Color(.025f,.015f,.035f,.88f));Fill(new Rect(left,0,2,1080),new Color(.55f,.28f,.25f,.65f));float x=left+28,w=right-56;Label(new Rect(x,155,w,42),"OFFLINE",small,TextAnchor.MiddleLeft);if(GUI.Button(new Rect(x+w-98,155,98,42),Language=="ko"?"한국어":"EN",button))SetLanguage(Language=="ko"?"en":"ko");Image(new Rect(x,212,w,104),brand);Fill(new Rect(x,335,w,1),new Color(.55f,.4f,.28f,.5f));Label(new Rect(x,354,w,100),K("캐릭터가 없습니다.","No characters yet."),normal,TextAnchor.MiddleCenter);GUI.enabled=false;GUI.Button(new Rect(x,470,w,64),"+  "+K("새 캐릭터","New character"),button);GUI.enabled=previousEnabled;Label(new Rect(x+8,550,w-16,90),K("캐릭터 생성·기존 저장 불러오기는 이식 중입니다.","Character creation and saved character loading are being ported."),small,TextAnchor.MiddleCenter);Fill(new Rect(x,662,w,1),new Color(.55f,.4f,.28f,.5f));Label(new Rect(x,682,w,48),K("어둠을 넘어, 지옥의 군주가 되리라.","Beyond the darkness, become the lord of hell."),small,TextAnchor.MiddleCenter);GUI.enabled=false;Image(new Rect(x,755,w,116),enterButton);GUI.enabled=previousEnabled;if(GUI.Button(new Rect(x,890,w,48),K("Unity 전투 검수 (임시 캐릭터)","Unity combat test (temporary character)"),button)){SelectPreview();EnterNativeTest();}if(GUI.Button(new Rect(x,955,260,42),K("시네마틱 다시 보기","Replay cinematic"),button))ReplayIntro();Label(new Rect(x+274,955,w-274,42),"UNITY PORT",small,TextAnchor.MiddleRight);Label(new Rect(26,22,700,36),"EXODUSER · HELL LORD",small,TextAnchor.MiddleLeft);}
  void DrawAncestor(){float scale=Mathf.Max(1920f/1920,1080f/1088),footY=Mathf.Min(1080*.89f,Mathf.Max(1080*.76f,1088*scale*.84f+(1080-1088*scale)*.75f));float h=Mathf.Min(1080*.8f,footY-28),w=h*384/624,footX=Mathf.Max(w*.52f+12,Mathf.Min(1920*.65f-w*.48f-12,1920*scale*.33f+(1920-1920*scale)*.5f));Rect r=new Rect(footX-182.43863f/384*w,footY-603.68209f/624*h,w,h);if(ancestor!=null){int frame=(int)(Time.unscaledTime*24)%96;GUI.DrawTextureWithTexCoords(r,ancestor,new Rect(frame%8/8f,1-(frame/8+1)/12f,1/8f,1/12f),true);OriginalArtDrawn=true;}else Image(r,ancestorFirst);Label(new Rect(footX-350,960,700,32),K("선대 소환체","ANCESTRAL SUMMON"),small,TextAnchor.MiddleCenter);Label(new Rect(footX-350,990,700,45),K("묘왕 바르칸","Varkan, the Tomb King"),heading,TextAnchor.MiddleCenter);Label(new Rect(footX-350,1037,700,30),K("플레이어가 소환하는 선대의 영체","A spirit summoned by the player."),small,TextAnchor.MiddleCenter);}
 }
}
