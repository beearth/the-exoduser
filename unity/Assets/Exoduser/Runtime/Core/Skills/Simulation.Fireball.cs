using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort.Core
{
    // PC-B03b: the E (magic) slot default skill, the malice orb (web `fireball`): the "beam" key (default mouse2) from idle -> magicCast (14 / pMagicSpd frames) ->
    // a homing orb that grows while it flies, explodes on the first enemy / at the end of its range / on a wall it can no longer bounce off, -> magicRecover (12 frames),
    // hold = fires again. Web: _execMagicE fallback (29087), magicCast branch (33727+, "악의구 (기본 폴백)"), player projectile loop (35322+), _fireballExplode (24710),
    // _maliceWeakMul (24707). Formulas are in SkillRules (oracle-checked); this file owns the state, input edge and the per-frame tick.
    public sealed class MaliceOrb
    {
        public int Id, Dmg, ExplDmg, Bounces; public bool Active;
        public float X, Y, Vx, Vy, Dist, MaxDist, R, R0, RMax, ExplR, BounceCool;
        // 웹 p._trail: 이동 전 위치를 매 실제 틱에14점 순환 기록한다. 렌더 빈도와 무관한 표시 자료다.
        public readonly float[] TrailX = new float[14], TrailY = new float[14];
        public int TrailHead, TrailCount;
        internal readonly HashSet<FieldBossState> HitFieldMobs = new HashSet<FieldBossState>();
        internal readonly Dictionary<EnemyState, double> WeakMul = new Dictionary<EnemyState, double>();   // p._mwMul: the direct hit + the blast stack once per orb
    }

    public sealed partial class Simulation
    {
        public readonly List<MaliceOrb> MaliceOrbs = new List<MaliceOrb>();
        public int MaliceOrbShots, MaliceOrbBlasts; public float MaliceOrbLastX, MaliceOrbLastY;
        public event Action<MaliceOrb> MaliceOrbExploded;
        private bool magicHeld; private int magicMpBonus, nextOrbId = 1; private bool attackHeldForMagic;
        private float magicCastAngle; // 웹 P.atkArc: 시전 시작 때 고정하며 다음 연사 시작 때 갱신한다.

        // once per tick before Tick(): the held state of the web 'beam' action (default mouse2)
        public void SetMagicInput(bool beamHeld) { magicHeld = beamHeld; }

        // pMagicSpd = (2 + pMagic*.08) * (1 + castSpeed + headbandCastSpd)
        public double MagicCastSpeed()
        {
            var inv = EquippedInventory;
            return (2 + PassiveMagic * .08) * (1 + (inv != null ? inv.AffixTotal("castSpeed") + inv.AffixTotal("headbandCastSpd") : 0));
        }
        // mpCost('magic'): _COST_SK has no 'magic' entry, so the skill-level factor is 1
        public int MagicMpCost() { return SkillRules.MpCost("magic", 1, MagicCostMultiplier()); }

        private bool CanStartMagic { get { return Player.State == "idle" && !HarpActive && !DashActive && !idleChainDetonation && Player.Mana >= MagicMpCost(); } }

        // idle branch of the web state machine: `else if(isHeld('beam')&&P.mp>=mpCost('magic')) _execMagicE()`, after the weapon / shield / Q branches
        private void TickMagicIdle()
        {
            if (!magicHeld || attackHeldForMagic || playerActionBranchConsumed || !CanStartMagic) return;
            MovePlayerAction(1, true);
            ExecMagicE();
        }

        // _execMagicE fallback: the orb. useMp('magic') * 2 is the bonus damage of this cast (P._mpBon)
        private void ExecMagicE()
        {
            float before = Player.Mana; Player.Mana = Math.Max(0, Player.Mana - MagicMpCost());
            magicMpBonus = (int)((before - Player.Mana) * 2);
            magicCastAngle = Player.Facing;
            Player.State = "magicCast"; Player.StateTicks = Js.Int(14 / MagicCastSpeed());
        }

        // magicCast / magicRecover branches
        private void TickMagicStates()
        {
            if (Player.State == "magicCast")
            {
                MovePlayerAction(.8f);
                if (Player.StateTicks <= 0) { FireMaliceOrb(); Player.State = "magicRecover"; Player.StateTicks = 12; }
            }
            else if (Player.State == "magicRecover")
            {
                MovePlayerAction(.8f);
                if (Player.StateTicks <= 0)
                {
                    if (magicHeld && Player.Mana >= MagicMpCost()) ExecMagicE();   // hold = rapid fire
                    else { Player.State = "idle"; Player.StateTicks = 0; }
                }
            }
        }

        private void FireMaliceOrb()
        {
            int lv = Math.Max(1, Skills.Level("fireball"));
            double scale = SkillRules.FireballScale(lv);
            int dmg = SkillRules.FireballDamage(MagicReference(), 1, MagicDamageMultiplier(), lv) + magicMpBonus; magicMpBonus = 0;
            double dx = Math.Cos(magicCastAngle), dy = Math.Sin(magicCastAngle);
            var o = new MaliceOrb
            {
                Id = nextOrbId++, Active = true, X = Player.X + (float)(dx * 14), Y = Player.Y + (float)(dy * 14),
                Vx = (float)(dx * SkillRules.FireballSpeed), Vy = (float)(dy * SkillRules.FireballSpeed), Dmg = dmg, ExplDmg = Js.Int(dmg * .6),
                MaxDist = (float)SkillRules.FireballRange(lv, 0), R0 = (float)SkillRules.FireballRadius0, R = (float)SkillRules.FireballRadius0, RMax = (float)SkillRules.FireballRadiusMax(lv), ExplR = (float)SkillRules.FireballExplosionRadius(lv)
            };
            MaliceOrbs.Add(o); MaliceOrbShots++;
            SkillSample("fireball", .8, 1); Cast("fireball");
        }

        private bool OrbWall(double x, double y) { return IsProjectileWall != null ? IsProjectileWall((float)x, (float)y) : !Pass((float)x, (float)y, 0); }

        // the fireball part of the web player projectile loop
        private void TickMaliceOrbs()
        {
            int w = 0;
            for (int i = 0; i < MaliceOrbs.Count; i++)
            {
                var p = MaliceOrbs[i];
                p.TrailX[p.TrailHead] = p.X; p.TrailY[p.TrailHead] = p.Y;
                p.TrailHead = (p.TrailHead + 1) % 14; p.TrailCount = Math.Min(14, p.TrailCount + 1);
                if (p.BounceCool > 0) p.BounceCool -= 1;
                double spd = Math.Sqrt(p.Vx * p.Vx + p.Vy * p.Vy);
                // homing: every 4th frame, nearest enemy inside 280 px, turn limited to 0.35 rad
                if (!(p.BounceCool > 0) && spd > 0 && (TickCount + i) % 4 == 0)
                {
                    EnemyState best = null; double bestD = SkillRules.FireballHomingRange;
                    foreach (var e in ShQuery(p.X, p.Y, bestD, true)) { if (!e.Alive) continue; double d = Distance(p.X, p.Y, e.X, e.Y); if (d < bestD) { bestD = d; best = e; } }
                    if (best != null)
                    {
                        double ta = Math.Atan2(best.Y - p.Y, best.X - p.X), ca = Math.Atan2(p.Vy, p.Vx), da = ta - ca;
                        while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
                        double turn = Math.Min(Math.Abs(da), SkillRules.FireballTurn) * Math.Sign(da);
                        p.Vx = (float)(Math.Cos(ca + turn) * spd); p.Vy = (float)(Math.Sin(ca + turn) * spd);
                    }
                }
                p.X += p.Vx; p.Y += p.Vy; p.Dist += (float)spd;
                if (p.MaxDist > 0) p.R = (int)(p.R0 + (p.RMax - p.R0) * Math.Min(1, p.Dist / p.MaxDist));
                bool dead = false;
                if (p.Dist > p.MaxDist) { OrbExplode(p); dead = true; }
                else if (OrbWall(p.X, p.Y))
                {
                    if (p.Bounces < SkillRules.FireballMaxBounce)
                    {
                        p.X -= p.Vx; p.Y -= p.Vy;
                        for (int esc = 0; esc < 5 && OrbWall(p.X, p.Y); esc++) { p.X -= p.Vx; p.Y -= p.Vy; }
                        bool hWall = OrbWall(p.X + p.Vx, p.Y), vWall = OrbWall(p.X, p.Y + p.Vy);
                        if (hWall) p.Vx = -p.Vx; if (vWall) p.Vy = -p.Vy; if (!hWall && !vWall) { p.Vx = -p.Vx; p.Vy = -p.Vy; }
                        p.Bounces++; p.BounceCool = SkillRules.FireballBounceCool;
                    }
                    else { OrbExplode(p); dead = true; }
                }
                if (!dead && HurtFieldMobs(p.X, p.Y, p.R + 8, p.Dmg, p.HitFieldMobs)) { OrbExplode(p); dead = true; }   // web pProj loop 35466: an angler touched by the orb takes p.dmg, the orb bursts
                if (!dead)
                {
                    foreach (var e in ShQuery(p.X, p.Y, p.R + 20, true))
                    {
                        if (!e.Alive || Distance(p.X, p.Y, e.X, e.Y) >= e.Radius + p.R) continue;
                        OrbExplode(p); dead = true; break;
                    }
                }
                if (dead) { p.Active = false; continue; }
                MaliceOrbs[w++] = p;
            }
            if (w < MaliceOrbs.Count) MaliceOrbs.RemoveRange(w, MaliceOrbs.Count - w);
        }

        // _maliceWeakMul: +30 % per stack (max 10, no timer) on the next orb hit; one stack per orb and enemy
        private double MaliceWeakMul(MaliceOrb p, EnemyState e)
        {
            double cached; if (p.WeakMul.TryGetValue(e, out cached)) return cached;
            var w = e.Web ?? SyncToWeb(e);
            double step = SkillRules.MaliceWeakStep + (EquippedInventory != null ? EquippedInventory.AffixTotal("maliceWeakAmp") : 0);
            double st = w._mwStk ?? 0, mul = 1 + st * step;
            p.WeakMul[e] = mul;
            double n = Math.Min(SkillRules.MaliceWeakMax, st + 1); w._mwStk = n;
            if (n > st) RaisePlayerText(e.X, e.Y - 34, "악의 약화 +" + Math.Round(n * step * 100) + "%", "#b07cff", 24);
            return mul;
        }

        // _fireballExplode (24710): blast damage x element chart x malice weakness, then poison (damage x 2 into the pool, 600 f, 10 stacks)
        private void OrbExplode(MaliceOrb p)
        {
            MaliceOrbBlasts++; MaliceOrbLastX = p.X; MaliceOrbLastY = p.Y;
            MaliceOrbExploded?.Invoke(p); // 표시 소비자는 좌표·반경만 읽는다. 동시 폭발도 각각 전달한다.
            double r = p.ExplR > 0 ? p.ExplR : 80; int dmg = p.ExplDmg;
            foreach (var e in ShQuery(p.X, p.Y, r + 20, true))
            {
                if (!e.Alive || Distance(p.X, p.Y, e.X, e.Y) >= r + e.Radius) continue;
                float a = (float)Math.Atan2(e.Y - p.Y, e.X - p.X);
                var web = e.Web ?? SyncToWeb(e);
                double m = EnemyHurt.ElMul(SkillRules.FireballElement, web.el) * MaliceWeakMul(p, e);
                bool wasAlive = e.Alive; practiceHitKind = "fireball";
                ApplyEnemyDamage(e, Js.Int(dmg * m), a, false, (float)SkillRules.FireballKnockback, false, false, 0, 0, false, (int)SkillRules.FireballElement);
                practiceHitKind = null; EmitFirstPracticeHit(e, "fireball", 0, 0, wasAlive, true);
                web = e.Web ?? SyncToWeb(e);
                web.poison = 1; web.poisonT = Math.Max(web.poisonT, SkillRules.FireballPoisonFrames); web.poisonStk = Math.Min(10, web.poisonStk + 1);
                if (web.poisonStk < 10) web._poisonPool = web._poisonPool + 1 * dmg * 2;   // pDotPool() = 1 until the passive rows are ported
            }
        }
    }
}
