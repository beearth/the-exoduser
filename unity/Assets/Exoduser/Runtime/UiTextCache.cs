using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PERF-U7 (docs/12퍼포먼스·최적화/UNITY_FRAME_OPT_MASTER_20261103.md): allocation-free helpers for per-glyph IMGUI text.
    // Char(c) returns the same string c.ToString() would; Size(style, text) is style.CalcSize(new GUIContent(text)) without the GUIContent.
    // Main thread only (IMGUI).
    static class UiTextCache
    {
        static readonly Dictionary<char, string> chars = new Dictionary<char, string>();
        static readonly GUIContent temp = new GUIContent();
        public static string Char(char c)
        {
            string s; if (!chars.TryGetValue(c, out s)) { s = c.ToString(); chars[c] = s; }
            return s;
        }
        public static Vector2 Size(GUIStyle style, string text)
        {
            temp.text = text; temp.image = null; temp.tooltip = null;
            return style.CalcSize(temp);
        }
        // ColorUtility.ToHtmlStringRGBA quantization, as a value key.
        public static Color32 Quantize(Color c)
        {
            return new Color32((byte)Mathf.Clamp(Mathf.RoundToInt(c.r * 255), 0, 255), (byte)Mathf.Clamp(Mathf.RoundToInt(c.g * 255), 0, 255),
                               (byte)Mathf.Clamp(Mathf.RoundToInt(c.b * 255), 0, 255), (byte)Mathf.Clamp(Mathf.RoundToInt(c.a * 255), 0, 255));
        }
    }
}
