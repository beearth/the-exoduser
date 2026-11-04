using System;
using UnityEngine;
using Exoduser.UnityPort;

namespace Exoduser
{
    // Run only through the shared Unity runner. No reference-assembly substitute.
    public static class A2RGroundBakeProbeVerification
    {
        public static void Verify()
        {
            var root = new GameObject("A2R probe verification");
            root.SetActive(false);
            var original = new Mesh { name = "support band fixture" };
            original.vertices = new[] { Vector3.zero, new Vector3(1,.08f,0),
                new Vector3(0,.16f,1), new Vector3(1,.17f,1) };
            original.triangles = new[] { 0,2,1, 1,2,3 };
            original.uv = new[] { Vector2.zero, Vector2.right, Vector2.up, Vector2.one };
            original.RecalculateNormals(); original.RecalculateTangents();
            var filter = root.AddComponent<MeshFilter>(); filter.sharedMesh = original;
            A2RLoadProbe.ConformStats stats = null;
            try
            {
                stats = A2RLoadProbe.MeasureConform(root, (x,z) => .4f);
                Require(stats.vertices == 4 && stats.supportVertices == 3 && stats.meshClones == 1,
                    "support-band counts");
                var points = filter.sharedMesh.vertices;
                // Full correction at y=0; half at y=.08; zero at .16 and above.
                Require(Mathf.Abs(points[0].y-.36f)<.00001f, "bottom contact");
                Require(Mathf.Abs(points[1].y-.26f)<.00001f, "half-height blend");
                Require(Mathf.Abs(points[2].y-.16f)<.00001f && Mathf.Abs(points[3].y-.17f)<.00001f,
                    "upper silhouette");
                Require(original.vertices[0] == Vector3.zero && original.vertices[1].y == .08f,
                    "source mesh unchanged");
                Require(stats.raycasts == 0 && stats.surfaceQueries == 3,
                    "injected surface does not claim physics calls");
                Debug.Log("A2R_LOAD_PROBE_VERIFICATION PASS support=3 vertices=4 sourceUnchanged=1");
            }
            finally
            {
                if(stats != null) foreach(var mesh in stats.ownedMeshes) UnityEngine.Object.DestroyImmediate(mesh);
                UnityEngine.Object.DestroyImmediate(root); UnityEngine.Object.DestroyImmediate(original);
            }
        }
        static void Require(bool condition,string message)
        {
            if(!condition) throw new InvalidOperationException("A2R load probe: " + message);
        }
    }
}
