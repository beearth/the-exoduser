using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // BX: stand-in presentation of the 1-1 dark druid's projectiles, ground hazards and wind-up rings. Gameplay (timing, damage, positions) is the Core's
    // (Core/DruidBoss*.cs, oracle-checked against game.html); this file only draws it with procedural discs / rings in the Hell-Gothic poison greens of the web
    // druid (#66dd22 shots, #84a83d roots, #5e10a8 mines). The web's own druid clips (druid_hit / roots / poison pool atlases) are art tasks of the boss VFX owner.
    public sealed class NativeBossView
    {
        readonly Transform root; readonly List<SpriteRenderer> pool = new List<SpriteRenderer>(); int used;
        readonly Sprite disc, ring;
        static readonly Color Poison = new Color(.40f, .87f, .13f), PoisonDark = new Color(.0f, .45f, .0f), Root = new Color(.52f, .66f, .24f), Mine = new Color(.37f, .06f, .66f), Warn = new Color(.8f, .15f, .1f);

        public NativeBossView(Transform parent)
        {
            root = new GameObject("BossView").transform; root.SetParent(parent, false);
            disc = MakeSprite(false); ring = MakeSprite(true);
        }

        public void Dispose() { if (root != null) UnityEngine.Object.Destroy(root.gameObject); }

        static Sprite MakeSprite(bool ringOnly)
        {
            const int n = 128; var tex = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float dx = (x + .5f) / n * 2 - 1, dy = (y + .5f) / n * 2 - 1, r = Mathf.Sqrt(dx * dx + dy * dy), a;
                if (ringOnly) a = Mathf.Clamp01(1 - Mathf.Abs(r - .93f) / .06f) * (r <= 1 ? 1 : 0);
                else a = r >= 1 ? 0 : Mathf.Clamp01((1 - r) / .22f);
                px[y * n + x] = new Color32(255, 255, 255, (byte)(a * 255));
            }
            tex.SetPixels32(px); tex.Apply(false, true);
            return Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100f, 0, SpriteMeshType.FullRect);
        }

        static Vector3 Point(double x, double y) { return new Vector3((float)x / 100, -(float)y / 100, 0); }

        SpriteRenderer Next()
        {
            if (used >= pool.Count) { var go = new GameObject("fx"); go.transform.SetParent(root, false); pool.Add(go.AddComponent<SpriteRenderer>()); }
            var r = pool[used++]; r.enabled = true; return r;
        }

        // radius in web pixels (the 128 px sprite is 1.28 world units wide at scale 1)
        void Put(Sprite s, double x, double y, double radius, Color c, int order)
        {
            var r = Next(); r.sprite = s; r.color = c; r.sortingOrder = order;
            r.transform.position = Point(x, y); r.transform.localScale = Vector3.one * (float)(radius * 2 / 128.0);
        }

        public void Update(Simulation sim)
        {
            used = 0;
            var druid = sim.Druid; if (druid == null) { Finish(); return; }
            int t = sim.TickCount;
            // ground hazards first (low sorting order, under the actors)
            foreach (var lp in druid.LavaPools)
            {
                if (lp.T < lp.WarnT) Put(ring, lp.X, lp.Y, lp.R, new Color(Poison.r, Poison.g, Poison.b, .35f + .35f * Mathf.Abs(Mathf.Sin((float)lp.T * .25f))), -9000);
                else { float fade = Mathf.Clamp01((float)((lp.MaxT - lp.T) / 40)); Put(disc, lp.X, lp.Y, lp.R, new Color(.22f, .45f, .08f, .55f * fade), -9000); Put(ring, lp.X, lp.Y, lp.R, new Color(Poison.r, Poison.g, Poison.b, .8f * fade), -8999); }
            }
            foreach (var pp in druid.PoisonPools) { float fade = Mathf.Clamp01((float)((pp.MaxT - pp.T) / 40)); Put(disc, pp.X, pp.Y, pp.R, new Color(.2f, .42f, .06f, .42f * fade), -9001); Put(ring, pp.X, pp.Y, pp.R, new Color(Poison.r, Poison.g, Poison.b, .55f * fade), -9000); }
            foreach (var ca in druid.ChaseAoes)
                foreach (var z in ca.Zones)
                {
                    if (!z.Hit) { float k = Mathf.Clamp01((float)(z.T / z.Delay)); Put(ring, z.X, z.Y, z.R, new Color(Root.r, Root.g, Root.b, .45f + .4f * k), -8990); Put(disc, z.X, z.Y, z.R * k, new Color(Root.r, Root.g, Root.b, .22f), -8991); }
                    else { float k = Mathf.Clamp01((float)(1 - z.ExplT / z.ExplMax)); Put(disc, z.X, z.Y, z.R, new Color(.72f, .92f, .38f, .55f * k), -8990); }
                }
            foreach (var f in druid.Fissures)
            {
                int steps = (int)(f.Len / 50) + 1;
                for (int i = 0; i <= steps; i++) { double d = f.Len * i / steps; Put(disc, f.X + Math.Cos(f.Ang) * d, f.Y + Math.Sin(f.Ang) * d, 46, new Color(Root.r * .6f, Root.g * .5f, Root.b * .3f, .9f), -8980); }
                Put(ring, f.X + Math.Cos(f.Ang) * f.Len, f.Y + Math.Sin(f.Ang) * f.Len, f.ExplR, new Color(Root.r, Root.g, Root.b, f.Exploded ? .15f : .5f), -8979);
            }
            foreach (var w in druid.TideWaves)
            {
                int segs = 72;
                for (int i = 0; i < segs; i++)
                {
                    double a = Math.PI * 2 * i / segs, gd = a - w.GapAng; while (gd > Math.PI) gd -= Math.PI * 2; while (gd < -Math.PI) gd += Math.PI * 2;
                    if (Math.Abs(gd) <= w.GapSize) continue;
                    Put(disc, w.X + Math.Cos(a) * w.Rad, w.Y + Math.Sin(a) * w.Rad, 34, new Color(Root.r, Root.g, Root.b, .75f), -8970);
                }
            }
            // wind-up warning ring on the boss
            var boss = druid.Boss;
            if (boss != null && boss.Alive && druid.Data.TryGetValue(boss, out var dd) && dd.S.EndsWith("Wind"))
            {
                float k = Mathf.Clamp01(1f - (float)(dd.St2 / 60));
                Put(ring, dd.X, dd.Y, dd.R * (1.6f + .4f * Mathf.Sin(t * .4f)), new Color(Warn.r, Warn.g, Warn.b, .45f + .4f * k), (int)dd.Y + 2);
            }
            // things in the air
            foreach (var m in druid.SeekerMines)
            {
                bool armed = m.T > m.ArmT; Put(disc, m.X, m.Y, 20, armed ? new Color(Mine.r + .3f, Mine.g, Mine.b + .2f, .95f) : new Color(Mine.r, Mine.g, Mine.b, .5f), (int)m.Y + 1);
                if (armed) Put(ring, m.X, m.Y, m.R, new Color(Mine.r + .3f, 0, Mine.b + .2f, .35f), (int)m.Y);
            }
            foreach (var o in druid.Orbs) { Put(disc, o.X, o.Y, o.R * 1.6f, new Color(Poison.r, Poison.g, Poison.b, .35f), (int)o.Y + 3); Put(disc, o.X, o.Y, o.R, new Color(.8f, 1f, .5f, .95f), (int)o.Y + 4); }
            foreach (var p in druid.Projectiles)
            {
                if (!p.Active) continue;
                double r = Math.Max(6, p.Sz * 3 + 3);
                if (p.Mine) { Put(disc, p.X, p.Y, 18, Mine, (int)p.Y); continue; }
                Color c = p.BlackBean ? PoisonDark : p.ElemBall ? new Color(.7f, .9f, .25f) : Poison;
                Put(disc, p.X, p.Y, r * 1.7, new Color(c.r, c.g, c.b, .30f), (int)p.Y + 5);
                Put(disc, p.X, p.Y, r, p.BlackBean ? new Color(.05f, .22f, .05f, .98f) : new Color(.86f, 1f, .62f, .97f), (int)p.Y + 6);
            }
            Finish();
        }

        void Finish() { for (int i = used; i < pool.Count; i++) pool[i].enabled = false; }
    }
}
