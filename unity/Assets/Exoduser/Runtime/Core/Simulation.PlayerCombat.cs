using System;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // PC-B07 connection DRAFT (second step): player dash / parry / shield state machine on top of the web calculations in ParryRules / ParryRewards / ChainDash /
    // PlayerPoise. Everything here is inert while PlayerCombatWired is false (the patches B07_simulation_parry_dash / B07_nativegame_qe_input call into it, but the
    // game behaves exactly as before: Q/E still show the "not available" toast, HurtPlayer keeps the old poise code). Flip the flag only together with the
    // real-play smoke of the next step. NOT YET IMPLEMENTED (listed in docs/engine/UNITY_B07_CORE_20261026.md): sBash strike damage / projectile reflection
    // (_gSlamHit), enemy melee parry points (표 A-8) and enemy poise on parry, kiGather release strikes, rage / malice / stat-bank rewards, HUD gauge value.
    public sealed partial class Simulation
    {
        public static readonly bool PlayerCombatWired = false;   // static readonly (not const): the guarded branches must not produce CS0162

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
            // ---- Q: shield / parry ----
            if (Player.State == "idle" && qDown && SbCd <= 0)
            {
                var s = new ParryRules.SBlockState { Mp = Player.Mana, Mmp = Player.MaxMana, S = Player.State };
                if (ParryRules.SBlockEnter(ref s, CapeParry, ShieldCdRed)) { Player.Mana = (float)s.Mp; Player.State = "sBlock"; Player.StateTicks = 999; SbParryT = s.SbParryT; SbHoldT = 0; SbReleaseR = 0; SbCd = s.SbCd; }
            }
            else if (Player.State == "sBlock")
            {
                var s = new ParryRules.SBlockState { Mp = Player.Mana, Mmp = Player.MaxMana, SbParryT = SbParryT, SbHoldT = SbHoldT, S = Player.State };
                ParryRules.SBlockTick(ref s, 1);
                Player.Mana = (float)s.Mp; SbParryT = s.SbParryT; SbHoldT = s.SbHoldT;
                if (!combatQHeld || Player.Mana <= 0)
                {
                    s.SbHoldT = SbHoldT; ParryRules.SBlockRelease(ref s);
                    Player.State = "idle"; Player.StateTicks = 0; SbParryT = s.SbParryT; SbReleaseR = s.SbReleaseR; SbHoldT = 0;
                }
            }
            // ---- E: shield strike (tap = sBash, hold = charge) ----
            if (Player.State == "idle" && eDown) { Player.State = "sDraw"; Player.StateTicks = 999; SdHold = 0; }
            else if (Player.State == "sDraw")
            {
                SdHold++;
                if (ParryRules.SdHoldConfirmed(SdHold))
                {
                    var f = ParryRules.SBashFire(Player.Stamina, MaliceSwipeLevel, Player.State, SBashChgMul, 0);
                    if (f.Fired) { Player.Stamina = (float)f.St; Player.State = "kiGather"; KgChg = SdHold * 2; } else Player.State = "idle";
                }
                else if (!combatEHeld)
                {
                    var f = ParryRules.SBashFire(Player.Stamina, MaliceSwipeLevel, Player.State, SBashChgMul, 0);
                    if (f.Fired) { Player.Stamina = (float)f.St; Player.State = "sBash"; Player.StateTicks = ParryRules.SBashTicks; SBashChgMul = 1; } else Player.State = "idle";
                }
            }
            else if (Player.State == "kiGather")
            {
                KgChg += 2;
                if (ParryRules.KiGatherAutoRelease(KgChg)) { SBashChgMul = ParryRules.ClampChargeMul(3); Player.State = "sBash"; Player.StateTicks = ParryRules.SBashTicks; KgChg = 0; }
                else if (!combatEHeld)
                {
                    if (ParryRules.KiGatherFizzles(KgChg)) { Player.State = "idle"; KgChg = 0; }
                    else { SBashChgMul = ParryRules.ClampChargeMul(ParryRules.KiGatherReleaseMultiplier(KgChg)); Player.State = "sBash"; Player.StateTicks = ParryRules.SBashTicks; KgChg = 0; }
                }
            }
            else if (Player.State == "sBash" && Player.StateTicks <= 0) { Player.State = "sRecover"; Player.StateTicks = ParryRules.SRecoverTicks(PParry); }
            else if (Player.State == "sRecover" && Player.StateTicks <= 0) { Player.State = "idle"; SBashChgMul = 1; }
            // ---- Shift: chain move ----
            TickChainDash();
            // stun natural end: the web restores poise 4 and grants 60 frames of invulnerability
            if (Player.State == "pStun" && Player.StateTicks <= 0) { Player.Iframes = (float)PlayerPoise.NaturalEndIframes; Player.Poise = PlayerPoise.MaxPoise; }
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
                DashLeft -= step;
                if (DashLeft <= 0) { DashActive = false; HarpActive = false; Player.Iframes = (float)ChainDash.LandingInvulnerable(Player.Iframes); }
            }
            // gauge regeneration (stops while holding / flying / pulled)
            HarpGauge = ChainDash.RegenGauge(HarpGauge, HarpGaugeMax, ChargeBoostLevel, PCharge, 1, DashHold, HarpActive, DashActive, false, false);
        }

        // HurtPlayer hook: true = the hit was fully handled (parry success). `damage` may be reduced by a failed-parry absorb.
        private bool CombatBeforeHurt(ref int damage)
        {
            if (!PlayerCombatWired) return false;
            if (HarpActive || DashActive) return true;   // web: no damage while the chain move runs
            // E strike window (sBash): isPWin
            if (ParryRules.IsParryWindow(Player.State, Player.StateTicks, 0, SbParryT, CapeParry) && Player.State == "sBash") { ApplyParrySuccess(false); return true; }
            var b = PlayerPoise.ShieldBranch(new PlayerPoise.BlockInput { S = Player.State, SbParryT = SbParryT, Dmg = damage, Poise = Player.Poise, PGuard = PGuard, ShieldBlockDR = ShieldBlockDR, CcRes = CcRes, StunRes = StunRes, Dot = false, RedBean = false });
            if (!b.ReachedDamage) { SbParryT = b.SbParryT; ApplyParrySuccess(true); return true; }
            if (Player.State == "sBlock" || Player.State == "peaceShield")
            {
                damage = (int)b.Dmg; Player.Poise = (float)b.Poise; SbParryT = b.SbParryT;
                if (b.S == "pStun") { Player.State = "pStun"; Player.StateTicks = (float)b.St2; Player.Iframes = (float)b.Iframes; }
            }
            return false;
        }

        private void ApplyParrySuccess(bool qParry)
        {
            var r = ParryRewards.Apply(new ParryRewards.Input
            {
                PlayerState = Player.State, ForceQ = qParry, SbParryT = SbParryT, ResourceMul = 1, ParryBonus = ParryBonus, PRegen = PRegen, OptHitStop = 100, OptShake = 100,
                Iframes = Player.Iframes, Hp = Player.Hp, Mhp = Player.MaxHp, St = Player.Stamina, Mst = Player.MaxStamina, Mp = Player.Mana, Mmp = Player.MaxMana, Poise = Player.Poise, MaxPoise = PlayerPoise.MaxPoise,
                Rage = Rage, RageMax = RageMaximum, Mats = Materials, HarpGauge = HarpGauge, HarpGaugeMax = HarpGaugeMax,
            });
            Player.Iframes = (float)r.Iframes; Player.Hp = (float)r.Hp; Player.Stamina = (float)r.St; Player.Mana = (float)r.Mp; Player.Poise = (float)r.Poise; HarpGauge = r.HarpGauge; AddMalice((int)r.Mats - Materials); SetRage(r.Rage);
            ParryCount++; LastParryHp = r.Hp;
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
