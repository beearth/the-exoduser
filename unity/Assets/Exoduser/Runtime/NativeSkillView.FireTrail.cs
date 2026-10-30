using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeSkillView
    {
        // 현행 웹 일반 화염 장판: 기존 flame01~04, 생성 시 위치·속도 고정, 4프레임 교대.
        // Core 난수와 분리한다. 실제 게임 화면의 크기·가독성 검수는 별도다.
        sealed class TrailFlame { public SpriteRenderer Renderer; public float X, Y, Frame, Speed, Scale; }
        readonly Dictionary<int, TrailFlame[]> fireTrails = new Dictionary<int, TrailFlame[]>();
        Sprite[] trailFrames;
        static float TrailRandom(ref uint state) { state = unchecked(state * 1664525u + 1013904223u); return (float)(state / 4294967296.0); }
        void ResetFireTrails()
        {
            foreach (var flames in fireTrails.Values) foreach (var flame in flames) { centeredSkillSprites.Remove(flame.Renderer); UnityEngine.Object.Destroy(flame.Renderer.gameObject); }
            fireTrails.Clear();
        }
        void UpdateFireTrails(Simulation sim, float time)
        {
            stale.Clear(); foreach (var id in fireTrails.Keys) stale.Add(id);
            foreach (var zone in sim.FireZones)
            {
                if (zone.Type != "fireTrail") continue;
                ActiveZones++; stale.Remove(zone.Id);
                if (trailFrames == null)
                {
                    trailFrames = new Sprite[4];
                    for (int i = 0; i < 4; i++)
                    {
                        var texture = Resources.Load<Texture2D>("Art/vfx/skill_fire_trail_0" + (i + 1));
                        if (texture == null) throw new InvalidOperationException("화염 사슬 원본 프레임 누락: " + i);
                        trailFrames[i] = Sprite.Create(texture, new Rect(0, 0, texture.width, texture.height), new Vector2(.5f, 0), 100, 0, SpriteMeshType.FullRect);
                    }
                }
                if (!fireTrails.TryGetValue(zone.Id, out var flames))
                {
                    flames = new TrailFlame[Math.Max(3, (int)(zone.R * zone.R * .0012f))];
                    uint random = unchecked((uint)zone.Id * 2654435761u + 0x9e3779b9u);
                    for (int i = 0; i < flames.Length; i++)
                    {
                        float angle = TrailRandom(ref random) * Mathf.PI * 2, distance = TrailRandom(ref random) * zone.R * .85f;
                        flames[i] = new TrailFlame { X = Mathf.Cos(angle) * distance, Y = Mathf.Sin(angle) * distance, Frame = (int)(TrailRandom(ref random) * 4), Speed = .5f + TrailRandom(ref random) * 1.5f, Scale = .6f + TrailRandom(ref random) * .6f };
                        flames[i].Renderer = NewRenderer(null, "fireTrail" + zone.Id + "-" + i, trailFrames[0], alpha, (int)(zone.Y + flames[i].Y));
                    }
                    fireTrails[zone.Id] = flames;
                }
                float progress = zone.T / (float)zone.MaxT, fade = (progress > .8f ? 1 - (progress - .8f) / .2f : 1) * .3f;
                for (int i = 0; i < flames.Length; i++)
                {
                    var flame = flames[i]; int frame = ((int)(time * 4 * flame.Speed + flame.Frame) % 4 + 4) % 4;
                    flame.Renderer.sprite = trailFrames[frame];
                    flame.Renderer.transform.position = Point(zone.X + flame.X, zone.Y + flame.Y);
                    flame.Renderer.sortingOrder = (int)(zone.Y + flame.Y);
                    Fit(flame.Renderer, 12 * flame.Scale, trailFrames[frame].rect.width);
                    flame.Renderer.color = new Color(1, 1, 1, (.5f + .2f * Mathf.Sin(time * 8 + i)) * Mathf.Clamp01(fade));
                }
            }
            foreach (var id in stale)
            {
                foreach (var flame in fireTrails[id]) { centeredSkillSprites.Remove(flame.Renderer); UnityEngine.Object.Destroy(flame.Renderer.gameObject); }
                fireTrails.Remove(id);
            }
        }
    }
}
