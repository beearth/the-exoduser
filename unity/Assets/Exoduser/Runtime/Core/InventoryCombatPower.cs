using System;
namespace Exoduser.UnityPort.Core {
 // Source game.html calcCP (49489-49511), same terms and weights; ~~ becomes a truncating int cast.
 public struct CombatPower { public int Total,Atk,Def,Extra; }
 public static class InventoryCombatPower {
  public static CombatPower Calculate(InventoryState state,InventoryStats stats,int level) {
   if(state==null)throw new ArgumentNullException("state");if(stats==null)throw new ArgumentNullException("stats");
   // statStr()=1; pDefAdd()=_altDef*30 with _altDef currently 0.
   // P.baseDef excludes equipped def (game.html 27923 P.baseDef=2, 27944 += crystal def + defFlat + grit*.5), so remove it from PlayerPhysicalDefense.
   double equippedDef=0;
   foreach(var it in state.Equipped)if(it!=null&&(it.slot=="shield"||it.slot=="armor"||it.slot=="boots"||it.slot=="gloves"||it.slot=="pants"))equippedDef+=it.def;
   double atk=stats.PlayerBaseAttack*2,def=(stats.PlayerPhysicalDefense-equippedDef)*3;
   // STATS (str/dex/int/lck) and PASSIVES are not ported yet: both terms are 0. Not ported, 0.
   double extra=level*10+stats.PlayerMaxHp*.5+stats.PlayerMaxStamina*.3+stats.PlayerMaxMana*.3;
   foreach(var it in state.Equipped) {
    if(it==null)continue;
    atk+=it.atk*2;def+=it.def*3;extra+=it.spd*40;
    extra+=it.wStagger*1.5+it.wRange*.4;
    extra+=it.bowRange*.3+it.bowSpd*30;
    extra+=it.charge+it.chargeDist*.5+it.bonusChargeDist*5+it.chargeW+it.chargeAoE*1.5;
    extra+=it.stagger*1.5;extra+=it.bonusSt*1.5;
    extra+=it.stRegen*200+it.mpRegen*500;
    extra+=it.splashR+it.splashMul*80+it.magicPen*30+it.bonusRange*8;
    if(it.elements!=null)foreach(var e in it.elements)extra+=e.dmg*.8;
   }
   return new CombatPower{Total=(int)(atk+def+extra),Atk=(int)atk,Def=(int)def,Extra=(int)extra};
  }
 }
}
