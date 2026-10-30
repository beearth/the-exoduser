using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 // A15: web OPT values that this host can honour right now (shake, brightness, FPS counter, pickup filter, difficulty at run start).
 // The rest are stored under the same web names so they travel with the settings file.
 public sealed partial class NativeGame
 {
  float fpsShown,fpsTimer;int fpsFrames;
  void OnSettingsOptionChanged(string key)
  {
   QueueSettingsSave();ApplySettingsOptions();
   if(key=="preset")settingsDirtyPresetNote=true;
  }
  bool settingsDirtyPresetNote;
  void ApplySettingsOptions()
  {
   if(Simulation==null||settings==null)return;
   Simulation.MinPickRarity=settings.Options.Get("minPickRar");Simulation.MinPickLevelTier=settings.Options.Get("minPickLvTier");
    if(Simulation.CrossbowAuto!=settings.Options.Check("xbowAuto"))Simulation.ToggleCrossbowAuto();
  }
  // game.html shake(): G.shake = n * OPT.shake / 100.
  float OptionShakeScale{get{return settings==null?1f:settings.Options.Get("shake")/100f;}}
  string SettingsDiagLine(int i)
  {
   switch(i){
    case 0:return SystemInfo.graphicsDeviceName;
    case 1:return SystemInfo.graphicsDeviceType+" "+SystemInfo.graphicsDeviceVersion;
    case 2:return "—";
    default:return fpsShown>0?fpsShown.ToString("0"):"…";
   }
  }
  void DrawSettingsOverlays()
  {
   if(settings==null)return;
   fpsFrames++;fpsTimer+=Time.unscaledDeltaTime;if(fpsTimer>=.5f){fpsShown=fpsFrames/fpsTimer;fpsFrames=0;fpsTimer=0;}
   if(Event.current.type!=EventType.Repaint)return;
   var old=GUI.matrix;GUI.matrix=Matrix4x4.identity;
   int b=settings.Options.Get("brightness");
   if(b<100)Fill(new Rect(0,0,Screen.width,Screen.height),new Color(0,0,0,(100-b)/100f));
   else if(b>100)Fill(new Rect(0,0,Screen.width,Screen.height),new Color(1,1,1,(b-100)/100f*.5f));
   if(settings.Options.Check("showFps")){
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*s)/2,(Screen.height-1080*s)/2,0),Quaternion.identity,Vector3.one*s);
    var st=new GUIStyle(GUI.skin.label){fontSize=16,fontStyle=FontStyle.Bold};st.normal.textColor=new Color(.53f,1f,.53f);
    NativeUiAudit.Label(new Rect(14,10,200,24),"FPS "+fpsShown.ToString("0"),st);
   }
   GUI.matrix=old;
  }
 }
}
