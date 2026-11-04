using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // VFX-D18: the ordinary field enemies' bullets share the druid's projectile list (Core: SpawnFieldProjectile -> Druid.SpawnProjectile), but only the 1-1 druid's own shots carry
    // DruidPoison. Everything else used to be drawn as the druid's green poison disc (07c-field-ai: a ~500 px lime plate). game.html draws them per kind in the enemy-projectile
    // pass 2 (54371..54581), with the user-made sheets this file cuts the same way: the toothed mouth for physical (E-parry) bullets, the per-element comet (8 frames, head at
    // 62 % of the width) for magic bullets, the element orb sheet for element balls. 2026-11-03: baked Hell Gothic palette rows replace rainbow + ELC runtime tint;
    // U-VFX-07b: element balls use proj_elem_orb_v3 (generated art, keyed by tools/vfx/make_elem_orb_v3.py; head centred on the shot point, same box).
    // The druid poison orb stays in NativeBossView.Update. Geometry, animation, and Core projectile classification are unchanged.
    // Ported 2026-11-04 (U-VFX-14, NativeBossView.AnglerWater.cs): the kraken water orb of the four 1-1 anglers (the web's fbEnergy shot, game.html 54183) is drawn with the new
    // water_orb_loop sheet, ribbon tail, charge, launch spray, hit / parry / vanish effects before DrawFieldBullet is reached.
    // Not ported (no art in Unity yet, drawn as the nearest sheet instead): the web's _drawKrakenShot for any other physical / ice element ball (the Core has no such spawn; the
    // elem orb sheet row stays), the procedural classic rainbow of black / blue beans (physical-palette comet), the dark sphere of the Q bean (dark-palette comet).
    // Kraken / angler water art is owned by the water lane. U-VFX-16: special beans use the dark orb row; friendly shots keep their element and gain a silver rim.
    public sealed partial class NativeBossView
    {
        const string MouthRes = "Art/vfx/field/proj_phys_mouth", OrbRes = "Art/vfx/field/proj_elem_orb_v3", CometRes = "Art/vfx/field/proj_bolt_comet_el";
        const int MouthW = 768, MouthH = 384, OrbW = 512, OrbH = 256, CometFrameCount = 8;
        static readonly int[] MouthFrameCount = { 8, 6, 6 };
        static readonly int[] ElemOrbRow = { -1, 0, 1, 2, 3, 4, 5 };   // baked rows {F,I,D,L,H,E}; physical still uses the comet
        static readonly Dictionary<int, Sprite[]> cometSprites = new Dictionary<int, Sprite[]>();
        static readonly Dictionary<string, bool> artPresent = new Dictionary<string, bool>();
        /// <summary>Per Update: field bullets drawn with the web art, per kind (the capture receipt reads these).</summary>
        public int FieldMouthsDrawn, FieldCometsDrawn, FieldOrbsDrawn, FieldBulletFallbacks;

        static bool HasArt(string res)
        {
            bool ok; if (artPresent.TryGetValue(res, out ok)) return ok;
            ok = Resources.Load<Texture2D>(res) != null; artPresent[res] = ok; return ok;
        }

        // Top-down rows {P,F,I,D,L,H,E,enemy poison}; no runtime ELC multiplication.
        static Sprite[] Comet(int el)
        {
            int key = el >= 0 && el <= 7 ? el : 0; Sprite[] frames;
            if (cometSprites.TryGetValue(key, out frames)) return frames;
            frames = null;
            var src = Resources.Load<Texture2D>(CometRes);
            if (src != null)
            {
                int fw = src.width / CometFrameCount, fh = src.height / 8; frames = new Sprite[CometFrameCount];
                for (int i = 0; i < CometFrameCount; i++) frames[i] = NativeDruidArt.Rect(CometRes, i * fw, key * fh, fw, fh, new Vector2(.62f, .5f));   // same head pivot and 254x137 cells
            }
            cometSprites[key] = frames; return frames;
        }

        void FieldMouth(BossProjectile p, double h, double ang, int tick, int order)
        {
            if (!HasArt(MouthRes)) { FieldFallback(p, h * .35, order); return; }
            int n = MouthFrameCount[0], fi = (((tick >> 2) + (int)(p.X * .03)) % n + n) % n;
            PutBox(NativeDruidArt.Rect(MouthRes, fi * MouthW, 0, MouthW, MouthH, new Vector2(.5f, .5f)), p.X, p.Y, h * MouthW / MouthH, h, Color.white, order, ang);
            FieldMouthsDrawn++;
        }

        void FieldComet(BossProjectile p, double len, int el, double ang, int tick, int order)
        {
            var frames = Comet(el);
            if (frames == null) { FieldFallback(p, len * .2, order); return; }
            int fi = (((int)(tick * .12 + p.X * .013)) % CometFrameCount + CometFrameCount) % CometFrameCount;
            var s = frames[fi];
            PutBox(s, p.X, p.Y, len, len * s.rect.height / s.rect.width, Color.white, order, ang);
            FieldCometsDrawn++;
        }

        void FieldOrb(BossProjectile p, double h, int row, double ang, int tick, int order)
        {
            if (!HasArt(OrbRes)) { FieldFallback(p, h * .3, order); return; }
            int fi = (((tick >> 2) + (int)(p.X * .03)) % 6 + 6) % 6;
            PutBox(NativeDruidArt.Rect(OrbRes, fi * OrbW, row * OrbH, OrbW, OrbH, new Vector2(.5f, .5f)), p.X, p.Y, h * OrbW / OrbH, h, Color.white, order, ang);
            FieldOrbsDrawn++;
        }

        // the web's last resort when a sheet is missing: a small element-coloured dot, never the druid orb
        void FieldFallback(BossProjectile p, double radius, int order)
        {
            Color c; ColorUtility.TryParseHtmlString(EnemyFactory.ElementColors[p.El >= 0 && p.El < EnemyFactory.ElementColors.Length ? p.El : 0], out c);
            Put(disc, p.X, p.Y, Math.Max(3, radius), new Color(c.r, c.g, c.b, .9f), order); FieldBulletFallbacks++;
        }

        static readonly Color FriendlyFieldRim = new Color(223 / 255f, 227 / 255f, 230 / 255f, .8f); // #dfe3e6

        // game.html enemy-projectile pass 2 for a bullet that is not a druid poison shot and not a seeker mine
        void DrawFieldBullet(BossProjectile p, int tick)
        {
            double sz = p.Sz == 0 ? 1 : p.Sz, ps = Math.Max(1.2, Math.Min(4.0, sz * 1.5)) * .7;   // bullet size cap 4.0, x.7
            bool physical = p.ParryClass == "physical";
            double sSc = ps * (physical ? 2 : 1), ang = Math.Atan2(p.Vy, p.Vx); int order = (int)p.Y + 6;
            if (AnglerSplitDraw(p, tick)) return;                                                                    // U-VFX-14 r2: the five allied water shots of a Q-parried angler ball
            if (AnglerOrbDraw(p, tick)) return;                                                                      // U-VFX-14: the angler's water orb (web fbEnergy), the old ice orb row only if the sheet is missing
            if (p.Friendly)
            {
                double friendlyLength = 20 * ps * 2.2 * (p.El == 1 ? .65 : 1);
                int row = p.El >= 0 && p.El < ElemOrbRow.Length ? ElemOrbRow[p.El] : -1;
                double radius;
                if (p.ElemBall && row >= 0) { double h = Math.Max(96, sz * 5.3); FieldOrb(p, h, row, ang, tick, order); radius = h * .38; }
                else { FieldComet(p, friendlyLength, p.El, ang, tick, order); radius = friendlyLength * .2; }
                Put(ring, p.X, p.Y, radius, FriendlyFieldRim, order + 1); // 기존 코드 링: 작은 탄에도 약 1px 폭을 남긴다.
                return;
            }
            if (p.BlackBean || p.BlueBean || p.BwBean || p.GbBean)
            {
                FieldOrb(p, 20 * ps * 2.2, ElemOrbRow[3], ang, tick, order);
                return; // 표현만 암흑으로 통일. 무지개탄 Q 전용 패링 규칙은 Core 그대로다.
            }
            if (p.Web) { FieldMouth(p, 22.05 * (ps * 2) * .55, ang, tick, order); return; }                       // snake-mouth web bullet: 22.05 * webScale * .55, webScale = ps * 2
            if (p.ElemBall)
            {
                double eb = Math.Max(96, sz * 5.3); int row = p.El >= 0 && p.El < ElemOrbRow.Length ? ElemOrbRow[p.El] : -1;
                if (row >= 0) FieldOrb(p, eb, row, ang, tick, order); else FieldComet(p, eb, p.El, ang, tick, order);
                return;
            }
            if (physical) { FieldMouth(p, 22.05 * sSc * .55, ang, tick, order); return; }
            double len = 20 * ps * 2.2 * (p.El == 1 ? .65 : 1);                                       // _normalMagicCometLength * _enemyMagicCometVisualScale (fire .65)
            FieldComet(p, len, p.El, ang, tick, order);
        }
    }
}
