using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
 // Same approved A layers and shader equations as title-signboard.js. No movie/outpaint seam.
 internal sealed class NativeTitleSignboard:IDisposable
 {
  const string Root="Art/TitleSignboard/A/";
  Texture2D still,plate,hero,masks,hands;
  Material material;RenderTexture frame;
  bool loaded,failed,dirty=true;
  float lastRender=-1;
  internal bool ReducedMotion=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-reduce-menu-motion")>=0;
  internal bool HasFocus=true;
  internal double Seconds{get;private set;}
  internal int RenderedFrames{get;private set;}
  internal string Mode=>frame!=null&&!failed?(ReducedMotion?"reduced-motion":"layered"):still!=null?"still":"unavailable";
  internal void Restart(){Seconds=0;RenderedFrames=0;dirty=true;lastRender=-1;}
  internal void Tick(float delta,bool focused){HasFocus=focused;Seconds=NativeTitleSignboardLayout.Advance(Seconds,delta,!focused||ReducedMotion);}
  void Load()
  {
   if(loaded)return;loaded=true;
   still=Resources.Load<Texture2D>(Root+"still");plate=Resources.Load<Texture2D>(Root+"background");hero=Resources.Load<Texture2D>(Root+"silvertail");masks=Resources.Load<Texture2D>(Root+"motion-mask");hands=Resources.Load<Texture2D>(Root+"hands");
   var shader=Resources.Load<Shader>("Shaders/TitleSignboard");
   if(shader==null||!shader.isSupported||plate==null||hero==null||masks==null||hands==null){failed=true;return;}
   material=new Material(shader){hideFlags=HideFlags.HideAndDontSave};
   material.SetTexture("_Plate",plate);material.SetTexture("_Hero",hero);material.SetTexture("_Masks",masks);material.SetTexture("_Hands",hands);
  }
  internal bool Draw(Rect screen)
  {
   try{Load();}catch(Exception error){failed=true;Debug.LogWarning("TITLE_A_LOAD_FALLBACK "+error.Message);}
   if(Event.current.type==EventType.Repaint&&!failed)
   {
    try
    {
     var size=NativeTitleSignboardLayout.Buffer(Screen.width,Screen.height);int w=(int)size.Width,h=(int)size.Height;
     if(frame==null||frame.width!=w||frame.height!=h)
     {
      ReleaseFrame();frame=new RenderTexture(w,h,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB){name="Approved A title",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp,hideFlags=HideFlags.HideAndDontSave};
      if(!frame.Create())throw new InvalidOperationException("Title render target unavailable");dirty=true;
     }
     float now=Time.realtimeSinceStartup;
     if(dirty||(HasFocus&&!ReducedMotion&&now-lastRender>=1f/30))
     {
      var crop=NativeTitleSignboardLayout.Cover(Screen.width,Screen.height);
      material.SetVector("_Crop",new Vector4((float)(crop.X/Screen.width),(float)(crop.Y/Screen.height),(float)(crop.Width/Screen.width),(float)(crop.Height/Screen.height)));
      material.SetFloat("_Seconds",(float)Seconds);
      var active=RenderTexture.active;bool write=GL.sRGBWrite;
      try{GL.sRGBWrite=QualitySettings.activeColorSpace==ColorSpace.Linear;Graphics.Blit(Texture2D.whiteTexture,frame,material);}finally{RenderTexture.active=active;GL.sRGBWrite=write;}
      RenderedFrames++;lastRender=now;dirty=false;
     }
    }
    catch(Exception error){failed=true;ReleaseFrame();Debug.LogWarning("TITLE_A_STILL_FALLBACK "+error.Message);}
   }
   Texture source=frame!=null&&!failed?(Texture)frame:still;
   if(source==null)return false;
   NativeUiAudit.DrawTexture(screen,source,frame!=null&&!failed?ScaleMode.StretchToFill:ScaleMode.ScaleAndCrop,false);
   NativeUiAudit.Region(screen,"component","frontend-subject-canvas","approved-A:"+Mode+":"+source.width+"x"+source.height);
   return true;
  }
  void ReleaseFrame(){if(frame==null)return;frame.Release();UnityEngine.Object.Destroy(frame);frame=null;}
  public void Dispose()
  {
   if(!loaded&&frame==null&&material==null)return;
   ReleaseFrame();if(material!=null)UnityEngine.Object.Destroy(material);material=null;
   foreach(var texture in new[]{still,plate,hero,masks,hands})if(texture!=null)Resources.UnloadAsset(texture);
   still=plate=hero=masks=hands=null;loaded=false;failed=false;dirty=true;
  }
 }
}
