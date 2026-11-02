using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeSkillView
    {
        // 장판당 네 개의 동적 mesh로 묶어 개별 불꽃 GameObject 생성을 피한다.
        sealed class AssaultFlame { public float X, Y, Frame, Speed, Scale; }
        sealed class AssaultZoneView { public int Revision; public AssaultFlame[] Flames; public CleaveMesh[] Meshes; public Light Light; }
        sealed class AssaultBurstView { public CleaveMesh[] Meshes; public bool Detonation; }
        readonly Dictionary<int, AssaultZoneView> assaultZones = new Dictionary<int, AssaultZoneView>();
        readonly Dictionary<int, AssaultBurstView> assaultBursts = new Dictionary<int, AssaultBurstView>();
        readonly HashSet<int> seenAssaultBursts = new HashSet<int>();
        Material[] assaultFlameMaterials, assaultBurstMaterials;
        Texture2D[] assaultFlameTextures, assaultBurstTextures;

        void LoadAssaultVisuals()
        {
            if (assaultFlameMaterials != null) return;
            assaultFlameMaterials = new Material[4]; assaultFlameTextures = new Texture2D[4];
            assaultBurstMaterials = new Material[4]; assaultBurstTextures = new Texture2D[4];
            for (int i = 0; i < 4; i++)
            {
                var texture = Resources.Load<Texture2D>("Art/vfx/skill_fire_trail_0" + (i + 1));
                if (texture == null) throw new InvalidOperationException("기동불꽃 원본 화염 프레임 누락 " + i);
                assaultFlameTextures[i] = texture; assaultFlameMaterials[i] = CleaveMaterial(texture);
            }
            string[] names = { "skill_chain_assault_impact", "skill_assault_fire_impact", "skill_assault_fire_fbf", "skill_assault_fire_basic" };
            for (int i = 0; i < names.Length; i++)
            {
                var texture = Resources.Load<Texture2D>("Art/vfx/" + names[i]);
                if (texture == null) throw new InvalidOperationException("기동불꽃 원본 착지·기폭 시트 누락 " + names[i]);
                assaultBurstTextures[i] = texture; var material = new Material(add); material.mainTexture = texture;
                material.SetInt("_DepthTest", NativeRemodel3D.Active ? (int)UnityEngine.Rendering.CompareFunction.Always : (int)UnityEngine.Rendering.CompareFunction.LessEqual);
                assaultBurstMaterials[i] = material;
            }
        }
        static void AssaultQuad(CleaveMesh mesh, float x, float y, float width, float height, Rect uv, float opacity, bool bottom)
        {
            Vector3 center = Point(x, y), right = Vector3.right, up = Vector3.up;
            if (NativeRemodel3D.Active && Camera.main != null) { right = Camera.main.transform.right; up = Camera.main.transform.up; }
            Vector3 dx = right * (width / 200), dy = up * (height / 100);
            if (!bottom) center -= dy * .5f;
            mesh.Quad(center - dx, center + dx, center + dx + dy, center - dx + dy, uv, new Color(1, 1, 1, opacity));
        }
        void UpdateChainAssaultView(Simulation sim, float time)
        {
            stale.Clear(); foreach (var id in assaultZones.Keys) stale.Add(id);
            int zoneIndex = -1;
            foreach (var zone in sim.FireZones)
            {
                zoneIndex++;
                if (zone.Type != "assaultFlame") continue;
                LoadAssaultVisuals(); ActiveZones++; stale.Remove(zone.Id);
                if (!assaultZones.TryGetValue(zone.Id, out var item))
                {
                    item = new AssaultZoneView { Revision = -1, Meshes = new CleaveMesh[4] };
                    for (int i = 0; i < 4; i++) item.Meshes[i] = NewCleaveMesh("assaultFlame" + zone.Id + "-" + i, assaultFlameMaterials[i], (int)zone.Y);
                    var lightObject = new GameObject("assaultLandingLight" + zone.Id); lightObject.transform.SetParent(parent, false);
                    item.Light = lightObject.AddComponent<Light>(); item.Light.type = LightType.Point; item.Light.shadows = LightShadows.None; item.Light.color = new Color(1, 140 / 255f, 50 / 255f);
                    assaultZones.Add(zone.Id, item);
                }
                float lightFade = Mathf.Max(0, 1 - zone.T / 24f);
                item.Light.enabled = NativeRemodel3D.Active && lightFade > 0;
                item.Light.transform.position = Point(zone.X, zone.Y) + Vector3.up * .12f;
                item.Light.range = zone.R * 1.35f / 100;
                item.Light.intensity = (.24f + Mathf.Sin(sim.TickCount * .13f + zoneIndex) * .03f) * lightFade * lightFade;
                if (item.Revision != zone.Revision)
                {
                    item.Revision = zone.Revision; item.Flames = new AssaultFlame[Math.Max(5, (int)(zone.R * zone.R * .002)) + zone.AfStack * 8];
                    uint random = unchecked((uint)(zone.Id * 31 + zone.Revision) * 2654435761u + 0x9e3779b9u);
                    for (int i = 0; i < item.Flames.Length; i++)
                    {
                        float angle = TrailRandom(ref random) * Mathf.PI * 2, distance = TrailRandom(ref random) * zone.R * .8f;
                        item.Flames[i] = new AssaultFlame { X = Mathf.Cos(angle) * distance, Y = Mathf.Sin(angle) * distance, Frame = (int)(TrailRandom(ref random) * 4), Speed = .8f + TrailRandom(ref random) * 1.5f, Scale = (.7f + TrailRandom(ref random) * .8f) * (1 + zone.AfStack * .35f) };
                    }
                }
                foreach (var mesh in item.Meshes) mesh.Clear();
                foreach (var mesh in item.Meshes) mesh.Go.GetComponent<MeshRenderer>().sortingOrder = (int)zone.Y;
                float progress = zone.T / (float)zone.MaxT, fade = (progress > .8f ? 1 - (progress - .8f) / .2f : 1) * .3f;
                for (int i = 0; i < item.Flames.Length; i++)
                {
                    var flame = item.Flames[i]; int frame = ((int)(time * 5 * flame.Speed + flame.Frame) % 4 + 4) % 4;
                    var texture = assaultFlameTextures[frame]; float width = 14 * flame.Scale;
                    AssaultQuad(item.Meshes[frame], zone.X + flame.X, zone.Y + flame.Y, width, width * texture.height / texture.width, new Rect(0, 0, 1, 1), (.5f + .25f * Mathf.Sin(time * 10 + i)) * Mathf.Clamp01(fade), true);
                }
                foreach (var mesh in item.Meshes) mesh.Apply();
            }
            foreach (var id in stale) { var item = assaultZones[id]; foreach (var mesh in item.Meshes) mesh.Destroy(); UnityEngine.Object.Destroy(item.Light.gameObject); assaultZones.Remove(id); }
            // Core 통지의 ID로 한 번만 바인딩한다. 화면 갱신을 건너뛰어도 재생 시점은 Core 틱이다.
            foreach (var burst in sim.ChainAssaultBursts)
            {
                if (!seenAssaultBursts.Add(burst.Id)) continue;
                int age = sim.TickCount - burst.Tick, count = burst.Detonation ? 3 : 1;
                if (age >= (burst.Detonation ? 160 : 36)) continue;
                int activeDet = 0; foreach (var value in assaultBursts.Values) if (value.Detonation) activeDet += 3;
                if (burst.Detonation && activeDet >= 40) continue;
                LoadAssaultVisuals(); var item = new AssaultBurstView { Detonation = burst.Detonation, Meshes = new CleaveMesh[count] };
                for (int i = 0; i < count; i++) item.Meshes[i] = NewCleaveMesh("assaultBurst" + burst.Id + "-" + i, assaultBurstMaterials[burst.Detonation ? i + 1 : 0], (int)burst.Y + 4 + i);
                assaultBursts.Add(burst.Id, item);
            }
            stale.Clear(); foreach (var id in assaultBursts.Keys) stale.Add(id);
            foreach (var burst in sim.ChainAssaultBursts)
            {
                if (!assaultBursts.TryGetValue(burst.Id, out var item)) continue;
                int age = sim.TickCount - burst.Tick;
                if (age >= (burst.Detonation ? 160 : 36)) continue;
                stale.Remove(burst.Id);
                for (int i = 0; i < item.Meshes.Length; i++)
                {
                    var mesh = item.Meshes[i]; mesh.Clear(); int textureIndex = burst.Detonation ? i + 1 : 0;
                    var texture = assaultBurstTextures[textureIndex]; int columns = burst.Detonation && i < 2 ? 4 : 3, frames = columns * columns, speed = burst.Detonation ? (i == 0 ? 8 : i == 1 ? 10 : 6) : 4;
                    int frame = age / speed;
                    if (frame < frames)
                    {
                        float progress = age / (float)(frames * speed), scale, opacity, y = burst.Y;
                        if (burst.Detonation)
                        {
                            float radiusScale = Mathf.Clamp(Mathf.Sqrt(burst.Radius / 50) * (1 + burst.Stack * .4f), 1.5f, 2.6f);
                            scale = (i == 0 ? 2 : i == 1 ? 2.4f : 1) * radiusScale * (1 + progress * .4f);
                            opacity = progress < .85f ? 1 : Mathf.Max(0, 1 - (progress - .85f) / .15f);
                        }
                        else { scale = burst.Radius / 384; opacity = .5f; y -= burst.Radius * .19f; }
                        // 웹은 셀 크기를 정수 절삭한다. 256/3인 BasicImpact의 마지막1px도 보존한다.
                        int cellWidth = texture.width / columns, cellHeight = texture.height / columns;
                        AssaultQuad(mesh, burst.X, y, cellWidth * scale, cellHeight * scale, new Rect(frame % columns * cellWidth / (float)texture.width, 1 - (frame / columns + 1) * cellHeight / (float)texture.height, cellWidth / (float)texture.width, cellHeight / (float)texture.height), opacity, false);
                    }
                    mesh.Apply();
                }
            }
            foreach (var id in stale) { foreach (var mesh in assaultBursts[id].Meshes) mesh.Destroy(); assaultBursts.Remove(id); }
            // 표시용 ID 기록도 Core의 보존 창(160틱) 밖에서는 제거한다.
            if (seenAssaultBursts.Count > 256) { seenAssaultBursts.Clear(); foreach (var burst in sim.ChainAssaultBursts) seenAssaultBursts.Add(burst.Id); }
        }
        void ResetChainAssaultView()
        {
            foreach (var item in assaultZones.Values) { foreach (var mesh in item.Meshes) mesh.Destroy(); UnityEngine.Object.Destroy(item.Light.gameObject); } assaultZones.Clear();
            foreach (var item in assaultBursts.Values) foreach (var mesh in item.Meshes) mesh.Destroy(); assaultBursts.Clear(); seenAssaultBursts.Clear();
            if (assaultFlameMaterials != null) foreach (var material in assaultFlameMaterials) UnityEngine.Object.Destroy(material);
            if (assaultBurstMaterials != null) foreach (var material in assaultBurstMaterials) UnityEngine.Object.Destroy(material);
            assaultFlameMaterials = assaultBurstMaterials = null; assaultFlameTextures = assaultBurstTextures = null;
        }
    }
}
