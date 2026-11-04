using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // U-VFX-16: 뼈색→녹슨 흑철 화살 몸 + 원소 촉. 코드 그라데이션, 노이즈·디더 없음.
    public sealed class NativeBoltView : IDisposable
    {
        static readonly string[] Body = { "#9a8a72", "#d8562a", "#5f98c0", "#5e3478", "#c8a848", "#c9a45e", "#7e6236" };
        static readonly string[] Tip = { "#efe6d2", "#ffd9a0", "#e8f3f8", "#cdb2e0", "#fff4d0", "#fff2d6", "#dcc8a4" };
        readonly Transform parent; readonly Sprite shaft, tip, glow;
        readonly Dictionary<int, SpriteRenderer[]> bolts = new Dictionary<int, SpriteRenderer[]>();

        public NativeBoltView(Transform parent)
        {
            this.parent = parent;
            shaft = BuildBolt(0); tip = BuildBolt(1); glow = BuildBolt(2);
        }

        static Color Parse(string hex, float alpha) { Color c; ColorUtility.TryParseHtmlString(hex, out c); c.a = alpha; return c; }
        static Sprite BuildBolt(int mode)
        {
            const int w = 128, h = 32;
            var texture = new Texture2D(w, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
            {
                float u = (x + .5f) / w, v = Mathf.Abs((y + .5f) / h * 2 - 1);
                float width = mode == 1 ? 1 - u : .35f + .65f * (1 - u);
                Color c = mode == 0 ? Color.Lerp(Parse("#efe6d2", 1), Parse("#2a2220", 1), u) : Color.white;
                c.a = mode == 2 ? Mathf.Pow(Mathf.Clamp01(1 - (u * 2 - 1) * (u * 2 - 1) - v * v), 2) : Mathf.Clamp01((width - v) * h * .5f);
                texture.SetPixel(x, y, c);
            }
            texture.Apply(false, true);
            return Sprite.Create(texture, new Rect(0, 0, w, h), new Vector2(.5f, .5f), 100);
        }
        SpriteRenderer Make(string name, Sprite sprite, int order)
        {
            var go = new GameObject(name); go.transform.SetParent(parent);
            var r = go.AddComponent<SpriteRenderer>(); r.sprite = sprite; r.sortingOrder = order; return r;
        }
        public void Reset() { foreach (var layers in bolts.Values) foreach (var r in layers) UnityEngine.Object.Destroy(r.gameObject); bolts.Clear(); }

        public void Update(Simulation simulation)
        {
            var active = new HashSet<int>();
            foreach (var p in simulation.Bolts)
            {
                if (!p.Active) continue; active.Add(p.Id);
                SpriteRenderer[] layers;
                if (!bolts.TryGetValue(p.Id, out layers)) { layers = new[] { Make("Bolt glow " + p.Id, glow, 24000), Make("Bolt shaft " + p.Id, shaft, 24001), Make("Bolt tip " + p.Id, tip, 24002) }; bolts.Add(p.Id, layers); }
                float angle = (float)Math.Atan2(p.Vy, p.Vx), fade = (float)Math.Min(1, 1 - p.Dist / Math.Max(1, p.MaxDist) * .3) * .6f;
                int el = Mathf.Clamp(p.Element, 0, 6);
                Place(layers[0], p.X - Math.Cos(angle) * 4, p.Y - Math.Sin(angle) * 4, angle, 34, 9, Parse(Body[el], Mathf.Min(.35f, fade * .28f)));      // soft glow
                Place(layers[1], p.X - Math.Cos(angle) * 7, p.Y - Math.Sin(angle) * 7, angle, 30, 3.2f, new Color(1, 1, 1, Mathf.Min(1, fade * 1.5f)));   // shaft
                Place(layers[2], p.X + Math.Cos(angle) * 3, p.Y + Math.Sin(angle) * 3, angle, 10, 4.6f, Parse(Tip[el], Mathf.Min(1, fade * 1.6f)));      // tip
            }
            var gone = new List<int>(); foreach (var id in bolts.Keys) if (!active.Contains(id)) gone.Add(id);
            foreach (int id in gone) { foreach (var r in bolts[id]) UnityEngine.Object.Destroy(r.gameObject); bolts.Remove(id); }
        }

        static void Place(SpriteRenderer r, double x, double y, float angle, float length, float thickness, Color color)
        {
            r.transform.position = new Vector3((float)x / 100, -(float)y / 100, 0);
            r.transform.rotation = Quaternion.Euler(0, 0, -angle * Mathf.Rad2Deg);
            r.transform.localScale = new Vector3(length / r.sprite.rect.width, thickness / r.sprite.rect.height, 1); r.color = color;
        }
        public void Dispose() { Reset(); foreach (var sprite in new[] { shaft, tip, glow }) { UnityEngine.Object.Destroy(sprite.texture); UnityEngine.Object.Destroy(sprite); } }
    }
}
