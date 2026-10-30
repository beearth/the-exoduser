using System;
using System.Collections.Generic;
using System.Linq;
using Exoduser.UnityPort.Core.Combat;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort.Core
{
    // PC-B07 player dash / parry / shield / E-strike state machine on top of the web calculations in ParryRules / ParryRewards / ChainDash / PlayerPoise (wired:
    // PlayerCombatWired). B07b added the E strike hit (Simulation.BashStrike.cs: _gSlamHit circle, damage, stun, poise), parryBank, Q cancel of sRecover and the Shift gauge
    // bar. 사슬 후반 스톡 이동과 sRecover의 E 홀드 재진입은 현재 원문 순서로 연결했다.
    // NOT YET IMPLEMENTED: projectile reflection (the friendly blue-bean pipeline), silvertail lunge parry, unique hooks (_uKiPrecharge ...), the overhead gauge text, melee parry points other than the ones the
    // ported enemy AI / druid boss already call (Parry / TryParry).
    public sealed partial class Simulation
    {
        public static readonly bool PlayerCombatWired = true;   // static readonly (not const): the guarded branches must not produce CS0162

        // equipment / passive inputs (0 until the inventory layer feeds them)
        public double CapeParry, ShieldCdRed, CcRes, StunRes, ParryBonus, PParry, PRegen, PGuard, ShieldBlockDR, MaliceSwipeLevel, ShieldThrowLevel, PCharge;
        // 습득·강화·저장 레벨이 사슬 계산의 한 입력이다. 기존 공개 입력의 대입도 스킬북에 반영한다.
        public double ChargeBoostLevel { get { return Skills.Level("chargeBoost"); } set { if (value >= 1) Skills.Levels["chargeBoost"] = (int)value; else Skills.Levels.Remove("chargeBoost"); } }
        // player combat state (web P._sbParryT, P._sbHoldT, P._sbReleaseR, P._sbCd, P._sdHold, P._kgChg, P._sBashChgMul, _harpGauge ...)
        public double SbParryT, SbHoldT, SbReleaseR, SbCd, SdHold, KgChg, SBashChgMul = 1, HarpGauge = 225, HarpGaugeMax = 225;
        // chain dash (web _dashHold/_dashHoldF/_harpActive/_dashActive)
        public bool DashHold, HarpActive, DashActive; public double DashHoldF; public int HarpTier;
        // 발사 때 선택을 고정한다. 비행 중 슬롯을 바꿔도 현재 사슬의 속성은 바뀌지 않는다.
        public string HarpSkill = "charge";
        public int MagicBlinkLevel { get { return Skills.Level("magicBlink"); } }
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
            if (!PlayerCombatWired) return;
            if (SbCd > 0 && Player.State != "sBlock") SbCd--;
            if (CombatBusy) return;
            bool qDown = combatQHeld && !combatQPrev, eDown = combatEHeld && !combatEPrev;
            if (SbParryT > 0 && Player.State != "sBlock") SbParryT--;   // release window counts down by itself (12 frames)
            // 원본 _tryKiSlashQCancel: 기검 3타 자세는 Q 홀드로도 즉시 취소하며 그 틱은 이동하지 않는다.
            bool kiCancel = Config.ActiveAttack == "kiSlash" && (Player.State == "wWindup" || Player.State == "wSwing" || Player.State == "wRecover") && combatQHeld;
            // ---- Q: shield / parry ----
            if ((Player.State == "idle" && combatQHeld && !HarpActive && !DashActive || Player.State == "sRecover" && qDown || kiCancel) && SbCd <= 0)   // 사슬 중 idle 시작 행동 차단, 계속 누른 Q는 착지 뒤 허용
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
            if (Player.State == "sBash" || Player.State == "sRecover" || Player.State == "bowRecover") MovePlayerAction(.8f);
            if (BashStrikeMoment) BashStrike();
            // 원문의 후반 자세 취소는 일반 홀드 발사와 달리 게이지 대신 스톡·ST를 쓴다.
            if ((Player.State == "sBash" && Player.StateTicks <= 14 || Player.State == "sRecover" || Player.State == "bowRecover") && TryLateChainMove(false)) return;
            if (Player.State == "bowRecover" && Player.StateTicks <= 0) Player.State = "idle";
            // ---- E: shield strike (tap = sBash, hold = charge) ----
            if (Player.State == "idle" && eDown && !playerActionBranchConsumed && !HarpActive && !DashActive) { MovePlayerAction(1, true); Player.State = "sDraw"; SdHold = 0; }
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
                TryLateChainMove(true); // E 자세·충전량을 유지하고 같은 틱의 충전도 계속한다.
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
            else if (Player.State == "sRecover" && Player.StateTicks <= 0) { Player.State = combatEHeld ? "sDraw" : "idle"; if (combatEHeld) SdHold = 0; SBashChgMul = 1; ShieldWingTicks = 0; }
            // ---- Shift: chain move ----
            // 사슬은 원문 update의 재생 앞 단계에서 실행한다.
            // 기절 자연 종료·Shift 탈출은 Simulation의 후반 자세 분기에서 처리한다.
        }

        /// <summary>The enemies already hit by the current chain pull (web _harpHits): each is hit once per cast.</summary>
        public readonly List<EnemyState> DashHits = new List<EnemyState>();

        private bool TryLateChainMove(bool gathering)
        {
            if (!combatShiftHeld || Player.ChargeStocks <= 0 || HarpActive || gathering && DashActive || Skills.ChargeSkill != "charge" && Skills.ChargeSkill != "magicBlink") return false;
            bool magic = Skills.ChargeSkill == "magicBlink";
            int cost = magic ? SkillMpCost("blink", "magicBlink") : SkillStCost("charge", "chargeBoost");
            if (magic ? Player.Mana < cost : cost <= 0 || Player.Stamina < cost) return false;
            if (magic) Player.Mana = Math.Max(0, Player.Mana - cost); else Player.Stamina -= cost;
            Player.ChargeStocks--; HarpSkill = Skills.ChargeSkill;
            if (Player.ChargeStocks < Player.MaxChargeStocks && Player.ChargeCd <= 0) Player.ChargeCd = 300;
            DashHold = false; DashHoldF = 0; HarpTier = ChainDash.CancelTier(ChargeBoostLevel);
            HarpActive = true; HarpDist = 0; HarpMaxDist = ChainDash.DistanceOfTier(HarpTier, ChargeBoostLevel, MagicBlinkLevel, PCharge);
            double direction = actionMoveX != 0 || actionMoveY != 0 ? Math.Atan2(actionMoveY, actionMoveX) : Player.Facing;
            HarpDirX = (float)Math.Cos(direction); HarpDirY = (float)Math.Sin(direction);
            HarpX = Player.X; HarpY = Player.Y; DashHits.Clear();
            return true;
        }

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
                if (HarpSkill == "magicBlink")
                {
                    int dmg = Js.Int(MagicReference() * SkillRules.SkMul("magicBlink", MagicBlinkLevel) * MagicDamageMultiplier() * Math.Max(1, Math.Min(3, HarpTier)));
                    ApplyEnemyDamage(e, dmg, (float)ang, true, 1, false, false, 0, 0, false, 1, false, false, false, false, 1.5);
                    var w = e.Web ?? SyncToWeb(e); w.burnT = Math.Max(w.burnT, 180); w.burnStk = Math.Min(10, w.burnStk + 1);
                }
                else
                {
                    int dmg = ChainDash.PathHitDamage(ChargeBoostLevel, armor != null ? armor.charge : 0, Player.BaseAttack, 1, EquippedInventory != null ? EquippedInventory.AffixTotal("dashBoost") : 0);
                    ApplyEnemyDamage(e, dmg, (float)ang, true, (float)ChainDash.PathHitKnockbackMult, false, false, 0, 0, false, armor != null ? armor.el : 0, false, false, false, false, ChainDash.PathHitPoiseMult);
                    e.KnockbackX += (float)(Math.Cos(ang) * ChainDash.PathHitPush); e.KnockbackY += (float)(Math.Sin(ang) * ChainDash.PathHitPush);
                }
                ShakeAmount = (float)(ChainDash.PathHitShake * OptShake / 100);   // G.shake = 4 * OPT.shake / 100 (G.hitStop is not modelled in the Core)
                if (!inEnemyLoop) FlushDeathSpawns();
            }
        }

        private bool FireChain(int tier, bool resetHoldFrames = true)
        {
            var result = ChainDash.Release(tier, HarpGauge, Player.Stamina, Player.MaxStamina, ChargeBoostLevel, MagicBlinkLevel, PCharge);
            if (!result.Fired) return false;
            HarpGauge = result.Gauge; Player.Stamina = (float)result.St; HarpTier = tier;
            HarpActive = true; HarpDist = 0; HarpMaxDist = result.MaxDist; HarpSkill = Skills.ChargeSkill ?? "charge";
            HarpDirX = (float)Math.Cos(Player.Facing); HarpDirY = (float)Math.Sin(Player.Facing);
            HarpX = Player.X; HarpY = Player.Y; DashHits.Clear();
            ChainSlamReady = ChainAssaultReady = false; ChainSkillDelay = 3;
            DashHold = false; if (resetHoldFrames) DashHoldF = 0;
            return true;
        }

        // 키 이벤트는 기절/경직 중에도 먼저 처리하며, 실제 비행 갱신은 원문 순서를 따른다.
        private void UpdateChainInputEvents()
        {
            bool shiftDown = combatShiftHeld && !combatShiftPrev;
            bool shiftUp = !combatShiftHeld && combatShiftPrev;
            if (shiftDown)
            {
                if (HarpActive || DashActive) { HarpActive = false; DashActive = false; DashHold = false; DashLeft = 0; DashVx = DashVy = 0; }
                else if (!DashHold && HarpGauge > 0) { DashHold = true; DashHoldF = 0; }
            }
            // 키업은 update 진입 전 이벤트이고, 만충 자동 발사는 update의 홀드 증가 뒤다.
            if (shiftUp && DashHold && (HarpActive || DashActive)) { DashHold = false; DashHoldF = 0; }
            if (shiftUp && DashHold && !HarpActive && !DashActive)
            {
                FireChain(ChainDash.TierForHoldFrames(DashHoldF), false); DashHold = false;
            }
        }

        private void TickChainDash()
        {
            bool chainHoldBlocked = Player.State == "pStun";
            HarpGauge = ChainDash.RegenGauge(HarpGauge, HarpGaugeMax, ChargeBoostLevel, PCharge, 1, DashHold, HarpActive, DashActive, chainHoldBlocked, false);
            if (!chainHoldBlocked && DashHold && combatShiftHeld && DashHoldF < ChainDash.HoldFramesCap)
            {
                DashHoldF++;
                if (DashHoldF >= ChainDash.TierHoldFrames[3] && !HarpActive && !DashActive) FireChain(3);
                if (DashHold && !HarpActive && !DashActive)
                {
                    int tier = ChainDash.TierForHoldFrames(DashHoldF);
                    double range = ChainDash.AvailableDistance(tier, HarpGauge, ChargeBoostLevel, MagicBlinkLevel, PCharge);
                    float dx = (float)Math.Cos(Player.Facing), dy = (float)Math.Sin(Player.Facing);
                    for (double d = 16; d <= range; d += 16)
                        if (!Pass(Player.X + dx * (float)d, Player.Y + dy * (float)d, 2)) { FireChain(tier); break; }
                }
            }
            if (ChainSkillDelay > 0) ChainSkillDelay--;
            if (HarpActive && !DashActive)
            {
                double step, distance = HarpDist;
                ChainDash.FlightStep(1, HarpMaxDist, ref distance, out step); HarpDist = distance;
                HarpX += HarpDirX * ChainDash.FlightSpeed * step; HarpY += HarpDirY * ChainDash.FlightSpeed * step;
                if (HarpDist >= HarpMaxDist)
                {
                    if (!Pass((float)HarpX, (float)HarpY, 2)) { HarpX -= HarpDirX * ChainDash.FlightSpeed * 2; HarpY -= HarpDirY * ChainDash.FlightSpeed * 2; }
                    var pull = ChainDash.StartPull(HarpTier, Player.X, Player.Y, (float)HarpX, (float)HarpY);
                    DashActive = true; DashVx = pull.Vx; DashVy = pull.Vy; DashLeft = pull.Left; Player.Poise = (float)pull.Poise;
                }
            }
            if (DashActive)
            {
                Player.Iframes = Math.Max(Player.Iframes, ChainDash.MoveIframesMin);
                double step = ChainDash.PullStep(1, DashLeft);
                float x = Player.X + (float)(DashVx * step), y = Player.Y + (float)(DashVy * step);
                if (Pass(x, y, Player.Radius)) { Player.X = x; Player.Y = y; } else DashLeft = 0;
                TickDashPathHits();
                if (HarpSkill == "magicBlink" && Js.Int(DashLeft) % 3 == 0)
                {
                    int lv = Math.Max(1, MagicBlinkLevel);
                    FireZones.Add(new FireZone { Id = nextZoneId++, Type = "fireTrail", X = Player.X, Y = Player.Y, R = 40 + lv * 3, Dmg = Js.Int(MagicReference() * SkillRules.SkMul("magicBlink", lv) * MagicDamageMultiplier() * .5), MaxT = 720, Lv = lv });
                }
                DashLeft -= step;
                if (DashLeft <= 0)
                {
                    LandChainSlam();
                    DashActive = false; HarpActive = false; DashHold = false; DashHoldF = 0; HarpTier = 0;
                    Player.Iframes = (float)ChainDash.LandingInvulnerable(Player.Iframes);
                    // 착지 직후 계속 누른 Shift는 잔여 게이지로 최고단을 다시 발사한다.
                    if (combatShiftHeld) FireChain(3);
                }
            }
        }

        // 원문33008: 사슬 갱신과 무적 감소 뒤, 후반 자세 처리 앞에서 최대 게이지·스톡을 갱신한다.
        private void TickChainStocks()
        {
            var armor = EquippedInventory != null ? EquippedInventory.GetEquipped("armor") : null;
            var boots = EquippedInventory != null ? EquippedInventory.GetEquipped("boots") : null;
            double extra = EquippedInventory != null ? EquippedInventory.AffixTotal("extraST") : 0;
            var maximum = ChainDash.ComputeGaugeMax(false, false, false, ChargeBoostLevel, MagicBlinkLevel, extra, armor != null ? armor.bonusChargeStock : 0, boots != null ? boots.bonusChargeStock : 0);
            Player.MaxChargeStocks = maximum.MaxStocks;
            HarpGaugeMax = maximum.Max; HarpGauge = Math.Min(HarpGauge, HarpGaugeMax);
            if (Player.ChargeStocks < Player.MaxChargeStocks)
            {
                if (Player.ChargeCd > 0) Player.ChargeCd--;
                else { Player.ChargeStocks++; if (Player.ChargeStocks < Player.MaxChargeStocks) Player.ChargeCd = Js.Int(maximum.CdBase * (1 + (EquippedInventory != null ? EquippedInventory.AffixTotal("dashCooldown") : 0))); }
            }
        }

        // 사망 재시도 끝의 원문 _refillRespawnResources 중 사슬 자원 경계.
        // 일반 저장 복원은 이 호출로 채우지 않으며 Native의 실제 사망 경로에서만 호출한다.
        public void RefillChainAfterRespawn()
        {
            TickChainStocks();
            Player.ChargeStocks = Player.MaxChargeStocks; Player.ChargeCd = 0;
            HarpGauge = HarpGaugeMax;
        }

        // 원문 리트라이 공통 대입 + _refillRespawnResources. 사망 경로 전용이며 저장 로드는 제외한다.
        public void RefillAfterDeathRetry()
        {
            Player.Hp = Player.MaxHp; Player.Mana = Player.MaxMana; Player.Stamina = Player.MaxStamina; Player.Shield = Player.MaxShield;
            Player.State = "idle"; Player.Iframes = 300; Player.KnockbackX = Player.KnockbackY = 0;
            PlayerPoison = PlayerWebSlow = PlayerTrapSlow = PlayerFreezeSlow = 0;
            RefillChainAfterRespawn();
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
