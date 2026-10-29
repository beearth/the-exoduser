using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // 피해 숫자와 상태 문구가 함께 쓰는 화면 좌표 배치. Core 좌표·수명·피해량은 바꾸지 않는다.
    public sealed class NativeFloatingTextLayout
    {
        public struct Box
        {
            public float X, Y, Width, Height;
            public Box(float x, float y, float width, float height) { X = x; Y = y; Width = width; Height = height; }
            public bool Overlaps(Box other) { return X < other.X + other.Width && X + Width > other.X && Y < other.Y + other.Height && Y + Height > other.Y; }
        }
        readonly List<Box> placed = new List<Box>();
        public void Clear() { placed.Clear(); }
        public Box Place(float centerX, float top, float width, float height)
        {
            width = Math.Min(1904, Math.Max(1, width));
            height = Math.Min(816, Math.Max(1, height));
            top = Math.Max(120, Math.Min(936 - height, top));
            int rows = (int)((top - 120) / (height + 4)) + 1;
            for (int attempt = 0; attempt < 512; attempt++)
            {
                int column = attempt / rows;
                int offset = column == 0 ? 0 : (column % 2 == 1 ? (column + 1) / 2 : -column / 2);
                float x = Math.Max(8, Math.Min(1912 - width, centerX - width / 2 + offset * (width + 8)));
                var candidate = new Box(x, top - attempt % rows * (height + 4), width, height);
                bool hit = false;
                foreach (var other in placed)
                    if (new Box(candidate.X - 2, candidate.Y - 2, width + 4, height + 4).Overlaps(other)) { hit = true; break; }
                if (hit) continue;
                placed.Add(candidate);
                return candidate;
            }
            // 극단적인 밀집에서도 이미 표시한 문자나 HUD를 덮지 않는다. 다음 프레임에 다시 배치한다.
            return new Box(8, 120, 0, 0);
        }
    }
}
