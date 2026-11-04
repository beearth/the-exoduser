using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // P31/P32: the Mouse Cursor card (dark red / dark purple) and the Cursor Size slider reach the real pointer through Cursor.SetCursor.
 // Textures are RGBA32 without mips and are built from the shipped PNG data, so they do not depend on importer settings. Missing data keeps the system cursor.
 public static class NativeCursorOption
 {
  static readonly Texture2D[] cache=new Texture2D[NativeCursorSteps.Kinds.Length*NativeCursorSteps.Steps.Length];
  static int appliedKind=-1,appliedStep=-1;
  public static int AppliedKind{get{return appliedKind;}}
  public static int AppliedStep{get{return appliedStep;}}
  static Texture2D Load(int kind,int step)
  {
   int slot=kind*NativeCursorSteps.Steps.Length+System.Array.IndexOf(NativeCursorSteps.Steps,step);
   if(slot<0)return null;if(cache[slot]!=null)return cache[slot];
   var data=Resources.Load<TextAsset>(NativeCursorSteps.ResourcePath(kind,step));if(data==null)return null;
   var tex=new Texture2D(2,2,TextureFormat.RGBA32,false){name="cursor_"+kind+"_"+step,filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
   if(!tex.LoadImage(data.bytes,false)){Object.Destroy(tex);return null;}
   cache[slot]=tex;return tex;
  }
  public static void Apply(NativeOptionSet options)
  {
   if(options==null||Application.isBatchMode)return;   // automated runs keep the default pointer
   int kind=Mathf.Clamp(options.Get("cursor"),0,NativeCursorSteps.Kinds.Length-1),step=NativeCursorSteps.StepFor(options.Get("cursorSize"));
   if(kind==appliedKind&&step==appliedStep)return;
   var tex=Load(kind,step);if(tex==null)return;
   int hx,hy;NativeCursorSteps.Hotspot(step,out hx,out hy);
   Cursor.SetCursor(tex,new Vector2(hx,hy),CursorMode.Auto);appliedKind=kind;appliedStep=step;
  }
 }
}
