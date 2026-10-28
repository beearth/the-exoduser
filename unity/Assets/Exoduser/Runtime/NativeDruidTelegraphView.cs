using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // RM-B1 RB1-3: presentation of the remodelled dark druid's telegraphs (spec §4 / VFX spec v2.1 §3.3). It only READS Simulation.DruidTelegraphs and never writes back:
    // judgement, timing and RNG are the Core's, so the fight is the same with or without this view. Empty list (remodel off) = nothing is drawn.
    // Three displays: ParryGlint (one staff-tip flash at Elapsed == 2), GroundDecal (thin border + a dark toxic stain that fills in from the outside as the warning runs out,
    // the border brightens for the last 5 ticks), GrabEyes (two eye glows + a faint mist wedge). Every shape is built from the Core numbers (circle, cone, line, ring with a gap,
    // arena minus the safe areas, trail), nothing is measured by hand. Drawn as vertex-colour meshes: no sprites, no dots, no emoji.
    public sealed class NativeDruidTelegraphView
    {
        // colours of the VFX spec §3.3 (enemy-warning red only for enemy telegraphs; parry = bone gold; grab eyes = flesh)
        static readonly Color Border = new Color32(200, 64, 42, 255), BorderFlash = new Color32(232, 160, 128, 255);
        static readonly Color Stain = new Color(.11f, .20f, .05f, 1f);
        static readonly Color GlintCore = new Color32(242, 230, 200, 255), GlintHalo = new Color32(164, 147, 115, 255), Bone = new Color32(223, 214, 194, 255);
        static readonly Color EyeCore = new Color32(232, 160, 128, 255), EyeHalo = new Color32(200, 64, 42, 255), Mist = new Color(.10f, .22f, .06f, 1f);
        const int UnderOrder = -8985, OverOrder = 30000, GlintTicks = 9;
        const double BorderW = 5, CellSize = 40;

        sealed class Mb
        {
            public readonly List<Vector3> V = new List<Vector3>(); public readonly List<Color> C = new List<Color>(); public readonly List<int> T = new List<int>();
            public readonly Mesh Mesh = new Mesh { name = "druid-telegraph" };
            public void Clear() { V.Clear(); C.Clear(); T.Clear(); }
            int Add(double x, double y, Color c) { V.Add(new Vector3((float)x / 100, -(float)y / 100, 0)); C.Add(c); return V.Count - 1; }
            public void Quad(double x0, double y0, double x1, double y1, double x2, double y2, double x3, double y3, Color c)
            {
                int a = Add(x0, y0, c), b = Add(x1, y1, c), d = Add(x2, y2, c), e = Add(x3, y3, c);
                T.Add(a); T.Add(b); T.Add(d); T.Add(a); T.Add(d); T.Add(e); T.Add(a); T.Add(d); T.Add(b); T.Add(a); T.Add(e); T.Add(d);   // both windings: nothing is culled
            }
            public void Rect(double x0, double y0, double x1, double y1, Color c) { Quad(x0, y0, x1, y0, x1, y1, x0, y1, c); }
            // thick segment from (x0,y0) to (x1,y1)
            public void Seg(double x0, double y0, double x1, double y1, double w, Color c)
            {
                double dx = x1 - x0, dy = y1 - y0, l = Math.Sqrt(dx * dx + dy * dy); if (l < 1e-6) return; double nx = -dy / l * w / 2, ny = dx / l * w / 2;
                Quad(x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny, c);
            }
            // annular sector r0..r1 from angle a0 to a1 (radians, y down like the web); r0 = 0 gives a pie slice / disc
            public void Arc(double cx, double cy, double r0, double r1, double a0, double a1, Color c)
            {
                if (r1 <= r0 || a1 <= a0) return;
                int n = Math.Max(2, (int)Math.Ceiling((a1 - a0) / (Math.PI * 2) * 64));
                for (int i = 0; i < n; i++)
                {
                    double s = a0 + (a1 - a0) * i / n, e = a0 + (a1 - a0) * (i + 1) / n;
                    Quad(cx + Math.Cos(s) * r0, cy + Math.Sin(s) * r0, cx + Math.Cos(s) * r1, cy + Math.Sin(s) * r1, cx + Math.Cos(e) * r1, cy + Math.Sin(e) * r1, cx + Math.Cos(e) * r0, cy + Math.Sin(e) * r0, c);
                }
            }
            public void Flush() { Mesh.Clear(); if (V.Count == 0) return; Mesh.SetVertices(V); Mesh.SetColors(C); Mesh.SetTriangles(T, 0); Mesh.bounds = new Bounds(Vector3.zero, new Vector3(1000, 1000, 1)); }
        }

        readonly Transform root; readonly Mb under = new Mb(), over = new Mb();
        readonly MeshRenderer underR, overR;
        readonly Dictionary<long, int> glintAt = new Dictionary<long, int>();   // (serial, index) -> sim tick the glint fired
        readonly List<DruidTelegraph> list = new List<DruidTelegraph>();
        public int DrawnEntries, MaxEntries; public readonly HashSet<string> SeenKinds = new HashSet<string>();   // QA: what was drawn

        public NativeDruidTelegraphView(Transform parent)
        {
            root = new GameObject("DruidTelegraphView").transform; root.SetParent(parent, false);
            underR = MakeLayer("under", under, UnderOrder); overR = MakeLayer("over", over, OverOrder);
        }

        MeshRenderer MakeLayer(string name, Mb mb, int order)
        {
            var go = new GameObject(name); go.transform.SetParent(root, false);
            go.AddComponent<MeshFilter>().sharedMesh = mb.Mesh;
            var r = go.AddComponent<MeshRenderer>();
            var probe = new GameObject("probe").AddComponent<SpriteRenderer>(); r.sharedMaterial = probe.sharedMaterial; UnityEngine.Object.Destroy(probe.gameObject);   // the default sprite material: alpha blend, vertex colour
            r.sortingOrder = order; r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; r.receiveShadows = false;
            return r;
        }

        public void Dispose() { if (root != null) UnityEngine.Object.Destroy(root.gameObject); }

        static Color A(Color c, double a) { return new Color(c.r, c.g, c.b, (float)Math.Max(0, Math.Min(1, a))); }

        // call every frame after the Simulation tick; `cam` = the world camera (only the visible part of the arena is filled)
        public void Update(Simulation sim, Camera cam)
        {
            under.Clear(); over.Clear();
            sim.DruidTelegraphs(list);
            DrawnEntries = list.Count; if (list.Count > MaxEntries) MaxEntries = list.Count;
            int tick = sim.TickCount;
            foreach (var t in list)
            {
                SeenKinds.Add(t.MoveId + "/" + t.Kind + "/" + t.Shape);
                switch (t.Kind)
                {
                    case DruidTeleKind.ParryGlint: Glint(t, tick); break;
                    case DruidTeleKind.GroundDecal: Decal(sim, t, cam); break;
                    case DruidTeleKind.GrabEyes: Grab(t); break;
                }
            }
            under.Flush(); over.Flush();
            if (glintAt.Count > 64) { var old = new List<long>(); foreach (var kv in glintAt) if (tick - kv.Value > 600) old.Add(kv.Key); foreach (var k in old) glintAt.Remove(k); }
        }

        // ---- 1 parry-able melee: one flash at the staff tip, 9 ticks, peak at once, 1 -> .225 at 20% -> 0 ----
        void Glint(DruidTelegraph t, int tick)
        {
            if (t.Elapsed < 2) return;
            long key = ((long)t.Serial << 8) | (uint)(t.Index & 0xff); int born;
            if (!glintAt.TryGetValue(key, out born)) { born = tick; glintAt[key] = born; }
            int age = tick - born; if (age >= GlintTicks) return;
            double f = age / (double)GlintTicks, k = f < .2 ? 1 - f / .2 * .775 : .225 * (1 - (f - .2) / .8);
            double dx = t.TipX - t.X, dy = t.TipY - t.Y, l = Math.Sqrt(dx * dx + dy * dy); if (l < 1e-6) { dx = 1; dy = 0; l = 1; } dx /= l; dy /= l;
            double half = 34;   // ~0.25 x the body height, drawn as a stretched streak along the staff
            over.Arc(t.TipX, t.TipY, 0, 30, 0, Math.PI * 2, A(GlintHalo, .45 * k));
            over.Seg(t.TipX - dx * half, t.TipY - dy * half, t.TipX + dx * half, t.TipY + dy * half, 7, A(GlintHalo, .7 * k));
            over.Seg(t.TipX - dx * half * .7, t.TipY - dy * half * .7, t.TipX + dx * half * .7, t.TipY + dy * half * .7, 3.5, A(GlintCore, k));
        }

        // ---- 3 grab: two eye glows (0..12 f fill in, then held) and a faint mist wedge toward the reaching hand ----
        void Grab(DruidTelegraph t)
        {
            double body = Math.Max(40, t.Radius - 207), fill = Math.Min(1, t.Elapsed / 12.0), p = t.Total > 0 ? Math.Min(1, t.Elapsed / t.Total) : 1;
            double fx = Math.Cos(t.Dir), fy = Math.Sin(t.Dir), px = -fy, py = fx;
            double hx = t.X + fx * body * .45, hy = t.Y + fy * body * .45 - body * .35;   // the head, a little above the centre
            for (int s = -1; s <= 1; s += 2)
            {
                double ex = hx + px * s * body * .22, ey = hy + py * s * body * .22 * .4, r = body * .12;
                over.Arc(ex, ey, 0, r * 2.4 * fill, 0, Math.PI * 2, A(EyeHalo, .30 * fill));
                over.Arc(ex, ey, 0, r * fill, 0, Math.PI * 2, A(EyeCore, .95 * fill));
            }
            double reach = Math.Max(0, t.Radius - 30);
            under.Arc(t.X, t.Y, body * .6, body * .6 + reach * Math.Min(1, .3 + p), t.Dir - .28, t.Dir + .28, A(Mist, .08 + .20 * p));
        }

        // ---- 2 area to avoid: a thin border + a dark stain that fills in from the outside, the border brightens for the last 5 ticks ----
        void Decal(Simulation sim, DruidTelegraph t, Camera cam)
        {
            double p = t.Live || t.Total <= 0 ? 1 : Math.Max(0, Math.Min(1, t.Elapsed / t.Total));
            bool flash = !t.Live && t.Remaining <= 5;
            Color edge = A(flash ? BorderFlash : Border, flash ? 1 : .85);
            double baseA = t.Live ? .30 : .10 + .08 * p, fillA = .18 + .24 * p;
            switch (t.Shape)
            {
                case DruidTeleShape.Circle:
                {
                    double R = t.Radius;
                    under.Arc(t.X, t.Y, 0, R, 0, Math.PI * 2, A(Stain, baseA));
                    under.Arc(t.X, t.Y, R * (1 - p), R, 0, Math.PI * 2, A(Stain, fillA));
                    under.Arc(t.X, t.Y, R - BorderW / 2, R + BorderW / 2, 0, Math.PI * 2, edge);
                    if (!t.Live && p > .02 && p < .98) under.Arc(t.X, t.Y, R * (1 - p) - 1, R * (1 - p) + 1, 0, Math.PI * 2, A(Border, .45));
                    break;
                }
                case DruidTeleShape.Cone:
                {
                    double R = t.Radius, a0 = t.Dir - t.Angle / 2, a1 = t.Dir + t.Angle / 2;
                    under.Arc(t.X, t.Y, 0, R, a0, a1, A(Stain, baseA));
                    under.Arc(t.X, t.Y, R * (1 - p), R, a0, a1, A(Stain, fillA));
                    under.Arc(t.X, t.Y, R - BorderW / 2, R + BorderW / 2, a0, a1, edge);
                    under.Seg(t.X, t.Y, t.X + Math.Cos(a0) * R, t.Y + Math.Sin(a0) * R, BorderW, edge);
                    under.Seg(t.X, t.Y, t.X + Math.Cos(a1) * R, t.Y + Math.Sin(a1) * R, BorderW, edge);
                    break;
                }
                case DruidTeleShape.Line:
                {
                    double L = t.Length, W = t.Width, dx = Math.Cos(t.Dir), dy = Math.Sin(t.Dir), nx = -dy * W / 2, ny = dx * W / 2;
                    double head = t.Live ? Math.Max(0, Math.Min(L, t.Progress)) : L * p;   // live fissure: the head; warning: filled from the far end back
                    under.Quad(t.X + nx, t.Y + ny, t.X + dx * L + nx, t.Y + dy * L + ny, t.X + dx * L - nx, t.Y + dy * L - ny, t.X - nx, t.Y - ny, A(Stain, baseA));
                    if (t.Live) under.Quad(t.X + nx, t.Y + ny, t.X + dx * head + nx, t.Y + dy * head + ny, t.X + dx * head - nx, t.Y + dy * head - ny, t.X - nx, t.Y - ny, A(Stain, fillA));
                    else under.Quad(t.X + dx * (L - head) + nx, t.Y + dy * (L - head) + ny, t.X + dx * L + nx, t.Y + dy * L + ny, t.X + dx * L - nx, t.Y + dy * L - ny, t.X + dx * (L - head) - nx, t.Y + dy * (L - head) - ny, A(Stain, fillA));
                    under.Seg(t.X + nx, t.Y + ny, t.X + dx * L + nx, t.Y + dy * L + ny, BorderW, edge);
                    under.Seg(t.X - nx, t.Y - ny, t.X + dx * L - nx, t.Y + dy * L - ny, BorderW, edge);
                    under.Seg(t.X + dx * L + nx, t.Y + dy * L + ny, t.X + dx * L - nx, t.Y + dy * L - ny, BorderW, edge);
                    under.Seg(t.X + nx, t.Y + ny, t.X - nx, t.Y - ny, BorderW, edge);
                    break;
                }
                case DruidTeleShape.RingGap:
                {
                    double r0 = Math.Max(0, t.Inner), r1 = t.Radius + t.Width / 2, g0 = t.GapDir - t.GapAngle / 2, g1 = t.GapDir + t.GapAngle / 2, full = Math.PI * 2;
                    double a0 = g1, a1 = g0 + full;   // the damaged part = everything except the gap
                    under.Arc(t.X, t.Y, r0, r1, a0, a1, A(Stain, t.Live ? fillA : baseA + .10));
                    if (!t.Live) under.Arc(t.X, t.Y, r1 - (r1 - r0) * p, r1, a0, a1, A(Stain, fillA));
                    under.Arc(t.X, t.Y, r1 - BorderW / 2, r1 + BorderW / 2, a0, a1, edge);
                    under.Arc(t.X, t.Y, Math.Max(0, r0 - BorderW / 2), r0 + BorderW / 2, a0, a1, edge);
                    under.Seg(t.X + Math.Cos(a0) * r0, t.Y + Math.Sin(a0) * r0, t.X + Math.Cos(a0) * r1, t.Y + Math.Sin(a0) * r1, BorderW, edge);
                    under.Seg(t.X + Math.Cos(a1) * r0, t.Y + Math.Sin(a1) * r0, t.X + Math.Cos(a1) * r1, t.Y + Math.Sin(a1) * r1, BorderW, edge);
                    under.Arc(t.X, t.Y, t.Radius - 1, t.Radius + 1, g0, g1, A(Bone, .35));   // the gap: no border, only a bone hairline "go here"
                    break;
                }
                case DruidTeleShape.ArenaMinusSafe: Pulse(sim, t, cam, p, fillA, baseA); break;
                case DruidTeleShape.Trail:
                {
                    double L = t.Length, W = Math.Max(30, t.Width > 0 ? Math.Min(t.Width, 90) : 50), dx = Math.Cos(t.Dir), dy = Math.Sin(t.Dir), done = Math.Max(0, Math.Min(L, t.Progress));
                    under.Seg(t.X, t.Y, t.X + dx * L, t.Y + dy * L, W, A(Stain, baseA));
                    under.Seg(t.X, t.Y, t.X + dx * done, t.Y + dy * done, W, A(Stain, fillA));
                    under.Seg(t.X + dx * L, t.Y + dy * L, t.X + dx * L, t.Y + dy * L, W, A(Stain, baseA));
                    break;
                }
            }
        }

        // heartbeat: the whole arena except the safe circle around the boss and the pillar shadows (as seen from the boss). Only the cells inside the camera are built.
        void Pulse(Simulation sim, DruidTelegraph t, Camera cam, double p, double fillA, double baseA)
        {
            double cx, cy, ar; sim.DruidArena(out cx, out cy, out ar);
            if (ar <= 0) { cx = t.X; cy = t.Y; ar = Math.Min(t.Length, t.Width) / 2; }
            double vx = cam != null ? cam.transform.position.x * 100.0 : cx, vy = cam != null ? -cam.transform.position.y * 100.0 : cy;
            double hh = cam != null ? cam.orthographicSize * 100.0 : 700, hw = cam != null ? hh * cam.aspect : 1200;
            double x0 = Math.Max(cx - ar, vx - hw - CellSize), x1 = Math.Min(cx + ar, vx + hw + CellSize), y0 = Math.Max(cy - ar, vy - hh - CellSize), y1 = Math.Min(cy + ar, vy + hh + CellSize);
            var col = A(Stain, .14 + .30 * p);
            for (double y = Math.Floor(y0 / CellSize) * CellSize; y < y1; y += CellSize)
            {
                double runStart = double.NaN, ym = y + CellSize / 2;
                for (double x = Math.Floor(x0 / CellSize) * CellSize; x <= x1 + CellSize; x += CellSize)
                {
                    double xm = x + CellSize / 2; bool hit = x < x1 && Danger(t, cx, cy, ar, xm, ym);
                    if (hit && double.IsNaN(runStart)) runStart = x;
                    else if (!hit && !double.IsNaN(runStart)) { under.Rect(runStart, y, x, y + CellSize, col); runStart = double.NaN; }
                }
            }
            if (t.Safe != null) foreach (var s in t.Safe) if (s != null && s.Length >= 3) under.Arc(s[0], s[1], s[2] - 1.5, s[2] + 1.5, 0, Math.PI * 2, A(Bone, .5));   // the safe ring hairline
        }

        static bool Danger(DruidTelegraph t, double cx, double cy, double ar, double px, double py)
        {
            if ((px - cx) * (px - cx) + (py - cy) * (py - cy) > ar * ar) return false;
            if (t.Safe != null) foreach (var s in t.Safe) if (s != null && s.Length >= 3 && (px - s[0]) * (px - s[0]) + (py - s[1]) * (py - s[1]) <= s[2] * s[2]) return false;
            if (t.Shadows != null) foreach (var s in t.Shadows) if (s != null && s.Length >= 3 && Shadowed(px, py, t.SrcX, t.SrcY, s[0], s[1], s[2])) return false;
            return true;
        }

        // the same test as DruidBoss.InPillarShadow: the segment source -> point crosses the pillar disc and the point is behind the pillar
        static bool Shadowed(double px, double py, double bx, double by, double ox, double oy, double r)
        {
            double sx = px - bx, sy = py - by, l2 = sx * sx + sy * sy; if (l2 < 1e-9) return false;
            double u = ((ox - bx) * sx + (oy - by) * sy) / l2; if (u <= 0 || u >= 1) return false;
            double qx = bx + sx * u - ox, qy = by + sy * u - oy;
            return qx * qx + qy * qy < r * r && Math.Sqrt((px - ox) * (px - ox) + (py - oy) * (py - oy)) > r;
        }
    }
}
