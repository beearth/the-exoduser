using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // RM-INT: world-space helpers of the remodel 3D presentation layer (switch `--remodel3d`; the driver lives in NativeGame.Remodel3D.cs).
    // The Core stays 2D: positions are Core pixels (px, py). The RM-1 scene was baked with Rm1SliceBuilder.W(): x_world = px / 100, z_world = -py / 100, y = terrain height
    // (1 tile = 40 px = 0.4 u). Off, every Point() is byte-for-byte the old 2D mapping (x / 100, -y / 100, 0), so the 2D path and its oracles are unchanged.
    public static class NativeRemodel3D
    {
        public static readonly bool Requested = Array.IndexOf(Environment.GetCommandLineArgs(), "--remodel3d") >= 0;
        public static bool Active;            // the RM-1 scene is loaded and the field is shown in 3D right now (false in the boss arena / before the scene is ready)
        public static Terrain Ground;         // the scene's Terrain (window of tiles x48..152 / y126..200)
        public const float Pitch = 0.85f;     // LOOK-001: elevation 0.85 rad = 48.70 deg
        public const float DistU = 14f;       // LOOK-001: 1400 px

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
}
