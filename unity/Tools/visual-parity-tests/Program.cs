using System;
using System.Collections.Generic;
using Exoduser.UnityPort;

static class Program
{
    static void Require(bool ok, string message) { if (!ok) throw new Exception(message); }
    static int Main()
    {
        var layout = new NativeFloatingTextLayout();
        var boxes = new List<NativeFloatingTextLayout.Box>();
        for (int i = 0; i < 40; i++)
        {
            var box = layout.Place(960 + i % 3 * 8, 500, i % 2 == 0 ? 72 : 170, 30);
            foreach (var previous in boxes) Require(!box.Overlaps(previous), "밀집 보스전의 피해·상태 문자 겹침: " + i);
            Require(box.X >= 8 && box.X + box.Width <= 1912 && box.Y >= 120 && box.Y + box.Height <= 936, "HUD 또는 화면 경계 침범");
            boxes.Add(box);
        }
        layout.Clear();
        var first = layout.Place(960, 500, 72, 30);
        Require(first.X == 924 && first.Y == 500, "프레임 초기화 뒤 잔여 배치");
        var edge = layout.Place(-100, -20, 170, 30);
        Require(edge.X >= 8 && edge.Y >= 120, "화면 밖 문구 클램프");
        Console.WriteLine("통과: 밀집 문자 40개 비중첩, HUD 보호, 프레임 초기화, 경계 클램프");
        return 0;
    }
}
