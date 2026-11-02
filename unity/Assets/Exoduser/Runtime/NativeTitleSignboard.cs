using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
 // origin/main title-signboard.js C2: one muted decoder, centered cover, masked waterfall flow.
 internal sealed class NativeTitleSignboard:IDisposable
 {
  const string Root="Art/TitleSignboard/C2/";
  internal const string Movie="title_motion_C2_tall_loop_20261102.mp4";
  Texture2D still,near,far,tile;Transform parent;NativeLobbyVideo movie;
  Material material;RenderTexture frame;
  bool loaded,failed,dirty=true,hasVideo,lastReduced;float lastRender=-1;
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
   still=Resources.Load<Texture2D>(Root+"still");near=Resources.Load<Texture2D>(Root+"fall-near");far=Resources.Load<Texture2D>(Root+"fall-far");
   var shader=Resources.Load<Shader>("Shaders/TitleSignboardC2");
   if(shader==null||!shader.isSupported||near==null||far==null){failed=true;return;}
   material=new Material(shader){hideFlags=HideFlags.HideAndDontSave};
   // Same 128x512 periodic tile as the web; no generated art or camera displacement.
   tile=new Texture2D(128,512,TextureFormat.RGBA32,false){filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Repeat,hideFlags=HideFlags.HideAndDontSave};
   var pixels=new Color32[128*512];
   for(int y=0;y<512;y++)for(int x=0;x<128;x++){
    double a=Math.Sin(x*.36+Math.Sin(y*Math.PI/128)*1.7),b=Math.Sin(y*Math.PI/16+Math.Sin(x*.17)*2.1),c=Math.Sin(y*Math.PI/32-x*.31),v=99+25*a+30*b+13*c;
    pixels[(511-y)*128+x]=new Color32((byte)Math.Round(v),(byte)Math.Round(v*.29),(byte)Math.Round(v*.27),255);
   }
   tile.SetPixels32(pixels);tile.Apply(false,true);material.SetTexture("_Flow",tile);material.SetTexture("_Near",near);material.SetTexture("_Far",far);
  }
  void EnsureMovie()
  {
   if(movie!=null||ReducedMotion||!HasFocus||parent==null)return;
   movie=new NativeLobbyVideo(parent);movie.Open(Movie,true,true,false);movie.Volume(0);
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
     float now=Time.realtimeSinceStartup;bool videoReady=!ReducedMotion&&movie!=null&&movie.Error.Length==0&&movie.Frame>=0&&movie.Texture!=null;
     // Freeze the same still under reduced motion; an interrupted loop keeps its last frame.
     if(videoReady){hasVideo=true;if(movie.Frame!=lastVideoFrame){VideoFrames++;lastVideoFrame=movie.Frame;}}
     bool waiting=hasVideo&&!videoReady&&!ReducedMotion&&movie!=null&&movie.Error.Length==0;
     if(!waiting&&(dirty||(HasFocus&&!ReducedMotion&&now-lastRender>=1f/30)))
     {
      var crop=NativeTitleSignboardLayout.Cover(Screen.width,Screen.height);material.SetVector("_Crop",new Vector4((float)(crop.X/Screen.width),(float)(crop.Y/Screen.height),(float)(crop.Width/Screen.width),(float)(crop.Height/Screen.height)));
      Texture source=videoReady?(Texture)movie.Texture:still;if(source==null)return false;
      material.SetTexture("_Plate",source);material.SetFloat("_Seconds",(float)Seconds);material.SetFloat("_Motion",HasFocus&&!ReducedMotion&&(movie==null||movie.Error.Length==0)?1:0);
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
   movie?.Dispose();movie=null;ReleaseFrame();if(material!=null)UnityEngine.Object.Destroy(material);material=null;if(tile!=null)UnityEngine.Object.Destroy(tile);tile=null;
   foreach(var texture in new[]{still,near,far})if(texture!=null)Resources.UnloadAsset(texture);still=near=far=null;loaded=false;failed=false;dirty=true;hasVideo=false;
  }
 }
}
