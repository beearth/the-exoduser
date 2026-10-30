using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeSkillView
    {
        // 웹 _drawMaliceOrbTrail / _fireballExplode / TVFX2의 현재 전사 표현.
        // 지면에 놓는 캐릭터와 달리 구체·폭발은 중심 앵커다. 반경이 커져도 접지 보정으로 떠오르지 않는다.
        static readonly HashSet<SpriteRenderer> centeredMaliceSprites = new HashSet<SpriteRenderer>();
        public static bool IsCenteredMaliceSprite(SpriteRenderer sprite) { return centeredMaliceSprites.Contains(sprite); }
        public static Vector3 MalicePosition(float x, float y) { return Point(x, y) + (NativeRemodel3D.Active ? Vector3.up * .25f : Vector3.zero); }
        readonly Sprite[][] maliceBurstFrames = new Sprite[3][];
        readonly List<MaliceBurst> maliceBursts = new List<MaliceBurst>();
        readonly Dictionary<long, int> maliceSparkCells = new Dictionary<long, int>();
        Simulation maliceSim;
        public int ActiveMaliceBursts { get { return maliceBursts.Count; } }
        Sprite maliceSquare;
        sealed class MaliceSpark { public SpriteRenderer renderer; public Vector2 velocity; public float size, life; }
        sealed class MaliceBurst { public Item item; public SpriteRenderer[] layers; public MaliceSpark[] sparks; public int start; public float scale, x, y; }
        static readonly float[] trailFraction = { 1f, 1f, .66f, .38f, .5f };
        static readonly float[] trailWidth = { 2.8f, 1.7f, 1.5f, 1.3f, .5f };
        static readonly float[] trailEnd = { 2f, 1f, 1f, 1f, .6f };

        LineRenderer[] NewMaliceTrail(Item item)
        {
            Color smoke = new Color(20 / 255f, 6 / 255f, 31 / 255f, .38f);
            Color flame = new Color(122 / 255f, 44 / 255f, 1f, .2f);
            Color[] colors = { smoke, flame, flame, new Color(flame.r, flame.g, flame.b, .22f), new Color(227 / 255f, 198 / 255f, 1f, .42f) };
            var lines = new LineRenderer[5];
            for (int i = 0; i < lines.Length; i++)
            {
                var go = new GameObject("웹 악의구 리본 " + i); go.transform.SetParent(item.go.transform, false);
                var line = go.AddComponent<LineRenderer>(); lines[i] = line;
                line.useWorldSpace = false; line.numCapVertices = 0; line.numCornerVertices = 0;
                line.sharedMaterial = malice; line.startColor = line.endColor = colors[i].linear;
            }
            item.embers = new SpriteRenderer[4];
            for (int i = 0; i < 4; i++) { item.embers[i] = NewRenderer(item, "웹 악의구 잔불 " + i, disc, malice, 0); centeredMaliceSprites.Add(item.embers[i]); }
            return lines;
        }

        static void ForgetMaliceSprites(Item item)
        {
            centeredMaliceSprites.Remove(item.a);
            if (item.embers != null) foreach (var sprite in item.embers) centeredMaliceSprites.Remove(sprite);
        }

        static void UpdateMaliceEmbers(Item item, List<Vector3> history, Vector3 head, float radius, float ms, float x)
        {
            int count = history.Count + 1;
            for (int j = 0; j < item.embers.Length; j++)
            {
                int index = 2 + j * 3; var sprite = item.embers[j]; sprite.enabled = history.Count >= 2 && index < count - 1;
                if (!sprite.enabled) continue;
                float fraction = 1 - index / (float)count, wobble = Mathf.Sin(ms * .02f + index * 1.7f + x * .05f) * radius * .8f * fraction;
                Vector3 offset = NativeRemodel3D.Active ? new Vector3(wobble, 0, wobble * .6f) : new Vector3(wobble, wobble * .6f, 0);
                sprite.transform.localPosition = history[history.Count - index] - head + offset / 100f;
                // 웹12px 스탬프의 원 반경5px와 drawImage 지름2s.
                float size = (radius * .45f * fraction + .8f) * 2 * (10f / 12f); Fit(sprite, size, sprite.sprite.rect.width);
                sprite.color = new Color(180 / 255f, 107 / 255f, 1, .55f * fraction).linear; sprite.sortingOrder = item.a.sortingOrder - 1;
            }
        }

        static void UpdateMaliceTrail(LineRenderer[] lines, List<Vector3> history, Vector3 head, float radius, int order)
        {
            int total = history.Count + 1;
            for (int layer = 0; layer < lines.Length; layer++)
            {
                var line = lines[layer]; int count = Mathf.CeilToInt(total * trailFraction[layer]);
                line.enabled = history.Count >= 2 && count >= 2; if (!line.enabled) continue;
                line.positionCount = count; line.SetPosition(0, Vector3.zero);
                for (int j = 1; j < count; j++) line.SetPosition(j, history[history.Count - j] - head);
                line.widthMultiplier = 1f;
                line.startWidth = (radius * trailWidth[layer] + trailEnd[layer]) / 100f; line.endWidth = trailEnd[layer] / 100f;
                line.sortingOrder = order;
            }
        }

        void LoadMaliceBursts()
        {
            var square = new Texture2D(1, 1, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point };
            square.SetPixel(0, 0, Color.white); square.Apply(false, true); maliceSquare = Sprite.Create(square, new Rect(0, 0, 1, 1), new Vector2(.5f, .5f), 100);
            string[] paths = { "skill_malice_smoke", "skill_malice_arcane", "skill_malice_impact" };
            int[] columns = { 4, 6, 3 }, rows = { 4, 6, 3 };
            for (int layer = 0; layer < 3; layer++)
            {
                var texture = Resources.Load<Texture2D>("Art/vfx/" + paths[layer]);
                if (texture == null) throw new InvalidOperationException("악의구 원본 폭발 시트 누락: " + paths[layer]);
                int width = texture.width / columns[layer], height = texture.height / rows[layer];
                var frames = new Sprite[columns[layer] * rows[layer]]; maliceBurstFrames[layer] = frames;
                for (int f = 0; f < frames.Length; f++) frames[f] = Sprite.Create(texture, new Rect(f % columns[layer] * width, texture.height - (f / columns[layer] + 1) * height, width, height), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
            }
        }

        void BindMaliceBursts(Simulation sim)
        {
            if (ReferenceEquals(maliceSim, sim)) return;
            ResetMaliceBursts(); maliceSim = sim; sim.MaliceOrbExploded += ShowMaliceBurst;
        }

        void ShowMaliceBurst(MaliceOrb orb)
        {
            // 화면 폭발 상한. 판정·피해에는 영향이 없다.
            if (maliceBursts.Count >= 12) return;
            var item = NewItem("악의구 원본 폭발"); item.go.transform.position = MalicePosition(orb.X, orb.Y);
            var burst = new MaliceBurst { item = item, start = maliceSim.TickCount, x = orb.X, y = orb.Y, scale = Mathf.Clamp(Mathf.Sqrt(orb.ExplR / 80f), .8f, 2.5f), layers = new SpriteRenderer[3], sparks = new MaliceSpark[12] };
            for (int i = 0; i < 3; i++) { burst.layers[i] = NewRenderer(item, "웹 폭발 층 " + i, maliceBurstFrames[i][0], malice, (int)orb.Y + 4 + i); centeredMaliceSprites.Add(burst.layers[i]); }
            // 표시 전용 난수. 게임의 RNG 순서·피해 판정을 소비하지 않는다.
            var random = new System.Random(unchecked(orb.Id * 397 ^ maliceSim.TickCount));
            for (int i = 0; i < 12; i++)
            {
                float angle = Mathf.PI * 2 * i / 12;
                var spark = new MaliceSpark { renderer = NewRenderer(item, "웹 폭발 잔불 " + i, maliceSquare, malice, (int)orb.Y + 3), velocity = new Vector2(Mathf.Cos(angle) * (4 + (float)random.NextDouble() * 3), Mathf.Sin(angle) * (4 + (float)random.NextDouble() * 3)), size = 3 + (float)random.NextDouble() * 3, life = 12 + (float)random.NextDouble() * 6 };
                burst.sparks[i] = spark; centeredMaliceSprites.Add(spark.renderer);
            }
            maliceBursts.Add(burst);
        }

        void UpdateMaliceBursts(int tick)
        {
            maliceSparkCells.Clear(); int sparksDrawn = 0;
            for (int i = maliceBursts.Count - 1; i >= 0; i--)
            {
                var burst = maliceBursts[i]; bool any = false; int age = Math.Max(0, tick - burst.start);
                for (int layer = 0; layer < 3; layer++)
                {
                    int elapsed = age + 1 - (layer == 1 ? 1 : 0), speed = layer == 2 ? 2 : 3;
                    int frame = elapsed / speed; var frames = maliceBurstFrames[layer]; var renderer = burst.layers[layer];
                    renderer.enabled = elapsed > 0 && frame < frames.Length; if (!renderer.enabled) continue; any = true;
                    float progress = elapsed / (float)(frames.Length * speed), scale = burst.scale * (layer == 0 ? 1.8f : layer == 1 ? 1.4f : .8f) * (1 + progress * .4f);
                    renderer.sprite = frames[frame]; renderer.transform.localScale = Vector3.one * scale;
                    renderer.color = new Color(1, 1, 1, .7f * (progress < .6f ? 1 : Mathf.Max(0, (1 - progress) / .4f)));
                }
                foreach (var spark in burst.sparks)
                {
                    float elapsed = age + 1; spark.renderer.enabled = elapsed < spark.life;
                    if (!spark.renderer.enabled) continue; any = true;
                    float distance = (1 - Mathf.Pow(.9f, elapsed)) / .1f;
                    float x = burst.x + spark.velocity.x * distance, y = burst.y + spark.velocity.y * distance;
                    int gx = (int)((x - maliceSim.Player.X + Screen.width * .5f) / 32f), gy = (int)((y - maliceSim.Player.Y + Screen.height * .5f) / 32f);
                    long cell = ((long)gx << 32) ^ (uint)gy; int inCell; maliceSparkCells.TryGetValue(cell, out inCell);
                    if (inCell >= 3 || sparksDrawn >= 80) { spark.renderer.enabled = false; continue; }
                    maliceSparkCells[cell] = inCell + 1; sparksDrawn++;
                    spark.renderer.transform.position = MalicePosition(x, y);
                    Fit(spark.renderer, spark.size, 1); spark.renderer.color = new Color(153 / 255f, 51 / 255f, 204 / 255f, Mathf.Min(1, (spark.life - elapsed) / spark.life * 2.1f)).linear;
                }
                if (!any) { ForgetMaliceBurst(burst); UnityEngine.Object.Destroy(burst.item.go); maliceBursts.RemoveAt(i); }
            }
        }

        void ResetMaliceBursts()
        {
            if (maliceSim != null) maliceSim.MaliceOrbExploded -= ShowMaliceBurst; maliceSim = null;
            foreach (var burst in maliceBursts) { ForgetMaliceBurst(burst); UnityEngine.Object.Destroy(burst.item.go); }
            maliceBursts.Clear();
        }

        static void ForgetMaliceBurst(MaliceBurst burst)
        {
            foreach (var renderer in burst.layers) centeredMaliceSprites.Remove(renderer);
            foreach (var spark in burst.sparks) centeredMaliceSprites.Remove(spark.renderer);
        }

        void DisposeMaliceVisuals()
        {
            foreach (var frames in maliceBurstFrames) foreach (var sprite in frames) UnityEngine.Object.Destroy(sprite);
            UnityEngine.Object.Destroy(maliceSquare.texture); UnityEngine.Object.Destroy(maliceSquare);
        }
    }
}
