using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // M1 region HUD wiring (follow-up of the 1-1 four-region rule): banner, direction arrow and gate label live in NativeRegionHud; this file only feeds them
    // the run state and the HUD rectangles the web arrow keeps clear of (_raMeasureSafe 61097: clock, bottom widgets, minimap, objective panel).
    public sealed partial class NativeGame
    {
        readonly NativeRegionHud regionHud = new NativeRegionHud();
        public NativeRegionHud RegionHud { get { return regionHud; } }

        void RegionHudAttach() { regionHud.Reset(); regionHud.ToGUI = ToGUI; regionHud.SafeZone = RegionHudSafeZone; }
        void RegionHudTick() { regionHud.English = English; regionHud.OnTick(Simulation); }

        NativeRegionHud.Safe RegionHudSafeZone()
        {
            var dock = NativeHudDockLayout.Create(1920, 1080);
            float bottom = Mathf.Min(dock.SlotBar.y, Mathf.Min(dock.LeftLiquid.y, dock.RightLiquid.y));
            return new NativeRegionHud.Safe {
                clock = new Rect(1920 / 2f - 85, 17, 170, 37), bottomTop = bottom,
                blocks = new[] { new Rect(8, 8, 141.1f, 141.1f), new Rect(1920 - NativeObjectivePanel.Width - NativeObjectivePanel.RightMargin, NativeObjectivePanel.Top, NativeObjectivePanel.Width, NativeObjectivePanel.Height) }
            };
        }

        void DrawRegionHud()
        {
            if (Simulation == null || firstPractice != null) return;
            regionHud.English = English;
            regionHud.Draw(Simulation, menu || stageClear.Active || death.Active || PlayerDown);
        }
    }
}
