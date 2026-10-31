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
        public const int SinkBodyTicks = 66, SinkHoldTicks = 18, SinkFadeTicks = 18;
        public const int SinkHoleTick = (int)(SinkBodyTicks * .55f) + 1;   // first tick NativeDruidBody.DrawSink shows the hole (t > bodyTicks * .55); the sink sound plays here
        readonly HashSet<int> sinkSounded = new HashSet<int>();

        void BossViewAttach()
        {
            if (bossView != null) bossView.Dispose();
            if (druidBody != null) druidBody.Dispose();
            if (teleView != null) teleView.Dispose();
            bossView = new NativeBossView(transform); teleView = new NativeDruidTelegraphView(transform); sinkStart.Clear(); sinkSounded.Clear();
            druidBody = new NativeDruidBody(transform, DiscSprite());
            Simulation.AttachDruidBoss();
        }

        // web camera: zoom target 0.80 while a boss is alive (1.0 otherwise), eased zoom += (target - zoom) * (1 - .94^dt); orthographicSize 5.4 is zoom 1
        float camZoom = 1f,hd2dArenaHalf;
        Vector3 hd2dCameraShake;
        void BossCameraZoom()
        {
            if(!Simulation.Stage.InArena)hd2dArenaHalf=0;
            var d = Simulation.Druid; bool boss = d != null && d.Boss != null && d.Boss.Alive;
            camZoom += ((boss ? .8f : 1f) - camZoom) * (1f - Mathf.Pow(.94f, Mathf.Min(Time.unscaledDeltaTime * 60f, 3f)));
            view.orthographicSize = 5.4f / camZoom;
        }

        // HD 배우를 그린 뒤 최종 2D 카메라를 확정한다. Core 위치/충돌/기존 3D 경로는 그대로다.
        void Hd2dArenaFrame()
        {
            if(!NativeHd2D.Enabled||NativeRemodel3D.Active||Simulation==null||!Simulation.Stage.InArena||
                view==null||druidBody==null||!druidBody.Visible||playerView==null||!playerView.enabled)return;
            var bounds=druidBody.Bounds;
            var playerBounds=playerView.bounds;
            // 원본 writer는 발 anchor를 쓴다. 곧 적용할 lift까지 포함한 최종 bounds를 예측한다.
            playerBounds.center+=view.transform.up*(NativeHd2D.FootLift(playerView.sprite)*Mathf.Abs(playerView.transform.lossyScale.y));
            bounds.Encapsulate(playerBounds);
            const float usableWidth=.84f,usableHeight=.68f,safeCentreY=.54f;
            float half=Mathf.Max(view.orthographicSize,Mathf.Max(bounds.size.y/(2*usableHeight),bounds.size.x/(2*usableWidth*Mathf.Max(.1f,view.aspect))));
            hd2dArenaHalf=Mathf.Max(hd2dArenaHalf,half);view.orthographicSize=hd2dArenaHalf;
            view.transform.position=new Vector3(bounds.center.x,bounds.center.y-(safeCentreY-.5f)*2*hd2dArenaHalf,view.transform.position.z)+hd2dCameraShake;
        }

        void BossViewUpdate()
        {
            if (bossView != null) bossView.Update(Simulation);
            if (druidBody != null && druidBody.Stamp != Time.frameCount) druidBody.Hide();   // nobody drew the druid this frame (gone / not on this stage)
            foreach (var e in Simulation.Enemies) if (e.Alive && e.IsBoss && sinkStart.Count > 0) { sinkStart.Remove(e.Id); sinkSounded.Remove(e.Id); }
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
            if (!druidBody.Draw(e, dd, newTick)) return false;
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
            druidBody.DrawSink(e, t, SinkBodyTicks, SinkHoldTicks, SinkFadeTicks); druidBody.Stamp = Time.frameCount;
        }
    }
}
