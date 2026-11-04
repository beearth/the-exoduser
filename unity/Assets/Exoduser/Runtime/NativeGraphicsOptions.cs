using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 // P18: the graphics settings that have a real Unity effect (see NativeGraphicsPolicy). Default values (everything on, scale 100) never touch the scene: the screen is the same as before.
 // Only the OFF side changes anything, and every change is remembered and put back when the setting is switched on again.
 public static class NativeGraphicsOptions
 {
  public static bool Fog{get;private set;}=true;
  public static bool Trail{get;private set;}=true;
  public static bool Slash{get;private set;}=true;
  static readonly Dictionary<Volume,float> savedWeight=new Dictionary<Volume,float>();
  static readonly Dictionary<Bloom,bool> savedBloom=new Dictionary<Bloom,bool>();
  static bool fogSuppressed,fogSaved,scaleSaved,quitHooked;
  static float savedScale=1f;
  static int sinceScan;
  const int ScanFrames=30;
  public static void Apply(NativeOptionSet o)
  {
   if(o==null||Application.isBatchMode)return;
   Hook();
   Trail=o.Check("trail");Slash=o.Check("slash");Fog=o.Check("fog");
   ApplyRenderScale(o.Get("resScale"));
   ApplyVolumes(o.Check("postfx"),o.Check("bloom"));
   ApplyFog(Fog);sinceScan=0;
  }
  // Scene code (area changes, the death filter) may add volumes or switch fog on again: look again twice a second while a setting is off.
  public static void Tick(NativeOptionSet o)
  {
   if(o==null||Application.isBatchMode)return;
   bool idle=o.Check("postfx")&&o.Check("bloom")&&o.Check("fog")&&savedWeight.Count==0&&savedBloom.Count==0&&!fogSuppressed;
   if(idle||++sinceScan<ScanFrames)return;
   sinceScan=0;ApplyVolumes(o.Check("postfx"),o.Check("bloom"));ApplyFog(o.Check("fog"));
  }
  static void Hook(){if(quitHooked)return;quitHooked=true;Application.quitting+=RestoreAll;}
  public static void RestoreAll()
  {
   RestoreVolumes();ApplyFog(true);
   if(scaleSaved){var a=UniversalRenderPipeline.asset;if(a!=null)a.renderScale=savedScale;scaleSaved=false;}
  }
  static void ApplyRenderScale(int percent)
  {
   var asset=UniversalRenderPipeline.asset;if(asset==null)return;
   if(!scaleSaved){if(percent>=100)return;savedScale=asset.renderScale;scaleSaved=true;}
   asset.renderScale=percent>=100?savedScale:savedScale*NativeGraphicsPolicy.RenderScale(percent);
  }
  static void RestoreVolumes()
  {
   foreach(var kv in savedWeight)if(kv.Key!=null&&kv.Key.weight==0f)kv.Key.weight=kv.Value;
   savedWeight.Clear();
   foreach(var kv in savedBloom)if(kv.Key!=null)kv.Key.active=kv.Value;
   savedBloom.Clear();
  }
  static void ApplyVolumes(bool post,bool bloom)
  {
   if(post&&bloom){RestoreVolumes();return;}
   foreach(var v in Object.FindObjectsByType<Volume>(FindObjectsSortMode.None))
   {
    if(!post){if(!savedWeight.ContainsKey(v))savedWeight[v]=v.weight;v.weight=0f;}
    else{float w;if(savedWeight.TryGetValue(v,out w)){if(v.weight==0f)v.weight=w;savedWeight.Remove(v);}}
    var profile=v.profile;Bloom b;
    if(profile!=null&&profile.TryGet(out b))
    {
     if(!bloom){if(!savedBloom.ContainsKey(b))savedBloom[b]=b.active;b.active=false;}
     else{bool a;if(savedBloom.TryGetValue(b,out a)){b.active=a;savedBloom.Remove(b);}}
    }
   }
  }
  // Fog off removes RenderSettings fog and the HellFogFeature pass (it reads Fog). Fog can only add haze, so this never hides an enemy.
  static void ApplyFog(bool on)
  {
   if(!on){if(!fogSuppressed){fogSaved=RenderSettings.fog;fogSuppressed=true;}else if(RenderSettings.fog)fogSaved=true;RenderSettings.fog=false;}
   else if(fogSuppressed){RenderSettings.fog=fogSaved;fogSuppressed=false;}
  }
 }
}
