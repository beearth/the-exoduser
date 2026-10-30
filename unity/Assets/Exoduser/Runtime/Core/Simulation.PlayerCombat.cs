using System;
using System.Collections.Generic;
using System.Linq;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // PC-B07 player dash / parry / shield / E-strike state machine on top of the web calculations in ParryRules / ParryRewards / ChainDash / PlayerPoise (wired:
    // PlayerCombatWired). B07b added the E strike hit (Simulation.BashStrike.cs: _gSlamHit circle, damage, stun, poise), parryBank, Q cancel of sRecover and the Shift gauge
    // bar. NOT YET IMPLEMENTED (docs/engine/UNITY_B07B_STRIKE_20261027.md): projectile reflection (the friendly blue-bean pipeline), the sBash / sRecover Shift cancel
    // and the sRecover -> sDraw re-entry, silvertail lunge parry, unique hooks (_uKiPrecharge ...), the overhead gauge text, melee parry points other than the ones the
    // ported enemy AI / druid boss already call (Parry / TryParry).
    public sealed partial class Simulation
    {
        public static readonly bool PlayerCombatWired = true;   // static readonly (not const): the guarded branches must not produce CS0162

        // equipment / passive inputs (0 until the inventory layer feeds them)
        public double CapeParry, ShieldCdRed, CcRes, StunRes, ParryBonus, PParry, PRegen, PGuard, ShieldBlockDR, MaliceSwipeLevel, ShieldThrowLevel, ChargeBoostLevel, PCharge;
        // player combat state (web P._sbParryT, P._sbHoldT, P._sbReleaseR, P._sbCd, P._sdHold, P._kgChg, P._sBashChgMul, _harpGauge ...)
        public double SbParryT, SbHoldT, SbReleaseR, SbCd, SdHold, KgChg, SBashChgMul = 1, HarpGauge = 225, HarpGaugeMax = 225;
        // chain dash (web _dashHold/_dashHoldF/_harpActive/_dashActive)
        public bool DashHold, HarpActive, DashActive; public double DashHoldF; public int HarpTier;
        public double HarpDist, HarpMaxDist, HarpX, HarpY, DashVx, DashVy, DashLeft; public float HarpDirX, HarpDirY;
        // last parry result (for the presentation layer / smoke)
        public int ParryCount; public double LastParryHp;

        private bool combatQHeld, combatEHeld, combatShiftHeld, combatQPrev, combatEPrev, combatShiftPrev;

        // called by the owner once per tick before Tick(): held states of Q (parry), E (shield strike) and Shift (chain move)
        public void SetPlayerCombatInput(bool qHeld, bool eHeld, bool shiftHeld)
        {
            combatQPrev = combatQHeld; combatEPrev = combatEHeld; combatShiftPrev = combatShiftHeld;
            combatQHeld = qHeld; combatEHeld = eHeld; combatShiftHeld = shiftHeld;
        }

        private bool CombatBusy { get { return Player.State == "stagger" || Player.State == "pStun" || Player.State == "fallen" || Player.State == "dead"; } }

        // one simulation tick of the player combat states; called from Tick right after the generic state timers
        private void TickPlayerCombat()
        {
            if (!PlayerCombatWired || CombatBusy) return;
            bool qDown = combatQHeld && !combatQPrev, eDown = combatEHeld && !combatEPrev;
            if (SbCd > 0) SbCd--;
            if (SbParryT > 0 && Player.State != "sBlock") SbParryT--;   // release window counts down by itself (12 frames)
            // 원본 _tryKiSlashQCancel: 기검 3타 자세는 Q 홀드로도 즉시 취소하며 그 틱은 이동하지 않는다.
            bool kiCancel = Config.ActiveAttack == "kiSlash" && (Player.State == "wWindup" || Player.State == "wSwing" || Player.State == "wRecover") && combatQHeld;
            // ---- Q: shield / parry ----
            if (((Player.State == "idle" || Player.State == "sRecover") && qDown || kiCancel) && SbCd <= 0)   // web sRecover: Q cancels the recovery into the shield
            {
                var s = new ParryRules.SBlockState { Mp = Player.Mana, Mmp = Player.MaxMana, S = Player.State };
                if (ParryRules.SBlockEnter(ref s, CapeParry, ShieldCdRed)) { if (kiCancel && Player.KiChargeActive) CancelKiCharge(); MovePlayerAction(Player.State == "idle" ? 1 : 0, true); Player.Mana = (float)s.Mp; Player.State = "sBlock"; Player.StateTicks = 999; SbParryT = s.SbParryT; SbHoldT = 0; SbReleaseR = 0; SbCd = s.SbCd; }
            }
            else if (Player.State == "sBlock")
            {
                var s = new ParryRules.SBlockState { Mp = Player.Mana, Mmp = Player.MaxMana, SbParryT = SbParryT, SbHoldT = SbHoldT, S = Player.State };
                ParryRules.SBlockTick(ref s, 1);
                Player.Mana = (float)s.Mp; SbParryT = s.SbParryT; SbHoldT = s.SbHoldT;
                if (!combatQHeld || Player.Mana <= 0)
                {
                    MovePlayerAction(0);
                    s.SbHoldT = SbHoldT; ParryRules.SBlockRelease(ref s);
                    Player.State = "idle"; SbParryT = s.SbParryT; SbReleaseR = s.SbReleaseR; SbHoldT = 0;
                }
                else MovePlayerAction(.35f, false, false);
            }
            // ---- E strike moment (st2 crosses 12): the circular hit of _gSlamHit ----
            if (Player.State == "sBash" || Player.State == "sRecover") MovePlayerAction(.8f);
            if (BashStrikeMoment) BashStrike();
            // ---- E: shield strike (tap = sBash, hold = charge) ----
            if (Player.State == "idle" && eDown && !playerActionBranchConsumed) { MovePlayerAction(1, true); Player.State = "sDraw"; SdHold = 0; }
            else if (Player.State == "sDraw")
            {
                SdHold++;
                if (ParryRules.SdHoldConfirmed(SdHold))
                {
                    MovePlayerAction(0);
                    var f = ParryRules.SBashFire(Player.Stamina, MaliceSwipeLevel, Player.State, SBashChgMul, 0);
                    if (f.Fired) { Player.Stamina = (float)f.St; Player.State = "kiGather"; KgChg = SdHold * 2; } else Player.State = "idle";
                }
                else if (!combatEHeld)
                {
                    MovePlayerAction(0);
                    var f = ParryRules.SBashFire(Player.Stamina, MaliceSwipeLevel, Player.State, SBashChgMul, 0);
                    if (f.Fired) { Player.Stamina = (float)f.St; attackBonus = (int)f.AtkBon; Player.State = "sBash"; Player.StateTicks = ParryRules.SBashTicks; SBashChgMul = 1; AutoShieldThrow(); } else Player.State = "idle";
                }
                else MovePlayerAction(.5f, false, false);
            }
            else if (Player.State == "kiGather")
            {
                MovePlayerAction(.18f, false, false);
                KgChg += 2;
                if (ParryRules.KiGatherAutoRelease(KgChg)) { SBashChgMul = ParryRules.ClampChargeMul(3); Player.State = "sBash"; Player.StateTicks = ParryRules.SBashTicks; KgChg = 0; AutoShieldThrow(); }
                else if (!combatEHeld)
                {
                    if (ParryRules.KiGatherFizzles(KgChg)) { Player.State = "idle"; KgChg = 0; }
                    else { SBashChgMul = ParryRules.ClampChargeMul(ParryRules.KiGatherReleaseMultiplier(KgChg)); Player.State = "sBash"; Player.StateTicks = ParryRules.SBashTicks; KgChg = 0; AutoShieldThrow(); }
                }
            }
            else if (Player.State == "sBash" && Player.StateTicks <= 0) { Player.State = "sRecover"; Player.StateTicks = ParryRules.SRecoverTicks(PParry); }
            else if (Player.State == "sRecover" && Player.StateTicks <= 0) { Player.State = "idle"; SBashChgMul = 1; ShieldWingTicks = 0; }
            // ---- Shift: chain move ----
            TickChainDash();
            // stun natural end: the web restores poise 4 and grants 60 frames of invulnerability
            if (Player.State == "pStun" && Player.StateTicks <= 0) { Player.Iframes = (float)PlayerPoise.NaturalEndIframes; Player.Poise = PlayerPoise.MaxPoise; }
        }

        /// <summary>The enemies already hit by the current chain pull (web _harpHits): each is hit once per cast.</summary>
        public readonly List<EnemyState> DashHits = new List<EnemyState>();

        // `_dashActive` pass-through hit loop (game.html 32474-32505, STR branch): after the pull step every living enemy within r + 20 of the player that is not in _harpHits is hit.
        // The web asks shQuery(P, 40) first; the existing shQuery port (NearbyWebs) is the exact radius r + other.r, which contains the r + 20 reach, so the candidate set is the same here.
        private void TickDashPathHits()
        {
            if (Enemies.Count == 0) return;
            var armor = EquippedInventory != null ? EquippedInventory.GetEquipped("armor") : null;
            foreach (var e in Enemies.ToArray())
            {
                if (!ChainDash.IsPathHit(Player.X, Player.Y, e.X, e.Y, e.Radius, e.Alive, DashHits.Contains(e))) continue;
                DashHits.Add(e);
                double ang = Math.Atan2(e.Y - Player.Y, e.X - Player.X);
                int dmg = ChainDash.PathHitDamage(ChargeBoostLevel, armor != null ? armor.charge : 0, Player.BaseAttack, 1, EquippedInventory != null ? EquippedInventory.AffixTotal("dashBoost") : 0);
                ApplyEnemyDamage(e, dmg, (float)ang, true, (float)ChainDash.PathHitKnockbackMult, false, false, 0, 0, false, armor != null ? armor.el : 0, false, false, false, false, ChainDash.PathHitPoiseMult);
                e.KnockbackX += (float)(Math.Cos(ang) * ChainDash.PathHitPush); e.KnockbackY += (float)(Math.Sin(ang) * ChainDash.PathHitPush);
                ShakeAmount = (float)(ChainDash.PathHitShake * OptShake / 100);   // G.shake = 4 * OPT.shake / 100 (G.hitStop is not modelled in the Core)
                if (!inEnemyLoop) FlushDeathSpawns();
            }
        }

        private void TickChainDash()
        {
            bool shiftUp = !combatShiftHeld && combatShiftPrev;
            if (combatShiftHeld && !HarpActive && !DashActive && DashHoldF < ChainDash.HoldFramesCap) DashHold = true;
            if (DashHold && !HarpActive && !DashActive)
            {
                if (combatShiftHeld) DashHoldF++;
                else if (shiftUp)
                {
                    int tier = ChainDash.TierForHoldFrames(DashHoldF);
                    var r = ChainDash.Release(tier, HarpGauge, Player.Stamina, Player.MaxStamina, ChargeBoostLevel, 0, PCharge);
                    DashHold = false; DashHoldF = 0;
                    if (r.Fired)
                    {
                        HarpGauge = r.Gauge; Player.Stamina = (float)r.St; HarpTier = tier; HarpActive = true; HarpDist = 0; HarpMaxDist = r.MaxDist;
                        HarpDirX = (float)Math.Cos(Player.Facing); HarpDirY = (float)Math.Sin(Player.Facing); HarpX = Player.X; HarpY = Player.Y;
                        DashHits.Clear();   // _harpHits = []
                    }
                }
            }
            if (HarpActive && !DashActive)
            {
                double step; double d = HarpDist; ChainDash.FlightStep(1, HarpMaxDist, ref d, out step); HarpDist = d;
                HarpX += HarpDirX * ChainDash.FlightSpeed * step; HarpY += HarpDirY * ChainDash.FlightSpeed * step;
                if (HarpDist >= HarpMaxDist)
                {
                    var pull = ChainDash.StartPull(HarpTier, Player.X, Player.Y, (float)HarpX, (float)HarpY);
                    DashActive = true; DashVx = pull.Vx; DashVy = pull.Vy; DashLeft = pull.Left; Player.Poise = (float)pull.Poise;
                }
            }
            if (DashActive)
            {
                Player.Iframes = Math.Max(Player.Iframes, ChainDash.MoveIframesMin);
                double step = ChainDash.PullStep(1, DashLeft);
                float nx = Player.X + (float)(DashVx * step), ny = Player.Y + (float)(DashVy * step);
                if (Pass(nx, ny, Player.Radius)) { Player.X = nx; Player.Y = ny; } else DashLeft = 0;
                TickDashPathHits();
                DashLeft -= step;
                if (DashLeft <= 0) { DashActive = false; HarpActive = false; Player.Iframes = (float)ChainDash.LandingInvulnerable(Player.Iframes); }
            }
            // gauge regeneration (stops while holding / flying / pulled)
            HarpGauge = ChainDash.RegenGauge(HarpGauge, HarpGaugeMax, ChargeBoostLevel, PCharge, 1, DashHold, HarpActive, DashActive, false, false);
        }

        // what the sBlock / peaceShield branch of hurtP did to a non-parried hit (rate text, knock-back, shake, flash are applied by HurtPlayer in the web's order)
        private struct BlockFx { public bool Active, Peace, Failed, FocusKeep; public double Rate, KbMagnitude, Shake; }

        // HurtPlayer hook: true = the hit was fully handled (parry success). `damage` may be reduced by a failed-parry absorb.
        private bool CombatBeforeHurt(ref int damage, bool dot, out BlockFx fx)
        {
            fx = default(BlockFx);
            if (!PlayerCombatWired) return false;
            if (HarpActive || DashActive) return true;   // web: no damage while the chain move runs
            // E strike window (sBash): isPWin
            if (ParryRules.IsParryWindow(Player.State, Player.StateTicks, 0, SbParryT, CapeParry) && Player.State == "sBash") { ApplyParrySuccess(false); return true; }
            string stateBefore = Player.State; double parryBefore = SbParryT, poiseBefore = Player.Poise;
            var b = PlayerPoise.ShieldBranch(new PlayerPoise.BlockInput { S = Player.State, SbParryT = SbParryT, Dmg = damage, Poise = Player.Poise, PGuard = PGuard, ShieldBlockDR = ShieldBlockDR, CcRes = CcRes, StunRes = StunRes, Dot = dot, RedBean = false });
            if (!b.ReachedDamage) { SbParryT = b.SbParryT; ApplyParrySuccess(true); return true; }
            if (stateBefore == "sBlock" || stateBefore == "peaceShield")
            {
                damage = (int)b.Dmg; Player.Poise = (float)b.Poise; SbParryT = b.SbParryT;
                if (b.S == "pStun") { Player.State = "pStun"; Player.StateTicks = (float)b.St2; Player.Iframes = (float)b.Iframes; }
                bool failed = parryBefore <= 0 && !dot;
                double blkBase = (ParryRules.GuardAbsorb(PGuard, ShieldBlockDR) + ParryRules.ShieldBlock()) * (dot ? .5 : 1);
                fx = new BlockFx { Active = true, Peace = stateBefore == "peaceShield", Failed = failed, FocusKeep = failed && b.S != "pStun" && Math.Max(0, Js.Or(poiseBefore, 4) - 1) <= 0, Rate = Math.Min(failed ? .25 : .50, failed ? blkBase * .5 : blkBase), KbMagnitude = b.KbMagnitude, Shake = b.Shake };
            }
            return false;
        }

        private void ApplyParrySuccess(bool qParry, double resourceMul = 1, string parryEl = null)   // ResourceMul / ParryEl: the doParry arguments of a reflected bullet (ParryReflect)
        {
            var r = ParryRewards.Apply(new ParryRewards.Input
            {
                PlayerState = Player.State, ForceQ = qParry, SbParryT = SbParryT, ResourceMul = resourceMul, ParryEl = parryEl, ParryBonus = ParryBonus, PRegen = PRegen, OptHitStop = 100, OptShake = 100,
                Iframes = Player.Iframes, Hp = Player.Hp, Mhp = Player.MaxHp, St = Player.Stamina, Mst = Player.MaxStamina, Mp = Player.Mana, Mmp = Player.MaxMana, Poise = Player.Poise, MaxPoise = PlayerPoise.MaxPoise,
                Rage = Rage, RageMax = RageMaximum, Mats = Materials, HarpGauge = HarpGauge, HarpGaugeMax = HarpGaugeMax,
            });
            Player.Iframes = (float)r.Iframes; Player.Hp = (float)r.Hp; Player.Stamina = (float)r.St; Player.Mana = (float)r.Mp; Player.Poise = (float)r.Poise; HarpGauge = r.HarpGauge; AddMalice((int)r.Mats - Materials); SetRage(r.Rage);
            if(resourceMul==3)GiantSlamCd=Math.Max(0,GiantSlamCd-30); // 원본 물리탄1발마다 분노 스킬 쿨30f 회복
            ParryCount++; LastParryHp = r.Hp;
            // RM-1 sound: web doParry plays q_parry for a Q parry (_forceQ || sBlock || peaceShield || _sbParryT>0) and sword_parry + sword_back otherwise (Step 1 = Q parry)
            Feedback.Enqueue(new FeedbackEvent { Kind = FeedbackKind.Parry, Step = (qParry || Player.State == "sBlock" || Player.State == "peaceShield" || SbParryT > 0) ? 1 : 0, Tick = TickCount, X = Player.X, Y = Player.Y });
            RaisePlayerText(Player.X, Player.Y - 42, "PARRY!", "#ffdd00", 45);   // web '⚡PARRY!' (addTxt 45f)
        }

        // HurtPlayer poise tail through the web rule (focus states, pStun guard, ccRes/stunRes, `(poise||4)-1`)
        private void CombatApplyHitPoise()
        {
            var h = PlayerPoise.OnHit(new PlayerPoise.State { S = Player.State, Poise = Player.Poise, PoiseR = 0, St2 = Player.StateTicks, Iframes = Player.Iframes }, false, Player.KiChargeActive, CcRes, StunRes, 100, 0);
            Player.Poise = (float)h.Player.Poise;
            if (h.Player.S == "pStun") { Player.State = "pStun"; Player.StateTicks = (float)h.Player.St2; CancelKiCharge(); }
            else if (h.Player.S == "stagger") { Player.State = "stagger"; Player.StateTicks = (float)h.Player.St2; }
        }
    }
}
