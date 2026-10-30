using System;
namespace Exoduser.UnityPort.Core
{
 // HUD는 웹 CSS 물리 순서(qsE=7, skSlotRMB=9), 스킬창은 의미 순서(rmb=7, magic=9)다.
 public static class SkillDockBinding
 {
  static readonly string[] Fixed={"1","2","3","4","F","Z","LMB","RMB","Shift","E","Q","Ctrl","Space"};
  public static int WindowIndexForDock(int i){return i==7?9:i==9?7:i;}
  public static int DockIndexForWindow(int i){return WindowIndexForDock(i);}
  public static string SkillForDock(Simulation s,int i){switch(i){case 0:case 1:case 2:case 3:return s.Skills.Slots[i];case 4:return s.Skills.Slots[5];case 5:return s.Skills.UltSlot;case 6:return s.Config.ActiveAttack=="kiSlash"?"kiSlash":null;case 7:return s.Skills.MagicSkill;case 8:return "charge";case 9:return "maliceSwipe";case 10:return "parry";case 11:return s.Skills.CtSkill;case 12:return s.Skills.Slots[4];default:return null;}}
  public static string KeyForDock(int i,KeyBindings b){if(i<0||i>=Fixed.Length)return "";string a=i==6?"weapon":i==7?"beam":i==8?"charge":i==9?"shield":i==10?"parry":i==12?"bow":null;if(a==null||b==null)return Fixed[i];string c=b.Primary(a);switch(c){case null:return "—";case "mouse0":return "LMB";case "mouse1":return "MMB";case "mouse2":return "RMB";case "Space":return "Space";case "ShiftLeft":return "Shift";case "ShiftRight":return "R-Shift";case "ControlLeft":return "Ctrl";case "ControlRight":return "R-Ctrl";default:return KeyBindings.KeyName(c,true);}}
  public static string KeyForWindow(int i,KeyBindings b){return KeyForDock(DockIndexForWindow(i),b);}
 }
}
