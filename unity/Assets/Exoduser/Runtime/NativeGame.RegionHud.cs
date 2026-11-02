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
            float bottom=Mathf.Min(dock.LeftFrame.y,dock.RightFrame.y);
            var blocks=new System.Collections.Generic.List<Rect>{NativeUiViewport.FromEdge(new Rect(8,8,141.1f,141.1f)),NativeUiViewport.FromEdge(new Rect(16,188,108,58.3f)),NativeUiViewport.FromEdge(new Rect(NativeUiViewport.Edges.Width-NativeObjectivePanel.Width-NativeObjectivePanel.RightMargin,NativeObjectivePanel.Top,NativeObjectivePanel.Width,NativeObjectivePanel.Height))};
            if(Time.unscaledTime<noticeUntil){var ns=new GUIStyle(label){alignment=TextAnchor.UpperLeft,wordWrap=true};blocks.Add(NativeUiViewport.FromEdge(new Rect(20,270,440,ns.CalcHeight(new GUIContent(notice),440))));}
            return new NativeRegionHud.Safe{screen=NativeUiViewport.ScreenInDesign,clock=new Rect(875,17,170,37),bottomTop=bottom,blocks=blocks.ToArray()};
        }

        void DrawRegionHud()
        {
            if (Simulation == null || firstPractice != null) return;
            regionHud.English = English;
            regionHud.Draw(Simulation, menu || stageClear.Active || death.Active || PlayerDown);
        }
    }
}
