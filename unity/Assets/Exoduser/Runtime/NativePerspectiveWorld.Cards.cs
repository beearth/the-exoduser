using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D PAINTGROUND: thin painted cards around the outer masses (plan 4.6: real 3D space layers of painted art, not 2D parallax).
    // Only existing, confirmed original art (Resources/Art/map/props, the web/Godot CH1 prop set; no generation): rotforest trees behind the wall, root props at the foot.
    // Camera-facing upright cards (the same billboard path as the map props: ground contact, key light, shadow caster / receiver). Collision is untouched.
    // Placement keeps the combat floor clear: a card is accepted only if the part of the floor its screen area covers is blocked terrain (checked at its top and middle),
    // and the occluded walkable floor is measured and reported (limit 3% of the screen).
    public sealed partial class NativePerspectiveWorld
    {
        [Serializable] public sealed class SliceCard { public string role, texture; public float x, y, sizePx; public bool flip; }
        public readonly List<SliceCard> SliceCards = new List<SliceCard>();
        public float CardFloorOcclusionPercent { get; private set; }

        void BuildPaintCards()
        {
            // upright originals only (the root / ground props are top-down discs and look like floating rocks when stood up)
            var back = new[] { "rotforest_tree_05", "rotforest_tree_07", "rotforest_tree_06", "rotforest_tree_11", "prop_corpsetree", "rotforest_tree_04", "rotforest_tree_05", "rotforest_tree_07" };
            var front = new[] { "prop_s_bone", "skull_totem", "prop_s_bone", "skull_totem", "prop_s_bone" };
            var rng = new System.Random(20261051);
            var view = new Rect(2400f, 6450f, 3250f, 1650f);
            var root = Child("Painted cards");
            var jobs = new List<KeyValuePair<string, string>>();
            foreach (var n in back) jobs.Add(new KeyValuePair<string, string>("back", n));
            foreach (var n in front) jobs.Add(new KeyValuePair<string, string>("front", n));
            double occludedScreenPx = 0;
            foreach (var job in jobs)
            {
                bool isBack = job.Key == "back";
                float size = isBack ? Mathf.Lerp(230f, 340f, (float)rng.NextDouble()) : Mathf.Lerp(80f, 130f, (float)rng.NextDouble());
                float sdMin = isBack ? -170f : -60f, sdMax = isBack ? -70f : -18f;
                SliceCard best = null; float bestScore = float.NegativeInfinity;
                for (int attempt = 0; attempt < 4000; attempt++)
                {
                    float x = view.xMin + (float)rng.NextDouble() * view.width, y = view.yMin + (float)rng.NextDouble() * view.height;
                    float sd = SdAt(x, y); if (sd < sdMin || sd > sdMax) continue;
                    // the card's screen area (upwards on screen = towards the north / smaller py) must lie over blocked terrain
                    float reach = size * 0.88f; // cot(pitch) * height: how far north the top of the card projects
                    if (SdAt(x, y - reach) > -20f || SdAt(x, y - reach * 0.5f) > -8f) continue;
                    bool near = false;
                    foreach (var c in SliceCards) if ((c.x - x) * (c.x - x) + (c.y - y) * (c.y - y) < 190f * 190f) { near = true; break; }
                    if (near) continue;
                    foreach (var m in SlicePlacements) { float dx = m.x - x, dy = m.y - y, r = Mathf.Max(m.radiusA, m.radiusB) * 0.7f; if (dx * dx + dy * dy < r * r) { near = true; break; } }
                    if (near) continue;
                    float score = (float)rng.NextDouble() - Mathf.Abs(sd - (sdMin + sdMax) * 0.5f) / 400f; // spread, prefer the middle of the band
                    if (score > bestScore) { bestScore = score; best = new SliceCard { role = job.Key, texture = job.Value, x = x, y = y, sizePx = size, flip = rng.NextDouble() < 0.5 }; }
                }
                if (best == null) { UnityEngine.Debug.LogWarning("Slice: no valid card spot for " + job.Value); continue; }
                SliceCards.Add(best);
                var tex = LoadBilinear("Art/map/props/" + best.texture);
                var b = MakeBillboard("card " + best.role + " " + best.texture, root);
                float scale = best.sizePx / tex.height;
                ShowBillboard(b, tex, 0, 0, tex.width, tex.height, tex.width * 0.5f, tex.height, scale, best.flip, new Color(1f, 1f, 1f, 1f), best.x, best.y);
                occludedScreenPx += OccludedFloorScreenPx(best, tex.width * scale, tex.height * scale);
            }
            CardFloorOcclusionPercent = (float)(occludedScreenPx / (1920.0 * 1080.0) * 100.0);
        }

        // Screen area (px, 1920x1080 START camera) of the card that sits in front of WALKABLE floor: rays from the START camera through card sample points
        // continued to the ground; every card sample whose ground point is walkable counts (alpha is ignored: a conservative upper bound).
        float OccludedFloorScreenPx(SliceCard c, float width, float height)
        {
            const float distance = 1400f, pitch = 0.85f; var focus = new Vector2(Map.startX, Map.startY);
            var cam = new Vector3(focus.x, distance * Mathf.Sin(pitch), -(focus.y + distance * Mathf.Cos(pitch)));
            int hit = 0, total = 0;
            for (int j = 0; j < 20; j++) for (int i = 0; i < 20; i++)
            {
                float u = ((i + 0.5f) / 20f - 0.5f) * width, h = (j + 0.5f) / 20f * height;
                var p = new Vector3(c.x + u, h, -c.y); float t = -cam.y / (p.y - cam.y);
                var g = cam + (p - cam) * t; total++;
                if (sourceMap.CanMove(g.x, -g.z, OverlayBodyRadius)) hit++;
            }
            float cardScreenArea = width * height * Mathf.Cos(pitch);
            return cardScreenArea * hit / Mathf.Max(total, 1);
        }
    }
}
