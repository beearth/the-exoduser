using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
 // Start-menu background: one muted looping decoder, centered cover.
 // 2026-11-07: 10-28 Kling loop extended to 32:9 (3840x1080); the C2 waterfall overlay is retired (no falls in this shot).
 internal sealed class NativeTitleSignboard:IDisposable
 {
  const string Root="Art/TitleSignboard/C2/";
  internal const string Movie="title_motion_1028_superwide_20261107.mp4";
  Texture2D still;Transform parent;NativeLobbyVideo movie;
  Material material;RenderTexture frame;
  bool loaded,failed,dirty=true,hasVideo,lastReduced;float lastRender=-1;int selectedWidth;double restoreTime=-1;
  internal bool ReducedMotion=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-reduce-menu-motion")>=0;
  bool hasFocus=true;
  internal bool HasFocus{get=>hasFocus;set{hasFocus=value;movie?.SetPlaybackAllowed(value&&!ReducedMotion);}}
  internal double Seconds{get;private set;}
  internal int RenderedFrames{get;private set;}
  internal int VideoFrames{get;private set;}long lastVideoFrame=-1;
  internal string Mode=>failed?"still-fallback":ReducedMotion?"reduced-motion":movie!=null&&movie.Error.Length>0?"still-fallback":hasVideo?"video":still!=null?"still":"unavailable";
  internal void Initialize(Transform owner){parent=owner;}
  internal void Restart(){Seconds=0;RenderedFrames=0;VideoFrames=0;lastVideoFrame=-1;dirty=true;lastRender=-1;hasVideo=false;}
  internal void Tick(float delta,bool focused)
  {
   if(lastReduced!=ReducedMotion){dirty=true;lastReduced=ReducedMotion;}
   HasFocus=focused;Seconds=NativeTitleSignboardLayout.Advance(Seconds,delta,!focused||ReducedMotion);
   if(movie!=null)movie.SetPlaybackAllowed(focused&&!ReducedMotion);
  }
  void Load()
  {
   if(loaded)return;loaded=true;
   still=Resources.Load<Texture2D>(Root+"still");
   var shader=Resources.Load<Shader>("Shaders/TitleSignboardC2");
   if(shader==null||!shader.isSupported){failed=true;return;}
   material=new Material(shader){hideFlags=HideFlags.HideAndDontSave};
  }
  void EnsureMovie()
  {
   if(!HasFocus||parent==null)return;
   int width=NativeTitleSignboardLayout.VideoWidth(Screen.width,Screen.height);
   if(movie==null)movie=new NativeLobbyVideo(parent);
   if(width!=selectedWidth){restoreTime=movie.Time;selectedWidth=width;movie.Open(NativeTitleSignboardLayout.VideoFile(width),true,true,false);movie.Volume(0);lastVideoFrame=-1;movie.SetPlaybackAllowed(HasFocus&&!ReducedMotion);}
   if(restoreTime>=0&&movie.Prepared){if(restoreTime>0&&movie.Duration>0)movie.Seek(restoreTime%movie.Duration);restoreTime=-1;}
  }
  internal bool Draw(Rect screen)
  {
   try{Load();if(!failed)EnsureMovie();}catch(Exception error){failed=true;Debug.LogWarning("TITLE_C2_LOAD_FALLBACK "+error.Message);}
   if(Event.current.type==EventType.Repaint&&!failed)
   {
    try
    {
     var size=NativeTitleSignboardLayout.Buffer(Screen.width,Screen.height);int w=(int)size.Width,h=(int)size.Height;
     if(frame==null||frame.width!=w||frame.height!=h){ReleaseFrame();frame=new RenderTexture(w,h,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB){name="C2 title",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp,hideFlags=HideFlags.HideAndDontSave};if(!frame.Create())throw new InvalidOperationException("Title render target unavailable");dirty=true;}
     float now=Time.realtimeSinceStartup;bool videoReady=movie!=null&&movie.Presentable;
     // Freeze the same still under reduced motion; an interrupted loop keeps its last frame.
     if(videoReady){hasVideo=true;if(movie.Frame!=lastVideoFrame){VideoFrames++;lastVideoFrame=movie.Frame;}}
     bool waiting=hasVideo&&!videoReady&&!ReducedMotion&&movie!=null&&movie.Error.Length==0;
     if(!waiting&&(dirty||(HasFocus&&!ReducedMotion&&now-lastRender>=1f/30)))
     {
      var crop=NativeTitleSignboardLayout.Cover(Screen.width,Screen.height);material.SetVector("_Crop",new Vector4((float)(crop.X/Screen.width),(float)(crop.Y/Screen.height),(float)(crop.Width/Screen.width),(float)(crop.Height/Screen.height)));
      Texture source=videoReady?(Texture)movie.Texture:still;if(source==null)return false;
      material.SetTexture("_Plate",source);
      var active=RenderTexture.active;bool write=GL.sRGBWrite;
      try{GL.sRGBWrite=QualitySettings.activeColorSpace==ColorSpace.Linear;Graphics.Blit(Texture2D.whiteTexture,frame,material);}finally{RenderTexture.active=active;GL.sRGBWrite=write;}
      RenderedFrames++;lastRender=now;dirty=false;
     }
    }
    catch(Exception error){failed=true;ReleaseFrame();Debug.LogWarning("TITLE_C2_STILL_FALLBACK "+error.Message);}
   }
   Texture result=frame!=null&&!failed?(Texture)frame:still;if(result==null)return false;
   NativeUiAudit.DrawTexture(screen,result,frame!=null&&!failed?ScaleMode.StretchToFill:ScaleMode.ScaleAndCrop,false);
   NativeUiAudit.Region(screen,"component","frontend-subject-canvas","C2:"+Mode+":"+result.width+"x"+result.height);return true;
  }
  void ReleaseFrame(){if(frame==null)return;frame.Release();UnityEngine.Object.Destroy(frame);frame=null;}
  public void Dispose()
  {
   movie?.Dispose();movie=null;selectedWidth=0;restoreTime=-1;ReleaseFrame();if(material!=null)UnityEngine.Object.Destroy(material);material=null;
   if(still!=null)Resources.UnloadAsset(still);still=null;loaded=false;failed=false;dirty=true;hasVideo=false;
  }
 }
}
