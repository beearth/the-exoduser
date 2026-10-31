using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // BX: presentation of the 1-1 dark druid's projectiles, ground hazards and event VFX. Gameplay (timing, damage, positions) is the Core's (Core/DruidBoss*.cs,
    // oracle-checked against game.html); this file draws it with the web's own art: the poison-pool / orb / hit / roots / shockring / dust atlas clips
    // (assets/vfx/boss/druid_*_24_*), the corruption ring (druid_corruption_ring.svg) and the grey-then-#66dd22 fire-devil orb sheet for the poison shots,
    // with the web's sizes, alphas and clip time (24 fps loops from the hazard's own T, once-clips stretched over maxFrames x frameTime ticks).
    // Still procedural (the web strokes them as vector lines too): fissure crack body, tide-wave beads, rhythm volley. 추적/탄 지뢰는 현행 어둠 지뢰 원화를 사용한다.
    public sealed partial class NativeBossView
    {
        readonly Transform root; readonly List<SpriteRenderer> pool = new List<SpriteRenderer>(), addPool = new List<SpriteRenderer>(); int used, addUsed;
        readonly Sprite disc, ring, thinRing, hardDisc;
        public int MineSpritesDrawn{get;private set;}
        public int MineArtFallbacks{get;private set;}
        static Sprite mineFlashRing;
        static Sprite MineFlashRing(){if(mineFlashRing!=null)return mineFlashRing;const int n=256;var tex=new Texture2D(n,n,TextureFormat.RGBA32,false);var px=new Color[n*n];for(int y=0;y<n;y++)for(int x=0;x<n;x++){float r=Vector2.Distance(new Vector2(x+.5f,y+.5f),new Vector2(n/2f,n/2f))/(n/2f);float a=Mathf.Min(Mathf.Clamp01((1-r)*n/2+.5f),Mathf.Clamp01((r-51f/53)*n/2+.5f));px[y*n+x]=new Color(1,216/255f,74/255f,a);}tex.SetPixels(px);tex.Apply(false,true);mineFlashRing=Sprite.Create(tex,new Rect(0,0,n,n),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);return mineFlashRing;}
        // game.html draws the pool rim as arc(r) + reversed arc(r-1.2) fill; its GPU canvas proxy fills that as a whole disc (#a9d76a at .55 of the clip alpha). Boss lead / design lead decision (10-27): keep the 1.2 px hairline the code means; true reproduces the web's disc.
        const bool PoolRimAsWebProxyDisc = false;
        readonly MaterialPropertyBlock block = new MaterialPropertyBlock();
        static readonly Color Poison = new Color(.40f, .87f, .13f), Root = new Color(.52f, .66f, .24f), Mine = new Color(.37f, .06f, .66f), RimGreen = new Color(.663f, .843f, .416f);

        // atlas clips: resource, columns, rows, frames, fps (loop = hazard T/60 seconds)
        struct Clip { public string Res; public int Cols, Rows, Frames; public float Fps; }
        static readonly Clip PoolClip = new Clip { Res = "druid_poison_pool_24_20261009", Cols = 6, Rows = 4, Frames = 24, Fps = 24f };
        static readonly Clip OrbClip = new Clip { Res = "druid_orb_24_20261009", Cols = 6, Rows = 4, Frames = 24, Fps = 300f / 7f };
        static readonly Clip HitClip = new Clip { Res = "druid_hit_24_20261010", Cols = 6, Rows = 4, Frames = 24, Fps = 180f / 7f };
        static readonly Clip RootsClip = new Clip { Res = "druid_roots_48_20261010", Cols = 8, Rows = 6, Frames = 48, Fps = 288f / 7f };
        static readonly Clip ShockClip = new Clip { Res = "druid_shockring_24_20261010", Cols = 6, Rows = 4, Frames = 24, Fps = 180f / 7f };
        static readonly Clip DustClip = new Clip { Res = "druid_dust_24_20261010", Cols = 6, Rows = 4, Frames = 24, Fps = 180f / 7f };

        // game.html playVFXAng: a once-clip lives maxFrames x frameTime ticks and is stretched over that time; additive ('lighter'), alpha 1 - frame/maxFrames*.3
        sealed class Vfx { public Clip Clip; public float X, Y, W, H; public int Born, FrameTime, MaxFrames; }
        readonly List<Vfx> vfx = new List<Vfx>();
        readonly Dictionary<BossProjectile,SpriteRenderer> projectileRenderers=new Dictionary<BossProjectile,SpriteRenderer>();
        public bool TryProjectileRenderer(BossProjectile p,out SpriteRenderer renderer){return projectileRenderers.TryGetValue(p,out renderer)&&renderer!=null;}
        Simulation bound; int boundTick;
        readonly HashSet<ChaseZone> zoneHit = new HashSet<ChaseZone>();
        readonly Dictionary<Fissure, int> fissureExploded = new Dictionary<Fissure, int>();
        string prevBossState;

        public NativeBossView(Transform parent)
        {
            root = new GameObject("BossView").transform; root.SetParent(parent, false);
            disc = MakeSprite(0); ring = MakeSprite(1); thinRing = MakeSprite(2); hardDisc = MakeSprite(3);
        }

        public void Dispose()
        {
            if (bound != null) bound.BossFx -= OnFx;
            if (root != null) UnityEngine.Object.Destroy(root.gameObject);
        }

        static Sprite MakeSprite(int mode)
        {
            int n = mode >= 2 ? 512 : 128; var tex = new Texture2D(n, n, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float dx = (x + .5f) / n * 2 - 1, dy = (y + .5f) / n * 2 - 1, r = Mathf.Sqrt(dx * dx + dy * dy), a;
                if (mode == 1) a = Mathf.Clamp01(1 - Mathf.Abs(r - .93f) / .06f) * (r <= 1 ? 1 : 0);
                else if (mode == 2) a = Mathf.Clamp01(1 - Mathf.Abs(r - .99f) / .006f);   // ~1.5 px hairline: the web strokes the pool rim 1.2 px wide
                else if (mode == 3) a = Mathf.Clamp01((1 - r) * 256f);   // hard-edged disc, 1 px antialias
                else a = r >= 1 ? 0 : Mathf.Clamp01((1 - r) / .22f);
                px[y * n + x] = new Color32(255, 255, 255, (byte)(a * 255));
            }
            tex.SetPixels32(px); tex.Apply(false, true);
            return Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(.5f, .5f), 100f, 0, SpriteMeshType.FullRect);
        }

        static Vector3 Point(double x, double y) { return NativeRemodel3D.Point(x, y); }

        SpriteRenderer Next()
        {
            if (used >= pool.Count) { var go = new GameObject("fx"); go.transform.SetParent(root, false); pool.Add(go.AddComponent<SpriteRenderer>()); }
            var r = pool[used++]; r.enabled = true; return r;
        }

        SpriteRenderer NextAdd()
        {
            if (addUsed >= addPool.Count) { var go = new GameObject("fxAdd"); go.transform.SetParent(root, false); var rr = go.AddComponent<SpriteRenderer>(); rr.sharedMaterial = NativeDruidArt.Additive; addPool.Add(rr); }
            var r = addPool[addUsed++]; r.enabled = true; return r;
        }

        // radius in web pixels (the 128 px sprite is 1.28 world units wide at scale 1)
        void Put(Sprite s, double x, double y, double radius, Color c, int order,bool ground=true)
        {
            var r = Next(); r.sprite = s; r.color = c; r.sortingOrder = order; r.transform.rotation = Quaternion.identity;
            r.transform.position = Point(x, y); r.transform.localScale = Vector3.one * (float)(radius * 2 / s.rect.width);if(ground)NativeHd2DSurface.Bind(r);else NativeHd2D.Center(r);
        }

        // a sprite stretched to w x h web pixels, optionally rotated (canvas rotate is clockwise on screen, Unity z-rotation counter-clockwise)
        void PutBox(Sprite s, double x, double y, double w, double h, Color c, int order, double angle = 0,bool ground=true)
        {
            var r = Next(); r.sprite = s; r.color = c; r.sortingOrder = order; r.transform.rotation = Quaternion.Euler(0, 0, -(float)(angle * Mathf.Rad2Deg));
            r.transform.position = Point(x, y); r.transform.localScale = new Vector3((float)w / s.rect.width, (float)h / s.rect.height, 1);if(ground)NativeHd2DSurface.Bind(r);else NativeHd2D.Center(r);
        }

        void PutAdd(Sprite s, double x, double y, double w, double h, float opacity, int order, double angle = 0, Color? tint = null,bool ground=true)
        {
            var r = NextAdd(); r.sprite = s; r.sortingOrder = order; r.color = tint??Color.white; r.transform.rotation = Quaternion.Euler(0, 0, -(float)(angle * Mathf.Rad2Deg));
            r.transform.position = Point(x, y); r.transform.localScale = new Vector3((float)w / s.rect.width, (float)h / s.rect.height, 1);
            r.GetPropertyBlock(block); block.SetFloat(NativeDruidArt.Opacity, opacity); r.SetPropertyBlock(block);if(ground)NativeHd2DSurface.Bind(r,true);else NativeHd2D.Grounded(r);
        }

        static Sprite ClipSprite(Clip c, int frame) { return NativeDruidArt.ClipFrame(NativeDruidArt.VfxDir + c.Res, c.Cols, c.Rows, frame); }
        static int LoopFrame(Clip c, double ticks) { return (int)Math.Floor(((ticks / 60.0) * c.Fps) % c.Frames); }

        // _drawDruidGroundRing: the corruption ring at diameter 2r, rotated by `angle`; innerFraction > 0 keeps only the band inner..1
        void GroundRing(double x, double y, double r, double alpha, double angle, int order, float inner = 0)
        {
            var s = inner > 0 ? NativeDruidArt.RingBand(inner) : NativeDruidArt.Ring;
            PutBox(s, x, y, r * 2, r * 2, new Color(1, 1, 1, (float)alpha), order, angle);
        }

        // _drawDruidPoolClip: pool.t/60 s into the looping 24-frame clip, drawn at 1.12 r with the given alpha, plus a 1.2 px pale-green rim at .55 of it
        void PoolClipDraw(double x, double y, double r, double t, double alpha, int order)
        {
            double R = r * 1.12;
            PutBox(ClipSprite(PoolClip, LoopFrame(PoolClip, t)), x, y, R * 2, R * 2, new Color(1, 1, 1, (float)alpha), order);
            Put(PoolRimAsWebProxyDisc ? hardDisc : thinRing, x, y, r, new Color(RimGreen.r, RimGreen.g, RimGreen.b, (float)(alpha * .55)), order + 1);
        }

        void Spawn(Clip c, double x, double y, double w, double h, int born, int frameTime, int maxFrames)
        {
            if (vfx.Count >= 20) vfx.RemoveAt(0);   // playVFXAng: the 20-entry pool evicts its oldest non-skill entry
            vfx.Add(new Vfx { Clip = c, X = (float)x, Y = (float)y, W = (float)w, H = (float)h, Born = born, FrameTime = frameTime, MaxFrames = maxFrames });
        }

        void OnFx(string kind, double x, double y, double r)
        {
            int born = boundTick;
            switch (kind)
            {
                case "druidDust": Spawn(DustClip, x, y, r * 2, r * 2, born, 7, 8); break;                                       // playVFXAng('druid_dust',x,y,r*2/256,7)
                case "druidRoots":
                    Spawn(HitClip, x, y, 362 * .72, 543 * .72, born, 7, 8);                                                    // druid_hit .72, 7
                    Spawn(RootsClip, x, y, r * 2, r * 2, born, 7, 10); break;                                                  // druid_roots r*2/256, 7
            }
        }

        public void Update(Simulation sim)
        {
            projectileRenderers.Clear();used = 0; addUsed = 0; MineSpritesDrawn = 0; MineArtFallbacks = 0; FieldMouthsDrawn = 0; FieldCometsDrawn = 0; FieldOrbsDrawn = 0; FieldBulletFallbacks = 0;
            if (bound != sim) { if (bound != null) bound.BossFx -= OnFx; bound = sim; sim.BossFx += OnFx; }
            DrawFieldZones(sim);
            var druid = sim.Druid; if (druid == null) { Finish(); return; }
            int t = sim.TickCount; boundTick = t;
            double nowMs = Time.unscaledTime * 1000.0;
            // ground hazards first (low sorting order, under the actors)
            foreach (var lp in druid.LavaPools)
            {
                double la = lp.T < lp.WarnT ? lp.T / lp.WarnT * .42 : lp.T > lp.MaxT * .8 ? (1 - (lp.T - lp.MaxT * .8) / (lp.MaxT * .2)) * .65 : .65;
                PoolClipDraw(lp.X, lp.Y, lp.R, lp.T, la, -9000);
            }
            foreach (var pp in druid.PoisonPools)
            {
                double f = pp.T > pp.MaxT * .8 ? 1 - (pp.T - pp.MaxT * .8) / (pp.MaxT * .2) : Math.Min(1, pp.T * 5 / pp.MaxT);
                PoolClipDraw(pp.X, pp.Y, pp.R, pp.T, f * .68, -9002);
            }
            int zi = 0;
            foreach (var ca in druid.ChaseAoes)
            {
                zi = 0;
                foreach (var z in ca.Zones)
                {
                    if (!z.Hit)
                    {
                        // rotten-root zone: hollow ring, the damage radius is unchanged
                        double zp = Math.Min(1, z.T / z.Delay), pulse = .78 + Math.Sin(nowMs * .018 + zi) * .22;
                        GroundRing(z.X, z.Y, z.R, zp * (.55 + .12 * pulse), zi * .67, -8990);
                    }
                    else
                    {
                        if (zoneHit.Add(z)) Spawn(HitClip, z.X, z.Y, z.R * 1.7, z.R * 1.7 * 543 / 362, t, 3, 8);   // playVFXAng('druid_hit',z.x,z.y,z.r*1.7/362,3)
                        double ep = z.ExplMax > 0 ? Math.Min(1, z.ExplT / z.ExplMax) : 1;
                        GroundRing(z.X, z.Y, z.R * (1 + ep * .25), (1 - ep) * .68, zi * .67, -8990);
                    }
                    zi++;
                }
            }
            if (zoneHit.Count > 64) zoneHit.RemoveWhere(z => z.Hit && z.ExplT >= z.ExplMax);
            int fi = 0;
            foreach (var f in druid.Fissures)
            {
                int steps = (int)(f.Len / 50) + 1;
                // three stroke layers of the web crack (#1c2418 w / #364327 .56w / #a5c568 max(7,.09w) at .31 / .56 / .84)
                double[] lw = { f.W, f.W * .56, Math.Max(7, f.W * .09) }; float[] la = { .31f, .56f, .84f };
                Color[] lc = { new Color(.11f, .141f, .094f), new Color(.212f, .263f, .153f), new Color(.647f, .773f, .408f) };
                for (int layer = 0; layer < 3; layer++)
                    for (int i = 0; i <= steps; i++) { double d = f.Len * i / steps; Put(disc, f.X + Math.Cos(f.Ang) * d, f.Y + Math.Sin(f.Ang) * d, lw[layer] * .5, new Color(lc[layer].r, lc[layer].g, lc[layer].b, la[layer]), -8980 + layer); }
                double hx = f.X + Math.Cos(f.Ang) * f.Len, hy = f.Y + Math.Sin(f.Ang) * f.Len;
                int born; if (f.Exploded && !fissureExploded.TryGetValue(f, out born)) fissureExploded[f] = t;
                double ep = f.Exploded ? Math.Min(1, (t - fissureExploded[f]) / 30.0) : 0, markR = f.Exploded ? f.ExplR * (1 + ep * .12) : f.ExplR;
                GroundRing(hx, hy, markR, f.Exploded ? (1 - ep) * .48 : .32 + Math.Sin(nowMs * .018) * .035, fi * .69, -8978, .78f);
                fi++;
            }
            if (fissureExploded.Count > 32) { var dead = new List<Fissure>(); foreach (var k in fissureExploded.Keys) if (!druid.Fissures.Contains(k)) dead.Add(k); foreach (var k in dead) fissureExploded.Remove(k); }
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
            // boss state transitions that carry a web VFX: bossShockWind -> bossShock = druid_shockring r*2.5/256 (512 px frame -> 5 r wide), speed 7, 8 frames
            var boss = druid.Boss; string bs = null;
            DruidData dd = null; if (boss != null && boss.Alive && druid.Data.TryGetValue(boss, out dd)) bs = dd.S;
            if (bs == "bossShock" && prevBossState == "bossShockWind") Spawn(ShockClip, dd.X, dd.Y, dd.R * 5, dd.R * 5, t, 7, 8);
            prevBossState = bs;
            // things in the air
            foreach (var m in druid.SeekerMines)
            {
                bool armed = m.T > m.ArmT;
                if(HasArt(WardSheet)){float a=armed?(float)(.78+(.5+Math.Sin(nowMs*.015)*.5)*.18):.46f;PutAdd(NativeDruidArt.ClipFrame(WardSheet,2,1,0),m.X,m.Y,m.R*2,m.R*2,a,(int)m.Y,nowMs*.00035);MineSpritesDrawn++;}
                else{Put(disc,m.X,m.Y,20,new Color(Mine.r,Mine.g,Mine.b,.5f),(int)m.Y);MineArtFallbacks++;}
            }
            foreach (var o in druid.Orbs)
            {
                double R = o.R * 2.4;   // _drawDruidOrbClip: o.t/60 s into the looping clip, 2.4 r
                PutBox(ClipSprite(OrbClip, LoopFrame(OrbClip, o.T)), o.X, o.Y, R * 2, R * 2, Color.white, (int)o.Y + 4,ground:false);
            }
            foreach (var p in druid.Projectiles)
            {
                if (!p.Active) continue;
                if(p.Mine){if(HasArt(WardSheet)){double mp=p.Life/(p.Ml==0?180:p.Ml),pulse=.5+Math.Sin(nowMs/(80+mp*100))*.5;bool blink=mp<.35;PutAdd(NativeDruidArt.ClipFrame(WardSheet,2,1,0),p.X,p.Y,112,112,(float)((blink?.84:.76)+pulse*.18),(int)p.Y,nowMs*.00035);if(blink)PutAdd(MineFlashRing(),p.X,p.Y,106,106,(float)(.3+pulse*.2),(int)p.Y+1,0,new Color(1,216/255f,74/255f));MineSpritesDrawn++;}else{Put(disc,p.X,p.Y,18,Mine,(int)p.Y);MineArtFallbacks++;}continue;}
                if (p.DruidPoison)
                {
                    // _drawDruidPoisonShot: 16-frame orb at 70 ms/frame, 96..180 px by Sz (240 for mines / element balls), doubled for physical-parry shots
                    double size = (p.Mine || p.ElemBall ? 240 : Math.Max(96, Math.Min(180, p.Sz * 24))) * (p.ParryClass == "physical" ? 2 : 1);
                    PutBox(NativeDruidArt.PoisonShot((int)(nowMs / 70) % 16), p.X, p.Y, size, size, Color.white, (int)p.Y + 6,ground:false);projectileRenderers[p]=pool[used-1];
                    continue;
                }
                int firstBulletRenderer=used;DrawFieldBullet(p, t);if(used>firstBulletRenderer)projectileRenderers[p]=pool[used-1];   // VFX-D18: field enemies' bullets, per kind as game.html pass 2 (NativeBossView.FieldBullets.cs)
            }
            // once-clips (additive)
            for (int i = 0; i < vfx.Count;)
            {
                var v = vfx[i]; int age = t - v.Born, life = v.FrameTime * v.MaxFrames;
                if (age >= life) { vfx.RemoveAt(i); continue; }
                int legacy = age / v.FrameTime, frame = Math.Min(v.Clip.Frames - 1, (int)((double)age / life * v.Clip.Frames));
                PutAdd(ClipSprite(v.Clip, frame), v.X, v.Y, v.W, v.H, 1f - (float)legacy / v.MaxFrames * .3f, (int)v.Y + 20,0,null,v.Clip.Res!=RootsClip.Res&&v.Clip.Res!=HitClip.Res);
                i++;
            }
            Finish();
        }

        // The field enemies' zero-speed bullets (game.html 54198 trap, 54262 iceZone / blizzard): the trap is the right half of the AI-made ward sheet (img/vfx/mine_trap_ward_sheet.png),
        // screen-blended (additive here) at 112 px, turning at -.00018 rad/ms, alpha .78 + .18 pulse; the floor zones are three flat discs (R = sz*5, .6 R, .28 R) pulsing with
        // .5 + sin(t/250 + x) * .3, dark purple for the dark element and pale blue for ice.
        const string WardSheet = "Art/vfx/field/mine_trap_ward_sheet";
        void DrawFieldZones(Simulation sim)
        {
            if (sim.FieldZones.Count == 0) return;
            double now = Time.unscaledTime * 1000.0;
            foreach (var z in sim.FieldZones)
            {
                if (z.Kind == "trap")
                {
                    double pulse = .5 + Math.Sin(now / 200) * .5;
                    PutAdd(NativeDruidArt.ClipFrame(WardSheet, 2, 1, 1), z.X, z.Y, 112, 112, (float)(.78 + pulse * .18), (int)z.Y - 20, -now * .00018);
                    continue;
                }
                bool dark = z.El == 3; double zr = (z.R != 0 ? z.R : 2) * 5, zp = .5 + Math.Sin(now / 250 + z.X) * .3;
                Color c0 = dark ? new Color32(0x1a, 0x00, 0x33, 255) : new Color32(0x2a, 0x4a, 0x66, 255), c1 = dark ? new Color32(0x3a, 0x00, 0x70, 255) : new Color32(0x44, 0x88, 0xaa, 255), c2 = dark ? new Color32(0x5e, 0x10, 0xa8, 255) : new Color32(0x88, 0xcc, 0xff, 255);
                Put(disc, z.X, z.Y, zr, new Color(c0.r, c0.g, c0.b, (float)(.12 * zp)), (int)z.Y - 30);
                Put(disc, z.X, z.Y, zr * .6, new Color(c1.r, c1.g, c1.b, (float)(.26 * zp)), (int)z.Y - 29);
                Put(disc, z.X, z.Y, zr * .28, new Color(c2.r, c2.g, c2.b, (float)(.46 * zp)), (int)z.Y - 28);
            }
        }

        void Finish()
        {
            for (int i = used; i < pool.Count; i++) pool[i].enabled = false;
            for (int i = addUsed; i < addPool.Count; i++) addPool[i].enabled = false;
        }
    }
}
