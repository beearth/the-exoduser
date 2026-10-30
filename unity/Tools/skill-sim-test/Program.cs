using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Skills;
using Exoduser.UnityPort.Core.Combat;

// PC-B03 behaviour checks of the skill executor on the real Simulation (standalone .NET, no Unity): input edges, costs, cooldowns, zones, slam, ice orb, holy dome,
// level up and the save round trip. Numeric formulas are the skill-oracle's job; this file checks that the Simulation applies them in the right order.
class Program
{
    static readonly List<object> Rows = new List<object>(); static int failed;
    static void Check(bool ok, string name) { Rows.Add(new { name, passed = ok }); if (!ok) { failed++; Console.WriteLine("FAIL " + name); } }
    static Simulation Make()
    {
        var cfg = new SimulationConfig { EnemyAiEnabled = false, PlayerMaxStamina = 300, PlayerMaxMana = 300, PlayerMaxHp = 1000 };
        var s = new Simulation(cfg); s.Random01 = () => .5; s.Materials = 100; s.Player.Stamina = 300; s.Player.Mana = 300; return s;
    }
    static void Release(Simulation s) { s.SetSkillInput(false, false, false, false, false, false, false, false); s.Tick(0, 0, 100, 0, false, false); }
    static void Press(Simulation s, bool d1 = false, bool space = false, bool f = false, bool ctrl = false)
    {
        Release(s);                                                                                                         // released frame
        s.SetSkillInput(d1, false, false, false, space, f, ctrl, false); s.Tick(0, 0, 100, 0, false, false);                // pressed frame
    }
    static void Idle(Simulation s, int n) { s.SetSkillInput(false, false, false, false, false, false, false, false); for (int i = 0; i < n; i++) s.Tick(0, 0, 100, 0, false, false); }
    static int Main(string[] args)
    {
        // ---- start state ----
        var s = Make();
        Check(s.Skills.Level("giantSlam") == 1 && s.Skills.Level("holyDome") == 1 && s.Skills.Level("spikeTrap") == 1 && s.Skills.Level("iceOrb") == 1, "new character starts with giantSlam / holyDome / spikeTrap / iceOrb Lv1");
        Check(s.Skills.Slots[0] == "spikeTrap" && s.Skills.Slots[4] == "giantSlam" && s.Skills.Slots[5] == "holyDome" && s.Skills.CtSkill == "iceOrb", "slots: 1 spikeTrap, Space giantSlam, F holyDome, Ctrl iceOrb");

        // ---- spike trap: malice 5, cooldown 600, zone with radius 300, DOT every 25 frames, slow ----
        s = Make(); var e = s.SpawnNormalEnemy(100, 0); int mats0 = s.Materials; int hp0 = e.Hp; float sh0 = e.Shield;
        Press(s, d1: true);
        Check(s.FireZones.Count == 1 && s.FireZones[0].Type == "spikeTrap" && s.FireZones[0].R == 300, "key 1 plants a spike trap (r300)");
        Check(s.Materials == mats0 - 5, "spike trap costs 5 malice (10 halved)");
        Check(s.SpikeTrapCd > 590 && s.SpikeTrapCd <= 600, "spike trap cooldown ~600 frames");
        Press(s, d1: true); Check(s.FireZones.Count == 1, "a second press during the cooldown plants nothing");
        Idle(s, 60); Check(e.Shield < sh0 || e.Hp < hp0, "spike trap ticks damage the enemy inside");
        Check(e.Web != null && (e.Web._spikeSlow ?? 0) > 0, "spike trap applies the slow flag");
        var far = Make(); far.Materials = 4; Press(far, d1: true); Check(far.FireZones.Count == 0 && far.Materials == 4, "spike trap refused below 5 malice");

        // ---- giant slam: ST 50, malice 10, 10-frame windup -> strike -> recover, shock wave, enemy hit ----
        s = Make(); e = s.SpawnNormalEnemy(200, 0); mats0 = s.Materials; float st0 = s.Player.Stamina; sh0 = e.Shield; hp0 = e.Hp;
        Press(s, space: true);
        Check(s.Player.State == "gSlamWindup" || s.Player.State == "gSlam1", "Space starts the slam windup state");
        Check(s.SlamWaves.Count == 1, "shock wave created");
        Check(s.Materials == mats0 - 10, "giant slam costs 10 malice (20 halved)");
        Check(s.Player.Stamina < st0 - 49 && s.Player.Stamina > st0 - 52, "giant slam costs 50 stamina");
        Check(e.Shield < sh0 || e.Hp < hp0, "giant slam hits an enemy inside its 500 range");
        Check(e.Stunned >= SkillRules.GiantSlamMiniStun - 1, "giant slam stuns an ordinary enemy (mini stun 60)");
        Check(s.GiantSlamCd > 1700, "giant slam cooldown 1800");
        Idle(s, 40); Check(s.Player.State == "idle", "slam states end after 10+10+12 frames");
        s = Make(); Press(s, space: true); s.GiantSlamCd = 0; Idle(s, 40); Press(s, space: true); Check(s.SlamWaves.Count == 2, "slam can be recast once the cooldown is 0");
        s = Make(); s.Player.Stamina = 10; Press(s, space: true); Check(s.SlamWaves.Count == 0, "no slam without stamina");
        s = Make(); Release(s); s.SetRollInput(false, false, false, true, true); s.SetSkillInput(false, false, false, false, true, false, false, false, true); s.Tick(0, 0, 100, 0, false, false);
        Check(s.SlamWaves.Count == 0 && s.RollActive, "Space with a direction held is the roll, not the slam");

        // ---- holy dome: zone, 30 s cooldown, regeneration inside ----
        s = Make(); s.Player.Hp = 500; s.Player.Mana = 100; s.Player.Stamina = 100;
        Press(s, f: true);
        Check(s.FireZones.Count == 1 && s.FireZones[0].Type == "holyDome" && s.FireZones[0].R == 520 && s.FireZones[0].MaxT == 750, "F plants the holy dome (r520, 750 frames)");
        Check(s.HolyDomeCd > 1790, "holy dome cooldown 1800");
        float hp1 = s.Player.Hp; Idle(s, 60); Check(s.Player.Hp > hp1 + 10 && s.Player.Mana > 105 && s.Player.Stamina > 105, "inside the dome HP / MP / ST regenerate");
        Idle(s, 800); Check(s.FireZones.Count == 0, "the dome expires after 750 frames");

        // ---- ice orb: MP 50, orb state, shatter after 120 frames or by Ctrl, blades, cooldown 1200 ----
        s = Make(); e = s.SpawnNormalEnemy(60, 0); float mp0 = s.Player.Mana; sh0 = e.Shield; hp0 = e.Hp;
        Press(s, ctrl: true);
        Check(s.IceOrbActive && s.Player.State == "iceOrb", "Ctrl enters the ice orb");
        Check(s.Player.Mana < mp0 - 49 && s.Player.Mana > mp0 - 52, "ice orb costs 50 MP");
        int hpBefore = (int)s.Player.Hp; s.HurtPlayer(50); Check((int)s.Player.Hp == hpBefore, "nothing hurts the player inside the orb");
        Idle(s, 125); Check(!s.IceOrbActive && s.Player.State == "idle", "the orb shatters by itself after 120 frames");
        Check(s.IceOrbCd > 1000 && s.IceOrbCd <= 1200, "ice orb cooldown 1200");
        Check(e.Shield < sh0 || e.Hp < hp0, "shatter reaches the enemy next to the orb");
        s = Make(); Press(s, ctrl: true); Press(s, ctrl: true); Check(!s.IceOrbActive, "Ctrl again inside the orb shatters it");
        s = Make(); Press(s, ctrl: true); Press(s, d1: true); Check(s.FireZones.Count == 0, "no other skill inside the orb");
        s = Make(); s.Player.Mana = 20; Press(s, ctrl: true); Check(!s.IceOrbActive, "no orb without MP");
        s = Make(); Press(s, ctrl: true); Idle(s, 125); Check(s.SkillBlades.Count > 0, "shatter launches blades"); Idle(s, 20); Check(s.SkillBlades.Count > 0, "blades keep flying");

        // ---- level up ----
        s = Make(); s.Player.StatPoints = 5; s.Player.Level = 1;
        Check(!s.CanUpgradeSkill("spikeTrap"), "Lv1 player: skill level lock 1 blocks the upgrade");
        s.Player.Level = 50; Check(s.CanUpgradeSkill("spikeTrap") && s.UpgradeSkill("spikeTrap") && s.Skills.Level("spikeTrap") == 2 && s.Player.StatPoints == 4, "Lv50 player upgrades spikeTrap to Lv2 for 1 SP");
        Check(!s.UpgradeSkill("spikeTrap"), "Lv2 reached the lock (50/50+1=2)");
        s.Player.StatPoints = 0; s.Player.Level = 100; Check(!s.CanUpgradeSkill("spikeTrap"), "no SP no upgrade");

        Dictionary<string, double> sk; string[] slots; string ult, ct;
        // ---- malice orb (E slot, web fireball): beam key from idle -> magicCast 7 f -> homing orb -> blast + poison + malice weakness -> magicRecover 12 f ----
        s = Make();
        Check(s.Skills.Level("fireball") == 1 && s.Skills.MagicSkill == "fireball", "new character has the fireball on the E slot");
        s = Make(); e = s.SpawnNormalEnemy(200, 0); float orbMp0 = s.Player.Mana; int orbHp0 = e.Hp; float orbSh0 = e.Shield;
        s.SetMagicInput(true); s.Tick(0, 0, 100, 0, false, false);
        Check(s.Player.State == "magicCast" && s.Player.Mana == orbMp0 - 10, "beam key starts magicCast and spends 10 mana (mpCost('magic'))");
        for (int i = 0; i < 8; i++) { s.SetMagicInput(false); s.Tick(0, 0, 100, 0, false, false); }
        Check(s.MaliceOrbShots == 1 && s.MaliceOrbs.Count + s.MaliceOrbBlasts >= 1, "the orb is fired after floor(14 / 2) = 7 frames");
        Idle(s, 120);
        var ew = e.Web; Check(s.MaliceOrbBlasts >= 1 && (e.Shield < orbSh0 || e.Hp < orbHp0), "the orb blast hurts the enemy it flew into");
        Check(ew != null && ew.poisonStk == 1 && ew.poisonT > 0 && ew.poison == 1, "the blast poisons (1 stack, 600 f)");
        Check(ew != null && ew._mwStk == 1, "the blast stacks one malice weakness");
        Check(s.Player.State == "idle" && s.MaliceOrbs.Count == 0, "magicRecover ends in idle after 12 frames");
        s = Make(); s.Player.Mana = 5; s.SetMagicInput(true); s.Tick(0, 0, 100, 0, false, false); Check(s.Player.State == "idle" && s.MaliceOrbShots == 0, "no cast below 10 mana");
        s = Make(); for (int i = 0; i < 80; i++) { s.SetMagicInput(true); s.Tick(0, 0, 100, 0, false, false); }
        Check(s.MaliceOrbShots >= 4, "holding the beam key fires again every 7 + 12 frames (shots " + s.MaliceOrbShots + ")");
        s = Make(); s.SetMagicInput(true); s.Tick(0, 0, 100, 0, false, false); s.SetMagicInput(false); Idle(s, 7 + 80);
        Check(s.MaliceOrbShots == 1 && s.MaliceOrbBlasts == 1 && s.MaliceOrbs.Count == 0, "an orb with no target blasts at the end of its 400 px range");
        s = Make(); s.SpawnNormalEnemy(60, 0); s.SetMagicInput(true); s.Tick(0, 0, 100, 0, true, false);
        Check(s.Player.State != "magicCast", "a held weapon attack wins over the beam key (web branch order)");
        s = Make(); s.Skills.Levels["fireball"] = 3; Check(SkillRules.FireballExplosionRadius(3) == 160 && SkillRules.FireballRadiusMax(3) == 24 && SkillRules.FireballRange(3, 0) == 500, "fireball Lv3: blast r160, grown r24, range 500");
        Check(SkillRules.FireballDamage(100, 1, 1, 1) == 1320, "fireball damage = magicRef * pMagicMul * skMul (13.2 at Lv1)");
        s = Make(); s.Skills.Levels["fireball"] = 4; s.CaptureSkills(out sk, out slots, out ult, out ct); var t = Make(); t.RestoreSkills(sk, slots, ult, ct);
        Check(t.Skills.Level("fireball") == 4, "the fireball level survives a capture / restore");
        t = Make(); t.RestoreSkills(new Dictionary<string, double> { { "spikeTrap", 1 } }, new string[6], null, null); Check(t.Skills.Level("fireball") == 1, "an old save without the fireball keeps it at Lv1");

        // ---- E strike (B07b): sDraw -> sBash 20 f -> the circular hit at the 8th frame (st2 12), damage + knock-back + mini stun, then sRecover ----
        {
            Action<Simulation, bool> eKey = (sim, down) => { sim.SetPlayerCombatInput(false, down, false); sim.Tick(0, 0, 100, 0, false, false); };
            // 기존 기본 원형 타격만 격리한다. 실제 신규 캐릭터의 무료 합체 파동은 gameplay-parity 14경계에서 별도 검증한다.
            s = Make(); s.Skills.Levels["shieldThrow"]=0; var near = s.SpawnNormalEnemy(60, 0); var far2 = s.SpawnNormalEnemy(160, 0); float nh = near.Hp + near.Shield, fh = far2.Hp + far2.Shield;
            eKey(s, true); eKey(s, false);
            Check(s.Player.State == "sBash", "E tap enters sBash");
            int tk = 0; while (s.Player.State == "sBash" && s.BashStrikeCount == 0 && tk++ < 30) eKey(s, false);
            Check(s.BashStrikeCount == 1 && s.Player.StateTicks == 12, "the strike lands when st2 crosses 12 (state ticks " + s.Player.StateTicks + ")");
            Check(near.Hp + near.Shield < nh, "the E strike hurts an enemy inside the 70 px circle");
            Check(far2.Hp + far2.Shield == fh, "an enemy outside the circle is untouched");
            Check(near.Stunned >= ParryRules.MiniStun - 1 || !near.Alive, "the struck enemy gets the 60 f mini stun");
            Check(s.SlamWaves.Count >= 1 && s.SlamWaves[s.SlamWaves.Count - 1].Bash, "the strike draws the blue shock wave");
            for (int i = 0; i < 12; i++) eKey(s, false);
            Check(s.Player.State == "sRecover" || s.Player.State == "idle", "sBash ends in sRecover");
            s = Make(); var mid = s.SpawnNormalEnemy(160, 0); float mh = mid.Hp + mid.Shield; s.SBashChgMul = 3;
            s.Player.State = "sBash"; s.Player.StateTicks = 20; for (int i = 0; i < 12; i++) eKey(s, false);
            Check(s.BashStrikeCount == 1 && mid.Hp + mid.Shield < mh, "a full charge (x3) widens the circle to 210 px");
            s = Make(); s.Player.State = "sRecover"; s.Player.StateTicks = 20; s.Player.Mana = 100;
            s.SetPlayerCombatInput(false, false, false); s.Tick(0, 0, 100, 0, false, false); s.SetPlayerCombatInput(true, false, false); s.Tick(0, 0, 100, 0, false, false);
            Check(s.Player.State == "sBlock", "Q cancels sRecover into the shield");
        }

        // ---- regression: the enemy AI keeps hurting the player after skills were used (M1 07b) ----
        foreach (bool used in new[] { false, true })
        {
            s = Make(); s.Config.EnemyAiEnabled = true; s.Player.Hp = s.Player.MaxHp;
            if (used)
            {
                var a = s.SpawnNormalEnemy(130, 0);
                Press(s, d1: true); Idle(s, 70); s.Player.Stamina = 300; Press(s, space: true); Idle(s, 46); Press(s, f: true); Idle(s, 60); Press(s, ctrl: true); Idle(s, 100);
                s.SkillBlades.Clear(); s.FireZones.Clear(); s.SlamWaves.Clear(); s.Enemies.Clear(); s.SpikeTrapCd = s.GiantSlamCd = s.HolyDomeCd = s.IceOrbCd = 0; s.Player.State = "idle";
            }
            s.Enemies.Clear(); s.Player.Hp = s.Player.MaxHp; s.Player.Iframes = 0; s.Player.Shield = 40;
            var atk = s.SpawnNormalEnemy(s.Player.X + 70, s.Player.Y); atk.Alerted = true; atk.StateTicks = 0; int hurt0 = s.HurtCount; int first = -1;
            for (int i = 0; i < 900 && first < 0; i++) { s.Tick(0, 0, s.Player.X + 300, s.Player.Y, false, false); if (s.HurtCount > hurt0) first = i; }
            Check(first >= 0, "enemy contact hits the player " + (used ? "after" : "without") + " skill use (first hit tick " + first + ")");
        }

        // 시전 시작 방향은 시전 중 조준을 바꿔도 유지하고 다음 연사는 새 조준을 사용한다.
        for (int di = 0; di < 8; di++)
        {
            s = Make(); s.Enemies.Clear(); s.IsProjectileWall = (x, y) => false;
            double aim = di * Math.PI / 4, switched = aim + Math.PI / 2;
            s.SetMagicInput(true); s.Tick(0, 0, (float)Math.Cos(aim) * 300, (float)Math.Sin(aim) * 300, false, false);
            for (int f = 0; f < 8 && s.MaliceOrbShots == 0; f++) s.Tick(0, 0, (float)Math.Cos(switched) * 300, (float)Math.Sin(switched) * 300, false, false);
            var shot = s.MaliceOrbs[0];
            Check(shot.TrailCount == 1, "악의구 첫 이동의 꼬리 표본1 " + di);
            Check(Math.Abs(shot.TrailX[0] - (s.Player.X + Math.Cos(aim) * 14)) < .0001 && Math.Abs(shot.TrailY[0] - (s.Player.Y + Math.Sin(aim) * 14)) < .0001, "악의구 꼬리가 이동 전 위치를 기록 " + di);
            Check(Math.Abs(shot.Vx - Math.Cos(aim) * 5.5) < .0001 && Math.Abs(shot.Vy - Math.Sin(aim) * 5.5) < .0001, "악의구 8방향 시전 시작각 유지 " + di);
            for (int f = 0; f < 30 && s.MaliceOrbShots < 2; f++) s.Tick(0, 0, (float)Math.Cos(switched) * 300, (float)Math.Sin(switched) * 300, false, false);
            shot = s.MaliceOrbs[s.MaliceOrbs.Count - 1];
            Check(s.MaliceOrbs[0].TrailCount == 14, "악의구 꼬리 순환 표본 상한14 " + di);
            Check(Math.Abs(shot.Vx - Math.Cos(switched) * 5.5) < .0001 && Math.Abs(shot.Vy - Math.Sin(switched) * 5.5) < .0001, "악의구 다음 연사에서 새 조준 반영 " + di);
        }

        // ---- save round trip ----
        s = Make(); s.Skills.Levels["spikeTrap"] = 3;
        s.CaptureSkills(out sk, out slots, out ult, out ct);
        t = Make(); t.Skills.Levels["spikeTrap"] = 1; t.Skills.Slots[0] = null; t.RestoreSkills(sk, slots, ult, ct);
        Check(t.Skills.Level("spikeTrap") == 3 && t.Skills.Slots[0] == "spikeTrap" && t.Skills.CtSkill == "iceOrb", "skills survive a capture / restore");
        var legacy = Make(); legacy.RestoreSkills(null, null, null, null); Check(legacy.Skills.Level("giantSlam") == 1, "a save without skills keeps the start state");

        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_not_Unity_runtime", passed = failed == 0, failed, checks = Rows }, new JsonSerializerOptions { WriteIndented = true });
        if (args.Length > 0) File.WriteAllText(args[0], result); Console.WriteLine("SKILL_SIM " + Rows.Count + " checks / " + failed + " failures"); return failed == 0 ? 0 : 2;
    }
}
