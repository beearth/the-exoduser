using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // B05 auto crossbow. Web: _autoBowSpec / _fireXbow / _autoFireBowSkill('normal') and the pProjs update for normalBow bolts
    // (game.html update(): auto fire block, then the player projectile loop). The bow is never fired by a key: fireBow() has no caller.
    // The web fires on a 120 frame timer at the nearest enemy, T toggles it (default ON), Space is the roll key (Space + direction).

    /// <summary>Everything the web reads from the equipped bow / passives / affixes for the auto crossbow.</summary>
    [Serializable]
    public sealed class CrossbowInputs
    {
        public bool Equipped;
        public string Type = "crossbow";
        public double Atk, EnhanceAtk, SlotFlatAtk;     // bw().atk, enhMulAtk(bw().enh), _slotFlatAtk(bw())
        public double BowSpd = 1, BowRange, BonusRange, ProjSpeed; public int Element;
        public double DexFlat;                          // STATS.dex + _eqStat('Dex'), without the _lvB() level part
        public double PierceFlat;                       // _eqAffix('pierceFlat')
        public double RangedDmgPct;                     // _eqAffix('rangedDmgPct') + _eqAffix('projDmgPct'): hurtE arrow typed damage %
        public double CritRateBowPercent;               // _eqAffix('critRateBow') * 100
        public double StCostRed;                        // _eqAffix('stCostRed') (only the negative part reduces the cost)
        public double PassiveAtk, PassiveBow, PassiveXbow, AltAtk; // PASSIVES.pAtk / pBow / pXbow, P._altAtk (0 until the passive rows are ported)
        public int FanShotLevel;                        // P.skills.fanShot (adds 1.5 stamina per level to the auto shot)
        public bool LegendaryBowCrit;                   // _lEq('_lBowCrit') > 0
    }

    [Serializable]
    public sealed class BoltState
    {
        public int Id, Damage, Element, Bounces, Pierced;
        public bool Active, Fresh;                      // Fresh: created by _mkPProj (no _pierceRate), not recycled by _resetPProj
        public double X, Y, Vx, Vy, Dist, MaxDist, Radius = 3, PierceRate;
        internal readonly HashSet<EnemyState> HitSet = new HashSet<EnemyState>();
        internal readonly HashSet<FieldBossState> HitFieldSet = new HashSet<FieldBossState>();   // p._hitSet for the anglers
    }

    public sealed partial class Simulation
    {
        public const int BoltPoolSize = 120;            // _PPROJ_POOL
        public const double CrossbowInterval = 120, CrossbowBaseDamage = 28;   // XBOW_INTERVAL, XBOW_DMG
        public readonly CrossbowInputs Crossbow = new CrossbowInputs();
        public readonly List<BoltState> Bolts = new List<BoltState>();
        public bool CrossbowAuto = true;                // _xbowEquipped (T toggle, default ON)
        public double CrossbowTimer;                    // _xbowTimer
        public EnemyState CrossbowTarget;               // _xbowTarget
        public int BoltFreeCount;                       // _pprojFree.length: recycled objects only come from bolts consumed by a hit
        public int BoltShots, BoltHits;                 // monotonic counters for sound / view
        public double BoltLastHitX, BoltLastHitY;
        /// <summary>Test hook: replaces the hurtE call of a bolt hit (enemy, damage, angle) -> unused. Null = the real ApplyEnemyDamage.</summary>
        public Action<EnemyState, int, double> BoltHurt;
        private int nextBoltId = 1;

        // ---- web helpers ----
        public double PassDmgSum(string type)           // _passDmgSum
        {
            double s = Crossbow.PassiveAtk * .10 + Crossbow.AltAtk + Config.PassiveHuman * .05;
            if (type == "bow" || type == "proj") s += Crossbow.PassiveBow * .15;
            if (type == "xbow") s += Crossbow.PassiveXbow * .05;
            return (1 + s) * 0.7;
        }
        public double BowRef()                          // bowRef()
        {
            return (Crossbow.Atk + Crossbow.EnhanceAtk) + Crossbow.SlotFlatAtk + Player.BaseAttack + (Crossbow.DexFlat + (int)(Player.Level * .5));
        }
        public double BowRangeMul { get { return 1 + Crossbow.PassiveBow * .08; } }           // pBowRange()
        public double XbowSpdMul { get { return 1 + Crossbow.PassiveXbow * .05; } }           // pXbowSpd()
        public double StDiscBow { get { double d = Math.Max(.60, 1 - Crossbow.PassiveBow * .04); return d * (1 + (Crossbow.StCostRed < 0 ? Crossbow.StCostRed : 0)); } }   // _stDisc('bow')

        public void AutoBowSpec(out double range, out double speed)   // _autoBowSpec
        {
            var def = WeaponCatalog.Bow(Crossbow.Type);
            double r = (Math.Max(Crossbow.BowRange, def.Range != 0 ? def.Range : 1000) + Crossbow.BonusRange * 12) * BowRangeMul;
            range = Math.Max(220, r);
            speed = Crossbow.ProjSpeed != 0 ? Crossbow.ProjSpeed : def.ProjSpeed != 0 ? def.ProjSpeed : 13;
        }

        public int AutoCrossbowDamage()                 // _fireXbow dmg: ~~((bowRef*pBowMul*pXbowMul*typeAtkMul + XBOW_DMG)*1)*3
        {
            double atkMul = WeaponCatalog.Bow(Crossbow.Type).AtkMul; if (atkMul == 0) atkMul = 1;
            return (int)(BowRef() * PassDmgSum("bow") * PassDmgSum("xbow") * atkMul + CrossbowBaseDamage) * 3;
        }

        public bool ToggleCrossbowAuto()                // T key: _xbowEquipped toggle, timer / target reset
        {
            CrossbowAuto = !CrossbowAuto; CrossbowTimer = 0; CrossbowTarget = null; return CrossbowAuto;
        }

        // _refreshEquipmentStats side of the bow slot (bw(), _eqAffix, _eqStat('Dex'))
        public void ApplyCrossbowEquipment(InventoryState inventory, double dexTotal)
        {
            var c = Crossbow; var b = inventory.GetEquipped("bow");
            c.Equipped = b != null; c.Type = b != null && !string.IsNullOrEmpty(b.btype) ? b.btype : "crossbow";
            c.Atk = b != null ? b.atk : 0; c.EnhanceAtk = b != null ? b.enh * .25 : 0;
            double flat = 0; if (b?.affixes != null) foreach (var a in b.affixes) if (a != null && (a.id == "sharpAtk" || a.id == "brutalAtk" || a.id == "ruinAtk")) flat += a.value;
            c.SlotFlatAtk = flat;
            c.BowSpd = b != null && b.bowSpd != 0 ? b.bowSpd : 1; c.BowRange = b != null ? b.bowRange : 0; c.BonusRange = b != null ? b.bonusRange : 0;
            c.ProjSpeed = b != null ? b.bowProjSpd : 0; c.Element = b != null ? b.el : 0;
            c.DexFlat = dexTotal - (int)(Player.Level * .5);
            c.PierceFlat = inventory.AffixTotal("pierceFlat");
            c.RangedDmgPct = inventory.AffixTotal("rangedDmgPct") + inventory.AffixTotal("projDmgPct");
            c.CritRateBowPercent = inventory.AffixTotal("critRateBow") * 100;
            c.StCostRed = inventory.AffixTotal("stCostRed");
            c.LegendaryBowCrit = b != null && b.legendarySpecial == "_lBowCrit" && b.legendaryVal > 0;
        }

        // shQuery: the web returns the enemies of every spatial-hash cell (128 px) touched by [x-r, x+r] x [y-r, y+r], cell by cell (row, then column).
        private List<EnemyState> ShQuery(double x, double y, double r, bool lessonActors = false)
        {
            int cx0 = (int)((x - r) / 128), cx1 = (int)((x + r) / 128), cy0 = (int)((y - r) / 128), cy1 = (int)((y + r) / 128);
            var found = new List<KeyValuePair<long, EnemyState>>();
            for (int i = 0; i < Enemies.Count; i++)
            {
                var e = Enemies[i]; if (!e.Alive || (!lessonActors && IsFirstPracticeActor(e))) continue;   // crossbow keeps the source oracle's quirk (the lesson actor is not in its hash); the right-click lesson fireball does see them (web: _shDirty rebuild after spawn)
                int cx = (int)(e.X / 128), cy = (int)(e.Y / 128);
                if (cx < cx0 || cx > cx1 || cy < cy0 || cy > cy1) continue;
                found.Add(new KeyValuePair<long, EnemyState>((((long)(cy - cy0)) * 1000000L + (cx - cx0)) * 100000L + i, e));
            }
            found.Sort((a, b) => a.Key.CompareTo(b.Key));
            var result = new List<EnemyState>(found.Count); foreach (var f in found) result.Add(f.Value);
            return result;
        }

        private BoltState NewBolt(double ox, double oy, double ang, double range, double speed, int damage)
        {
            double cdx = Math.Cos(ang), cdy = Math.Sin(ang);
            BoltState b = new BoltState();
            if (BoltFreeCount > 0) { BoltFreeCount--; b.PierceRate = 50 + Crossbow.PierceFlat; }   // _getPProj pops a recycled object -> _resetPProj sets _pierceRate
            else b.Fresh = true;                                                                    // _mkPProj: _pierceRate undefined -> no pierce
            b.Id = nextBoltId++; b.Active = true;
            b.X = ox + cdx * 10; b.Y = oy + cdy * 10; b.Vx = cdx * speed; b.Vy = cdy * speed;
            b.Damage = damage; b.Element = Crossbow.Element; b.MaxDist = range; b.Dist = 0; b.Radius = 3;
            Bolts.Add(b); BoltShots++;
            return b;
        }

        private void FireCrossbow(EnemyState target)
        {
            double ox = CrossbowPetEnabled ? CrossbowPetX : Player.X, oy = CrossbowPetEnabled ? CrossbowPetY : Player.Y;
            double ang = Math.Atan2(target.Y - oy, target.X - ox);
            double range, speed; AutoBowSpec(out range, out speed);
            if(CrossbowPetEnabled)CrossbowPetAngle=ang;
            int damage = AutoCrossbowDamage();
            NewBolt(ox, oy, ang, range, speed, damage);
            if (Crossbow.LegendaryBowCrit && NextRandom() * 100 < Config.PlayerCriticalChance)
                NewBolt(ox, oy, ang + (NextRandom() < .5 ? .12 : -.12), range, speed, damage);
        }

        // Called once per frame from Tick (after the enemy loop): auto fire, then the bolt update.
        internal void TickCrossbow()
        {
            if (CrossbowAuto && Player.Hp > 0 && Crossbow.Equipped)
            {
                CrossbowTimer += 1;
                CrossbowTarget = null;
                double range, speed; AutoBowSpec(out range, out speed);
                double ox=CrossbowPetEnabled?CrossbowPetX:Player.X,oy=CrossbowPetEnabled?CrossbowPetY:Player.Y;
                double near = range;
                foreach (var e in ShQuery(ox, oy, range))
                {
                    if (!e.Alive) continue;
                    double dx = e.X - ox, dy = e.Y - oy, d = Math.Sqrt(dx * dx + dy * dy);
                    if (d < near) { near = d; CrossbowTarget = e; }
                }
                double spdMul = (Crossbow.BowSpd != 0 ? Crossbow.BowSpd : 1) * XbowSpdMul;
                if (CrossbowTimer >= CrossbowInterval / spdMul && CrossbowTarget != null && Player.Stamina > Player.MaxStamina * .2)
                {
                    CrossbowTimer = 0;
                    double before = Player.Stamina;
                    FireCrossbow(CrossbowTarget);
                    double cost = (1.5 + Crossbow.FanShotLevel * 1.5) * StDiscBow;
                    Player.Stamina = (float)Math.Max(0, before - cost);
                }
            }
            UpdateBolts();
        }

        private bool BoltWall(double x, double y) { return IsProjectileWall != null ? IsProjectileWall((float)x, (float)y) : !Pass((float)x, (float)y, 0); }

        private void HurtByBolt(EnemyState enemy, int damage, double angle)
        {
            if (BoltHurt != null) { BoltHurt(enemy, damage, angle); return; }
            // hurtE for an arrow: no knockback (ranged), no poise hit, typed % + critRateBow
            ApplyEnemyDamage(enemy, damage, (float)angle, false, 0, false, false, Crossbow.RangedDmgPct, Crossbow.CritRateBowPercent, true);
        }

        // The normalBow branch of the web player projectile loop.
        private void UpdateBolts()
        {
            int w = 0;
            for (int i = 0; i < Bolts.Count; i++)
            {
                var p = Bolts[i];
                double spd = Math.Sqrt(p.Vx * p.Vx + p.Vy * p.Vy);
                p.X += p.Vx; p.Y += p.Vy; p.Dist += spd;
                bool dead = false;
                if (p.Dist > p.MaxDist) dead = true;
                else if (BoltWall(p.X, p.Y))
                {
                    bool canBounce = p.Dist < p.MaxDist * 0.5 && p.Bounces < 2;
                    if (canBounce)
                    {
                        p.X -= p.Vx; p.Y -= p.Vy;
                        for (int esc = 0; esc < 5 && BoltWall(p.X, p.Y); esc++) { p.X -= p.Vx; p.Y -= p.Vy; }
                        bool hWall = BoltWall(p.X + p.Vx, p.Y), vWall = BoltWall(p.X, p.Y + p.Vy);
                        if (hWall) p.Vx = -p.Vx; if (vWall) p.Vy = -p.Vy; if (!hWall && !vWall) { p.Vx = -p.Vx; p.Vy = -p.Vy; }
                        p.Bounces++;
                    }
                    else dead = true;
                }
                if (dead) { p.Active = false; continue; }   // a bolt that ends by range / wall is not recycled (web: `continue` before _recyclePProj)
                bool hit = false;
                if (HurtFieldMobs(p.X, p.Y, p.Radius + 8, p.Damage, p.HitFieldSet)) hit = true;   // web 35466: _hurtFieldMobs(p.x, p.y, (p.r||6)+8, p.dmg, p._hitSet)
                foreach (var e in ShQuery(p.X, p.Y, p.Radius + 20))
                {
                    if (!e.Alive) continue;
                    if (p.HitSet.Contains(e)) continue;
                    double dx = p.X - e.X, dy = p.Y - e.Y;
                    if (!(Math.Sqrt(dx * dx + dy * dy) < e.Radius + p.Radius)) continue;
                    double ang = Math.Atan2(e.Y - p.Y, e.X - p.X);
                    int dmg = (int)(p.Damage * 1.0);        // elMul(p.el, e.el): the element chart is B06, ordinary enemies take x1
                    BoltHits++; BoltLastHitX = e.X; BoltLastHitY = e.Y;
                    HurtByBolt(e, dmg, ang);
                    // unified pierce: _pierceRate 1000 = 91 guaranteed + 9 chance passes; a fresh object has no rate
                    double rate = p.Fresh ? 0 : p.PierceRate;
                    if (rate > 0)
                    {
                        p.HitSet.Add(e); p.Pierced++;
                        int guaranteed = (int)Math.Floor(rate * 91 / 1000);
                        if (p.Pierced <= guaranteed) continue;
                        int over = p.Pierced - guaranteed;
                        double survive = Math.Max(0, 1 - over * 0.1);
                        if (survive > 0 && NextRandom() < survive) continue;
                    }
                    if (!e.Alive) { p.HitSet.Add(e); continue; }   // crossbow kill pierce
                    hit = true; break;
                }
                if (!hit) Bolts[w++] = p;
                else { p.Active = false; if (BoltFreeCount < BoltPoolSize) BoltFreeCount++; }
            }
            if (w < Bolts.Count) Bolts.RemoveRange(w, Bolts.Count - w);
        }
    }
}
