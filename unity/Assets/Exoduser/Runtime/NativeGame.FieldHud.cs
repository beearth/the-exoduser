using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  NativeFieldHud fieldHud;
  int cpTick=-1,cpLevel=-1,cpEquipSig,cpValue;
  int EquipSignature(){unchecked{int h=17;var eq=inventory.State.Equipped;for(int i=0;i<eq.Length;i++)h=h*31+(eq[i]==null?0:System.Runtime.CompilerServices.RuntimeHelpers.GetHashCode(eq[i]));return h;}}
  void DrawFieldHud(float hudWidth)
  {
   if(Simulation==null||Map==null)return;if(fieldHud==null)fieldHud=new NativeFieldHud();
   var p=Simulation.Player;int level=p.Level,cp=0;
   // PERF-U7: the full stat + combat-power calculation ran on every OnGUI event (Layout, Repaint, input). Recompute only when the simulation tick,
   // the level or the equipped item set changes; inventory / forge windows hide this HUD, so a change made there shows by the next tick.
   int equipSig=EquipSignature();
   if(Simulation.TickCount!=cpTick||level!=cpLevel||equipSig!=cpEquipSig){cpTick=Simulation.TickCount;cpLevel=level;cpEquipSig=equipSig;cpValue=0;
    try{var stats=inventory.State.CalculateStats(level);cpValue=InventoryCombatPower.Calculate(inventory.State,stats,level).Total;}catch(System.Exception){}}
   cp=cpValue;
   var flow=Simulation.Stage;int total=flow!=null?flow.TotalSpawned:0;
   fieldHud.Draw(hudWidth,new NativeFieldHud.Info{map=Map,sim=Simulation,statPoints=p.StatPoints,passivePoints=p.PassivePoints,combatPower=cp,progress=Simulation.Regions!=null?Simulation.RegionClearedCount()/4f:(total>0?Mathf.Min(1f,flow.StageKills/(float)total):0f),   // web 60602: bar = cleared regions / 4
english=lobby.Language!="ko"});
  }
 }
}
