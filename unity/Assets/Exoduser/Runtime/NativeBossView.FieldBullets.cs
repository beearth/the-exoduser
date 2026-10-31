using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // VFX-D18: the ordinary field enemies' bullets share the druid's projectile list (Core: SpawnFieldProjectile -> Druid.SpawnProjectile), but only the 1-1 druid's own shots carry
    // DruidPoison. Everything else used to be drawn as the druid's green poison disc (07c-field-ai: a ~500 px lime plate). game.html draws them per kind in the enemy-projectile
    // pass 2 (54371..54581), with the user-made sheets this file cuts the same way: the toothed mouth for physical (E-parry) bullets, the per-element comet (the rainbow comet sheet
    // tinted with ELC at .65, 8 frames, head at 62 % of the width) for magic bullets, the element orb sheet for element balls. The druid poison orb stays in NativeBossView.Update.
    // Not ported (no art in Unity yet, drawn as the nearest sheet instead): the kraken water orb of physical / ice element balls (elem orb sheet row), the procedural classic rainbow
    // of black / blue beans (the untinted comet), the dark sphere of the Q bean (the comet tinted dark).
    public sealed partial class NativeBossView
    {
        const string MouthRes = "Art/vfx/field/proj_phys_mouth", OrbRes = "Art/vfx/field/proj_elem_orb", CometRes = "Art/vfx/field/proj_bolt_comet";
        const int MouthW = 768, MouthH = 384, OrbW = 512, OrbH = 256, CometFrameCount = 8;
        static readonly int[] MouthFrameCount = { 8, 6, 6 };
        static readonly int[] ElemOrbRow = { -1, 0, 2, 1, 3, 5, 4 };   // EL {P,F,I,D,L,H,E} -> sheet row (-1: no orb for physical)
        static readonly Dictionary<int, Sprite[]> cometSprites = new Dictionary<int, Sprite[]>();
        static readonly Dictionary<string, bool> artPresent = new Dictionary<string, bool>();
        /// <summary>Per Update: field bullets drawn with the web art, per kind (the capture receipt reads these).</summary>
        public int FieldMouthsDrawn, FieldCometsDrawn, FieldOrbsDrawn, FieldBulletFallbacks;

        static bool HasArt(string res)
        {
            bool ok; if (artPresent.TryGetValue(res, out ok)) return ok;
            ok = Resources.Load<Texture2D>(res) != null; artPresent[res] = ok; return ok;
        }

        // _drawCometBullet's source: el 1..6 gets the ELC overlay (source-atop at .65 over the original: rgb * .35 + tint * .65, alpha kept); 0 / anything else = the original rainbow
        static Sprite[] Comet(int el)
        {
            int key = el >= 1 && el <= 6 ? el : 0; Sprite[] frames;
            if (cometSprites.TryGetValue(key, out frames)) return frames;
            frames = null;
            var src = Resources.Load<Texture2D>(CometRes);
            if (src != null)
            {
                var tex = src;
                if (key != 0)
                {
                    try
                    {
                        var px = src.GetPixels32(); Color tint; ColorUtility.TryParseHtmlString(EnemyFactory.ElementColors[key], out tint);
                        float tr = tint.r * 255f * .65f, tg = tint.g * 255f * .65f, tb = tint.b * 255f * .65f;
                        for (int i = 0; i < px.Length; i++)
                        {
                            if (px[i].a == 0) continue;
                            px[i].r = (byte)Mathf.Min(255, px[i].r * .35f + tr); px[i].g = (byte)Mathf.Min(255, px[i].g * .35f + tg); px[i].b = (byte)Mathf.Min(255, px[i].b * .35f + tb);
                        }
                        tex = new Texture2D(src.width, src.height, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
                        tex.SetPixels32(px); tex.Apply(false, false);
                    }
                    catch (Exception) { tex = src; }   // texture not readable: the untinted comet is still the right shape
                }
                int fw = tex.width / CometFrameCount; frames = new Sprite[CometFrameCount];
                for (int i = 0; i < CometFrameCount; i++) frames[i] = Sprite.Create(tex, new Rect(i * fw, 0, fw, tex.height), new Vector2(.62f, .5f), 100, 0, SpriteMeshType.FullRect);   // head (right) is the travel direction, drawn from -dw * .62
            }
            cometSprites[key] = frames; return frames;
        }

        void FieldMouth(BossProjectile p, double h, double ang, int tick, int order)
        {
            if (!HasArt(MouthRes)) { FieldFallback(p, h * .35, order); return; }
            int n = MouthFrameCount[0], fi = (((tick >> 2) + (int)(p.X * .03)) % n + n) % n;
            PutBox(NativeDruidArt.Rect(MouthRes, fi * MouthW, 0, MouthW, MouthH, new Vector2(.5f, .5f)), p.X, p.Y, h * MouthW / MouthH, h, Color.white, order, ang,ground:false);
            FieldMouthsDrawn++;
        }

        void FieldComet(BossProjectile p, double len, int el, double ang, int tick, int order)
        {
            var frames = Comet(el);
            if (frames == null) { FieldFallback(p, len * .2, order); return; }
            int fi = (((int)(tick * .12 + p.X * .013)) % CometFrameCount + CometFrameCount) % CometFrameCount;
            var s = frames[fi];
            PutBox(s, p.X, p.Y, len, len * s.rect.height / s.rect.width, Color.white, order, ang,ground:false);
            FieldCometsDrawn++;
        }

        void FieldOrb(BossProjectile p, double h, int row, double ang, int tick, int order)
        {
            if (!HasArt(OrbRes)) { FieldFallback(p, h * .3, order); return; }
            int fi = (((tick >> 2) + (int)(p.X * .03)) % 6 + 6) % 6;
            PutBox(NativeDruidArt.Rect(OrbRes, fi * OrbW, row * OrbH, OrbW, OrbH, new Vector2(.5f, .5f)), p.X, p.Y, h * OrbW / OrbH, h, Color.white, order, ang,ground:false);
            FieldOrbsDrawn++;
        }

        // the web's last resort when a sheet is missing: a small element-coloured dot, never the druid orb
        void FieldFallback(BossProjectile p, double radius, int order)
        {
            Color c; ColorUtility.TryParseHtmlString(EnemyFactory.ElementColors[p.El >= 0 && p.El < EnemyFactory.ElementColors.Length ? p.El : 0], out c);
            Put(disc, p.X, p.Y, Math.Max(3, radius), new Color(c.r, c.g, c.b, .9f), order,ground:false); FieldBulletFallbacks++;
        }

        // game.html enemy-projectile pass 2 for a bullet that is not a druid poison shot and not a seeker mine
        void DrawFieldBullet(BossProjectile p, int tick)
        {
            double sz = p.Sz == 0 ? 1 : p.Sz, ps = Math.Max(1.2, Math.Min(4.0, sz * 1.5)) * .7;   // bullet size cap 4.0, x.7
            bool physical = p.ParryClass == "physical";
            double sSc = ps * (physical ? 2 : 1), ang = Math.Atan2(p.Vy, p.Vx); int order = (int)p.Y + 6;
            if (p.Web) { FieldMouth(p, 22.05 * (ps * 2) * .55, ang, tick, order); return; }                       // snake-mouth web bullet: 22.05 * webScale * .55, webScale = ps * 2
            if (p.ElemBall)
            {
                double eb = Math.Max(96, sz * 5.3); int row = p.El >= 0 && p.El < ElemOrbRow.Length ? ElemOrbRow[p.El] : -1;
                if (row >= 0) FieldOrb(p, eb, row, ang, tick, order); else FieldComet(p, eb, p.El, ang, tick, order);
                return;
            }
            if (physical) { FieldMouth(p, 22.05 * sSc * .55, ang, tick, order); return; }
            bool rainbow = p.BlackBean || p.BlueBean || p.BwBean || p.Friendly;
            double len = 20 * ps * 2.2 * (p.El == 1 && !rainbow ? .65 : 1);                                       // _normalMagicCometLength * _enemyMagicCometVisualScale (fire .65)
            FieldComet(p, len, rainbow ? 0 : (p.GbBean ? 3 : p.El), ang, tick, order);
        }
    }
}
