using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort.Core
{
    // PC-B03: the skill executor for the warrior's starting set (web _dispatchSkillSlot / _dispatchCtSkill + activateSpikeTrap / activateGiantSlam / activateHolyDome /
    // activateIceOrb + activateIceShatter and the G._fireZones / iceOrb / gSlam state ticks of update()). Slots: 1~4, Space (rage burst), F (area), Ctrl (fixed), Z (ult).
    // Formulas live in Skills/SkillRules.cs (oracle-checked); this file owns state, input edges, costs, targets and the per-frame ticks.
    [Serializable] public sealed class SkillBook
    {
        public readonly Dictionary<string, int> Levels = new Dictionary<string, int>();
        public readonly string[] Slots = new string[SkillRules.SlotCount];   // SKILL_SLOTS: 1,2,3,4,Space,F
        public string UltSlot, CtSkill = "iceOrb", MagicSkill = "fireball";  // ULT_SLOT, P.activeCtSk, P.activeMagicSk (E slot; fireball is the only ported one)
        public int Level(string id) { int v; return id != null && Levels.TryGetValue(id, out v) ? v : 0; }
        public bool Learned(string id) { return Level(id) >= 1; }
    }

    public sealed class FireZone { public int Id; public string Type; public float X, Y, R, TickTimer; public int T, MaxT, Lv, Dmg; }
    public sealed class SlamWave { public int Id; public float X, Y, MaxR; public int T, MaxT; public bool Bash, Flame; }   // Bash: the E strike wave (blue-grey, web col #66aadd)
    public sealed class SkillBlade
    {
        public int Id, Dmg, Pierced; public bool Active; public float X, Y, Vx, Vy, Dist, MaxDist, Radius;
        internal readonly HashSet<EnemyState> Hit = new HashSet<EnemyState>();
    }

    public sealed partial class Simulation
    {
        public readonly SkillBook Skills = new SkillBook();
        public readonly List<FireZone> FireZones = new List<FireZone>();
        public readonly List<SlamWave> SlamWaves = new List<SlamWave>();
        public readonly List<SkillBlade> SkillBlades = new List<SkillBlade>();
        // P._gcCd (spike trap), P._gslCd (giant slam), P._hdCd (holy dome), P._ioCd (ice orb); frames
        public float SpikeTrapCd, GiantSlamCd, HolyDomeCd, IceOrbCd;
        public bool IceOrbActive; public int IceOrbT; public float IceOrbX, IceOrbY; public int IceOrbBonus, GiantSlamLevel;
        public bool SkillsWired = true;
        // passives / equipment the web reads in these formulas and Unity has not ported yet (0 = none): pMagic, pAtk, pMelee, pPierce ...
        public double PassiveMagic, PassiveAtk, PassiveMelee;
        // outcome counters for the presentation layer / smoke
        public int SkillCastCount, SkillDeniedCount; public string LastSkill, LastSkillDenied;
        public event Action<string> SkillCast;   // id of the skill that was just started

        private bool skD1, skD2, skD3, skD4, skSpace, skF, skCtrl, skZ, skP1, skP2, skP3, skP4, skPSpace, skPF, skPCtrl, skPZ;
        private bool skSuppressSpace;
        // Skill effects (blade scatter, voice choice, pierce rolls) draw from their own stream (web Math.random): the shared sim stream stays the enemy / loot owners'.
        private uint skillRandomState = 0x9E3779B9u;
        private double SkillRandom() { skillRandomState = unchecked(skillRandomState * 1664525u + 1013904223u); return skillRandomState / 4294967296.0; }
        private int nextZoneId = 1, nextBladeId = 1, nextWaveId = 1;
        private readonly HashSet<EnemyState> spikeHitThisFrame = new HashSet<EnemyState>();

        // start state of a new character (game.html 62632-62640 / 62334-62336 + the Ctrl iceOrb that is always granted): giantSlam -> Space, holyDome -> F, spikeTrap -> 1, iceOrb -> Ctrl
        public void InitStartingSkills()
        {
            Skills.Levels["giantSlam"] = 1; Skills.Slots[SkillRules.SlotSpace] = "giantSlam";
            Skills.Levels["holyDome"] = 1; Skills.Slots[SkillRules.SlotF] = "holyDome";
            Skills.Levels["spikeTrap"] = 1; Skills.Slots[0] = "spikeTrap";
            Skills.Levels["iceOrb"] = 1; Skills.CtSkill = "iceOrb";
            Skills.Levels["maliceSwipe"] = 1; Skills.Levels["shieldThrow"] = 1; MaliceSwipeLevel=1; ShieldThrowLevel=1;
            Skills.Levels["fireball"] = 1; Skills.MagicSkill = "fireball";   // E: P.skills.fireball||1 is always usable (default skill)
        }

        // ---- save (web `skills`, `skillSlots`, `ultSlot`, `activeCtSk`): only the skills this executor runs are owned by Unity ----
        public static readonly string[] PortedSkillIds = { "spikeTrap", "giantSlam", "holyDome", "iceOrb", "fireball", "maliceSwipe", "shieldThrow" };
        static bool IsPorted(string id) { return id != null && Array.IndexOf(PortedSkillIds, id) >= 0; }
        public void CaptureSkills(out Dictionary<string, double> skills, out string[] slots, out string ult, out string ct)
        {
            skills = new Dictionary<string, double>(); foreach (var id in PortedSkillIds) skills[id] = Skills.Level(id);
            slots = new string[SkillRules.SlotCount]; for (int i = 0; i < slots.Length; i++) slots[i] = IsPorted(Skills.Slots[i]) ? Skills.Slots[i] : null;
            ult = null; ct = Skills.CtSkill;
        }
        // m.Skills == null (a save from before the skills were stored) keeps the new-character start state
        public void RestoreSkills(Dictionary<string, double> skills, string[] slots, string ult, string ct)
        {
            if (skills == null) return;
            foreach (var id in PortedSkillIds) { double v; skills.TryGetValue(id, out v); if ((id == "fireball"||id=="maliceSwipe"||id=="shieldThrow") && v < 1) v = 1; if (v >= 1) Skills.Levels[id] = (int)v; else Skills.Levels.Remove(id); }
            for (int i = 0; i < SkillRules.SlotCount; i++) Skills.Slots[i] = slots != null && i < slots.Length && IsPorted(slots[i]) && Skills.Learned(slots[i]) ? slots[i] : null;
            MaliceSwipeLevel=Skills.Level("maliceSwipe");ShieldThrowLevel=Skills.Level("shieldThrow");
            Skills.CtSkill = IsPorted(ct) && Skills.Learned(ct) ? ct : (Skills.Learned("iceOrb") ? "iceOrb" : null);
        }

        // held states of 1..4, Space (rage burst key), F, Ctrl and Z, once per tick before Tick(); spaceIsRollKey: the Space key also rolls (a direction held => roll, no slam)
        public void SetSkillInput(bool d1, bool d2, bool d3, bool d4, bool space, bool f, bool ctrl, bool z, bool spaceIsRollKey = false)
        {
            skP1 = skD1; skP2 = skD2; skP3 = skD3; skP4 = skD4; skPSpace = skSpace; skPF = skF; skPCtrl = skCtrl; skPZ = skZ;
            skD1 = d1; skD2 = d2; skD3 = d3; skD4 = d4; skSpace = space; skF = f; skCtrl = ctrl; skZ = z;
            // 13380-13383: Space pressed while a direction is held starts the roll and returns before the slot dispatch
            skSuppressSpace = spaceIsRollKey && rollPending >= 0;
        }

        // ---- references (meleeRef / magicRef / pMagicMul / _cdRed / pMagicCost) ----
        public double MagicReference()
        {
            var inv = EquippedInventory; var h = inv != null ? inv.GetEquipped("helmet") : null;
            double atk = h != null ? h.atk : 0, enh = h != null ? h.enh * .25 : 0, flat = 0, intel = (int)(Player.Level * .5);
            if (h != null && h.affixes != null) foreach (var a in h.affixes) if (a != null && (a.id == "sharpAtk" || a.id == "brutalAtk" || a.id == "ruinAtk")) flat += a.value;
            if (inv != null) foreach (var i in inv.Equipped) if (i != null) intel += i.bInt;
            return atk + enh + flat + Player.BaseAttack + intel;
        }
        // pMagicMul(true) = _passDmgSum('magic') * (1 + _uHelmMagic) * 2;  _passDmgSum = (1 + pMagic*.10 + magicDmg + _iMagDmg*.01) * 0.7
        public double MagicDamageMultiplier()
        {
            var inv = EquippedInventory;
            double s = PassiveAtk * .10 + PassiveMagic * .10 + (inv != null ? inv.AffixTotal("magicDmg") + inv.ImplicitTotal("_iMagDmg") * .01 : 0);
            return (1 + s) * 0.7 * 2;
        }
        public double CooldownReduction
        {
            get { var inv = EquippedInventory; return inv == null ? 0 : inv.AffixTotal("cooldownRed") + inv.AffixTotal("helmCooldown") + inv.AffixTotal("endCooldownAll") + inv.AffixTotal("skillCdRed"); }
        }
        public double MagicCostMultiplier() { var inv = EquippedInventory; return SkillRules.PMagicCost(PassiveMagic, inv != null ? inv.AffixTotal("mpCostRed") : 0, 0); }
        public int SkillStCost(string key, string skillId) { return SkillRules.StCost(key, Skills.Level(skillId), Player.MaxStamina, SkillRules.PAtkCost(PassiveAtk), SkillRules.PMeleeStCost(PassiveMelee), EquippedInventory != null ? EquippedInventory.AffixTotal("stCostRed") : 0); }
        public int SkillMpCost(string key, string skillId) { return SkillRules.MpCost(key, Skills.Level(skillId), MagicCostMultiplier()); }

        // ---- level up (_skCtx / _skLearnUp upgrade branch): SP is Player.StatPoints ----
        public bool CanUpgradeSkill(string id) { return SkillRules.CanUpgrade(Skills.Learned(id), Skills.Level(id), Player.StatPoints, Player.Level); }
        public bool UpgradeSkill(string id)
        {
            if (!CanUpgradeSkill(id)) return false;
            Player.StatPoints -= SkillRules.UpgradeSpCost; Skills.Levels[id] = Skills.Level(id) + 1; if(id=="maliceSwipe")MaliceSwipeLevel=Skills.Level(id);if(id=="shieldThrow")ShieldThrowLevel=Skills.Level(id);return true;
        }

        // HUD cooldown sweep: remaining frames and the full length of the skill's last cooldown
        public float SkillCooldown(string id, out float total)
        {
            total = 0; int lv = Math.Max(1, Skills.Level(id));
            switch (id)
            {
                case "spikeTrap": total = SkillRules.SpikeTrapCooldown(CooldownReduction); return SpikeTrapCd;
                case "giantSlam": total = SkillRules.GiantSlamCooldown(GiantSlamLevel > 0 ? GiantSlamLevel : lv, CooldownReduction); return GiantSlamCd;
                case "holyDome": total = SkillRules.HolyDomeCooldown; return HolyDomeCd;
                case "iceOrb": total = SkillRules.IceOrbCooldown(lv); return IceOrbCd;
            }
            return 0;
        }

        private void DenySkill(string id, string reason) { SkillDeniedCount++; LastSkillDenied = id + ":" + reason; }
        private bool SkillBusy { get { return CombatBusy || Player.State == "dead" || Player.State == "fallen" || RollActive || HarpActive || DashActive; } }

        // ---- the per-frame skill tick (called after the roll) ----
        private void TickSkills()
        {
            if (!SkillsWired) return;
            spikeHitThisFrame.Clear();
            bool dead = Player.Hp <= 0 || Player.State == "dead" || Player.State == "fallen";
            if (!dead) DispatchSkillKeys();
            TickSkillCooldowns();
            if (IceOrbActive) TickIceOrb();
            TickMagicIdle(); TickMagicStates();
            CaptureShieldDomeFrame(); TickFireZones();
            TickSkillBlades(); TickMaliceOrbs();
            for (int i = SlamWaves.Count - 1; i >= 0; i--) { var w = SlamWaves[i]; w.T++; if (w.T >= w.MaxT) SlamWaves.RemoveAt(i); }
        }

        private void DispatchSkillKeys()
        {
            // 13400: digits 1~4 -> slot; 13421 Space, 13425 F (not repeats); Ctrl fixed skill; Z ult slot
            if (skD1 && !skP1) DispatchSlot(0); if (skD2 && !skP2) DispatchSlot(1); if (skD3 && !skP3) DispatchSlot(2); if (skD4 && !skP4) DispatchSlot(3);
            if (IceOrbActive && skSpace && !skPSpace && !skSuppressSpace) { ActivateIceShatter(); return; }   // 13404: Space while inside the orb shatters it
            if (skSpace && !skPSpace && !skSuppressSpace && Skills.Slots[SkillRules.SlotSpace] != null && !(HarpActive || DashActive)) DispatchSlot(SkillRules.SlotSpace);
            if (skF && !skPF && Skills.Slots[SkillRules.SlotF] != null) DispatchSlot(SkillRules.SlotF);
            if (skCtrl && !skPCtrl && Skills.CtSkill != null) DispatchCt();
            if (skZ && !skPZ && Skills.UltSlot != null) { /* Z ult skills (blackStar / lavaSummon) are not ported yet */ }
        }

        // _dispatchSkillSlot (12905-13091), the ported branches only
        public bool DispatchSlot(int slot)
        {
            if (slot < 0 || slot >= SkillRules.SlotCount) return false;
            string sid = Skills.Slots[slot];
            if (sid == null || !Skills.Learned(sid)) return false;
            if (Player.State == "dead" || Player.State == "fallen") return false;
            if (Player.State == "pStun") { Player.Poise = PlayerPoise.MaxPoise; }   // skills break out of a stun with full poise
            if (IceOrbActive && sid != "iceOrb") { RaisePlayerText(Player.X, Player.Y - 30, "얼음보주 안에선 사용 불가!", "#88ddff", 40); return true; }
            switch (sid)
            {
                case "spikeTrap": return CastSpikeTrap();
                case "giantSlam": return CastGiantSlam("giantSlam");
                case "holyDome": return CastHolyDome();
                case "iceOrb": return CastIceOrb();
            }
            return false;
        }

        // _dispatchCtSkill (13228-13250): re-entering while the orb is active shatters it
        public bool DispatchCt()
        {
            string sid = Skills.CtSkill;
            if (sid == null || !Skills.Learned(sid)) return false;
            if (IceOrbActive) { ActivateIceShatter(); return true; }
            if (sid == "iceOrb") return CastIceOrb();
            return false;
        }

        private void Cast(string id) { SkillCastCount++; LastSkill = id; var h = SkillCast; if (h != null) h(id); }
        private void SkillSample(string key, double volume, double rate)
        {
            Feedback.Enqueue(new FeedbackEvent { Kind = FeedbackKind.Sample, Tick = TickCount, X = Player.X, Y = Player.Y, SampleKey = key, Volume = (float)volume, Rate = (float)rate, QueuedRate = (float)rate });
        }

        // ---- 가시덫 (13146 + activateSpikeTrap 45656) ----
        private bool CastSpikeTrap()
        {
            if (Materials < MaliceCost(SkillRules.SpikeTrapMalice)) { RaisePlayerText(Player.X, Player.Y - 30, "악의 부족! (" + MaliceCost(SkillRules.SpikeTrapMalice) + ")", "#ff4444", 40); DenySkill("spikeTrap", "malice"); return false; }
            if (SpikeTrapCd > 0) { DenySkill("spikeTrap", "cooldown"); return false; }
            int paid; TrySpendMalice(SkillRules.SpikeTrapMalice, out paid);
            SpikeTrapCd = SkillRules.SpikeTrapCooldown(CooldownReduction);
            int lv = Math.Max(1, Skills.Level("spikeTrap"));
            FireZones.Add(new FireZone { Id = nextZoneId++, Type = "spikeTrap", X = Player.X, Y = Player.Y, R = (float)SkillRules.SpikeTrapRadius(lv), MaxT = SkillRules.SpikeTrapMaxT, Lv = lv,
                Dmg = SkillRules.SpikeTrapDamage(MagicReference(), 1, MagicDamageMultiplier(), lv) });
            SkillSample("spike_trap", .8, 1); HurtShake(4); Cast("spikeTrap");
            return true;
        }

        // ---- 지옥강타 1 (13135 + activateGiantSlam 46596 + _gSlamHit 46675) ----
        public event Action<double> RageCastHook;
        private bool CastGiantSlam(string srcId)
        {
            int stCost = SkillStCost("giantSlam", "giantSlam");
            if (Player.Stamina < stCost) { DenySkill(srcId, "stamina"); return false; }
            if (Materials < MaliceCost(SkillRules.GiantSlamMalice)) { RaisePlayerText(Player.X, Player.Y - 30, "악의 부족!", "#ff4444", 40); DenySkill(srcId, "malice"); return false; }
            if (GiantSlamCd > 0) { DenySkill(srcId, "cooldown"); return false; }
            int slv = Math.Max(1, Skills.Level(srcId) > 0 ? Skills.Level(srcId) : Skills.Level("giantSlam"));
            Player.Stamina = Math.Max(0, Player.Stamina - stCost);
            int paid; TrySpendMalice(SkillRules.GiantSlamMalice, out paid);
            GiantSlamCd = SkillRules.GiantSlamCooldown(slv, CooldownReduction); GiantSlamLevel = slv;
            Player.State = "gSlamWindup"; Player.StateTicks = SkillRules.GiantSlamWindup;
            var rage = ConsumeRageForSlam();   // _rageMul (1 + rage*0.19*(1+pRage*.10)*(1+rageDmg)) and spends the rage
            if (RageCastHook != null) RageCastHook(rage.Consumed);   // parry-lesson.js rageCast(amount)
            int dmg = SkillRules.GiantSlamDamage(MeleeReference(), 1, slv, rage.DamageMul);
            double range = SkillRules.GiantSlamRange(slv);
            GiantSlamHit(range, dmg, slv);
            ShakeAmount = Math.Max(ShakeAmount, (float)(14 * OptShake / 100.0));
            SlamWaves.Add(new SlamWave { Id = nextWaveId++, X = Player.X, Y = Player.Y, MaxR = (float)(range * 2), MaxT = SkillRules.GiantSlamWaveMaxT });
            SkillSample("heavy_hit", 1, 1); SkillSample(SkillRandom() < .5 ? "voice_grunt" : "male_grunt", 1, 1); Cast("giantSlam");
            return true;
        }

        // _gSlamHit: circular damage inside `range`, poise / stun on everything inside the stun range (= range)
        private void GiantSlamHit(double range, int rawDmg, int slv)
        {
            int dmg = SkillRules.GiantSlamHitDamage(rawDmg, Config.DamageMultiplier, 0);
            foreach (var e in Enemies.ToArray())
            {
                if (!e.Alive) continue;
                float d = Distance(Player.X, Player.Y, e.X, e.Y);
                if (d > range + e.Radius) continue;
                float ang = (float)Math.Atan2(e.Y - Player.Y, e.X - Player.X);
                ApplyEnemyDamage(e, dmg, ang, false, 0, false, false, 0, 0, false, 0);
                e.KnockbackX += (float)Math.Cos(ang) * 8; e.KnockbackY += (float)Math.Sin(ang) * 8;
                if (!e.Alive) continue;
                if (e.IsBoss) PoiseHitEnemy(e, Js.Int(e.MaxPoise * 0.25));
                else
                {
                    e.Stunned = Math.Max(e.Stunned, SkillRules.GiantSlamMiniStun);
                    if (e.Poise <= 0) { e.Stunned = Math.Max(e.Stunned, SkillRules.GiantSlamFullStun(slv)); e.Poise = 0; }
                    if (e.Web != null) e.Web.stunned = e.Stunned;
                }
            }
            HurtFieldMobs(Player.X, Player.Y, range, dmg, null);   // _gSlamHit ends with _hurtFieldMobs(P.x, P.y, range, dmg) (web 46824)
            HurtShake(18);
        }

        // _poiseHit(e, amt) on the Core types (boss: groggy 90 f + 300 f immunity, ordinary: 180 f)
        private bool PoiseHitEnemy(EnemyState e, double amt)
        {
            if (!e.Alive || amt <= 0) return false;
            var w = SyncToWeb(e);
            var r = Combat.EnemyPoiseRules.PoiseHit(new Combat.EnemyPoiseRules.Enemy { Alive = e.Alive, Boss = e.IsBoss, Poise = e.Poise, MaxPoise = e.MaxPoise, PoiseR = e.PoiseRegenTicks, Stunned = e.Stunned, MaxStunned = e.MaxStunned, PImmune = w._pImmune ?? 0 }, amt, 60, 0);
            e.Poise = (float)r.Enemy.Poise; e.PoiseRegenTicks = (float)r.Enemy.PoiseR; e.Stunned = (float)r.Enemy.Stunned; e.MaxStunned = (float)r.Enemy.MaxStunned; w._pImmune = r.Enemy.PImmune;
            w.poise = e.Poise; w.stunned = e.Stunned; w._maxStunned = e.MaxStunned;
            return r.Broke;
        }

        // ---- 회복의 영역 (13131 + activateHolyDome 46854) ----
        private bool CastHolyDome()
        {
            if (HolyDomeCd > 0) { DenySkill("holyDome", "cooldown"); return false; }
            int lv = Math.Max(1, Skills.Level("holyDome"));
            HolyDomeCd = SkillRules.HolyDomeCooldown;
            FireZones.Add(new FireZone { Id = nextZoneId++, Type = "holyDome", X = Player.X, Y = Player.Y, R = (float)SkillRules.HolyDomeRadius(lv), MaxT = SkillRules.HolyDomeDuration(lv), Lv = lv });
            SkillSample(SkillRandom() < .5 ? "voice_holyDome" : "voice_holyDome2", 1, 1); HurtShake(3); Cast("holyDome");
            return true;
        }

        // ---- 얼음보주 (13057 / 13246 + activateIceOrb 46904) ----
        private bool CastIceOrb()
        {
            if (IceOrbActive) { ActivateIceShatter(); return true; }
            int mp = SkillMpCost("iceOrb", "iceOrb");
            if (Player.Mana < mp) { RaisePlayerText(Player.X, Player.Y - 30, "MP 부족!", "#4488ff", 40); DenySkill("iceOrb", "mana"); return false; }
            if (IceOrbCd > 0) { DenySkill("iceOrb", "cooldown"); return false; }
            float before = Player.Mana; Player.Mana = Math.Max(0, Player.Mana - mp);
            IceOrbBonus = (int)((before - Player.Mana) * 2);   // P._ioBon = useMp('iceOrb') * 2
            IceOrbActive = true; IceOrbT = 0; IceOrbX = Player.X; IceOrbY = Player.Y;
            Player.State = "iceOrb"; HurtShake(4);
            SkillSample("ice_storm", .6, 2.0); Cast("iceOrb");
            return true;
        }

        private void TickIceOrb()
        {
            if (Player.Hp <= 0) { IceOrbActive = false; return; }
            IceOrbT++;
            Player.State = "iceOrb";
            if (IceOrbT >= SkillRules.IceOrbAutoShatter) { ActivateIceShatter(); return; }
            // Shift: blink out by 180 px in the facing direction, then shatter from the orb position
            bool shift = combatShiftHeld && !combatShiftPrev;
            if (shift)
            {
                float ox = Player.X, oy = Player.Y;
                float bx = Player.X + (float)Math.Cos(Player.Facing) * SkillRules.IceOrbBlinkDistance, by = Player.Y + (float)Math.Sin(Player.Facing) * SkillRules.IceOrbBlinkDistance;
                ActivateIceShatter();
                if (Pass(bx, oy, Player.Radius)) Player.X = bx;
                if (Pass(Player.X, by, Player.Radius)) Player.Y = by;
                Player.Iframes = Math.Max(Player.Iframes, SkillRules.IceOrbEscapeIframes);
                RaisePlayerText(Player.X, Player.Y - 20, "❄ 탈출!", "#aaeeff", 30);
            }
        }

        // activateIceShatter (46914): blades in every direction + a close-range burst
        public void ActivateIceShatter()
        {
            if (!IceOrbActive) return;
            IceOrbActive = false;
            int slv = Math.Max(1, Skills.Level("iceOrb"));
            int baseDmg = SkillRules.IceOrbBaseDamage(MagicReference(), 1, MagicDamageMultiplier(), slv, IceOrbBonus); IceOrbBonus = 0;
            int bladeDmg = SkillRules.IceOrbBladeDamage(baseDmg), n = SkillRules.IceOrbBlades(slv);
            float cx = Player.X, cy = Player.Y; double spawnR = SkillRules.IceOrbSpawnRadius(Player.Radius, slv);
            for (int i = 0; i < n; i++)
            {
                double ang = (Math.PI * 2 / n) * i + (SkillRandom() - .5) * .15, spd = 7 + SkillRandom() * 3;
                var b = new SkillBlade { Id = nextBladeId++, Active = true, X = cx + (float)(Math.Cos(ang) * spawnR), Y = cy + (float)(Math.Sin(ang) * spawnR), Vx = (float)(Math.Cos(ang) * spd), Vy = (float)(Math.Sin(ang) * spd),
                    Dmg = bladeDmg, MaxDist = (float)SkillRules.IceOrbBladeMaxDist, Radius = (float)SkillRules.IceOrbBladeRadius };
                SkillBlades.Add(b);
            }
            double shatterR = SkillRules.IceOrbShatterRadius(slv); int shatterDmg = SkillRules.IceOrbShatterDamage(baseDmg);
            foreach (var e in Enemies.ToArray())
            {
                if (!e.Alive) continue;
                if (Distance(e.X, e.Y, cx, cy) < shatterR + e.Radius)
                    ApplyEnemyDamage(e, shatterDmg, (float)Math.Atan2(e.Y - cy, e.X - cx), false, 1, false, false, 0, 0, false, 2);
            }
            RaisePlayerText(cx, cy - 30, "❄ 파쇄!", "#aaeeff", 50); HurtShake(10);
            Player.State = "idle"; Player.StateTicks = 0;
            IceOrbCd = SkillRules.IceOrbCooldown(slv);
            SkillSample("ice_storm", .5, 1.4);
        }

        private void TickSkillBlades()
        {
            for (int i = SkillBlades.Count - 1; i >= 0; i--)
            {
                var b = SkillBlades[i];
                if (!b.Active) { SkillBlades.RemoveAt(i); continue; }
                b.X += b.Vx; b.Y += b.Vy; b.Dist += (float)Math.Sqrt(b.Vx * b.Vx + b.Vy * b.Vy);
                if (b.Dist >= b.MaxDist) { b.Active = false; continue; }
                bool wall = IsProjectileWall != null ? IsProjectileWall(b.X, b.Y) : !Pass(b.X, b.Y, 0);
                if (wall) { b.Active = false; continue; }
                foreach (var e in Enemies.ToArray())
                {
                    if (!e.Alive || b.Hit.Contains(e) || Distance(b.X, b.Y, e.X, e.Y) >= e.Radius + b.Radius) continue;
                    if (HasLineOfSight != null && !HasLineOfSight(b.X, b.Y, e.X, e.Y)) continue;
                    b.Hit.Add(e);
                    ApplyEnemyDamage(e, b.Dmg, (float)Math.Atan2(e.Y - b.Y, e.X - b.X), false, 0, false, false, 0, 0, false, 2);
                    // unified pierce (rate 50 + equipment): the first floor(50*91/1000) hits always pass, then 1 - 0.1 per extra hit
                    b.Pierced++;
                    bool passes = b.Pierced <= SkillRules.GuaranteedPierce(50) || SkillRandom() < SkillRules.PierceSurvive(b.Pierced, 50);
                    if (!passes) { b.Active = false; break; }
                    // ice blade: 75 %... -> web 35729: a hit enemy (not a boss) is frozen 30 f and loses 10 % ice resistance; passes with chance `pierce` (0.95)
                    if (e.Alive)
                    {
                        if (!e.IsBoss) { e.Stunned = Math.Max(e.Stunned, SkillRules.IceOrbBladeStun); if (e.Web != null) e.Web.stunned = e.Stunned; }
                        if (e.Web != null) e.Web._iceShardRes = Math.Min(1, (e.Web._iceShardRes ?? 0) + 0.10);
                    }
                    if (!(SkillRandom() < SkillRules.IceOrbBladePierce)) { b.Active = false; break; }
                }
            }
        }

        private void TickSkillCooldowns()
        {
            float bonus = 0;
            foreach (var z in FireZones) if (z.Type == "holyDome" && Distance(Player.X, Player.Y, z.X, z.Y) < z.R) { bonus = 1; break; }
            if (SpikeTrapCd > 0) SpikeTrapCd -= 1;                 // 36658: P._gcCd -= sp (no dome bonus)
            if (GiantSlamCd > 0) GiantSlamCd -= 1 + bonus;         // 36819
            if (HolyDomeCd > 0) HolyDomeCd -= 1;                   // 36820: the dome's own cooldown is not accelerated
            if (IceOrbCd > 0) IceOrbCd -= 1 + bonus;               // 36828
        }

        // G._fireZones loop (37339+): age, DOT tick, expiry; the dome only regenerates the player (resources +10+Lv*2 per second, x2 regen, x2 cooldowns)
        private void TickFireZones()
        {
            for (int i = FireZones.Count - 1; i >= 0; i--)
            {
                var z = FireZones[i]; z.T++;
                if (z.Type == "spikeTrap")
                {
                    z.TickTimer += 1;
                    if (z.TickTimer >= SkillRules.SpikeTrapTick)
                    {
                        z.TickTimer -= SkillRules.SpikeTrapTick;
                        foreach (var e in Enemies.ToArray())
                        {
                            if (!e.Alive || Distance(z.X, z.Y, e.X, e.Y) > z.R) continue;
                            if (!spikeHitThisFrame.Add(e)) continue;   // _stHitCap: one spike-trap hit per enemy per frame
                            bool wasAlive = e.Alive; practiceHitKind = "spikeTrap";
                            ApplyEnemyDamage(e, z.Dmg, (float)Math.Atan2(e.Y - z.Y, e.X - z.X), false, 1, true, true, 0, 0, false, 0);
                            practiceHitKind = null; EmitFirstPracticeHit(e, "spikeTrap", 0, 0, wasAlive, true);
                            var w = e.Web ?? SyncToWeb(e);
                            w.bleedT = Math.Max(w.bleedT, SkillRules.SpikeTrapBleedFrames); w.bleedStk = Math.Min(10, w.bleedStk + 1); w.bleed = 1;
                            w._spikeSlow = Math.Max(w._spikeSlow ?? 0, SkillRules.SpikeTrapSlowFrames); w._spikeSlowLv = z.Lv;
                        }
                    }
                }
                else if (z.Type == "holyDome" && Player.Hp > 0 && Distance(Player.X, Player.Y, z.X, z.Y) < z.R)
                {
                    float f = (float)SkillRules.HolyDomeRegenPerFrame(z.Lv, 1);
                    Player.Hp = Math.Min(Player.MaxHp, Player.Hp + f); Player.Mana = Math.Min(Player.MaxMana, Player.Mana + f); Player.Stamina = Math.Min(Player.MaxStamina, Player.Stamina + f);
                }
                if (z.T >= z.MaxT) FireZones.RemoveAt(i);
            }
        }

        // update() gSlam* cases (34085): the player walks at 35 % speed through windup (10 f) -> strike (10 f) -> recover (12 f); iceOrb freezes every action.
        private bool TickSkillState(float moveX, float moveY)
        {
            switch (Player.State)
            {
                case "gSlamWindup": case "gSlam1": case "gSlamRecover":
                {
                    double len = Math.Sqrt(moveX * moveX + moveY * moveY);
                    if (len > 0)
                    {
                        float ms = (Player.Speed + BootMoveSpeed) * .35f;
                        float nx = Player.X + (float)(moveX / len) * ms, ny = Player.Y + (float)(moveY / len) * ms;
                        if (Pass(nx, Player.Y, Player.Radius)) Player.X = nx; if (Pass(Player.X, ny, Player.Radius)) Player.Y = ny;
                    }
                    if (Player.State == "gSlamWindup") { if (Player.StateTicks <= 0) { Player.State = "gSlam1"; Player.StateTicks = SkillRules.GiantSlamStrike; } }
                    else if (Player.State == "gSlam1") { if (Player.StateTicks <= 0) { Player.State = "gSlamRecover"; Player.StateTicks = SkillRules.GiantSlamRecover; } }
                    else if (Player.StateTicks <= 0) Player.State = "idle";
                    return true;
                }
                case "iceOrb": return true;
            }
            return false;
        }
    }
}
