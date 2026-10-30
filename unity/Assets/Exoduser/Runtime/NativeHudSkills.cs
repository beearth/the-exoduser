using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeHud {
  public Action<int> SlotSelected;
  public bool TracePointerEvents;
  GUIStyle skillStatus;
  float statusSelectionUntil;
  public static bool StatusShouldDisplay(bool hovering,bool charging,bool selectionActive){return hovering||charging||selectionActive;}
  public static Rect SkillSlotRect(NativeHudDockLayout dock,int index){return dock.SlotRect(index);}
  // Normal bottom-origin screen input -> the same scaled HUD space used for drawing.
  public static bool PointerOverSlots(Vector3 screenPoint){float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);var point=new Vector2(screenPoint.x/s,(Screen.height-screenPoint.y)/s);var dock=NativeHudDockLayout.Create(Screen.width/s,Screen.height/s);for(int i=0;i<13;i++)if(SkillSlotRect(dock,i).Contains(point))return true;return false;}
  GUIStyle rageText;
  // Web updateHUD (28534-28547): the Space (rage burst) slot gets a red fill rising from the bottom (height = rage / _rageMax) with the raw "N%" at the top,
  // a border that warms at 50 / 100 and an inner glow at 100. Nothing is drawn while rage is 0.
  public static Color RageBorder(double rage){return rage>=100?new Color(1f,.133f,0):rage>=50?new Color(.8f,.267f,0):new Color(.533f,.267f,0);}
  public static float RageFill(double rage,double max){return max>0?(float)Math.Min(100,rage*100/max)/100f:0;}
  void DrawRageSlot(Rect slot,Simulation simulation){
   double rage=simulation.Rage;if(!(rage>0))return;
   if(rageText==null){rageText=new GUIStyle(keyLabel){fontSize=13,fontStyle=FontStyle.Normal,alignment=TextAnchor.UpperCenter};}
   var old=GUI.color;float fill=RageFill(rage,simulation.RageMaximum);
   GUI.color=new Color(1f,.078f,0,.45f);NativeUiAudit.DrawTexture(new Rect(slot.x,slot.yMax-slot.height*fill,slot.width,slot.height*fill),Texture2D.whiteTexture);
   GUI.color=RageBorder(rage);const float b=2;
   NativeUiAudit.DrawTexture(new Rect(slot.x,slot.y,slot.width,b),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(slot.x,slot.yMax-b,slot.width,b),Texture2D.whiteTexture);
   NativeUiAudit.DrawTexture(new Rect(slot.x,slot.y,b,slot.height),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(slot.xMax-b,slot.y,b,slot.height),Texture2D.whiteTexture);
   if(rage>=100){GUI.color=new Color(1f,.118f,0,.6f);const float g=5;NativeUiAudit.DrawTexture(new Rect(slot.x+b,slot.y+b,slot.width-2*b,g),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(slot.x+b,slot.yMax-b-g,slot.width-2*b,g),Texture2D.whiteTexture);}
   string label=Math.Truncate(rage).ToString("0")+"%";
   GUI.color=new Color(.4f,0,0,.9f);NativeSilverHellUi.Label(new Rect(slot.x+1,slot.y+3,slot.width,slot.height),label,rageText);
   GUI.color=Color.white;NativeSilverHellUi.Label(new Rect(slot.x,slot.y+2,slot.width,slot.height),label,rageText);
   GUI.color=old;
  }
  // B03: dock slot -> equipped skill (0..3 = keys 1-4, 4 = F, 5 = Z, 7 = 마법/RMB, 8 = Shift, 9 = 칼등/E, 10 = Q, 11 = Ctrl, 12 = Space; web _slotSkId: RMB maliceSwipe / Shift charge / Q parry are fixed unless re-slotted); the LMB slot keeps its own kiSlash drawing
  public static string SlotSkillId(Simulation s,int index){
   return SkillDockBinding.SkillForDock(s,index);
  }
  readonly System.Collections.Generic.Dictionary<string,Texture2D> slotIcons=new System.Collections.Generic.Dictionary<string,Texture2D>();
  GUIStyle cooldownText;
  // web updateQS: the slot shows the skill icon with a dark sweep that shrinks as the cooldown runs out and the remaining seconds
  void DrawSlotSkill(Rect slot,string id,Simulation s){
   Texture2D tex;if(!slotIcons.TryGetValue(id,out tex)){tex=Resources.Load<Texture2D>("Art/ui/skill_icons/orb/"+id);slotIcons[id]=tex;}
   const float scale=NativeHudDockLayout.ArtScale;
   if(tex!=null){var inset=new Rect(slot.x+3*scale,slot.y+3*scale,slot.width-6*scale,slot.height-6*scale);NativeUiAudit.DrawTexture(inset,tex,ScaleMode.ScaleToFit,true);}
   float total;float cd=s.SkillCooldown(id,out total);
   if(cd>0&&total>0){
    var old=GUI.color;float frac=Mathf.Clamp01(cd/total);GUI.color=new Color(0,0,0,.62f);NativeUiAudit.DrawTexture(new Rect(slot.x,slot.yMax-slot.height*frac,slot.width,slot.height*frac),Texture2D.whiteTexture);
    if(cooldownText==null){cooldownText=new GUIStyle(keyLabel){fontSize=15,fontStyle=FontStyle.Normal,alignment=TextAnchor.MiddleCenter};}
    GUI.color=new Color(217/255f,214/255f,208/255f,1f);NativeSilverHellUi.Label(slot,Mathf.CeilToInt(cd/60f).ToString(),cooldownText);GUI.color=old;
   }
  }
  // Web updateHUD (60406): a 3 px bar along the bottom of the Shift slot, width = _harpGauge / _HARP_GAUGE_MAX, #44ffaa full / #88ccff from half / #ff8844 below
  public static Color ChainGaugeColor(double pct){return pct>=1?new Color(.267f,1f,.667f):pct>=.5f?new Color(.533f,.8f,1f):new Color(1f,.533f,.267f);}
  void DrawChainGauge(Rect slot,Simulation s){
   double max=s.HarpGaugeMax;if(!(max>0))return;float pct=(float)Math.Min(1,s.HarpGauge/max);
   var old=GUI.color;GUI.color=ChainGaugeColor(pct);NativeUiAudit.DrawTexture(new Rect(slot.x,slot.yMax-3*NativeHudDockLayout.ArtScale,slot.width*pct,3*NativeHudDockLayout.ArtScale),Texture2D.whiteTexture);GUI.color=old;
  }
  void DrawSkillSlots(NativeHudDockLayout dock,float width,float height,Simulation simulation){
   if(TracePointerEvents&&(Event.current.type==EventType.MouseDown||Event.current.type==EventType.MouseUp)){
    int eventHit=-1,screenHit=-1;Vector2 guiPoint=Event.current.mousePosition;float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);Vector2 screenPoint=new Vector2(ExoInput.MousePosition.x/scale,(Screen.height-ExoInput.MousePosition.y)/scale);
    for(int i=0;i<13;i++){var r=SkillSlotRect(dock,i);if(eventHit<0&&r.Contains(guiPoint))eventHit=i;if(screenHit<0&&r.Contains(screenPoint))screenHit=i;}
    Debug.Log("[HUD POINTER TRACE] type="+Event.current.type+" button="+Event.current.button+" eventPos="+guiPoint+" inputScreen="+ExoInput.MousePosition+" screenAsGui="+screenPoint+" eventSlot="+eventHit+" screenSlot="+screenHit+" screen="+Screen.width+"x"+Screen.height+" matrix="+GUI.matrix+" enabled="+GUI.enabled+" depth="+GUI.depth);
   }
   for(int i=0;i<13;i++){
    var rect=SkillSlotRect(dock,i);
    string slotSkill=simulation!=null?SlotSkillId(simulation,i):null;
    if(slotSkill!=null)DrawSlotSkill(rect,slotSkill,simulation);
    else if(i!=6){var old=GUI.color;GUI.color=new Color(118/255f,121/255f,121/255f,.7f);NativeSilverHellUi.Label(new Rect(rect.x,rect.y+4,rect.width,25),"—",keyLabel);GUI.color=old;}
    if(NativeSilverHellUi.Button(rect,"",GUIStyle.none)){statusSelectionUntil=i==6?Time.unscaledTime+1.6f:0;SlotSelected?.Invoke(i);}
   }
   if(simulation==null)return;
   DrawRageSlot(SkillSlotRect(dock,12),simulation);
   DrawChainGauge(SkillSlotRect(dock,8),simulation);
   if(skillStatus==null){skillStatus=new GUIStyle(keyLabel){fontSize=14,alignment=TextAnchor.MiddleCenter};skillStatus.normal.textColor=new Color(175/255f,178/255f,178/255f);}
   string name=simulation.Config.ActiveAttack=="kiSlash"?"기검참":"기본 무기";
   var statusRect=DockStatusRect(dock,width);
   var oldColor=GUI.color;
   bool showStatus=StatusShouldDisplay(SkillSlotRect(dock,6).Contains(Event.current.mousePosition),simulation.Player.KiChargeActive,Time.unscaledTime<statusSelectionUntil);
   if(showStatus){
    string statusText=name+" · ST "+SkillUiState.StaminaCost(simulation)+" · "+SkillUiState.Status(simulation)+" [K]";
    float fitWidth=Mathf.Max(360,skillStatus.CalcSize(new GUIContent(statusText)).x+12);statusRect.x=width*.5f-fitWidth*.5f;statusRect.width=fitWidth;
    NativeSilverHellUi.ActionPlate(new Rect(statusRect.x-10,statusRect.y-8,statusRect.width+20,36),false,0,false,20,4);
    NativeSilverHellUi.Label(statusRect,statusText,skillStatus);
    if(simulation.Player.KiChargeActive){var chargeRect=new Rect(width*.5f-80,statusRect.y-4,160,2);GUI.color=new Color(.18f,.20f,.21f,.8f);NativeUiAudit.DrawTexture(chargeRect,Texture2D.whiteTexture);GUI.color=new Color(.55f,.72f,.78f,.9f);NativeUiAudit.DrawTexture(new Rect(chargeRect.x,chargeRect.y,chargeRect.width*Mathf.Clamp01(simulation.Player.KiChargeTicks/120),chargeRect.height),Texture2D.whiteTexture);}
   }
   GUI.color=oldColor;
  }
 }
}
