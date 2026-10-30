using System;
using UnityEngine;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeSkills
    {
        void DrawChargeOrbs(int level)
        {
            var levels = new int[5];
            for (int i = 0; i < levels.Length; i++) levels[i] = cur.SkillDisplayLevel(ChargeForgeRules.Materials[i]);
            var model = ChargeForgeRules.Build(cur.Skills.Level("chargeBoost"), cur.Skills.ChargeSkill, cur.Config.DemoMode, levels);
            for (int i = 0; i < model.Orbs.Length; i++)
            {
                var item = model.Orbs[i]; var position = ChargeForgeRules.Position(i, model.Orbs.Length);
                float x = (float)position[0], y = (float)position[1], labelY = AltarOrigin.y + y + 42;
                DrawOrb(new SkillDefsOrb { id = item.Id, x = x, y = y, o = 58, dim = item.Dim, sourceDim = true, badge = item.Badge,
                    nameRect = new[] { AltarOrigin.x + x - 68, labelY, 136, 15 }, subRect = new[] { AltarOrigin.x + x - 68, labelY + 16, 136, 14 } }, level);
            }
        }
        Texture2D ChainOrbIcon(bool dim)
        {
            string key = dim ? "chainOrbDim" : "chainOrb";
            if (procedural.TryGetValue(key, out var icon)) return icon;
            // 파일은 원본 byte 그대로 유지한다. 런타임에서 CSS object-fit:cover/scale(1.18)·원형 clip을 그린다.
            var source = Resources.Load<Texture2D>("Art/ui/skill_icons/chainSlash_original");
            if (source == null) throw new InvalidOperationException("사슬 파생 스킬 원본 아이콘 누락");
            const int size = 128; var pixels = new Color[size * size]; float crop = Mathf.Min(source.width, source.height) / 1.18f;
            for (int y = 0; y < size; y++) for (int x = 0; x < size; x++)
            {
                float dx = (x + .5f) / size - .5f, dy = (y + .5f) / size - .5f;
                var color = source.GetPixelBilinear(.5f + dx * crop / source.width, .5f + dy * crop / source.height);
                if (dim) { float gray = color.r * .2126f + color.g * .7152f + color.b * .0722f; color.r = Mathf.Lerp(color.r, gray, .75f) * .56f; color.g = Mathf.Lerp(color.g, gray, .75f) * .56f; color.b = Mathf.Lerp(color.b, gray, .75f) * .56f; }
                color.a *= Mathf.Clamp01((.5f - Mathf.Sqrt(dx * dx + dy * dy)) * size + .5f); pixels[y * size + x] = color;
            }
            icon = new Texture2D(size, size, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            icon.SetPixels(pixels); icon.Apply(false, true); procedural[key] = icon; return icon;
        }
    }
}
