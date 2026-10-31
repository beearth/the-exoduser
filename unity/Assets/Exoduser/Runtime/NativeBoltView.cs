using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Crossbow bolts. The web has no arrow sprite (_bowArrowReady is always false) and draws a vector bolt: element colour (ELC), bright tip (ELG2),
    // alpha min(1, 1 - dist/maxDist*.3) * .6 for the auto crossbow (ghostXbow). Same here with a stretched white sprite, no generated art.
    public sealed class NativeBoltView : IDisposable
    {
        static readonly string[] Body = { "#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44" };   // ELC
        static readonly string[] Tip = { "#ffffff", "#ffaa44", "#88ccff", "#cc77ff", "#ffffaa", "#ffccee" };               // ELG2
        readonly Transform parent; readonly Sprite pixel;
        readonly Dictionary<int, SpriteRenderer[]> bolts = new Dictionary<int, SpriteRenderer[]>();

        public NativeBoltView(Transform parent)
        {
            this.parent = parent;
            pixel = Sprite.Create(Texture2D.whiteTexture, new Rect(0, 0, 1, 1), new Vector2(.5f, .5f), 1);
        }

        static Color Parse(string hex, float alpha) { Color c; ColorUtility.TryParseHtmlString(hex, out c); c.a = alpha; return c; }
        SpriteRenderer Make(string name, int order)
        {
            var go = new GameObject(name); go.transform.SetParent(parent);
            var r = go.AddComponent<SpriteRenderer>(); r.sprite = pixel; r.sortingOrder = order; return r;
        }
        public void Reset() { foreach (var layers in bolts.Values) foreach (var r in layers) UnityEngine.Object.Destroy(r.gameObject); bolts.Clear(); }

        public void Update(Simulation simulation)
        {
            var active = new HashSet<int>();
            foreach (var p in simulation.Bolts)
            {
                if (!p.Active) continue; active.Add(p.Id);
                SpriteRenderer[] layers;
                if (!bolts.TryGetValue(p.Id, out layers)) { layers = new[] { Make("Bolt glow " + p.Id, 24000), Make("Bolt shaft " + p.Id, 24001), Make("Bolt tip " + p.Id, 24002) }; bolts.Add(p.Id, layers); }
                float angle = (float)Math.Atan2(p.Vy, p.Vx), fade = (float)Math.Min(1, 1 - p.Dist / Math.Max(1, p.MaxDist) * .3) * .6f;
                int el = Mathf.Clamp(p.Element, 0, 5);
                Place(layers[0], p.X - Math.Cos(angle) * 4, p.Y - Math.Sin(angle) * 4, angle, 34, 9, Parse(Body[el], fade * .28f));      // soft glow
                Place(layers[1], p.X - Math.Cos(angle) * 7, p.Y - Math.Sin(angle) * 7, angle, 30, 3.2f, Parse(Body[el], Mathf.Min(1, fade * 1.5f)));   // shaft
                Place(layers[2], p.X + Math.Cos(angle) * 3, p.Y + Math.Sin(angle) * 3, angle, 10, 4.6f, Parse(Tip[el], Mathf.Min(1, fade * 1.6f)));      // tip
            }
            var gone = new List<int>(); foreach (var id in bolts.Keys) if (!active.Contains(id)) gone.Add(id);
            foreach (int id in gone) { foreach (var r in bolts[id]) UnityEngine.Object.Destroy(r.gameObject); bolts.Remove(id); }
        }

        static void Place(SpriteRenderer r, double x, double y, float angle, float length, float thickness, Color color)
        {
            r.transform.position = NativeRemodel3D.Point(x,y);
            r.transform.rotation = Quaternion.Euler(0, 0, -angle * Mathf.Rad2Deg);
            r.transform.localScale = new Vector3(length / 100, thickness / 100, 1); r.color = color;NativeHd2DSurface.Bind(r);
        }
        public void Dispose() { Reset(); UnityEngine.Object.Destroy(pixel); }
    }
}
