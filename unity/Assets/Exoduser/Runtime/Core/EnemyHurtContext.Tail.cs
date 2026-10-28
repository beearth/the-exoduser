using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // CX-04c2: a JS object literal the hurtE death tail hands to an injected function (_wiPush, _spawnBossProjectile). Keys keep the order the web literal
    // writes them; a key whose web value is `undefined` (e.g. `redBean:_isRB29||undefined`) is kept with a null value because the web object has the key.
    public sealed class JsObj
    {
        public readonly List<KeyValuePair<string, object>> Props = new List<KeyValuePair<string, object>>();
        public JsObj Set(string key, double value) { Props.Add(new KeyValuePair<string, object>(key, value)); return this; }
        public JsObj Set(string key, bool value) { Props.Add(new KeyValuePair<string, object>(key, value)); return this; }
        public JsObj Set(string key, object value) { Props.Add(new KeyValuePair<string, object>(key, value)); return this; }
        public bool Has(string key) { foreach (var p in Props) if (p.Key == key) return true; return false; }
        public object Get(string key) { foreach (var p in Props) if (p.Key == key) return p.Value; return null; }
        public double Num(string key, double fallback) { return Get(key) is double d ? d : fallback; }
        public bool Flag(string key) { return Get(key) is bool b && b; }
        public string Str(string key) { return Get(key) as string; }
    }
    // G.rifts entries: EnemyRift (EnemyTickContext.cs; the tail sets si / spawned)
    // POT[type] (name and colour only; the tail reads nothing else)
    public sealed class EnemyPotDef { public string name, col; }

    public sealed partial class EnemyHurtContext
    {
        // --- globals (CX-04c2 tail; CritSfxCd is read by the head since web 780ac692b) ---
        public double CritSfxCd;                        // _critSfxCd (SND-02, 12-frame crit sound cooldown)
        public bool? DruidFled;                         // G._druidFled (set by _druidSinkStart since web 2c3c380ec)
        public double Mats;                             // G.mats
        public double ChainCnt, ChainT;                 // G._chainCnt, G._chainT
        public List<EnemyRift> Rifts = new List<EnemyRift>(); // G.rifts

        // --- injected web functions (CX-04c2) ---
        public Action<string> BossLine;                 // _bossLine(key)  (death head, web 481482e72 STY-12)
        public Action<JsObj> WiPush;                    // _wiPush({x,y,type,...})
        public Func<double> MagicRef, StatInt, PMagicMul; // magicRef(), statInt(), pMagicMul()
        public Func<string, double> SkMul;              // _skMul(id)
        public Action<EnemySpawn, double, double, double, double, double, string, double> EProjAt; // eProjAt(e,ang,spd,dmgMult,el,life,col,sz)
        public Action<EnemySpawn, JsObj> SpawnShot;     // _spawnBossProjectile(e, literal) with the tail's literals
        public Action<EnemySpawn, double, double> HurtEnemyAng; // hurtE(oe, dmg, ang) — noSound / opts omitted
        public Func<string, double, double, double, object> MkItem; // mkItem(slot, tier, el, rarity)
        public Func<string, double, bool> AddPotion;    // addPotion(type, count)
        public Func<string, EnemyPotDef> Pot;           // POT[type] (null = undefined)
        public Func<double> MaliceMul;                  // _maliceMul()
        public Action<EnemySpawn> RollDrop;             // rollDrop(e)
        public Action<double, bool?> AddExp;            // addExp(v[, trans]) — null = the second argument is omitted
        public Action CheckRooms, DbSaveNow;            // checkRooms(), dbSaveNow()
        public Action SfxExplode, SfxMagicHit, SfxPickup; // SFX.explode(), SFX.magicHit(), SFX.pickup()
    }
}
