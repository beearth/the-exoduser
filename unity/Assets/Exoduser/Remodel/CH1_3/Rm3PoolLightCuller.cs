using System;
using UnityEngine;

// RM-3: the slice carries 14 point lights (hell pools + toxic pools), but URP Forward gives a large object (the Terrain) only 8 additional lights. This keeps the nearest `maxLights`
// lights enabled around the focus (the player marker) and switches the rest off. The pool GameObjects stay active; only Light.enabled changes. Same approach as Rm4PoolLightCuller (RM-4).
namespace Exoduser
{
    public sealed class Rm3PoolLightCuller : MonoBehaviour
    {
        public Transform focus;
        public int maxLights = 8;
        Light[] lights;

        void OnEnable() { lights = GetComponentsInChildren<Light>(true); }

        void LateUpdate() { if (focus != null) Refresh(focus.position); }

        public void Refresh(Vector3 p)
        {
            if (lights == null || lights.Length == 0) lights = GetComponentsInChildren<Light>(true);
            int n = lights.Length; var key = new float[n]; var idx = new int[n];
            for (int i = 0; i < n; i++)
            {
                var d = lights[i].transform.position - p; d.y = 0f;
                key[i] = d.magnitude - lights[i].range * 0.5f; idx[i] = i;   // a big pool counts as nearer than a small one at the same distance
            }
            Array.Sort(key, idx);
            for (int r = 0; r < n; r++) lights[idx[r]].enabled = r < maxLights;
        }
    }
}
