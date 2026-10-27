// RM-B1 (boss-battle lead ruling 2026-10-28): the remodelled druid's bullets are never turned around by a parry. The only remodel bullet move is #5 (spore fan), which spec §3 marks
// "not parryable (roll)"; a reflected bean would hit the boss for >= 10 % of its max HP and break the life HP curve. Checked in the real Simulation with the E strike window and with
// the Q parry window open: no reflection, no friendly bullet, the bullet ends through the ordinary hurt path.
using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;

static partial class P
{
    static void ParryGuard()
    {
        foreach (var key in new[] { "E", "Q" })
        {
            string n = "parry guard " + key;
            var s = new Simulation(new SimulationConfig { StageIndex = 0, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 40 }, key == "E" ? 20261033u : 20261034u);
            s.DruidRemodel = true; s.Player.Level = 8; s.Player.Hp = s.Player.MaxHp;
            s.AttachDruidBoss();
            s.Stage.Enabled = true; s.Stage.FieldBossDone = true; s.Stage.BossUnlocked = true;
            s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29;
            var p = s.Player; int guard = 0;
            while (guard++ < 1500 && !(s.Stage.InArena && s.Stage.LoadPhase == 0 && s.Stage.Boss != null)) s.Tick(0, 0, p.X + 100, p.Y, false, false);
            var boss = s.Stage.Boss; Check(boss != null && s.Druid.Remodel, n + ": remodel fight started");
            if (boss == null) return;
            for (int i = 0; i < 200; i++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; }
            // the bullet comes from the far side of the player (the player stands 110 px from the boss), aimed at the player
            double ang = Math.Atan2(boss.Y - 2160, boss.X - 2560) + 0.9; p.X = (float)(boss.X + Math.Cos(ang) * 110); p.Y = (float)(boss.Y + Math.Sin(ang) * 110);
            if (!s.CanMove((float)p.X, (float)p.Y, p.Radius)) { p.X = boss.X + 110; p.Y = boss.Y; }
            double away = Math.Atan2(p.Y - boss.Y, p.X - boss.X), dist = key == "E" ? 90 : 140, sx = p.X + Math.Cos(away) * dist, sy = p.Y + Math.Sin(away) * dist, toP = Math.Atan2(p.Y - sy, p.X - sx);
            var b = s.Druid.SpawnProjectile(boss, s.Druid.Data[boss], new ProjSpec { X = sx, Y = sy, Vx = Math.Cos(toP) * 3, Vy = Math.Sin(toP) * 3, Dmg = 500, Life = 400, Ml = 400, El = key == "E" ? 0 : 3, Col = "col", Sz = 1.2, Commit = true }, false);
            Check(b != null, n + ": bullet spawned"); if (b == null) return;
            if (key == "E") { p.State = "sBash"; p.StateTicks = 20; } else { p.State = "sBlock"; p.StateTicks = 999; s.SbParryT = 18; }
            bool everFriendly = false; int ended = -1;
            for (int t = 1; t <= 80; t++) { s.Tick(0, 0, boss.X, boss.Y, false, false); everFriendly |= b.Friendly; if (!b.Active) { ended = t; break; } }
            Check(!everFriendly && !b.BlueBean && !b.ParryBlueBean, n + ": the bullet was never turned around");
            Check(s.ReflectCount == 0, n + ": no parry reflection paid (" + s.ReflectCount + ")");
            Check(ended > 0, n + ": the bullet ended through the ordinary path (" + ended + ")");
        }
    }
}
