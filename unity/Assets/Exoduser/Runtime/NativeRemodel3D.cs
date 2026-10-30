using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // RM-INT: world-space helpers of the remodel 3D presentation layer (switch `--remodel3d`; the driver lives in NativeGame.Remodel3D.cs).
    // The Core stays 2D: positions are Core pixels (px, py). The RM-1 scene was baked with Rm1SliceBuilder.W(): x_world = px / 100, z_world = -py / 100, y = terrain height
    // (1 tile = 40 px = 0.4 u). Off, every Point() is byte-for-byte the old 2D mapping (x / 100, -y / 100, 0), so the 2D path and its oracles are unchanged.
    public static class NativeRemodel3D
    {
        public static readonly bool Requested = Array.IndexOf(Environment.GetCommandLineArgs(), "--remodel3d") >= 0 ||
            (Application.isEditor && Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-qa-sandbox")>=0 && Environment.GetEnvironmentVariable("EXO_A2_EDITOR_PREVIEW")=="1");
        public static bool Active;            // the RM-1 scene is loaded and the field is shown in 3D right now (false in the boss arena / before the scene is ready)
        public static Terrain Ground;         // the scene's Terrain (window of tiles x48..152 / y126..200)
        public static bool ForestA2;          // A2 승인 구도만 원근을 넓힌다. 비A2 LOOK-001은 보존한다.
        public static float Pitch { get { return ForestA2 ? 38*Mathf.Deg2Rad : NativeRemodelCamera.Pitch; } }
        public static float DistU { get { return ForestA2 ? 21 : NativeRemodelCamera.Distance; } }

        /// <summary>The 2D mapping the whole port was written against (also what Core-feeding callbacks must keep using, whatever the presentation does).</summary>
        public static Vector3 Point2D(double px, double py) { return new Vector3((float)px / 100, -(float)py / 100, 0); }

        /// <summary>View position of a Core point: 2D plane when off, ground point of the RM-1 scene when active.</summary>
        public static Vector3 Point(double px, double py)
        {
            if (!Active) return Point2D(px, py);
            float x = (float)px / 100, z = -(float)py / 100;
            return new Vector3(x, GroundY(x, z), z);
        }

        /// <summary>Terrain height at a world x / z (Rm1SliceBuilder.GroundY: SampleHeight + terrain y). The terrain only covers a window of the map, so the query is clamped into it.</summary>
        public static float GroundY(float wx, float wz)
        {
            if (Ground == null) return 0f;
            var tp = Ground.transform.position; var sz = Ground.terrainData.size;
            float cx = Mathf.Clamp(wx, tp.x, tp.x + sz.x), cz = Mathf.Clamp(wz, tp.z, tp.z + sz.z);
            return Ground.SampleHeight(new Vector3(cx, 0, cz)) + tp.y;
        }
    }

    /// <summary>
    /// Public world mapping for presentation code that lives on the remodel 3D layer (VFX, boss views). One definition: the same numbers the actor views use (Rm1SliceBuilder.W()).
    /// Independent of the switch: it always answers in the 3D convention (x = px / 100, z = -py / 100, y = terrain height; 0 without a loaded terrain). Use <see cref="Active"/> to know whether the 3D layer is on.
    /// </summary>
    public static class RemodelWorld
    {
        public static bool Active { get { return NativeRemodel3D.Active; } }

        /// <summary>Core point (px, py) -> world position on the ground.</summary>
        public static Vector3 ToWorld(float x, float y) { return ToWorld(x, y, 0f); }
        /// <summary>Core point -> world position, `height` units above the ground (the Core z stays 0; this is presentation height only).</summary>
        public static Vector3 ToWorld(float x, float y, float height)
        {
            float wx = x / 100f, wz = -y / 100f;
            return new Vector3(wx, NativeRemodel3D.GroundY(wx, wz) + height, wz);
        }
        /// <summary>Ground height (world y) under a Core point; the terrain window clamps the query.</summary>
        public static float GroundHeight(float x, float y) { return NativeRemodel3D.GroundY(x / 100f, -y / 100f); }
        /// <summary>Ground normal under a Core point (up without a terrain).</summary>
        public static Vector3 GroundNormal(float x, float y)
        {
            var g = NativeRemodel3D.Ground; if (g == null) return Vector3.up;
            var tp = g.transform.position; var sz = g.terrainData.size;
            float wx = Mathf.Clamp(x / 100f, tp.x, tp.x + sz.x), wz = Mathf.Clamp(-y / 100f, tp.z, tp.z + sz.z);
            return g.terrainData.GetInterpolatedNormal((wx - tp.x) / sz.x, (wz - tp.z) / sz.z);
        }
        /// <summary>World position -> Core point (inverse of ToWorld on the x / z plane).</summary>
        public static Vector2 ToCore(Vector3 world) { return new Vector2(world.x * 100f, -world.z * 100f); }
    }
}
