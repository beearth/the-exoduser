using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace Exoduser.UnityPort
{
    // Opt-in diagnostics only. Normal play creates no probe object or mesh copies.
    public sealed class A2RLoadProbe : MonoBehaviour
    {
        static readonly bool requested = Array.IndexOf(Environment.GetCommandLineArgs(), "--a2r-load-probe") >= 0;
        public static bool Enabled { get { return requested && NativeQaSandbox.Active; } }
        static readonly List<GroundSample> ground = new List<GroundSample>();
        readonly List<string> stages = new List<string>();
        bool ready;
        [Serializable] public sealed class GroundSample
        {
            public string id, format;
            public double ms;
            public int width, height, mips;
            public bool readable, missing;
        }
        [Serializable] sealed class Catalog { public Model[] models; }
        [Serializable] sealed class Model { public string name, resource; }
        [Serializable] sealed class MeshInfo { public string name; public int vertices; public long indices, bytes; }
        [Serializable] sealed class TextureInfo { public string name, format; public int width, height, mips; public long bytes; }
        [Serializable] sealed class ModelInfo
        {
            public string name, resource;
            public bool residentInPlacementCache;
            public int placementInstances;
            public double cachedLoadMs;
            public List<MeshInfo> meshes = new List<MeshInfo>();
            public List<TextureInfo> textures = new List<TextureInfo>();
        }
        [Serializable] sealed class Replay { public string id, model; public ConformStats conform; }
        [Serializable] sealed class Report
        {
            public string scope = "ground=original synchronous loads; models=cached post-field loads; conform=inactive source-clone replay after field assembly, not original per-call timing";
            public string utc;
            public List<GroundSample> ground;
            public List<string> originalStageLogs;
            public List<ModelInfo> models = new List<ModelInfo>();
            public List<Replay> replays = new List<Replay>();
        }
        [Serializable] public sealed class ConformStats
        {
            public int filters, vertices, supportVertices, surfaceQueries, groundQueries, raycasts, rayHits, meshClones;
            public double totalMs, readMs, transformMs, surfaceMs, groundMs, rayMs, cloneMs, uploadMs, normalsMs, tangentsMs, boundsMs;
            [NonSerialized] public readonly List<Mesh> ownedMeshes = new List<Mesh>();
        }
        static double Ms(long ticks) { return ticks * 1000.0 / Stopwatch.Frequency; }
        public static void BeginGround() { if(Enabled) ground.Clear(); }
        public static void GroundLoaded(string id, Texture2D texture, long ticks)
        {
            if(!Enabled) return;
            ground.Add(new GroundSample { id = id, ms = Ms(ticks), missing = texture == null,
                width = texture != null ? texture.width : 0, height = texture != null ? texture.height : 0,
                mips = texture != null ? texture.mipmapCount : 0, readable = texture != null && texture.isReadable,
                format = texture != null ? texture.graphicsFormat.ToString() : "missing" });
        }
        public static void EndGround()
        {
            if(!Enabled) return;
            double total = 0, repeated = 0; var unique = new HashSet<string>(StringComparer.Ordinal);
            foreach(var sample in ground) { total += sample.ms; if(!unique.Add(sample.id)) repeated += sample.ms; }
            Debug.Log("A2R_LOAD_PROBE_GROUND requests=" + ground.Count + " unique=" + unique.Count +
                " totalMs=" + total.ToString("F3",System.Globalization.CultureInfo.InvariantCulture) +
                " repeatedMs=" + repeated.ToString("F3",System.Globalization.CultureInfo.InvariantCulture));
        }
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Boot()
        {
            if(!Enabled) return;
            ground.Clear();
            var go = new GameObject("A2R opt-in load probe");
            DontDestroyOnLoad(go); go.AddComponent<A2RLoadProbe>();
        }
        void Awake() { Application.logMessageReceived += OnLog; }
        void OnDestroy() { Application.logMessageReceived -= OnLog; }
        void OnLog(string message,string stack,LogType type)
        {
            if(message.StartsWith("[A2 전체필드]",StringComparison.Ordinal)) stages.Add(message);
            if(message.StartsWith("A2R_3D_READY ",StringComparison.Ordinal)) ready = true;
        }
        IEnumerator Start()
        {
            // All extra loads and mesh work happen after the original assembly stage logs.
            float deadline = Time.realtimeSinceStartup + 300;
            while(!ready && Time.realtimeSinceStartup < deadline) yield return null;
            yield return null;
            var report = new Report { utc = DateTime.UtcNow.ToString("o"), ground = new List<GroundSample>(ground),
                originalStageLogs = new List<string>(stages) };
            if(ready)
            {
                var props = UnityEngine.Object.FindFirstObjectByType<A2RProps3D>();
                if(props != null) yield return CaptureModels(props,report);
            }
            else Debug.LogWarning("A2R_LOAD_PROBE partial: no 3D-ready stage within 300s");
            // Never write to the human save namespace or an arbitrary command-line path.
            File.WriteAllText(Path.Combine(NativeQaSandbox.Root,"a2r-load-probe.json"), JsonUtility.ToJson(report,true));
            Debug.Log("A2R_LOAD_PROBE_WRITTEN models=" + report.models.Count + " replays=" + report.replays.Count);
            Destroy(gameObject);
        }
        IEnumerator CaptureModels(A2RProps3D props,Report report)
        {
            var field = typeof(A2RProps3D).GetField("prefabs",BindingFlags.Instance|BindingFlags.NonPublic);
            var cache = field != null ? field.GetValue(props) as Dictionary<string,GameObject> : null;
            if(cache == null) throw new InvalidOperationException("A2R load probe placement-cache contract changed");
            var catalog = JsonUtility.FromJson<Catalog>(Resources.Load<TextAsset>("A2R/Models3D/catalog").text);
            foreach(var spec in catalog.models)
            {
                var row = new ModelInfo { name = spec.name, resource = spec.resource };
                foreach(var item in props.Result.items) if(item.model == spec.name) row.placementInstances++;
                GameObject prefab; row.residentInPlacementCache = cache.TryGetValue(spec.name,out prefab);
                if(row.residentInPlacementCache)
                {
                    long start = Stopwatch.GetTimestamp(); var loaded = Resources.Load<GameObject>(spec.resource);
                    row.cachedLoadMs = Ms(Stopwatch.GetTimestamp()-start);
                    if(loaded != prefab) throw new InvalidOperationException("A2R probe cached resource changed: " + spec.name);
                    var seenMeshes = new HashSet<Mesh>(); var seenTextures = new HashSet<Texture>();
                    foreach(var filter in prefab.GetComponentsInChildren<MeshFilter>(true))
                    {
                        var mesh = filter.sharedMesh; if(mesh == null || !seenMeshes.Add(mesh)) continue;
                        long indices = 0; for(int i=0;i<mesh.subMeshCount;i++) indices += mesh.GetIndexCount(i);
                        row.meshes.Add(new MeshInfo { name = mesh.name, vertices = mesh.vertexCount, indices = indices,
                            bytes = UnityEngine.Profiling.Profiler.GetRuntimeMemorySizeLong(mesh) });
                    }
                    foreach(var renderer in prefab.GetComponentsInChildren<Renderer>(true)) foreach(var material in renderer.sharedMaterials)
                    {
                        if(material == null) continue;
                        foreach(var property in material.GetTexturePropertyNames())
                        {
                            var texture = material.GetTexture(property); if(texture == null || !seenTextures.Add(texture)) continue;
                            row.textures.Add(new TextureInfo { name = texture.name, width = texture.width, height = texture.height,
                                mips = texture is Texture2D t ? t.mipmapCount : 0, format = texture.graphicsFormat.ToString(),
                                bytes = UnityEngine.Profiling.Profiler.GetRuntimeMemorySizeLong(texture) });
                        }
                    }
                }
                // Unused catalog assets are not loaded; do not create an artificial 78-model memory spike.
                report.models.Add(row);
            }
            var placed = new Dictionary<string,Transform>(StringComparer.Ordinal);
            foreach(Transform child in props.VisualRoot) placed[child.name] = child;
            foreach(var item in props.Result.items)
            {
                GameObject prefab; Transform actual;
                if(!cache.TryGetValue(item.model,out prefab) || !placed.TryGetValue(item.id+" "+item.kind+" "+item.model,out actual)) continue;
                var parent = new GameObject("A2R inactive conform replay"); parent.SetActive(false);
                parent.transform.SetParent(actual.parent,false);
                ConformStats stats = null;
                try
                {
                    var clone = Instantiate(prefab,parent.transform);
                    clone.transform.localPosition = actual.localPosition; clone.transform.localRotation = actual.localRotation;
                    clone.transform.localScale = actual.localScale;
                    stats = MeasureConform(clone);
                    report.replays.Add(new Replay { id = item.id, model = item.model, conform = stats });
                }
                finally
                {
                    if(stats != null) foreach(var mesh in stats.ownedMeshes) Destroy(mesh);
                    Destroy(parent);
                }
                // Let per-instance temporary meshes be released before measuring another placement.
                yield return null;
            }
        }
        // Read-only experiment on disposable clones. Matches d9e5a2742 ConformBase math.
        // Timers add overhead; report replay timings separately from original stage totals.
        public static ConformStats MeasureConform(GameObject model,Func<float,float,float> surface = null)
        {
            var result = new ConformStats(); long begin = Stopwatch.GetTimestamp();
            try
            {
                foreach(var filter in model.GetComponentsInChildren<MeshFilter>(true))
                {
                    long tick = Stopwatch.GetTimestamp(); var original = filter.sharedMesh; var points = original.vertices;
                    result.readMs += Ms(Stopwatch.GetTimestamp()-tick); result.filters++; result.vertices += points.Length;
                    bool changed = false;
                    for(int i=0;i<points.Length;i++)
                    {
                        tick = Stopwatch.GetTimestamp(); var world = filter.transform.TransformPoint(points[i]);
                        var root = model.transform.InverseTransformPoint(world);
                        result.transformMs += Ms(Stopwatch.GetTimestamp()-tick);
                        if(root.y > .16f) continue;
                        result.supportVertices++; result.surfaceQueries++;
                        tick = Stopwatch.GetTimestamp(); float weight = 1-Mathf.SmoothStep(0,1,Mathf.Max(0,root.y)/.16f);
                        var basePoint = model.transform.TransformPoint(new Vector3(root.x,0,root.z));
                        result.transformMs += Ms(Stopwatch.GetTimestamp()-tick);
                        tick = Stopwatch.GetTimestamp(); float y;
                        if(surface != null) y = surface(basePoint.x,basePoint.z);
                        else
                        {
                            long part = Stopwatch.GetTimestamp(); result.groundQueries++;
                            float terrain = NativeRemodel3D.GroundY(basePoint.x,basePoint.z);
                            result.groundMs += Ms(Stopwatch.GetTimestamp()-part);
                            part = Stopwatch.GetTimestamp(); RaycastHit hit; result.raycasts++;
                            bool found = Physics.Raycast(new Vector3(basePoint.x,60,basePoint.z),Vector3.down,out hit,140,1<<28,
                                QueryTriggerInteraction.Ignore);
                            result.rayMs += Ms(Stopwatch.GetTimestamp()-part); if(found) result.rayHits++;
                            y = Mathf.Max(terrain,found ? hit.point.y : float.NegativeInfinity);
                        }
                        result.surfaceMs += Ms(Stopwatch.GetTimestamp()-tick);
                        tick = Stopwatch.GetTimestamp(); world.y += (y-.04f-basePoint.y)*weight;
                        points[i] = filter.transform.InverseTransformPoint(world); changed = true;
                        result.transformMs += Ms(Stopwatch.GetTimestamp()-tick);
                    }
                    if(!changed) continue;
                    tick = Stopwatch.GetTimestamp(); var mesh = Instantiate(original); result.ownedMeshes.Add(mesh);
                    mesh.name = original.name+" diagnostic terrain rooted instance";
                    result.meshClones++; result.cloneMs += Ms(Stopwatch.GetTimestamp()-tick);
                    tick = Stopwatch.GetTimestamp(); mesh.vertices = points; result.uploadMs += Ms(Stopwatch.GetTimestamp()-tick);
                    tick = Stopwatch.GetTimestamp(); mesh.RecalculateNormals(); result.normalsMs += Ms(Stopwatch.GetTimestamp()-tick);
                    tick = Stopwatch.GetTimestamp(); mesh.RecalculateTangents(); result.tangentsMs += Ms(Stopwatch.GetTimestamp()-tick);
                    tick = Stopwatch.GetTimestamp(); mesh.RecalculateBounds(); var bounds = mesh.bounds; bounds.Expand(.35f);
                    mesh.bounds = bounds; result.boundsMs += Ms(Stopwatch.GetTimestamp()-tick); filter.sharedMesh = mesh;
                }
            }
            catch
            {
                foreach(var mesh in result.ownedMeshes) Destroy(mesh);
                throw;
            }
            result.totalMs = Ms(Stopwatch.GetTimestamp()-begin); return result;
        }
    }
}
