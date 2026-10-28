using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Exoduser.UnityPort.Core
{
    // O-1 wire (CX-04c1 + CX-04c2): the whole death part of the web hurtE (`if(e.hp<=0){` .. end) runs through the oracle-checked Core
    // EnemyHurt.DeathHead (decoy / doppelganger / boss revive / mob revive / kill counters / combo / STY-D9 sink / gate guard) and EnemyHurt.DeathTail
    // (debris, kill chain, etype death effects, element zones, rare / elite rewards, malice, potions, rollDrop, exp, checkRooms, autosave), in the web order of
    // calls and Math.random draws. This replaces the hand-assembled KillEnemy (Unity order: kills, combo, malice +4, potion, elite malice, equipment, exp) and
    // ReviveRules.OnZeroHp / SinkOnDeath as the death path (ReviveRules.TickCorpse still resolves the reserved revives).
    // Simulation state the web keeps in G / P is copied into the hurt context before each step and back after it (same pattern as the head / middle wire).
    public sealed partial class Simulation
    {
        public int ComboMax;                                                  // G.comboMax
        public double KillChainCount, KillChainTicks;                         // G._chainCnt, G._chainT
        public readonly List<EnemyRift> Rifts = new List<EnemyRift>();        // G.rifts — the rift update / spawn of update() is not ported yet
        public readonly List<JsObj> UnportedDeathShots = new List<JsObj>();   // death bullets / zones with no Unity system yet (poisonZone, mine, bomb, _seaSlow, eProjAt ...)
        public readonly List<JsObj> UnportedWorldItems = new List<JsObj>();   // _wiPush debris / o2bubble (no Unity pickup yet)
        public int DroppedDeathShots;                                         // death bullets lost because no projectile owner exists (field bullets need the druid host)
        public bool DruidFled;                                                // G._druidFled
        public event Action AutosaveRequested;                                // dbSaveNow() every 10th kill
        double critSfxCd;                                                     // _critSfxCd (SND-02 crit sound, 12 frames); _sfxFrameReset counts it down
        int pendingKillRoomChecks;                                            // checkRooms() calls made by kills, run before this frame's own Stage.Tick
        readonly List<EnemyState> pendingDeathSpawns = new List<EnemyState>(); // split / companion enemies: added to Enemies outside any Enemies loop

        // Frame start: _sfxFrameReset (`if(_critSfxCd>0)_critSfxCd--`).
        void TickDeathFrameStart() { if (critSfxCd > 0) critSfxCd--; }

        // Before Stage.Tick: the deferred spawns and the checkRooms() calls of the kills (the web calls checkRooms() at the kill, before the frame's own checkRooms;
        // each call advances the 30-frame check counter).
        void TickDeathFrameEnd()
        {
            FlushDeathSpawns();
            while (pendingKillRoomChecks > 0) { pendingKillRoomChecks--; Stage.Tick(); }
        }

        // After the 소환굴 update: kill-chain timer of update() (game.html 35880 `if(G._chainT>0){G._chainT-=sp;if(G._chainT<=0){G._chainCnt=0;G._chainT=0}}`)
        void TickKillChain() { if (KillChainTicks > 0) { KillChainTicks -= 1; if (KillChainTicks <= 0) { KillChainCount = 0; KillChainTicks = 0; } } }

        void FlushDeathSpawns()
        {
            if (pendingDeathSpawns.Count == 0) return;
            foreach (var e in pendingDeathSpawns) Enemies.Add(e);
            pendingDeathSpawns.Clear();
        }

        // ens: the web objects of every enemy; Add = an enemy the death part created (mkEn split / companion revive).
        sealed class DeathEns : Collection<EnemySpawn>
        {
            readonly Action<EnemySpawn> added; bool filling;
            public DeathEns(IEnumerable<EnemySpawn> all, Action<EnemySpawn> onAdd) { filling = true; foreach (var w in all) Add(w); filling = false; added = onAdd; }
            protected override void InsertItem(int index, EnemySpawn item) { base.InsertItem(index, item); if (!filling && added != null) added(item); }
        }

        EnemyState AdoptDeathSpawn(EnemySpawn w)
        {
            var e = new EnemyState {
                Id = nextEnemyId++, Etype = (int)w.etype, X = (float)w.x, Y = (float)w.y, Radius = (float)w.r, Hp = ToIntClamped(w.hp), MaxHp = ToIntClamped(w.mhp), Attack = ToIntClamped(w.atk),
                BaseAttack = ToIntClamped(w.baseAtk), Level = (int)w.lv, Shield = (float)w.eShield, MaxShield = (float)w.eShieldMax, Poise = (float)w.poise, MaxPoise = (float)w.maxPoise,
                Speed = (float)w.speed, Facing = (float)w.facing, StateTicks = (float)w.st2, ProjectileTicks = (float)w.projT, Elite = (int)w.elite, Col = w.col, Web = w,
                IsBoss = w.ib, RevPts = w._revPts, MaxRevPts = w._maxRevPts, Deaths = w.deaths, HomeX = w._homeX, HomeY = w._homeY, HasHome = true
            };
            webOwner[w] = e; webEns.Add(w); pendingDeathSpawns.Add(e);
            return e;
        }

        // EnemyState -> web: the death / revive fields the death part reads. `suppressRevive` = a kill that must not revive (remodel last life, harness, practice).
        void DeathToWeb(EnemyState e, EnemySpawn w, bool suppressRevive)
        {
            w.deaths = e.Deaths; w._revPts = e.RevPts; w._maxRevPts = e.MaxRevPts; w._origR = e.OrigR > 0 ? (double?)e.OrigR : null;
            w._reviveTimer = e.ReviveTimer > 0 ? (double?)e.ReviveTimer : null; w._bossPhase = e.BossPhase; w.bossPatCd = e.BossPatCd;
            w._revived = e.Revived ? (bool?)true : null; w._bossRevJudged = e.BossRevJudged ? (bool?)true : null; w._bossRevived = e.BossRevived ? (bool?)true : null;
            w._bossRevChance = e.BossRevJudged ? (double?)e.BossRevChance : null; w._bossRevRoll = e.BossRevJudged ? (double?)e.BossRevRoll : null;
            w._dgRevived = e.DgRevived; w._fmKind = e.FmKind ? "fb" : null; w._isGateGuard = e.IsGateGuard ? (bool?)true : null; w._sinkDruid = e.SinkDruid ? (bool?)true : null;
            w.maxPoise = e.MaxPoise; w.speed = e.Speed; w.elite = e.Elite;
            if (suppressRevive) { if (e.IsBoss) { w._bossRevJudged = true; w._revPts = 0; } else w._revived = true; }
        }

        // web -> EnemyState after the death part (boss revive changes size / attack / speed / poise; everything else is the revive bookkeeping).
        void DeathFromWeb(EnemyState e, EnemySpawn w)
        {
            SyncFromWeb(e, w);
            e.Alive = w.alive; e.MaxShield = (float)w.eShieldMax; e.Radius = (float)w.r; e.Attack = ToIntClamped(w.atk); e.BaseAttack = ToIntClamped(w.baseAtk); e.Speed = (float)w.speed;
            e.MaxPoise = (float)w.maxPoise; e.Deaths = w.deaths; e.RevPts = w._revPts; e.OrigR = w._origR ?? 0; e.ReviveTimer = w._reviveTimer ?? 0;
            e.ReviveX = w._reviveX ?? e.ReviveX; e.ReviveY = w._reviveY ?? e.ReviveY; e.BossRevChance = w._bossRevChance ?? 0; e.BossRevRoll = w._bossRevRoll ?? 1;
            e.BossPhase = w._bossPhase; e.BossPatCd = w.bossPatCd; e.SpawnTicks = w._spawnT; e.BossReviveVfxPending = w._bossReviveVFXPending ?? 0;
            e.Revived = w._revived == true; e.ReviveAsGhoul = w._reviveAsGhoul == true; e.BossRevJudged = w._bossRevJudged == true; e.BossRevived = w._bossRevived == true;
            e.SinkDruid = w._sinkDruid == true; e.DgRevived = w._dgRevived;
        }

        // other enemies the death part changed through shQuery / ens (M07 heal, M20 / M26 buffs, twin rage)
        void DeathOtherFromWeb(EnemySpawn w)
        {
            if (w == null || !webOwner.TryGetValue(w, out var o)) return;
            o.Hp = ToIntClamped(w.hp); o.Attack = ToIntClamped(w.atk); o.BaseAttack = ToIntClamped(w.baseAtk); o.Speed = (float)w.speed; o.Radius = (float)w.r;
        }

        static readonly EnemyPotDef PotHp = new EnemyPotDef { name = "악의 추출", col = "#33cc66" };   // POT (game.html 27860-27862): hp only

        // hurtE `if(e.hp<=0){ .. }` for a Unity enemy. `c` is the hurt context of the hit that killed it (head / middle already ran on `w`).
        void RunWebDeath(EnemyState enemy, EnemyHurtContext c, EnemySpawn w, double? ang, EnemyHurtOpts opts, EnemyHurtBodyResult body, bool suppressRevive)
        {
            int companionEtype = -1; double companionX = 0, companionY = 0;
            c.Ens = new DeathEns(inEnemyLoop ? (IEnumerable<EnemySpawn>)webEns : AllWebs(), nw => { if (nw != null && !webOwner.ContainsKey(nw)) { var ne = AdoptDeathSpawn(nw); if (ne.IsBoss) { companionEtype = ne.Etype; companionX = ne.X; companionY = ne.Y; } } });
            DeathToWeb(enemy, w, suppressRevive);
            var P = c.P;
            P.lv = Player.Level; P.facing = Player.Facing; P.rage = Rage; P.shield = Player.Shield; P.mshield = Player.MaxShield; P.r = Player.Radius;
            P.kb = new EnemyVec { x = Player.KnockbackX, y = Player.KnockbackY }; P._freezeSlow = PlayerFreezeSlow;
            double hpBefore = P.hp, mpBefore = P.mp, stBefore = P.st ?? 0, shBefore = P.shield ?? 0, kbxBefore = P.kb.x, kbyBefore = P.kb.y;
            // --- G ---
            c.Stage = Config.StageIndex; c.DemoMode = Config.DemoMode; c.DemoLastStage = Config.DemoLastStage; c.OptDiff = Config.DifficultyIndex; c.OptHitStop = 100;
            c.Kills = Kills; c.StageKills = Stage.StageKills; c.Combo = Combo; c.ComboTimer = ComboTicks; c.ComboMax = ComboMax;
            c.KilledBosses = new List<double>(); foreach (int et in KilledBosses) c.KilledBosses.Add(et);
            c.FireZones = null; c.SpawnHoles = new List<EnemySpawnHole>();                                  // no holyPrison zone / _fromHole source in Unity yet
            c.GateGuardSet = Stage.GateGuard != null; c.GateGuardKilled = Stage.GateGuardKilled; c.BossGateOpen = true;
            c.CritSfxCd = critSfxCd; c.Mats = Materials; c.ChainCnt = KillChainCount; c.ChainT = KillChainTicks; c.Rifts = Rifts; c.DruidFled = DruidFled ? (bool?)true : null;
            double matsBefore = Materials;
            // --- presentation: texts go to the revive text owner, the rest is drawn by the Native layer from the state (or not ported) ---
            c.AddText = (x, y, text, col, life, size, text2) => { var h = ReviveTextRaised; if (h != null) h(new ReviveText { X = x, Y = y, Ko = text, En = text, Color = col, Life = (int)life }); };
            c.Translate = s => s; c.Lang = (ko, en) => ko;
            c.AtkTicketRelease = x => { }; c.PetOnKill = x => { };                                         // tickets are never counted in Unity (EnemyAi), no pet yet
            c.RegKill = x => { if (webOwner.TryGetValue(x, out var o)) RegKill(o); };
            c.ReviveVfx = (x, y, col, label, o) => { }; c.PlayVfxAng = (k, x, y, sc, a, b, f) => { }; c.AddBlastLight = (x, y, r, t, cr, cg, cb) => { }; c.AddTpBolt = (x1, y1, x2, y2, wd, col) => { };
            c.DeathFx = (x, y, r, col, ib, burn, et, kind) => { }; c.SpawnLargeMonsterDeathFx = (x, a) => { }; c.AddCorpse = (x, a, pw) => { }; c.AddBurnCorpse = x => { };
            c.AddGorePiece = (x, y, k) => { }; c.AddDeathImpact = (x, y, r) => { }; c.GetPProj = () => new EnemyPProj();
            c.RageMax = () => RageMaximum; c.SfxVictory = () => { }; c.BuildMapCache = () => { };
            c.BossLine = RemodelLine;   // _bossLine(key): once per fight (G._bossLineSeen) -> BossLineRaised / BossLineLog (Simulation.BossRemodelRules)
            bool shockwave = false;
            c.HurtPlayerTyped = (d, m) => { shockwave = true; HurtPlayer((int)d, new HurtOptions { Magic = m != null && m.dtype == "magic" }); };
            c.SpawnBossShot = (x, o) => SpawnDeathBullet(x, new ProjSpec { X = o.x, Y = o.y, Vx = o.vx, Vy = o.vy, Dmg = o.dmg, Life = o.life, Ml = o.ml, Sz = o.sz, El = (int)(o.el ?? 0), Col = o.col ?? "", RedBean = o.redBean == true, Homing = o.homing == true });
            var spawnCtx = new EnemySpawnContext {
                PlayerLevel = Player.Level, DifficultyIndex = Config.DifficultyIndex, StageDiffOffset = 0, Stage = Config.StageIndex, DemoMode = Config.DemoMode, DemoLastStage = Config.DemoLastStage,
                CanMove = (cx, cy, cr) => Pass((float)cx, (float)cy, (float)cr), Random = NextRandom
            };
            c.MkEn = (x, y, si, et, ib, el, room) => EnemyFactory.Create(spawnCtx, x, y, si, et, ib, el, room);
            var touched = new List<EnemySpawn>();
            var shq = c.ShQuery; c.ShQuery = (x, y, r) => { var l = shq(x, y, r); touched.AddRange(l); return l; };
            // --- death head ---
            double oldX = enemy.X, oldY = enemy.Y, oldR = enemy.Radius;
            bool guardBefore = Stage.GateGuardKilled;
            var head = EnemyHurt.DeathHead(c, w, ang, true, opts, body, out var exit);
            DeathFromWeb(enemy, w);
            if (exit == DeathExit.Continue)
            {
                // --- death tail ---
                double potionMalice = 0; var potTexts = new List<DropText>(); int potDraws = 0;
                c.WiPush = o => PushDeathWorldItem(o);
                c.MagicRef = () => 0; c.StatInt = () => 1; c.PMagicMul = () => 1; c.SkMul = id => 1;   // plague burst only: no _plagued source in Unity yet (statInt() is 1 in the web too)
                c.EProjAt = (x, a, sp, dm, el, life, col, sz) => UnportedDeathShots.Add(new JsObj().Set("eProjAt", true).Set("x", x.x).Set("y", x.y).Set("ang", a).Set("spd", sp).Set("dmgMult", dm).Set("el", el).Set("life", life).Set("col", (object)col).Set("sz", sz));
                c.SpawnShot = (x, o) => SpawnDeathShot(x, o);
                c.HurtEnemyAng = (x, d, a) => { if (webOwner.TryGetValue(x, out var o)) ApplyEnemyDamage(o, (int)d, (float)a, false, 1); };
                c.MkItem = (slot, tier, el, rar) => ItemFactory.MkItem(slot, (int)tier, (int)el, (int)rar, null, Player.Level, NextRandom, NowMs(), BuildIsDemo);
                c.AddPotion = (t, n) => { potDraws++; if (t != "hp") return false; c.Mats += n; potionMalice += n; potTexts.Add(new DropText { Text = "+" + (int)n, Color = "#cc66ff", Ttl = 25, Anchor = DropAnchor.Player, DY = -20 }); ReviveTextRaised?.Invoke(new ReviveText { X = Player.X, Y = Player.Y - 20, Ko = "+" + (int)n, En = "+" + (int)n, Color = "#cc66ff", Life = 25 }); return true; };   // addPotion(hp): G.mats += n, addTxt(P, +n)
                c.Pot = t => t == "hp" ? PotHp : null;
                c.MaliceMul = () => 1 + PassiveMaliceLevel * 0.08;
                c.RollDrop = x => RollNormalEquipment(enemy);
                c.AddExp = (v, trans) => AddExperience((int)v, trans == true);
                c.CheckRooms = () => pendingKillRoomChecks++;
                c.DbSaveNow = () => AutosaveRequested?.Invoke();
                c.SfxExplode = () => { }; c.SfxMagicHit = () => { }; c.SfxPickup = () => { };
                var add = c.AddText; c.AddText = (x, y, text, col, life, size, text2) => { if (col == "#33cc66" || text == "HP물약 +1") potTexts.Add(new DropText { Text = text, Color = col, Ttl = (int)life, Anchor = DropAnchor.Source, DY = -8 }); add(x, y, text, col, life, size, text2); };
                EnemyHurt.DeathTail(c, w, ang, true, opts, body, head);
                KillDropped?.Invoke(enemy, new DropResult { Malice = (int)potionMalice, Draws = potDraws, Texts = potTexts.ToArray() });
            }
            // --- G / P back ---
            Kills = (int)c.Kills; Combo = (int)c.Combo; ComboTicks = (float)c.ComboTimer; ComboMax = (int)c.ComboMax;
            critSfxCd = c.CritSfxCd; KillChainCount = c.ChainCnt; KillChainTicks = c.ChainT; DruidFled = c.DruidFled == true;
            int maliceGain = (int)(c.Mats - matsBefore); if (maliceGain != 0) AddMalice(maliceGain);
            if (c.GateGuardKilled == true && !guardBefore) Stage.OnGateGuardKilled(enemy);
            // P is a view: hurtP (revive shockwave, etype bursts) already changed the real player, so only the changes the death part made to the view are added (On-Kill heals, knock-back)
            if (P.hp != hpBefore) Player.Hp = (float)Math.Min(Player.MaxHp, Player.Hp + (P.hp - hpBefore));
            if (P.mp != mpBefore) Player.Mana = (float)Math.Min(Player.MaxMana, Player.Mana + (P.mp - mpBefore));
            if (P.st.HasValue && P.st.Value != stBefore) Player.Stamina = (float)Math.Min(Player.MaxStamina, Player.Stamina + (P.st.Value - stBefore));
            if (P.shield.HasValue && P.shield.Value != shBefore) Player.Shield = (float)Math.Min(Player.MaxShield, Player.Shield + (P.shield.Value - shBefore));
            if (P.kb != null) { Player.KnockbackX += (float)(P.kb.x - kbxBefore); Player.KnockbackY += (float)(P.kb.y - kbyBefore); }
            if (P._freezeSlow.HasValue && !double.IsNaN(P._freezeSlow.Value)) PlayerFreezeSlow = (float)P._freezeSlow.Value;
            foreach (var o in touched) if (o != w) DeathOtherFromWeb(o);
            foreach (var o in c.Ens) if (o != w && o._twPartnerDead == w) DeathOtherFromWeb(o);
            if (exit == DeathExit.BossRevive)
            {
                double deaths = enemy.Deaths;
                var plan = new BossRevivePlan {
                    H7 = HellOfStage() == 6, OldX = oldX, OldY = oldY, OldR = oldR, VfxR = oldR, NewR = enemy.Radius, NewX = enemy.X, NewY = enemy.Y,
                    ShrinkPct = enemy.OrigR > 0 ? ReviveRules.Trunc((1 - enemy.Radius / enemy.OrigR) * 100) : 0,
                    ShockwaveR = 100 + deaths * 30, ShockwaveDamage = ReviveRules.Trunc(enemy.Attack * (.5 + deaths * .15)), ShockwaveHitsPlayer = shockwave,
                    BurstCount = deaths >= 2 ? (int)(8 + deaths * 4) : 0, CompanionEtype = companionEtype, CompanionX = companionX, CompanionY = companionY
                };
                BossRevived?.Invoke(enemy, plan);
            }
        }

        int HellOfStage() { int si = Config.StageIndex; return si >= 0 && si < EnemyTables.SiToHell.Length ? EnemyTables.SiToHell[si] : 0; }

        IEnumerable<EnemySpawn> AllWebs() { foreach (var e in Enemies) yield return SyncToWeb(e); }

        // _wiPush from the death tail: a rolled item (rare mobs, slime) becomes a world drop; debris / o2bubble have no Unity pickup yet.
        void PushDeathWorldItem(JsObj o)
        {
            if (o.Str("type") == "item" && o.Get("item") is InventoryItem it)
            {
                WorldDrop.Push(Loot, new LootState { Id = nextLootId++, X = (float)o.Num("x", 0), Y = (float)o.Num("y", 0), Item = it, Slot = it.slot, Rarity = (int)it.rarity, Tier = (int)it.tier, Element = (int)it.el });
                return;
            }
            UnportedWorldItems.Add(o);
        }

        // _spawnBossProjectile(e, literal) from the death tail: a moving bullet goes to the enemy projectile owner, an iceZone to the field zones, the rest is recorded.
        void SpawnDeathShot(EnemySpawn owner, JsObj o)
        {
            double vx = o.Num("vx", 0), vy = o.Num("vy", 0);
            if (o.Flag("iceZone"))
            {
                FieldZones.Add(new FieldZone { Kind = "iceZone", X = o.Num("x", 0), Y = o.Num("y", 0), Life = o.Num("life", 0), R = o.Num("sz", 0), Dmg = o.Num("dmg", 0), El = o.Num("el", 0) });
                return;
            }
            if (o.Has("vx") && (vx != 0 || vy != 0) && !o.Has("type"))
            {
                SpawnDeathBullet(owner, new ProjSpec { X = o.Num("x", 0), Y = o.Num("y", 0), Vx = vx, Vy = vy, Dmg = o.Num("dmg", 0), Life = o.Num("life", 0), Ml = o.Num("ml", 0), Sz = o.Num("sz", 1),
                    El = (int)o.Num("el", 0), Col = o.Str("col") ?? "", RedBean = o.Flag("redBean"), BlackBean = o.Flag("blackBean"), Homing = o.Flag("homing") });
                return;
            }
            UnportedDeathShots.Add(o);
        }

        void SpawnDeathBullet(EnemySpawn owner, ProjSpec s)
        {
            if (Druid == null) { DroppedDeathShots++; return; }
            webOwner.TryGetValue(owner, out var e);
            Druid.SpawnProjectile(e, null, s, true);
        }
    }
}
