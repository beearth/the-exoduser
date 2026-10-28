using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // B08: connects ReviveRules / EnergyShield to the native simulation (enemy death, corpse timers, ghouls, player fall and demon revive).
    public sealed partial class Simulation
    {
        // addTxt of the revive rules; NativeGame draws them (text lifetime is the web's frame count).
        public event Action<ReviveText> ReviveTextRaised;
        public event Action<EnemyState, BossRevivePlan> BossRevived;   // boss immediate revive: VFX/companion owners hook here
        public event Action<EnemyState> EnemyRevived;                  // corpse stood up as its own body or was converted into a ghoul (arg = living enemy)
        public readonly List<int> KilledBosses = new List<int>();      // G._killedBosses (companion revive pool)
        public Func<double, double, double> HolyPrisonSuppress;        // (x,y) -> zone suppress, NaN when none
        public Func<double> WeakRevZoneBonus;                          // weakRev zone bonus at the player, 0 when none
        public int ReviveCountdownFrames { get { return Player.State == "fallen" ? (int)Math.Max(0, Math.Ceiling(Player.StateTicks)) : 0; } }

        private ReviveContext ReviveCtx()
        {
            return new ReviveContext {
                Stage = Config.StageIndex, Hell = (int)EnemyTables.SiToHell[Math.Min(Config.StageIndex, EnemyTables.SiToHell.Length - 1)],
                DemoMode = Config.DemoMode, DemoLastStage = Config.DemoLastStage, AntiRevive = Config.AntiRevive, HolyPrison = HolyPrisonSuppress,
                PlayerHp = Player.Hp, PlayerMaxHp = Player.MaxHp, PlayerX = Player.X, PlayerY = Player.Y, PlayerFacing = Player.Facing, PlayerIframes = Player.Iframes, PlayerState = Player.State,
                CanMove = Pass, KilledBosses = KilledBosses, Rnd = NextRandom };
        }

        private void Raise(List<ReviveText> texts) { var h = ReviveTextRaised; if (h != null) foreach (var t in texts) h(t); }

        // hurtE `if(e.hp<=0)`: the web death part (O-1: EnemyHurt.DeathHead + DeathTail through Simulation.RunWebDeath). ReviveRules.OnZeroHp / SinkOnDeath below are
        // no longer on this path (kept: shield-revive-oracle still checks them, and ReviveRules.TickCorpse resolves the revives DeathHead reserves).
        private void OnEnemyZeroHp(EnemyState enemy, EnemyHurtContext context, EnemySpawn web, double? ang, EnemyHurtOpts opts, EnemyHurtBodyResult body)
        {
            if (druidLives.Count > 0 && RemodelZeroHp(enemy)) return;   // RM-B1/B0: a remodelled boss has lives instead of the judged revive
            RunWebDeath(enemy, context, web, ang, opts, body, false);
        }

        // update() dead-enemy branch: `else if(e._reviveTimer>0)`
        private void TickCorpses()
        {
            List<EnemyState> born = null;
            int count = Enemies.Count;
            for (int i = 0; i < count; i++)
            {
                var e = Enemies[i];
                if (e.Alive || !(e.ReviveTimer > 0)) continue;
                var r = ReviveRules.TickCorpse(ReviveCtx(), e, 1, nextEnemyId);
                Raise(r.Texts);
                if (r.Ghoul != null) { nextEnemyId++; if (born == null) born = new List<EnemyState>(); born.Add(r.Ghoul); }
                if (r.What == CorpseResult.Kind.OwnBody) { var h = EnemyRevived; if (h != null) h(e); }
            }
            if (born != null) foreach (var g in born) { Enemies.Add(g); var h = EnemyRevived; if (h != null) h(g); }
        }

        // update(): demonRevCd countdown and the energy shield regen (3 s after a hit)
        private void TickPlayerShieldAndRevive()
        {
            if (Player.DemonReviveCd > 0) Player.DemonReviveCd = Math.Max(0, Player.DemonReviveCd - 1);
            double sh = Player.Shield, rt = Player.ShieldRegenTicks;
            EnergyShield.PlayerRegen(ref sh, Player.MaxShield, ref rt, Config.ShieldStatInt, Player.Level, Config.ShieldMRegen, 1);
            Player.Shield = (float)sh; Player.ShieldRegenTicks = (float)rt;
        }

        // die() 43815-43840
        private void PlayerDie()
        {
            if (Player.State == "fallen" || Player.State == "dead") return;
            var fall = ReviveRules.PlayerFall(new ReviveRules.PlayerFallInput {
                Level = Player.Level, RevivePow = Config.RevivePow, ReviveCdAffix = Config.ReviveCdAffix, ReviveOnceAffix = Config.ReviveOnceAffix,
                PassiveDemon = Config.PassiveDemon, PassiveHuman = Config.PassiveHuman, WeakRevZone = WeakRevZoneBonus == null ? 0 : WeakRevZoneBonus(),
                ReviveOnceUsed = Player.ReviveOnceUsed, DemonReviveCd = Player.DemonReviveCd, Roll = Config.ReviveOnceAffix > 0 && !Player.ReviveOnceUsed ? 0 : NextRandom() * 100 });
            if (fall.ReviveOnce)
            { // 1-life revive affix: full resources, no fall
                Player.ReviveOnceUsed = true; Player.Hp = Player.MaxHp; Player.Mana = Player.MaxMana; Player.Stamina = Player.MaxStamina; Player.Iframes = 120;
                Raise(new List<ReviveText> { new ReviveText { X = Player.X, Y = Player.Y - 25, Ko = "💀 1회부활!", En = "💀 1-life Revive!", Color = "#44ff88", Life = 60 } });
                return;
            }
            Player.Hp = 0; Player.State = "fallen"; Player.StateTicks = 300; Player.Iframes = 9999; CancelKiCharge();
            Player.FallenReviveChance = fall.Chance; Player.FallenReviveCdFrames = fall.CdFrames; Player.FallenCanRevive = fall.CanRevive; Player.FallenReviveRoll = fall.Roll;
        }

        // update() fallen branch: 5 s countdown, then _fallenResolve
        private void TickFallen()
        {
            if (Player.State != "fallen") return;
            Player.StateTicks--;
            if (Player.StateTicks > 0) return;
            if (ReviveRules.FallenSucceeds(Player.FallenCanRevive, Player.FallenReviveRoll, Player.FallenReviveChance))
            {
                Player.DemonReviveCd = (float)Player.FallenReviveCdFrames;
                Player.Hp = Player.MaxHp; Player.Mana = Player.MaxMana; Player.Stamina = Player.MaxStamina;
                Player.State = "idle"; Player.StateTicks = 0; Player.Iframes = 120;
                var texts = ReviveRules.FallenSuccessTexts(Player.X, Player.Y, Player.FallenReviveChance);
                Raise(texts);
                return;
            }
            Player.State = "dead"; Player.Iframes = 0;
        }
    }
}
