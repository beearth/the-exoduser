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
  double clockAt;Texture2D sigil,embers,halo;Labels labels;
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
   c.clockAt=Time.realtimeSinceStartupAsDouble;c.flow.Begin(reduced);c.blackLatch.Cancel();c.swap=onBlack;c.done=onDone;c.prepared=ready;c.problem=error;c.swapped=false;c.entry=new TransitionRecord{id=++nextId,boundary=boundary,started=Time.realtimeSinceStartup};c.history.Add(c.entry);if(c.history.Count>128)c.history.RemoveAt(0);return c.entry.id;
  }
  internal static bool Cancel(int id){if(current==null||!current.flow.Busy||current.entry.id!=id)return false;current.entry.cancelled=true;current.blackLatch.Cancel();current.swap=null;current.done=null;current.prepared=null;current.problem=null;current.flow.Cancel();return true;}
  void Update(){NativeLobbyVideo.ApplyTransitionMix();if(!flow.Busy)return;bool ready=false;string error=null;try{ready=swapped&&(prepared==null||prepared());if(swapped&&problem!=null)error=problem();}catch(Exception e){error=e.Message;}
   double now=Time.realtimeSinceStartupAsDouble;double delta=Math.Max(0,now-clockAt);clockAt=now;flow.Tick(delta,ready,!string.IsNullOrEmpty(error));NativeLobbyVideo.ApplyTransitionMix();
   if(flow.NeedsSwap)blackLatch.Request(Time.frameCount);if(flow.Failed)blackLatch.Cancel();
   if(blackLatch.TryConsume(Time.frameCount)){executing=true;try{entry.blackPaintedFrame=blackLatch.PresentedFrame;entry.swappedFrame=Time.frameCount;swap?.Invoke();swapped=true;entry.swapped=Time.realtimeSinceStartup;}catch(Exception e){error=e.ToString();flow.Tick(0,false,true);}finally{executing=false;swap=null;}}
   if(!string.IsNullOrEmpty(error)){entry.error=error;entry.failed=true;Debug.LogWarning("SCREEN_TRANSITION_RECOVER "+entry.boundary+" "+error);}
   if(flow.Failed)entry.failed=true;
   if(!flow.Busy){entry.finished=Time.realtimeSinceStartup;var callback=done;done=null;prepared=null;problem=null;if(!entry.cancelled)callback?.Invoke();}
  }
  string LoadingText(){if(labels==null){var data=Resources.Load<TextAsset>("Data/screen_transition_labels");if(data!=null)labels=JsonUtility.FromJson<Labels>(data.text);}string code=NativeGame.Instance==null?"en":NativeGame.Instance.GetComponent<NativeLobby>()?.Language??"en",english="";if(labels!=null&&labels.entries!=null)foreach(var row in labels.entries){if(row.code==code)return row.text;if(row.code=="en")english=row.text;}return english;}
  void Art(){if(sigil==null)sigil=Resources.Load<Texture2D>("Art/ui/silver_hell/gate_sigil_loading");if(embers==null)embers=Resources.Load<Texture2D>("Art/ui/silver_hell/gate_sigil_loading_embers");if(halo!=null)return;const int n=256;halo=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];Color[] stops={new Color(162/255f,19/255f,8/255f,.9f),new Color(133/255f,9/255f,3/255f,.55f),new Color(89/255f,4/255f,1/255f,.2f),new Color(60/255f,0,0,0)};float[] positions={0,.28f,.52f,.72f};for(int y=0;y<n;y++)for(int x=0;x<n;x++){float u=(x+.5f)/n*2-1,v=(y+.5f)/n*2-1,d=Mathf.Sqrt(u*u+v*v)/Mathf.Sqrt(2);Color c=stops[3];for(int s=0;s<3;s++)if(d<positions[s+1]){c=Color.Lerp(stops[s],stops[s+1],(d-positions[s])/(positions[s+1]-positions[s]));break;}px[y*n+x]=c;}halo.SetPixels(px);halo.Apply(false,true);}
  void OnGUI(){if(!flow.Busy)return;var old=GUI.matrix;var tint=GUI.color;bool enabled=GUI.enabled;try{GUI.matrix=Matrix4x4.identity;GUI.depth=-1000000;GUI.enabled=true;GUI.color=new Color(0,0,0,(float)flow.Opacity);NativeUiAudit.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Texture2D.whiteTexture);
   if(flow.ShowSigil){Art();float size=Screen.height*.12f,margin=Mathf.Max(48,Screen.height*.045f);var box=new Rect(Screen.width-margin-size,Screen.height-margin-size,size,size);GUI.color=new Color(1,1,1,(float)flow.HaloOpacity);if(halo!=null)NativeUiAudit.DrawTexture(new Rect(box.x-size*.2f,box.y-size*.2f,size*1.4f,size*1.4f),halo);GUI.color=Color.white;if(sigil!=null)NativeUiAudit.DrawTexture(box,sigil);GUI.color=new Color(1,1,1,(float)flow.EmberOpacity);if(embers!=null)NativeUiAudit.DrawTexture(box,embers);NativeUiAudit.Region(box,"component","screen-loading-sigil","R4 same PNG·12vh·red-only pulse");}
   if(flow.ShowLabel){string text=LoadingText();var style=new GUIStyle(GUI.skin.label){font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(true),text),fontSize=12,alignment=TextAnchor.MiddleRight,padding=new RectOffset(),margin=new RectOffset()};style.normal.textColor=new Color(223/255f,214/255f,194/255f,.8f);GUI.color=Color.white;float right=Mathf.Max(48,Screen.height*.045f),bottom=Mathf.Max(24,Screen.height*.02f);NativeSilverHellUi.Label(new Rect(0,Screen.height-bottom-18,Screen.width-right,18),text,style);}
   if(Event.current.type==EventType.Repaint)blackLatch.Paint(Time.frameCount,flow.Opacity);
   if(Event.current.isKey||Event.current.isMouse||Event.current.type==EventType.ScrollWheel)Event.current.Use();
  }finally{GUI.matrix=old;GUI.color=tint;GUI.enabled=enabled;}}
  void OnDestroy(){if(halo!=null)Destroy(halo);if(current==this)current=null;}
 }
}
