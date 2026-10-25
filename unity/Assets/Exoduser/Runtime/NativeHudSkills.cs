using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeHud {
  public Action<int> SlotSelected;
  GUIStyle skillStatus;
  float statusSelectionUntil;
  public static bool StatusShouldDisplay(bool hovering,bool charging,bool selectionActive){return hovering||charging||selectionActive;}
  public static Rect SkillSlotRect(NativeHudDockLayout dock,int index){float s=NativeHudDockLayout.ArtScale;return new Rect(dock.SlotBar.x+(128+44*index)*s,dock.SlotBar.y+70*s,37*s,77*s);}
  // Normal bottom-origin screen input -> the same scaled HUD space used for drawing.
  public static bool PointerOverSlots(Vector3 screenPoint){float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);var point=new Vector2(screenPoint.x/s,(Screen.height-screenPoint.y)/s);var dock=NativeHudDockLayout.Create(Screen.width/s,Screen.height/s);for(int i=0;i<13;i++)if(SkillSlotRect(dock,i).Contains(point))return true;return false;}
  void DrawSkillSlots(NativeHudDockLayout dock,float width,float height,Simulation simulation){
   for(int i=0;i<13;i++){
    var rect=SkillSlotRect(dock,i);
    if(i!=6){var old=GUI.color;GUI.color=new Color(.5f,.47f,.40f,.7f);GUI.Label(new Rect(rect.x,rect.y+4,rect.width,25),"—",keyLabel);GUI.color=old;}
    if(GUI.Button(rect,"",GUIStyle.none)){statusSelectionUntil=i==6?Time.unscaledTime+1.6f:0;SlotSelected?.Invoke(i);}
   }
   if(simulation==null)return;
   if(skillStatus==null){skillStatus=new GUIStyle(keyLabel){fontSize=14,alignment=TextAnchor.MiddleCenter};skillStatus.normal.textColor=new Color(.74f,.69f,.59f);}
   string name=simulation.Config.ActiveAttack=="kiSlash"?"기검참":"기본 무기";
   var statusRect=DockStatusRect(dock,width);
   var oldColor=GUI.color;
   bool showStatus=StatusShouldDisplay(SkillSlotRect(dock,6).Contains(Event.current.mousePosition),simulation.Player.KiChargeActive,Time.unscaledTime<statusSelectionUntil);
   if(showStatus){
    GUI.Label(statusRect,name+" · ST "+SkillUiState.StaminaCost(simulation)+" · "+SkillUiState.Status(simulation)+" [K]",skillStatus);
    if(simulation.Player.KiChargeActive){var chargeRect=new Rect(width*.5f-80,statusRect.y-4,160,2);GUI.color=new Color(.18f,.20f,.21f,.8f);GUI.DrawTexture(chargeRect,Texture2D.whiteTexture);GUI.color=new Color(.55f,.72f,.78f,.9f);GUI.DrawTexture(new Rect(chargeRect.x,chargeRect.y,chargeRect.width*Mathf.Clamp01(simulation.Player.KiChargeTicks/120),chargeRect.height),Texture2D.whiteTexture);}
   }
   GUI.color=oldColor;
  }
 }
}
