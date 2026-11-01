using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort
{
 internal static class NativeLoadingSelection
 {
  static readonly int[] ids={1,2,3,4,5,6,7,8,9,10,11,12,15,16,18,19};
  internal static readonly IReadOnlyList<int> Images=Array.AsReadOnly(ids);
  internal static bool IsAllowed(int id){return Array.IndexOf(ids,id)>=0;}
  internal static int ForStage(int stage){int n=stage%ids.Length;return ids[n<0?n+ids.Length:n];}
 }
 internal static class NativeLoadingTips
 {
  internal const int Count=4;
  // Approved afcb game.html _LOAD_TIPS entries 10/11/13/14; only already-ported Native capabilities.
  static readonly string[] ko={"보스의 패턴을 읽으면 패링 타이밍이 보인다","인벤토리(TAB)에서 장비를 비교하고 장착","R키로 아이템 수거","물약은 설정한 HP% 이하에서 자동 사용"};
  static readonly string[] en={"Read boss patterns and the parry timing shows","TAB for inventory — compare and equip gear","Press R to collect items","Potions auto-use when HP falls below set %"};
  internal static int FontPixels(float height){return (int)Math.Round(Math.Max(11,Math.Min(16,height*.0125f)),MidpointRounding.AwayFromZero);}
  internal static string Pick(int stage,bool english,string inventoryKey,string pickupKey)
  {
   int i=(stage%Count+Count)%Count;if(i==1&&string.IsNullOrEmpty(inventoryKey)||i==2&&string.IsNullOrEmpty(pickupKey))i=0;string text=(english?en:ko)[i];
   if(i==1)text=text.Replace("TAB",inventoryKey??"—");
   if(i==2)text=english?text.Replace(" R "," "+(pickupKey??"—")+" "):text.Replace("R키",(pickupKey??"—")+"키");
   return "◆ "+text;
  }
 }
}
