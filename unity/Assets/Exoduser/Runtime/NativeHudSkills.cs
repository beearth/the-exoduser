using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeHud {
  public Action<int> SlotSelected;
  GUIStyle skillStatus;
  public static Rect SkillSlotRect(NativeHudDockLayout dock,int index){float s=NativeHudDockLayout.ArtScale;return new Rect(dock.SlotBar.x+(128+44*index)*s,dock.SlotBar.y+70*s,37*s,77*s);}
  // Normal bottom-origin screen input -> the same scaled HUD space used for drawing.
  public static bool PointerOverSlots(Vector3 screenPoint){float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);var point=new Vector2(screenPoint.x/s,(Screen.height-screenPoint.y)/s);var dock=NativeHudDockLayout.Create(Screen.width/s,Screen.height/s);for(int i=0;i<13;i++)if(SkillSlotRect(dock,i).Contains(point))return true;return false;}
  void DrawSkillSlots(NativeHudDockLayout dock,float width,float height,Simulation simulation){
   for(int i=0;i<13;i++){
    var rect=SkillSlotRect(dock,i);
    if(i!=6){var old=GUI.color;GUI.color=new Color(.5f,.47f,.40f,.7f);GUI.Label(new Rect(rect.x,rect.y+4,rect.width,25),"—",keyLabel);GUI.color=old;}
    if(GUI.Button(rect,"",GUIStyle.none))SlotSelected?.Invoke(i);
   }
   if(simulation==null)return;
   if(skillStatus==null){skillStatus=new GUIStyle(keyLabel){fontSize=18,alignment=TextAnchor.MiddleCenter};}
   string name=simulation.Config.ActiveAttack=="kiSlash"?"기검참":"기본 무기";
   var statusRect=new Rect(width/2-270,dock.SlotBar.y-18,540,30);
   var oldColor=GUI.color;GUI.color=new Color(.025f,.026f,.024f,.92f);GUI.DrawTexture(statusRect,Texture2D.whiteTexture);GUI.color=oldColor;
   GUI.Label(statusRect,name+" · ST "+SkillUiState.StaminaCost(simulation)+" · "+SkillUiState.Status(simulation)+"    [K]",skillStatus);
   if(simulation.Player.KiChargeActive){var barRect=new Rect(statusRect.x,statusRect.yMax,540,5);GUI.color=new Color(.12f,.16f,.2f);GUI.DrawTexture(barRect,Texture2D.whiteTexture);GUI.color=new Color(.55f,.80f,1);GUI.DrawTexture(new Rect(barRect.x,barRect.y,barRect.width*Mathf.Clamp01(simulation.Player.KiChargeTicks/120),barRect.height),Texture2D.whiteTexture);GUI.color=oldColor;}
  }
 }
}
