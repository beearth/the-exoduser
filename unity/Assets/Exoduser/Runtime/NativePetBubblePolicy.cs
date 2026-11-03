using System;
using System.Text.RegularExpressions;

namespace Exoduser.UnityPort
{
 public static class NativePetBubblePolicy
 {
  // G.bossAlive is zone-local on web. Stage.BossAlive also means "not yet spawned" in Unity,
  // so the "not a boss fight" test is the arena flag; elapsed is the cumulative stage-0 field time of the run.
  public static bool EnvironmentReady(float elapsed,bool inArena)=>elapsed>30&&!inArena;
  public static bool BossReady(bool inArena,bool actorPresent,bool actorAlive)=>inArena&&actorPresent&&actorAlive;
 }
 public static class NativePetBubbleHints
 {
  static readonly Regex tokens=new Regex(@"\b(Shift|Space|Q|E|X|F|R|Z|TAB|LMB|RMB|Left[- ]?click|Right[- ]?click)\b|좌클릭|우클릭|쉬프트|스페이스",RegexOptions.IgnoreCase|RegexOptions.CultureInvariant);
  public static string Resolve(string text,Func<string,string> label)
  {
   if(string.IsNullOrEmpty(text))return text;
   return tokens.Replace(text,m=>{
    string token=m.Value.ToLowerInvariant(),action=null;
    switch(token){
     case "shift":case "쉬프트":action="charge";break;
     case "space":case "스페이스":action="bow";break;
     case "q":action="parry";break;case "e":action="shield";break;
     case "r":action="interact";break;case "tab":action="inventory";break;
     case "lmb":case "left-click":case "left click":case "좌클릭":action="weapon";break;
     case "rmb":case "right-click":case "right click":case "우클릭":action="beam";break;
    }
    return action==null?m.Value:(label(action)??m.Value);
   });
  }
 }
}
