using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        NativeFieldLighting worldLighting;

        // Camera image effects finish before IMGUI: HUD, menus and video stay above lighting.
        internal bool WorldLightingVisible => Simulation != null && view.cullingMask != 0 &&
            (lobby == null || !lobby.IsBlocking || lobby.StartupWorldVisible);

        void InitializeWorldLighting()
        {
            worldLighting = view.gameObject.AddComponent<NativeFieldLighting>();
            worldLighting.Initialize(this, view);
        }

        void DisposeWorldLighting()
        {
            if (worldLighting == null) return;
            worldLighting.Release();
            Destroy(worldLighting);
            worldLighting = null;
        }
    }
}
