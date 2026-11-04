using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 [DefaultExecutionOrder(-32000)]
 internal sealed class NativeScreenTransition:MonoBehaviour {
  [Serializable] internal sealed class TransitionRecord {public int id;public string boundary,error;public bool cancelled,failed;public int blackPaintedFrame,swappedFrame;public float started,swapped,finished;}
  [Serializable] sealed class Labels {public Label[] entries;}
  [Serializable] sealed class Label {public string code,text;}
  static NativeScreenTransition current;static int nextId;internal static Func<bool> ReduceMotion;
  readonly ScreenTransitionFlow flow=new ScreenTransitionFlow();readonly BlackPresentationLatch blackLatch=new BlackPresentationLatch();
  readonly List<TransitionRecord> history=new List<TransitionRecord>();TransitionRecord entry;Action swap,done;Func<bool> prepared;Func<string> problem;bool executing,swapped;
  // The flow clock (Core, unchanged) caps preparation at 12 s and fails on one long frame. While Preparing the host holds that clock and
  // judges failure itself: an exception, no progress report for the watchdog's frame time (20 s assembly / 12 s other), or the 120 s absolute
  // cap on one preparation (hard-cap, frames clamped to 2 s). A failure opens the screen as is (no lobby rollback). Visuals run on their own clock.
  readonly TransitionPrepareWatchdog watchdog=new TransitionPrepareWatchdog();double visualAt;float shownProgress;bool sawAssembly,fieldBound;
  double clockAt;Texture2D sigil,embers,halo,emberShadow;int shadowHeight;Labels labels;
  internal static bool ReducedMotionRequested=>(ReduceMotion!=null&&ReduceMotion())||Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-reduced-motion")>=0;
  internal static bool Busy=>current!=null&&current.flow.Busy;
  internal static bool Executing=>current!=null&&current.executing;
  internal static bool InputBlocked=>Busy&&!Executing;
  internal static float Gain=>current==null?1:(float)current.flow.MediaGain;
  internal static ScreenTransitionFlow State=>current==null?null:current.flow;
  internal static IReadOnlyList<TransitionRecord> History=>current==null?null:current.history;
  internal static int Request(string boundary,Action onBlack,Func<bool> ready=null,Action onDone=null,Func<string> error=null){
   if(current==null){var go=new GameObject("Screen transition");DontDestroyOnLoad(go);current=go.AddComponent<NativeScreenTransition>();}
   var c=current;if(c.flow.Busy)return 0;bool reduced=ReducedMotionRequested;
   c.clockAt=Time.realtimeSinceStartupAsDouble;c.visualAt=0;c.shownProgress=0;c.sawAssembly=false;c.fieldBound=TransitionPrepareWatchdog.FieldBound(boundary);NativeTransitionProgress.NewTransition();if(c.fieldBound)NativeGame.FieldEntryRequested();c.watchdog.End();c.flow.Begin(reduced);c.blackLatch.Cancel();c.swap=onBlack;c.done=onDone;c.prepared=ready;c.problem=error;c.swapped=false;c.entry=new TransitionRecord{id=++nextId,boundary=boundary,started=Time.realtimeSinceStartup};c.history.Add(c.entry);if(c.history.Count>128)c.history.RemoveAt(0);return c.entry.id;
  }
  internal static bool Cancel(int id){if(current==null||!current.flow.Busy||current.entry.id!=id)return false;current.entry.cancelled=true;current.blackLatch.Cancel();current.swap=null;current.done=null;current.prepared=null;current.problem=null;current.flow.Cancel();return true;}
  void Update(){NativeLobbyVideo.ApplyTransitionMix();if(!flow.Busy)return;bool ready=false;string error=null;NativeTransitionProgress.ReleaseOrphan();
   // Only transitions into the field wait for the 3D field (assembly in flight, or requested and not built yet). Menu transitions never do.
   try{ready=swapped&&(prepared==null||prepared())&&!NativeTransitionProgress.Blocks(fieldBound,NativeGame.FieldPreparePending);if(swapped&&problem!=null)error=problem();if(swapped&&fieldBound&&string.IsNullOrEmpty(error))error=NativeTransitionProgress.Failure;}catch(Exception e){error=e.Message;}
   double now=Time.realtimeSinceStartupAsDouble;double delta=Math.Max(0,now-clockAt);clockAt=now;visualAt+=delta;
   bool assembling=fieldBound&&NativeTransitionProgress.Active;if(assembling)sawAssembly=true;
   float target=TransitionProgressBar.Target(sawAssembly,assembling,NativeTransitionProgress.Fraction,flow.Failed||!string.IsNullOrEmpty(entry.error),shownProgress);shownProgress=Mathf.MoveTowards(shownProgress,target,(float)delta*(assembling?.6f:3f));
   error=TransitionPrepareWatchdog.Advance(flow,watchdog,delta,ready,error,assembling,fieldBound?NativeTransitionProgress.Beats:0);NativeLobbyVideo.ApplyTransitionMix();
   if(flow.NeedsSwap)blackLatch.Request(Time.frameCount);if(flow.Failed)blackLatch.Cancel();
   if(blackLatch.TryConsume(Time.frameCount)){executing=true;try{entry.blackPaintedFrame=blackLatch.PresentedFrame;entry.swappedFrame=Time.frameCount;swap?.Invoke();swapped=true;entry.swapped=Time.realtimeSinceStartup;}catch(Exception e){error=e.ToString();flow.Tick(0,false,true);}finally{executing=false;swap=null;}}
   if(flow.Failed&&string.IsNullOrEmpty(error))error="prepare-failed";
   if(!string.IsNullOrEmpty(error)){
    // First reason wins and is logged once; the later frames of the same failed transition (fade in) cannot overwrite it.
    if(string.IsNullOrEmpty(entry.error)){entry.error=error;Debug.LogWarning("SCREEN_TRANSITION_RECOVER "+entry.boundary+" "+error);
     // Stalled or hard-capped preparation: stop the half-built 3D field and open in 2D (the existing 3D-failure path).
     if(fieldBound&&TransitionPrepareWatchdog.IsPrepareFailure(error))NativeGame.AbortFieldPrepare(error);}
    entry.failed=true;}
   if(flow.Failed)entry.failed=true;
   if(!flow.Busy){entry.finished=Time.realtimeSinceStartup;var callback=done;done=null;prepared=null;problem=null;if(!entry.cancelled)callback?.Invoke();}
  }
  string LoadingText(){if(labels==null){var data=Resources.Load<TextAsset>("Data/screen_transition_labels");if(data!=null)labels=JsonUtility.FromJson<Labels>(data.text);}string code=NativeGame.Instance==null?"en":NativeGame.Instance.GetComponent<NativeLobby>()?.Language??"en",english="";if(labels!=null&&labels.entries!=null)foreach(var row in labels.entries){if(row.code==code)return row.text;if(row.code=="en")english=row.text;}return english;}
  void Art(){if(sigil==null)sigil=Resources.Load<Texture2D>("Art/ui/silver_hell/gate_sigil_loading");if(embers==null)embers=Resources.Load<Texture2D>("Art/ui/silver_hell/gate_sigil_loading_embers");if(embers!=null&&(emberShadow==null||shadowHeight!=Screen.height)){if(emberShadow!=null)Destroy(emberShadow);shadowHeight=Screen.height;emberShadow=BuildEmberShadow(embers,Screen.height*.12f);}if(halo!=null)return;const int n=256;halo=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];Color[] stops={new Color(162/255f,19/255f,8/255f,.9f),new Color(133/255f,9/255f,3/255f,.55f),new Color(89/255f,4/255f,1/255f,.2f),new Color(60/255f,0,0,0)};float[] positions={0,.28f,.52f,.72f};for(int y=0;y<n;y++)for(int x=0;x<n;x++){float u=(x+.5f)/n*2-1,v=(y+.5f)/n*2-1,d=Mathf.Sqrt(u*u+v*v)/Mathf.Sqrt(2);Color c=stops[3];for(int s=0;s<3;s++)if(d<positions[s+1]){c=Color.Lerp(stops[s],stops[s+1],(d-positions[s])/(positions[s+1]-positions[s]));break;}px[y*n+x]=c;}halo.SetPixels(px);halo.Apply(false,true);}
  // CSS drop-shadow(0 0 2px rgba(143,19,12,.35)); cached in physical pixels, independent of viewport width.
  static Texture2D BuildEmberShadow(Texture2D source,float size){const int margin=6;int width=Mathf.CeilToInt(size)+margin*2;var alpha=new float[width*width];var horizontal=new float[width*width];var kernel=new float[13];float sum=0;for(int k=-6;k<=6;k++){kernel[k+6]=Mathf.Exp(-k*k/8f);sum+=kernel[k+6];}for(int k=0;k<13;k++)kernel[k]/=sum;for(int y=0;y<width;y++)for(int x=0;x<width;x++){float u=(x-margin+.5f)/size,v=(y-margin+.5f)/size;if(u>=0&&u<=1&&v>=0&&v<=1)alpha[y*width+x]=source.GetPixelBilinear(u,v).a;}for(int y=0;y<width;y++)for(int x=0;x<width;x++){float a=0;for(int k=-6;k<=6;k++){int sx=x+k;if(sx>=0&&sx<width)a+=alpha[y*width+sx]*kernel[k+6];}horizontal[y*width+x]=a;}var pixels=new Color[width*width];for(int y=0;y<width;y++)for(int x=0;x<width;x++){float a=0;for(int k=-6;k<=6;k++){int sy=y+k;if(sy>=0&&sy<width)a+=horizontal[sy*width+x]*kernel[k+6];}pixels[y*width+x]=new Color(143/255f,19/255f,12/255f,a*.35f);}var texture=new Texture2D(width,width,TextureFormat.RGBA32,false){name="R4 CSS 2px ember shadow",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};texture.SetPixels(pixels);texture.Apply(false,true);return texture;}
  void OnGUI(){if(!flow.Busy)return;var old=GUI.matrix;var tint=GUI.color;bool enabled=GUI.enabled;try{GUI.matrix=Matrix4x4.identity;GUI.depth=-1000000;GUI.enabled=true;GUI.color=new Color(0,0,0,(float)flow.Opacity);NativeUiAudit.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Texture2D.whiteTexture);
   float pulse=(float)TransitionPulse.At(visualAt);
   if(visualAt>=.3){Art();float size=Screen.height*.12f,margin=Mathf.Max(48,Screen.height*.045f);var box=new Rect(Screen.width-margin-size,Screen.height-margin-size,size,size);GUI.color=new Color(1,1,1,flow.Reduced?.3f:.25f+.15f*pulse);if(halo!=null)NativeUiAudit.DrawTexture(new Rect(box.x-size*.2f,box.y-size*.2f,size*1.4f,size*1.4f),halo);GUI.color=Color.white;if(sigil!=null)NativeUiAudit.DrawTexture(box,sigil);GUI.color=new Color(1,1,1,flow.Reduced?.3f:.12f+.63f*pulse);if(emberShadow!=null)NativeUiAudit.DrawTexture(new Rect(box.x-6,box.y-6,emberShadow.width,emberShadow.height),emberShadow);if(embers!=null)NativeUiAudit.DrawTexture(box,embers);NativeUiAudit.Region(box,"component","screen-loading-sigil","R4 same PNG·12vh·red-only pulse");}
   if(visualAt>=1&&shownProgress>0){
    // Silver Hell hairline under the loading label: track --sv-dk, fill --sv-lt with a --sv-hi head. No text, so nothing to translate.
    float right2=Mathf.Max(48,Screen.height*.045f),bottom2=Mathf.Max(24,Screen.height*.02f),thick=Mathf.Max(1,Mathf.Round(Screen.height/1080f)),width=Mathf.Max(160,Screen.height*.2f);
    var track=new Rect(Screen.width-right2-width,Screen.height-bottom2+6,width,thick);float fade=flow.Phase==ScreenTransitionPhase.FadeIn?(float)flow.Opacity:1,fill=Mathf.Clamp01(shownProgress);
    GUI.color=new Color(79/255f,83/255f,82/255f,.55f*fade);NativeUiAudit.DrawTexture(track,Texture2D.whiteTexture);
    if(fill>0){var done=new Rect(track.x,track.y,Mathf.Max(thick,width*fill),thick);GUI.color=new Color(201/255f,199/255f,195/255f,.85f*fade);NativeUiAudit.DrawTexture(done,Texture2D.whiteTexture);GUI.color=new Color(246/255f,245/255f,242/255f,fade);NativeUiAudit.DrawTexture(new Rect(done.xMax-Mathf.Min(done.width,Mathf.Max(6,width*.03f)),done.y,Mathf.Min(done.width,Mathf.Max(6,width*.03f)),thick),Texture2D.whiteTexture);}
    GUI.color=Color.white;NativeUiAudit.Region(new Rect(track.x,track.y-2,track.width,thick+4),"component","screen-loading-progress","silver hairline fill = real field assembly progress");}
   if(visualAt>=1){string text=LoadingText();var style=new GUIStyle(GUI.skin.label){font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(true),text),fontSize=12,alignment=TextAnchor.MiddleRight,padding=new RectOffset(),margin=new RectOffset()};style.normal.textColor=new Color(223/255f,214/255f,194/255f,.8f);GUI.color=Color.white;float right=Mathf.Max(48,Screen.height*.045f),bottom=Mathf.Max(24,Screen.height*.02f);NativeSilverHellUi.Label(new Rect(0,Screen.height-bottom-18,Screen.width-right,18),text,style);}
   if(Event.current.type==EventType.Repaint)blackLatch.Paint(Time.frameCount,flow.Opacity);
   if(Event.current.isKey||Event.current.isMouse||Event.current.type==EventType.ScrollWheel)Event.current.Use();
  }finally{GUI.matrix=old;GUI.color=tint;GUI.enabled=enabled;}}
  void OnDestroy(){if(halo!=null)Destroy(halo);if(emberShadow!=null)Destroy(emberShadow);if(current==this)current=null;}
 }
}
