using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // BX: view glue of the 1-1 dark druid (Core/DruidBoss*.cs). Registers the boss behind Simulation.Stage.BossSpawners, draws its projectiles / hazards
    // (NativeBossView) and the STY-D9 final death: the last death of the 1-1 druid is a sink into the ground (66 tick body, 18 tick hold, 18 tick fade of the web).
    public sealed partial class NativeGame
    {
        NativeBossView bossView; NativeDruidBody druidBody; NativeDruidTelegraphView teleView; readonly Dictionary<int, int> sinkStart = new Dictionary<int, int>();
        NativeDruidModelView druidModel;
        readonly NativeDruidImpactClock druidImpact = new NativeDruidImpactClock();
        readonly List<NativeDruidImpactClock.Actor> impactActors = new List<NativeDruidImpactClock.Actor>();
        int impactActorId = -1, impactEtype = -1;
        public const int SinkBodyTicks = 66, SinkHoldTicks = 18, SinkFadeTicks = 18;
        public const int SinkHoleTick = (int)(SinkBodyTicks * .55f) + 1;   // first tick NativeDruidBody.DrawSink shows the hole (t > bodyTicks * .55); the sink sound plays here
        readonly HashSet<int> sinkSounded = new HashSet<int>();

        void BossViewAttach()
        {
            BossViewDispose();
            bossView = new NativeBossView(transform); teleView = new NativeDruidTelegraphView(transform); sinkStart.Clear(); sinkSounded.Clear();
            druidBody = new NativeDruidBody(transform, DiscSprite());
            druidModel = new NativeDruidModelView(transform, DiscSprite());
            Simulation.AttachDruidBoss();
        }

        void BossViewDispose()
        {
            druidImpact.Reset();
            impactActors.Clear(); impactActorId = impactEtype = -1;
            bossView?.Dispose(); druidBody?.Dispose(); teleView?.Dispose(); druidModel?.Dispose();
            bossView = null; druidBody = null; teleView = null; druidModel = null;
        }

        // 매 Core틱의 기존 DispatchFeedback에서만 읽는다. 보스 본체의 등록/id/현재 좌표를 확인하며 다른 보스에는 적용하지 않는다.
        void BossImpactBeginTick()
        {
            impactActors.Clear(); impactActorId = impactEtype = -1;
            var sim = Simulation; var boss = sim != null && sim.Druid != null ? sim.Druid.Boss : null;
            DruidData data;
            bool valid = sim != null && sim.Config.StageIndex == 0 && sim.Stage.InArena && boss != null && boss.IsBoss && boss.Alive && boss.Hp > 0
                && ReferenceEquals(sim.Stage.FindBoss(), boss) && sim.Druid.Data.TryGetValue(boss, out data);
            if (!valid) { druidImpact.Reset(); return; }
            data = sim.Druid.Data[boss];
            impactActorId = boss.Id; impactEtype = boss.Etype;
            foreach (var actor in sim.Enemies)
                if (actor.Alive && actor.Hp > 0 && actor.IsBoss)
                    impactActors.Add(new NativeDruidImpactClock.Actor { Id = actor.Id, Etype = actor.Etype, X = actor.X, Y = actor.Y, Radius = actor.Radius, Alive = true, IsBoss = true });
            // DruidTelegraph.StaffTip과 같은 공개 계약: Facing+WeaponAng, 몸 반지름+70.
            double angle = data.Facing + data.WeaponAng, reach = data.R + DruidBoss.StaffReachExtra;
            druidImpact.Begin(sim.TickCount, boss.Id, data.X, data.Y, data.R, data.S, true,
                data.X + Math.Cos(angle) * reach, data.Y + Math.Sin(angle) * reach);
        }

        void BossImpactOffer(FeedbackEvent e)
        {
            if (e.Kind == FeedbackKind.KiSlashHit) druidImpact.OfferKi(e.Tick, e.X, e.Y);
            else if ((e.Kind == FeedbackKind.BossHit || e.Kind == FeedbackKind.EnemyCrit)
                && NativeDruidImpactClock.SourceMatches(impactActorId, impactEtype, e.Etype, e.IsBoss, e.X, e.Y, impactActors))
                druidImpact.OfferHit(e.Tick, e.X, e.Y, e.Kind == FeedbackKind.EnemyCrit);
        }

        void BossImpactFinishTick()
        {
            if (Simulation != null && bossView != null) bossView.DruidContact(druidImpact.Finish(Simulation.TickCount), Simulation.TickCount);
        }

        // web camera: zoom target 0.80 while a boss is alive (1.0 otherwise), eased zoom += (target - zoom) * (1 - .94^dt); orthographicSize 5.4 is zoom 1
        float camZoom = 1f;
        void BossCameraZoom()
        {
            var d = Simulation.Druid; bool boss = d != null && d.Boss != null && d.Boss.Alive;
            camZoom += ((boss ? .8f : 1f) - camZoom) * (1f - Mathf.Pow(.94f, Mathf.Min(Time.unscaledDeltaTime * 60f, 3f)));
            view.orthographicSize = 5.4f / camZoom;
        }

        void BossViewUpdate()
        {
            if (bossView != null) bossView.Update(Simulation);
            if (teleView != null) teleView.Update(Simulation, view);   // RB1-3: reads Simulation.DruidTelegraphs only (remodel off = empty list = nothing drawn)
            if (druidBody != null && druidBody.Stamp != Time.frameCount) druidBody.Hide();   // nobody drew the druid this frame (gone / not on this stage)
            if (druidModel != null && druidModel.Stamp != Time.frameCount) druidModel.Hide();
            foreach (var e in Simulation.Enemies) if (e.Alive && e.IsBoss && sinkStart.Count > 0) { sinkStart.Remove(e.Id); sinkSounded.Remove(e.Id); }
        }

        bool BossVisibleBounds(out Bounds bounds)
        {
            if (druidModel != null && druidModel.Visible) { bounds = druidModel.Bounds; return true; }
            if (druidBody != null && druidBody.Visible) { bounds = druidBody.Bounds; return true; }
            bounds = new Bounds(); return false;
        }

        // dead 1-1 druid (SinkDruid): the body sinks, holds on the last frame, then fades. Returns true while the sink is still on screen.
        public bool BossSinkVisible(EnemyState e)
        {
            if (!e.IsBoss || !e.SinkDruid || e.Alive) return false;
            int t0; if (!sinkStart.TryGetValue(e.Id, out t0)) return true;
            return Simulation.TickCount - t0 < SinkBodyTicks + SinkHoldTicks + SinkFadeTicks;
        }

        // the web druid body (8-direction sheets); false = not the 1-1 druid / no art, the generic enemy sprite is used
        bool BossBodyDraw(EnemyState e, EnemyView ev, bool newTick)
        {
            if (!e.IsBoss || druidBody == null || Simulation.Druid == null) return false;
            DruidData dd; if (!Simulation.Druid.Data.TryGetValue(e, out dd)) return false;
            bool holdPose = druidImpact.Holding(Simulation.TickCount);
            if (druidModel != null && druidModel.Draw(e, dd, Simulation.TickCount, ev.moving, holdPose))
            { druidBody.Hide(); ev.body.enabled = false; ev.walk.enabled = false; return true; }
            if (!druidBody.Draw(e, dd, newTick, Simulation.TickCount, holdPose)) return false;
            druidBody.Stamp = Time.frameCount; ev.body.enabled = false; ev.walk.enabled = false;
            return true;
        }

        static Sprite discSprite;
        static Sprite DiscSprite()
        {
            if (discSprite != null) return discSprite;
            const int n = 128; var tex = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float dx = (x + .5f) / n * 2 - 1, dy = (y + .5f) / n * 2 - 1, r = Mathf.Sqrt(dx * dx + dy * dy);
                px[y * n + x] = new Color32(255, 255, 255, (byte)((r >= 1 ? 0 : Mathf.Clamp01((1 - r) / .22f)) * 255));
            }
            tex.SetPixels32(px); tex.Apply(false, true);
            return discSprite = Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100f, 0, SpriteMeshType.FullRect);
        }

        // dead 1-1 druid (SinkDruid): web _drawDruidSink through the emerge sheet
        void BossSinkDraw(EnemyState e, EnemyView ev)
        {
            if (!e.IsBoss || !e.SinkDruid || druidBody == null) return;
            int t0; if (!sinkStart.TryGetValue(e.Id, out t0)) { t0 = Simulation.TickCount; sinkStart[e.Id] = t0; }
            int t = Simulation.TickCount - t0;
            if (t >= SinkHoleTick && sound != null && sinkSounded.Add(e.Id)) sound.PlaySinkHole(e.X, e.Y, Simulation.TickCount);
            ev.body.enabled = false; ev.walk.enabled = false;
            if (t >= SinkBodyTicks + SinkHoldTicks + SinkFadeTicks) return;
            if (druidModel != null && druidModel.DrawSink(e, Simulation.TickCount, t, SinkBodyTicks, SinkHoldTicks, SinkFadeTicks))
            { druidBody.Hide(); return; }
            druidBody.DrawSink(e, t, SinkBodyTicks, SinkHoldTicks, SinkFadeTicks); druidBody.Stamp = Time.frameCount;
        }
    }
}
