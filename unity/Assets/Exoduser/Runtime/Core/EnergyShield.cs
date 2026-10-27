using System;

namespace Exoduser.UnityPort.Core
{
    // B08 energy shield = an extra HP bar (CLAUDE.md "에너지쉴드", game.html). Damage reaches the shield only after every DR / multiplier, the shield
    // is spent before HP, HP never moves while the shield holds, only the overflow reaches HP, DOT skips it unless the hit carries shieldHit.
    // Enemy: hurtE 42431-42440. Player (P.shield/P.mshield, separate from e.eShield): hurtP 43635-43657 and the regen tick 32840-32845.
    public static class EnergyShield
    {
        public struct EnemyHit
        {
            public double Shield;    // e.eShield after the hit
            public double Damage;    // dmg that continues to HP (0 when fully absorbed)
            public double Absorbed;  // _shAbs
            public bool Blocked;     // _shBlocked
            public bool ShowNumber;  // addTxt(x,y-70,String(_shAbs),'#66ddff',45) is raised: absorbed>0 && !isDot
        }

        // `if((!isDot||opts.shieldHit)&&e.eShieldMax>0&&e.eShield>0)`: shAbs=min(shield,dmg); shield=max(0,shield-dmg); dmg=max(0,dmg-shAbs)
        public static EnemyHit AbsorbEnemy(double eShield, double eShieldMax, double dmg, bool isDot, bool shieldHit)
        {
            var r = new EnemyHit { Shield = eShield, Damage = dmg };
            if ((!isDot || shieldHit) && eShieldMax > 0 && eShield > 0)
            {
                double abs = Math.Min(eShield, dmg);
                r.Shield = Math.Max(0, eShield - dmg);
                r.Damage = Math.Max(0, dmg - abs);
                r.Absorbed = abs;
                r.ShowNumber = abs > 0 && !isDot;
                if (r.Damage == 0) r.Blocked = true;
            }
            return r;
        }

        // hurtE 42208-42209: reviveIframes is clamped to 90; while >0 a non-DOT hit is swallowed (iframes -1). Returns true when the hit is discarded.
        public static bool SwallowedByReviveIframes(ref double reviveIframes, bool isDot)
        {
            if (reviveIframes > 90) reviveIframes = 90;
            if (reviveIframes > 0 && !isDot) { reviveIframes = Math.Max(0, reviveIframes - 1); return true; }
            return false;
        }

        public struct PlayerHit
        {
            public double Shield, RegenT;
            public double Damage;        // `a` that continues to HP
            public bool Touched;         // mshield>0 && shield>0 (regen timer reset, absorb ran)
            public bool Broke;           // shield went from positive to 0 ("쉴드 파괴!"), overflow = Damage
            public bool FullBlock;       // _shFullBlock
            public double PreAbsorb;     // `a` before the absorb (used by the unique shield-break bank)
        }

        // hurtP: after DR / barrier / conditional DR / min damage. `a>=shield` -> overflow=a-shield, shield 0; else shield-=a, a=0.
        public static PlayerHit AbsorbPlayer(double shield, double mshield, double regenT, double a)
        {
            var r = new PlayerHit { Shield = shield, RegenT = regenT, Damage = a, PreAbsorb = a };
            if (mshield > 0 && shield > 0)
            {
                r.Touched = true;
                r.RegenT = 180;
                if (a >= shield) { r.Damage = a - shield; r.Shield = 0; r.Broke = true; }
                else { r.Shield = shield - a; r.Damage = 0; r.FullBlock = true; }
            }
            return r;
        }

        // update(): `if(P.mshield>0){ if(P.shieldRegenT>0)P.shieldRegenT-=sp*((1/pShieldCdMul())||1); else if(P.shield<P.mshield)P.shield=min(mshield, shield+(.3+(STATS.int+_lvB())*.003)*pMRegenMul()*sp) }`
        // pMRegenMul = 1+pMRegen*.03, pShieldCdMul = 1-min(.3,pMRegen*.03), _lvB = ~~(lv*.5)
        public static void PlayerRegen(ref double shield, double mshield, ref double regenT, double statInt, int level, double pMRegen, double sp)
        {
            if (!(mshield > 0)) return;
            double mRegenMul = 1 + pMRegen * .03, cdMul = 1 - Math.Min(.3, pMRegen * .03);
            if (regenT > 0)
            {
                double inv = 1 / cdMul; if (inv == 0 || double.IsNaN(inv)) inv = 1;
                regenT -= sp * inv;
            }
            else if (shield < mshield)
            {
                double lvB = Math.Truncate(level * .5);
                shield = Math.Min(mshield, shield + (0.3 + (statInt + lvB) * 0.003) * mRegenMul * sp);
            }
        }
    }
}
