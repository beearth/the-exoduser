using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  NativeFieldHud fieldHud;
  void DrawFieldHud(float hudWidth)
  {
   if(Simulation==null||Map==null)return;if(fieldHud==null)fieldHud=new NativeFieldHud();
   var p=Simulation.Player;int level=p.Level,cp=0;
   try{var stats=inventory.State.CalculateStats(level);cp=InventoryCombatPower.Calculate(inventory.State,stats,level).Total;}catch(System.Exception){}
   var flow=Simulation.Stage;int total=flow!=null?flow.TotalSpawned:0;
   fieldHud.Draw(hudWidth,new NativeFieldHud.Info{map=Map,sim=Simulation,statPoints=p.StatPoints,passivePoints=p.PassivePoints,combatPower=cp,progress=total>0?Mathf.Min(1f,flow.StageKills/(float)total):0f,english=lobby.Language!="ko"});
  }
 }
}
