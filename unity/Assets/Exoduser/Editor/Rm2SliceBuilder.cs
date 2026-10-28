using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using Unity.AI.Navigation;
using Unity.Cinemachine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.AI;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

// RM-2 structure builder (1-2 "twisted forest road", idempotent). `Unity -batchmode -executeMethod Exoduser.Rm2SliceBuilder.Run -quit` builds Remodel/CH1_2/RM2_Slice.unity:
// Terrain matching the web walk grid (data = Data/ch1_2_walk.json + Data/rm2_build.json from tools/rm2/gen_build_data.mjs), procedural lump masses + landmarks (LumpMesh, same method as RM-1),
// toxic surfaces on blocked tiles only, Lights/Pools/Pool_Hell_NN + Pool_Toxic_NN, light shafts, Cinemachine LOOK-001 rig, NavMesh baked from the walk grid.
// Other entry points: Capture (cuts/top/capsule), Wedge (sight-wedge capsule test, rule h <= 0.9 + tan(pitch) * D), Fps. Core (Runtime/Core), Remodel/Common, Rendering/ and RM-1 files are only read.
// Coordinates: web px -> Unity world x = px/100, z = -px_y/100 (1 tile = 40px = 0.4u).
namespace Exoduser
{
    public static class Rm2SliceBuilder
    {
        const string Root = "Assets/Exoduser/Remodel/CH1_2";
        const string Rm1Root = "Assets/Exoduser/Remodel/CH1_1";   // read-only: textures of the confirmed hand-painted art, shaders
        const string ScenePath = Root + "/RM2_Slice.unity";
        const string GenDir = Root + "/Generated";
        const string DataDir = Root + "/Data";
        // Terrain window (tiles): the walk area spans x27..167 y6..198, padded so the perspective view never sees past the terrain edge.
        const int TX0 = 20, TY0 = 4, TX1 = 180, TY1 = 198;
        const float T = 0.4f, TerrainH = 4f, BaseY = -0.5f;
        const float Pitch = 0.85f, DistU = 14f;
        const int HRes = 1025, ARes = 512;

        [Serializable] class IslandInfo { public int size; public int[] bbox; public bool touchesBorder; }
        [Serializable] class WalkFile { public string[] rows; public IslandInfo[] blockedIslandsInsideWalk; }
        [Serializable] class BItem { public string id, shape; public float[] r, pair, light; public bool tall, shaft; public float maxH, x, y; public int[] tiles; }
        [Serializable] class BuildFile { public BItem[] landmarks, fills, toxic, pools, cuts; public BItem dry; }
        [Serializable] class WedgeEntry { public string name, kind; public float h, cap, dU; public int tx, ty, nx, ny; }
        [Serializable] class WedgeFile { public WedgeEntry[] tall; }

        static string[] walkRows; static int[,] distWalk, distBlock; static float[,] tileCap; static IslandInfo[] islands; static BuildFile build; static Terrain terrain;
        static readonly HashSet<int> plannedTiles = new HashSet<int>(), toxicSet = new HashSet<int>();
        static readonly Color LightHell = Hex("#b0281c"), LightToxic = Hex("#b7b54a"), ShadowCol = Hex("#120c0a"), FogLow = Hex("#2a1a16");
        static Color Hex(string h) { ColorUtility.TryParseHtmlString(h, out var c); return c; }
        static string F(float v) { return v.ToString("0.###", CultureInfo.InvariantCulture); }
        static int Key(int tx, int ty) { return ty * 200 + tx; }
        static bool Walk(int x, int y) { return x >= 0 && y >= 0 && x < 200 && y < 200 && walkRows[y][x] == '0'; }
        static float Hash(int x, int y) { unchecked { uint h = (uint)(x * 374761393 + y * 668265263); h = (h ^ (h >> 13)) * 1274126177u; return ((h ^ (h >> 16)) & 0xffff) / 65535f; } }
        static Vector3 W(float tx, float ty, float y = 0f) { return new Vector3(tx * T, y, -ty * T); }
        static float Smooth(float a, float b, float x) { x = Mathf.Clamp01((x - a) / (b - a)); return x * x * (3 - 2 * x); }
        static void WriteData(string name, string text) { Directory.CreateDirectory(DataDir); File.WriteAllText(DataDir + "/" + name, text); }
        static BItem Item(BItem[] a, string id) { foreach (var i in a) if (i.id == id) return i; return null; }

        // ---- footprints of 3D masses (XZ world), used to prove nothing covers a walk tile (same method as RM-1)
        struct FP { public string kind; public float cx, cz, hw, hd, yaw; public bool circle; }
        static readonly List<FP> fps = new List<FP>();
        static bool InFP(FP f, float px, float pz, float margin)
        {
            float dx = px - f.cx, dz = pz - f.cz;
            if (f.circle) return dx * dx + dz * dz < (f.hw + margin) * (f.hw + margin);
            float c = Mathf.Cos(f.yaw * Mathf.Deg2Rad), s = Mathf.Sin(f.yaw * Mathf.Deg2Rad);
            float lx = dx * c - dz * s, lz = dx * s + dz * c;
            return Mathf.Abs(lx) < f.hw + margin && Mathf.Abs(lz) < f.hd + margin;
        }
        static bool FpHitsWalk(FP f)
        {
            float r = f.circle ? f.hw : Mathf.Sqrt(f.hw * f.hw + f.hd * f.hd);
            int x0 = Mathf.FloorToInt((f.cx - r) / T) - 1, x1 = Mathf.CeilToInt((f.cx + r) / T) + 1, y0 = Mathf.FloorToInt((-f.cz - r) / T) - 1, y1 = Mathf.CeilToInt((-f.cz + r) / T) + 1;
            for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++)
                    if (Walk(tx, ty) && InFP(f, (tx + .5f) * T, -(ty + .5f) * T, 0.04f)) return true;
            return false;
        }

        // ---- sight wedge: a mass whose north side is walkable may rise only to h <= 0.9 + tan(pitch) * D (D = horizontal distance, u, from the mass' north end to the nearest walk tile north of it)
        static int NorthDy(int tx, int ty, int halfCols, out int wx, out int wy)
        {
            for (int dy = 1; dy <= 40; dy++) { int y = ty - dy; if (y < 0) break; for (int x = tx - halfCols; x <= tx + halfCols; x++) if (Walk(x, y)) { wx = x; wy = y; return dy; } }
            wx = -1; wy = -1; return -1;
        }
        static float WedgeCap(int tx, int ty, float radiusU, out int dyEff, out int wx, out int wy)
        {
            int rt = Mathf.CeilToInt(radiusU / T); int dy = NorthDy(tx, ty, rt + 2, out wx, out wy);
            if (dy < 0) { dyEff = -1; return 99f; }
            dyEff = Mathf.Max(1, dy - rt); float d = (dyEff - 1) * T;
            return (0.9f + Mathf.Tan(Pitch) * d) * 0.92f;   // 8% margin for lean / terrain blur
        }
        struct Mass { public string name, kind; public float h, cap, dU; public int tx, ty, nx, ny; }
        static readonly List<Mass> masses = new List<Mass>();

        static void Load()
        {
            var wf = JsonUtility.FromJson<WalkFile>(File.ReadAllText(DataDir + "/ch1_2_walk.json"));
            walkRows = wf.rows; islands = wf.blockedIslandsInsideWalk ?? new IslandInfo[0];
            build = JsonUtility.FromJson<BuildFile>(File.ReadAllText(DataDir + "/rm2_build.json"));
            distWalk = Bfs(true); distBlock = Bfs(false);
            tileCap = new float[200, 200];
            for (int y = 0; y < 200; y++) for (int x = 0; x < 200; x++) { int dy = NorthDy(x, y, 1, out _, out _); tileCap[y, x] = dy < 0 ? 99f : (0.9f + Mathf.Tan(Pitch) * (dy - 1) * T) * 0.92f; }
            plannedTiles.Clear(); toxicSet.Clear();
            foreach (var arr in new[] { build.landmarks, build.fills, build.toxic }) foreach (var it in arr) for (int i = 0; i + 1 < it.tiles.Length; i += 2) plannedTiles.Add(Key(it.tiles[i], it.tiles[i + 1]));
            for (int i = 0; i + 1 < build.dry.tiles.Length; i += 2) plannedTiles.Add(Key(build.dry.tiles[i], build.dry.tiles[i + 1]));
            foreach (var it in build.toxic) for (int i = 0; i + 1 < it.tiles.Length; i += 2) toxicSet.Add(Key(it.tiles[i], it.tiles[i + 1]));
        }
        // chebyshev distance (8-neighbour BFS) to the nearest walkable (toWalk) or blocked tile; out-of-grid counts as blocked
        static int[,] Bfs(bool toWalk)
        {
            var d = new int[200, 200]; var q = new Queue<(int, int)>();
            for (int y = 0; y < 200; y++) for (int x = 0; x < 200; x++) { bool src = toWalk ? Walk(x, y) : !Walk(x, y); d[y, x] = src ? 0 : -1; if (src) q.Enqueue((x, y)); }
            while (q.Count > 0) { var (x, y) = q.Dequeue(); for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) { int nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= 200 || ny >= 200 || d[ny, nx] >= 0) continue; d[ny, nx] = d[y, x] + 1; q.Enqueue((nx, ny)); } }
            return d;
        }
        static bool Planned(int tx, int ty, int dilate)
        {
            for (int y = ty - dilate; y <= ty + dilate; y++) for (int x = tx - dilate; x <= tx + dilate; x++) if (plannedTiles.Contains(Key(x, y))) return true;
            return false;
        }

        public static void Run()
        {
            AudioListener.volume = 0f;   // no sound from any automated run
            Directory.CreateDirectory(GenDir); Directory.CreateDirectory(Root + "/Materials"); AssetDatabase.Refresh();
            Load(); fps.Clear(); masses.Clear();
            var mats = MakeMaterials();
            var td = BuildTerrainData();
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var world = new GameObject("World");
            var tgo = Terrain.CreateTerrainGameObject(td); tgo.name = "Terrain"; tgo.transform.SetParent(world.transform, false);
            tgo.transform.position = new Vector3(TX0 * T, BaseY, -TY1 * T);
            terrain = tgo.GetComponent<Terrain>(); terrain.drawInstanced = true; terrain.heightmapPixelError = 3f; terrain.basemapDistance = 400f;

            BuildToxic(world.transform, mats);
            var blockout = new GameObject("Blockout").transform; blockout.SetParent(world.transform, false);
            BuildLandmarks(blockout, mats);
            BuildMasses(blockout, mats);
            CheckIslands(blockout, mats);
            BuildLighting(mats);
            WalkOverlap();
            BuildCamera();
            BuildNavMesh(world.transform);
            HeroCheck();
            RenderBoundsCheck(world.transform, blockout);
            WriteWedge();
            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            Debug.Log("[RM2] slice built: " + ScenePath);
        }

        // ---------------------------------------------------------------- materials
        class Mats { public Material Toxic, Mass, Bark, Shaft1, Shaft2; }
        static Material Mat(string path, Shader sh, Action<Material> init)
        {
            var m = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (m == null) { m = new Material(sh); AssetDatabase.CreateAsset(m, path); }
            m.shader = sh; init(m); EditorUtility.SetDirty(m); return m;
        }
        static Mats MakeMaterials()
        {
            var mats = new Mats(); var lit = Shader.Find("Universal Render Pipeline/Lit");
            mats.Toxic = Mat(Root + "/Materials/M_ToxicFlow_RM2.mat", Shader.Find("EXODUSER/ToxicFlow"), m => { });
            // confirmed hand-painted mass_v01 (bark plates, sinew webbing, red veins) + its normal map, read from RM-1's folder; no generated art
            var massTex = AssetDatabase.LoadAssetAtPath<Texture2D>(Rm1Root + "/Materials/Mass/mass_v01.png"); var nrmTex = AssetDatabase.LoadAssetAtPath<Texture2D>(Rm1Root + "/Materials/Mass/mass_v01_normal.png");
            Action<Material, Color, float> massInit = (m, tint, smooth) => { m.SetTexture("_BaseMap", massTex); m.SetColor("_BaseColor", tint); m.SetTexture("_BumpMap", nrmTex); m.SetFloat("_BumpScale", 1f); m.EnableKeyword("_NORMALMAP"); m.SetFloat("_Smoothness", smooth); m.SetFloat("_Metallic", 0f); };
            mats.Mass = Mat(Root + "/Materials/M_RottenWoodMembrane_RM2.mat", lit, m => massInit(m, new Color(.62f, .56f, .54f), .10f));
            mats.Bark = Mat(Root + "/Materials/M_CursedBark_RM2.mat", lit, m => massInit(m, new Color(.40f, .34f, .33f), .06f));
            var shaft = Shader.Find("EXODUSER/LightShaft");
            mats.Shaft1 = Mat(Root + "/Materials/M_Shaft_Hell_1_RM2.mat", shaft, m => { m.SetColor("_Color", LightHell); m.SetFloat("_Intensity", 0.42f); m.SetFloat("_Phase", 0.4f); });
            mats.Shaft2 = Mat(Root + "/Materials/M_Shaft_Hell_2_RM2.mat", shaft, m => { m.SetColor("_Color", LightHell); m.SetFloat("_Intensity", 0.34f); m.SetFloat("_Phase", 2.1f); });
            return mats;
        }

        // ---------------------------------------------------------------- terrain: walk tiles flat at 0; blocked tiles rise with distance (capped by the sight wedge); toxic tiles sunk; dry bed barely sunk
        static Dictionary<int, float> SpecialTileH()
        {
            var o = new Dictionary<int, float>();
            for (int i = 0; i + 1 < build.dry.tiles.Length; i += 2) o[Key(build.dry.tiles[i], build.dry.tiles[i + 1])] = -0.04f;
            foreach (var it in build.toxic) for (int i = 0; i + 1 < it.tiles.Length; i += 2) o[Key(it.tiles[i], it.tiles[i + 1])] = -0.34f;
            return o;
        }
        static float TileH(int tx, int ty, Dictionary<int, float> sp)
        {
            if (tx >= 0 && ty >= 0 && tx < 200 && ty < 200 && sp.TryGetValue(Key(tx, ty), out var ph)) return ph;
            if (Walk(tx, ty)) return 0f;
            bool outside = tx < 0 || ty < 0 || tx >= 200 || ty >= 200;
            int d = outside ? 6 : distWalk[ty, tx];
            float v = Mathf.Min(1.5f, 0.28f * (d - 0.2f)) * (0.75f + 0.5f * Hash(tx, ty));
            return outside ? v : Mathf.Min(v, tileCap[ty, tx]);
        }
        static TerrainData BuildTerrainData()
        {
            var layers = new List<TerrainLayer>();
            TerrainLayer TL(string name, string tex, Vector2 size)
            {
                var path = GenDir + "/TL_" + name + ".terrainlayer"; var l = AssetDatabase.LoadAssetAtPath<TerrainLayer>(path);
                if (l == null) { l = new TerrainLayer(); AssetDatabase.CreateAsset(l, path); }
                l.diffuseTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(tex); l.tileSize = size; l.tileOffset = Vector2.zero; l.smoothness = 0f; l.metallic = 0f; EditorUtility.SetDirty(l); return l;
            }
            layers.Add(TL("Floor1", Rm1Root + "/Materials/Ground/floor_v01b.png", new Vector2(3.2f, 3.2f)));
            layers.Add(TL("Floor2", Rm1Root + "/Materials/Ground/floor_v02b.png", new Vector2(2.6f, 2.6f)));
            layers.Add(TL("Floor3", Rm1Root + "/Materials/Ground/floor_v03b.png", new Vector2(3.6f, 3.6f)));
            float sx = (TX1 - TX0) * T, sz = (TY1 - TY0) * T;
            var path2 = GenDir + "/RM2_Terrain.asset"; AssetDatabase.DeleteAsset(path2);
            var td = new TerrainData { heightmapResolution = HRes, alphamapResolution = ARes, baseMapResolution = 512 };
            td.size = new Vector3(sx, TerrainH, sz);
            AssetDatabase.CreateAsset(td, path2);
            td.terrainLayers = layers.ToArray();
            td.SetHeights(0, 0, ComputeHeights());
            td.SetAlphamaps(0, 0, ComputeAlpha());
            return td;
        }
        static float[,] ComputeHeights()
        {
            var sp = SpecialTileH(); var h = new float[HRes, HRes];
            for (int i = 0; i < HRes; i++) for (int j = 0; j < HRes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(HRes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(HRes - 1));
                    float fx = X - .5f, fy = Y - .5f; int x0 = Mathf.FloorToInt(fx), y0 = Mathf.FloorToInt(fy); float ax = fx - x0, ay = fy - y0;
                    h[i, j] = Mathf.Lerp(Mathf.Lerp(TileH(x0, y0, sp), TileH(x0 + 1, y0, sp), ax), Mathf.Lerp(TileH(x0, y0 + 1, sp), TileH(x0 + 1, y0 + 1, sp), ax), ay);
                }
            for (int pass = 0; pass < 2; pass++) { BoxBlur(h, 4, true); BoxBlur(h, 4, false); }
            for (int i = 0; i < HRes; i++) for (int j = 0; j < HRes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(HRes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(HRes - 1));
                    float v = h[i, j] + 0.014f * (Mathf.PerlinNoise(X * .33f, Y * .33f) - .5f) * 2f;
                    h[i, j] = Mathf.Clamp01((v - BaseY) / TerrainH);   // BaseY is the world y of normalised 0; walkable (v=0) sits at world y = 0 because the terrain object is placed at BaseY
                }
            return h;
        }
        static void BoxBlur(float[,] h, int r, bool horiz)
        {
            var tmp = new float[HRes, HRes];
            for (int i = 0; i < HRes; i++) { float sum = 0; int n = 0; for (int k = -r; k <= r; k++) { int jj = Mathf.Clamp(k, 0, HRes - 1); sum += horiz ? h[i, jj] : h[jj, i]; n++; }
                for (int j = 0; j < HRes; j++) { if (horiz) tmp[i, j] = sum / n; else tmp[j, i] = sum / n; int add = Mathf.Clamp(j + r + 1, 0, HRes - 1), rem = Mathf.Clamp(j - r, 0, HRes - 1); sum += (horiz ? h[i, add] : h[add, i]) - (horiz ? h[i, rem] : h[rem, i]); } }
            Array.Copy(tmp, h, tmp.Length);
        }
        static float[,,] ComputeAlpha()
        {
            var a = new float[ARes, ARes, 3]; var dry = new HashSet<int>(); for (int i = 0; i + 1 < build.dry.tiles.Length; i += 2) dry.Add(Key(build.dry.tiles[i], build.dry.tiles[i + 1]));
            for (int i = 0; i < ARes; i++) for (int j = 0; j < ARes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(ARes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(ARes - 1));
                    float n1 = Mathf.PerlinNoise(X * .17f, Y * .17f), n2 = Mathf.PerlinNoise(X * .29f + 40f, Y * .29f + 17f);
                    bool isDry = dry.Contains(Key(Mathf.FloorToInt(X), Mathf.FloorToInt(Y)));
                    float w0 = Mathf.Lerp(.25f, 1f, n1) * (isDry ? .3f : 1f), w1 = Mathf.Lerp(.15f, .9f, n2) * (isDry ? .3f : 1f), w2 = isDry ? 1.6f : .2f + .2f * n1;
                    float s = w0 + w1 + w2; a[i, j, 0] = w0 / s; a[i, j, 1] = w1 / s; a[i, j, 2] = w2 / s;
                }
            return a;
        }
        static float GroundY(float wx, float wz) { return terrain.SampleHeight(new Vector3(wx, 0, wz)) + terrain.transform.position.y; }

        // ---------------------------------------------------------------- toxic surfaces: one tile-quad mesh per plan item, blocked tiles only (build data never lists walk tiles)
        static Mesh SaveMesh(Mesh m, string name) { var p = GenDir + "/" + name + ".asset"; AssetDatabase.DeleteAsset(p); AssetDatabase.CreateAsset(m, p); return m; }
        static void BuildToxic(Transform parent, Mats mats)
        {
            var root = new GameObject("Toxic"); root.transform.SetParent(parent, false); int onWalk = 0;
            foreach (var it in build.toxic)
            {
                var vs = new List<Vector3>(); var uvs = new List<Vector2>(); var tris = new List<int>();
                for (int i = 0; i + 1 < it.tiles.Length; i += 2)
                {
                    int tx = it.tiles[i], ty = it.tiles[i + 1]; if (Walk(tx, ty)) { onWalk++; continue; }
                    int b = vs.Count; float y = -0.05f;
                    vs.Add(W(tx, ty, y)); vs.Add(W(tx + 1, ty, y)); vs.Add(W(tx, ty + 1, y)); vs.Add(W(tx + 1, ty + 1, y));
                    for (int k = 0; k < 4; k++) uvs.Add(new Vector2(vs[b + k].x, vs[b + k].z) * 0.9f);
                    tris.AddRange(new[] { b, b + 1, b + 2, b + 2, b + 1, b + 3 });
                }
                var m = new Mesh { name = "Toxic_" + it.id }; m.SetVertices(vs); m.SetUVs(0, uvs); m.SetTriangles(tris, 0); m.RecalculateNormals(); m.RecalculateBounds();
                SaveMesh(m, "Toxic_" + it.id);
                var go = new GameObject("Toxic_" + it.id); go.transform.SetParent(root.transform, false);
                go.AddComponent<MeshFilter>().sharedMesh = m; var mr = go.AddComponent<MeshRenderer>(); mr.sharedMaterial = mats.Toxic; mr.shadowCastingMode = ShadowCastingMode.Off;
            }
            Debug.Log("[RM2] toxic surfaces built, tiles on walk=" + onWalk);
        }

        // ---------------------------------------------------------------- lumps (RM-1 method: stacked rings, superellipse footprint that is a hard upper bound, base lobes, taper, lean, noise, bumpy/jagged top)
        class LumpP { public float dome = 0f, hw, hd, h, n = 2.8f, body = .82f, top = .7f, flareT = .3f, lobeAmp = .18f, lobeDecay = .4f, noise = .12f, lean = .12f, jag = 0f, topBump = .12f, tile = 2.4f, sink = .25f, leanAng = -999f; public int K = 28, R = 10, lobes = 5, seed; }
        // Registers the footprint (inflated for lean) and refuses to place when it would touch a walk tile (shrinks up to 8x first). Height is clamped to the sight wedge unless applyCap is false (elevated caps).
        static bool PlaceLump(string name, Transform parent, Vector3 pos, float yaw, float hw, float hd, float h, int seed, Material mat, float tile, bool trunk, string kind, bool applyCap = true, float leanAng = -999f)
        {
            var fp = new FP { kind = kind, cx = pos.x, cz = pos.z, yaw = yaw }; int sh = 0; bool ok = false;
            while (true)
            {
                fp.hw = hw + 0.3f * Mathf.Min(hw, hd); fp.hd = hd + 0.3f * Mathf.Min(hw, hd);
                if (!FpHitsWalk(fp)) { ok = true; break; }
                if (++sh > 8 || hw < 0.12f) break; hw *= .85f; hd *= .85f;
            }
            if (!ok) return false;
            int tx = Mathf.FloorToInt(pos.x / T), ty = Mathf.FloorToInt(-pos.z / T); int dyEff = -1, nx = -1, ny = -1; float cap = 99f;
            if (applyCap) { cap = WedgeCap(tx, ty, Mathf.Max(hw, hd) * 1.3f, out dyEff, out nx, out ny); h = Mathf.Min(h, cap); }
            else { WedgeCap(tx, ty, Mathf.Max(hw, hd) * 1.3f, out dyEff, out nx, out ny); }
            var rnd = new System.Random(seed); var lp = new LumpP { hw = hw, hd = hd, h = h, seed = seed, tile = tile, leanAng = leanAng };
            if (trunk) { lp.n = 2f; lp.K = 26; lp.R = 20; lp.body = .52f; lp.top = .82f; lp.flareT = .26f; lp.lobes = 3 + rnd.Next(3); lp.lobeAmp = .34f; lp.lobeDecay = .38f; lp.noise = .16f; lp.lean = .10f; lp.jag = .55f; lp.topBump = .06f; }
            else { lp.n = Mathf.Lerp(2.1f, 3.4f, (float)rnd.NextDouble()); lp.body = Mathf.Lerp(.68f, .9f, (float)rnd.NextDouble()); lp.top = Mathf.Lerp(.45f, .8f, (float)rnd.NextDouble()); lp.flareT = Mathf.Lerp(.2f, .4f, (float)rnd.NextDouble()); lp.lobes = 3 + rnd.Next(4); lp.lobeAmp = Mathf.Lerp(.14f, .28f, (float)rnd.NextDouble()); lp.lobeDecay = Mathf.Lerp(.3f, .5f, (float)rnd.NextDouble()); lp.noise = Mathf.Lerp(.10f, .22f, (float)rnd.NextDouble()); lp.lean = Mathf.Lerp(.05f, .26f, (float)rnd.NextDouble()); lp.topBump = Mathf.Lerp(.12f, .26f, (float)rnd.NextDouble()); lp.jag = 0f; lp.dome = Mathf.Lerp(.16f, .34f, (float)rnd.NextDouble()); lp.top = Mathf.Min(lp.top, .66f); }
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.transform.SetPositionAndRotation(pos, Quaternion.Euler(0, yaw, 0));
            go.AddComponent<MeshFilter>().sharedMesh = LumpMesh(lp); var r = go.AddComponent<MeshRenderer>(); r.sharedMaterial = mat; r.shadowCastingMode = ShadowCastingMode.On;
            fps.Add(fp); masses.Add(new Mass { name = name, kind = kind, h = h, cap = cap, dU = dyEff < 0 ? -1f : (dyEff - 1) * T, tx = tx, ty = ty, nx = nx, ny = ny });
            return true;
        }
        static Mesh LumpMesh(LumpP p)
        {
            var rnd = new System.Random(p.seed); float ph = (float)rnd.NextDouble() * 6.283f; float nx = (float)rnd.NextDouble() * 80f; float nz0 = (float)rnd.NextDouble() * 80f; float la0 = (float)rnd.NextDouble() * 6.283f; float la = p.leanAng > -900f ? p.leanAng : la0;
            var lean = new Vector2(Mathf.Cos(la), Mathf.Sin(la)) * p.lean * Mathf.Min(p.hw, p.hd); var verts = new List<Vector3>(); var uvs = new List<Vector2>(); var tris = new List<int>();
            int K = p.K, R = p.R; float perim = Mathf.PI * (p.hw + p.hd);
            for (int j = 0; j <= R; j++)
            {
                float t = j / (float)R, y = Mathf.Lerp(-p.sink, p.h, t);
                float s = Mathf.Lerp(1f, p.body, Smooth(0f, p.flareT, t)) * Mathf.Lerp(1f, p.top, Smooth(p.flareT, 1f, t)); float lamp = p.lobeAmp * (1f - Smooth(0f, p.lobeDecay, t));
                for (int k = 0; k <= K; k++)
                {
                    float th = k / (float)K * 6.2831853f, c = Mathf.Cos(th), sn = Mathf.Sin(th);
                    float rb = Mathf.Pow(Mathf.Pow(Mathf.Abs(c) / p.hw, p.n) + Mathf.Pow(Mathf.Abs(sn) / p.hd, p.n), -1f / p.n);
                    float lobe = 0.5f + 0.5f * Mathf.Cos(p.lobes * th + ph + t * 0.8f);
                    float nv = Mathf.PerlinNoise(nx + c * 1.4f + 5f, nz0 + sn * 1.4f + t * 2.3f);
                    float rad = rb * s * (1f - lamp * (1f - lobe)) * (1f - p.noise * nv);                  // every factor <= 1: the footprint is a hard upper bound
                    float yy = y; if (j == R && p.jag > 0f) yy += p.jag * (Mathf.Abs(Mathf.Sin(th * 2.5f + ph)) * 0.55f - 0.2f);
                    var sh = lean * (t * t);
                    verts.Add(new Vector3(c * rad + sh.x, yy, sn * rad + sh.y)); uvs.Add(new Vector2(k / (float)K * perim / p.tile, (y + p.sink) / p.tile));
                }
            }
            int stride = K + 1; var sideTris = new List<int>();
            for (int j = 0; j < R; j++) for (int k = 0; k < K; k++)
                {
                    int a0 = j * stride + k, a1 = a0 + 1, b0 = a0 + stride, b1 = b0 + 1;
                    sideTris.AddRange(new[] { a0, b0, a1, a1, b0, b1 });
                }
            { var va = verts[sideTris[0]]; var vb = verts[sideTris[1]]; var vc = verts[sideTris[2]]; if (Vector3.Dot(Vector3.Cross(vb - va, vc - va), new Vector3(va.x - lean.x * 0f, 0, va.z)) < 0f) for (int i = 0; i < sideTris.Count; i += 3) { int tmp = sideTris[i + 1]; sideTris[i + 1] = sideTris[i + 2]; sideTris[i + 2] = tmp; } }
            tris.AddRange(sideTris);
            // top cap: concentric rings shrinking to the centre, bumpy heights, planar uv (no pole pinch)
            int ringBase = verts.Count; var topRing = new List<Vector3>(); for (int k = 0; k < K; k++) topRing.Add(verts[R * stride + k]);
            var cen = Vector3.zero; foreach (var v in topRing) cen += v; cen /= K; float[] sc = { 1f, .68f, .36f }; int ringsN = sc.Length;
            for (int r = 0; r < ringsN; r++) for (int k = 0; k < K; k++)
                {
                    var v = topRing[k]; var q = new Vector3(Mathf.Lerp(cen.x, v.x, sc[r]), v.y, Mathf.Lerp(cen.z, v.z, sc[r]));
                    float bump = (Mathf.PerlinNoise(nx + q.x * 1.7f, nz0 + q.z * 1.7f) - .45f) * p.topBump * p.h * (r == 0 ? .5f : 1f) * 2f; q.y = Mathf.Max(v.y + bump, v.y - .25f * p.h) + p.h * p.dome * (1f - sc[r] * sc[r]); if (p.jag > 0f && r > 0) q.y -= p.jag * .3f * (r / (float)ringsN);
                    verts.Add(q); uvs.Add(new Vector2(q.x, q.z) / p.tile);
                }
            int centerIdx = verts.Count; verts.Add(new Vector3(cen.x, topRing.Count > 0 ? cen.y - (p.jag > 0f ? p.jag * .35f : -p.topBump * p.h * .25f) : cen.y, cen.z)); uvs.Add(new Vector2(cen.x, cen.z) / p.tile);
            var capTris = new List<int>();
            for (int r = 0; r < ringsN - 1; r++) for (int k = 0; k < K; k++)
                {
                    int k1 = (k + 1) % K; int o0 = ringBase + r * K + k, o1 = ringBase + r * K + k1, i0 = ringBase + (r + 1) * K + k, i1 = ringBase + (r + 1) * K + k1;
                    capTris.AddRange(new[] { o0, i0, o1, o1, i0, i1 });
                }
            for (int k = 0; k < K; k++) { int k1 = (k + 1) % K; capTris.AddRange(new[] { ringBase + (ringsN - 1) * K + k, centerIdx, ringBase + (ringsN - 1) * K + k1 }); }
            for (int i = 0; i < capTris.Count; i += 3) { var va = verts[capTris[i]]; var vb = verts[capTris[i + 1]]; var vc = verts[capTris[i + 2]]; if (Vector3.Cross(vb - va, vc - va).y < 0f) { int tmp = capTris[i + 1]; capTris[i + 1] = capTris[i + 2]; capTris[i + 2] = tmp; } }   // cap faces up
            tris.AddRange(capTris);
            var m = new Mesh { name = "Lump", indexFormat = IndexFormat.UInt32 }; m.SetVertices(verts); m.SetUVs(0, uvs); m.SetTriangles(tris, 0); m.RecalculateNormals();
            var nrm = m.normals; for (int j = 0; j <= R; j++) { var n = (nrm[j * stride] + nrm[j * stride + K]).normalized; nrm[j * stride] = n; nrm[j * stride + K] = n; } m.normals = nrm;   // hide the uv seam
            m.RecalculateBounds(); m.RecalculateTangents(); return m;
        }
        // irregular tube along a path (roots / limbs / logs); the end is a flat broken cap when capEnd is set
        static Mesh TubeMesh(List<Vector3> path, float r0, float r1, int sides, int seed, float tile, bool capEnd, float irregular)
        {
            var rnd = new System.Random(seed); int M = path.Count; var verts = new List<Vector3>(); var uvs = new List<Vector2>(); var tris = new List<int>(); float along = 0f; float ph = (float)rnd.NextDouble() * 6.28f;
            for (int i = 0; i < M; i++)
            {
                var tg = (path[Mathf.Min(i + 1, M - 1)] - path[Mathf.Max(i - 1, 0)]).normalized; var n = Vector3.Cross(tg, Vector3.up); if (n.sqrMagnitude < 1e-4f) n = Vector3.Cross(tg, Vector3.right); n.Normalize(); var b = Vector3.Cross(tg, n);
                if (i > 0) along += (path[i] - path[i - 1]).magnitude; float r = Mathf.Lerp(r0, r1, i / (M - 1f));
                for (int k = 0; k <= sides; k++)
                {
                    float th = k / (float)sides * 6.2831853f; float rr = r * (1f + irregular * 0.18f * (Mathf.PerlinNoise(seed * .01f + k * .9f, i * .7f) - .5f) * 2f);
                    verts.Add(path[i] + (Mathf.Cos(th) * n + Mathf.Sin(th) * b) * rr); uvs.Add(new Vector2(k / (float)sides * 6.2831853f * r0 / tile, along / tile));
                }
            }
            int stride = sides + 1;
            for (int i = 0; i < M - 1; i++) for (int k = 0; k < sides; k++)
                {
                    int a0 = i * stride + k, a1 = a0 + 1, b0 = a0 + stride, b1 = b0 + 1; int[] tr = { a0, b0, a1, a1, b0, b1 };
                    for (int q = 0; q < 6; q += 3) { var va = verts[tr[q]]; var vb = verts[tr[q + 1]]; var vc = verts[tr[q + 2]]; var cen = path[i]; if (Vector3.Dot(Vector3.Cross(vb - va, vc - va), (va + vb + vc) / 3f - cen) < 0f) { int tmp = tr[q + 1]; tr[q + 1] = tr[q + 2]; tr[q + 2] = tmp; } }
                    tris.AddRange(tr);
                }
            if (capEnd)
            {
                int c = verts.Count; verts.Add(path[M - 1] + (path[M - 1] - path[M - 2]).normalized * 0.02f); uvs.Add(new Vector2(.5f, .5f)); int last = (M - 1) * stride;
                for (int k = 0; k < sides; k++) { int a = last + k, bb = last + k + 1; var va = verts[a]; var vb = verts[bb]; var vc = verts[c]; var o = (path[M - 1] - path[M - 2]); if (Vector3.Dot(Vector3.Cross(vb - va, vc - va), o) < 0f) { tris.AddRange(new[] { a, c, bb }); } else tris.AddRange(new[] { a, bb, c }); }
            }
            var m = new Mesh { name = "Tube", indexFormat = IndexFormat.UInt32 }; m.SetVertices(verts); m.SetUVs(0, uvs); m.SetTriangles(tris, 0); m.RecalculateNormals(); m.RecalculateBounds(); m.RecalculateTangents(); return m;
        }
        // a tube is placed only if every sampled point of its ground projection is clear of walk tiles; its samples count as footprints for the walk-overlap check
        static bool PlaceTube(string name, Transform parent, List<Vector3> path, float r0, float r1, int seed, Material mat, string kind, bool capEnd, bool checkFp = true)
        {
            var tfp = new List<FP>();
            if (checkFp) { foreach (var p in path) { var f = new FP { kind = kind, cx = p.x, cz = p.z, hw = Mathf.Max(r0, r1) + 0.05f, circle = true }; if (FpHitsWalk(f)) return false; tfp.Add(f); } }
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.AddComponent<MeshFilter>().sharedMesh = TubeMesh(path, r0, r1, 8, seed, 1.6f, capEnd, 1.0f);
            var r = go.AddComponent<MeshRenderer>(); r.sharedMaterial = mat; r.shadowCastingMode = ShadowCastingMode.On; fps.AddRange(tfp); return true;
        }

        // ---------------------------------------------------------------- landmarks (plan LM1..LM5) and island fills (F1..F6)
        // one lump per 8-connected component of the item's tiles (footprint = bbox * 0.9, shrunk until clear of walk tiles)
        static int ComponentLumps(BItem it, string prefix, float hMax, Material mat, string kind, int seedBase, Transform root)
        {
            var set = new HashSet<int>(); var order = new List<int>(); for (int i = 0; i + 1 < it.tiles.Length; i += 2) { int k = Key(it.tiles[i], it.tiles[i + 1]); if (set.Add(k)) order.Add(k); }
            var seen = new HashSet<int>(); int ci = 0, placed = 0;
            foreach (int k0 in order)
            {
                if (seen.Contains(k0)) continue; var comp = new List<int>(); var q = new Queue<int>(); q.Enqueue(k0); seen.Add(k0);
                while (q.Count > 0) { int c = q.Dequeue(); comp.Add(c); int cx = c % 200, cy = c / 200; for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) { int nk = Key(cx + dx, cy + dy); if (cx + dx >= 0 && cx + dx < 200 && set.Contains(nk) && seen.Add(nk)) q.Enqueue(nk); } }
                float mx = 0, mz = 0; int bx0 = 999, by0 = 999, bx1 = -1, by1 = -1; foreach (int c in comp) { int tx = c % 200, ty = c / 200; mx += (tx + .5f) * T; mz += -(ty + .5f) * T; bx0 = Mathf.Min(bx0, tx); by0 = Mathf.Min(by0, ty); bx1 = Mathf.Max(bx1, tx); by1 = Mathf.Max(by1, ty); }
                mx /= comp.Count; mz /= comp.Count; float w = Mathf.Max(0.4f, (bx1 - bx0 + 1) * T * .9f), d = Mathf.Max(0.4f, (by1 - by0 + 1) * T * .9f); float yaw = (Hash(bx0, by0) - .5f) * 30f;
                if (PlaceLump(prefix + "_" + (ci).ToString("00"), root, new Vector3(mx, GroundY(mx, mz), mz), yaw, w * .5f, d * .5f, comp.Count < 4 ? hMax * .6f : hMax, seedBase + ci * 17, mat, 2.4f, false, kind)) placed++;
                ci++;
            }
            return placed;
        }
        static Vector3 TileW(float tx, float ty) { var w = W(tx, ty); w.y = GroundY(w.x, w.z); return w; }
        static void BuildLandmarks(Transform root, Mats mats)
        {
            // fills first (boss gate / boss pillars / first mushroom / altar / camp / cocoons = the web's collision islands), all low (<= 0.9u) and camera-side
            foreach (var f in build.fills) { int n = ComponentLumps(f, "Fill_" + f.id, Mathf.Max(0.3f, f.maxH), mats.Bark, "fill-" + f.id, 7000 + f.id[1] * 101, root); Debug.Log("[RM2] fill " + f.id + " lumps=" + n); }
            // LM1 fallen twisted giant tree on the web corpse-tree island: root-plate mound + a log lying east-west; every part <= 0.9u
            var lm1 = Item(build.landmarks, "LM1"); ComponentLumps(lm1, "LM1_Mound", 0.8f, mats.Bark, "lm1", 8100, root);
            { var path = new List<Vector3>(); for (int k = 0; k <= 10; k++) { float tx = 77f + k * 1.2f; var p = TileW(tx, 80.5f); p.y += 0.36f + 0.05f * Mathf.Sin(k * .9f); p.z += 0.10f * Mathf.Sin(k * 1.3f); path.Add(p); } PlaceTube("LM1_Log", root, path, 0.38f, 0.30f, 8101, mats.Bark, "lm1-log", true); }
            { var p = TileW(76.5f, 80.5f); PlaceLump("LM1_RootPlate", root, p, 20f, 0.9f, 0.9f, 0.85f, 8102, mats.Bark, 2.4f, true, "lm1"); }
            // LM2 blocked-water bank: a long low mound across the west band, two roots reaching toward the stagnant pool and the dry bed
            var lm2 = Item(build.landmarks, "LM2");
            { var p = TileW(lm2.r[0] + .5f, lm2.r[1] + .5f); PlaceLump("LM2_Bank", root, p, 0f, lm2.r[2] * T * .9f, lm2.r[3] * T * .9f, 0.85f, 8200, mats.Mass, 2.4f, false, "lm2");
              foreach (int sg in new[] { -1, 1 }) { var path = new List<Vector3>(); for (int k = 0; k <= 8; k++) { float t = k / 8f; var q = TileW(lm2.r[0] + .5f + sg * (1f + 4.2f * t), lm2.r[1] + .5f + 1.2f * Mathf.Sin(t * 2.6f + sg)); q.y += 0.30f * (1f - t) + 0.05f; path.Add(q); } PlaceTube("LM2_Root_" + (sg < 0 ? "W" : "E"), root, path, 0.20f, 0.06f, 8201 + sg, mats.Bark, "lm2-root", false); } }
            // LM3 twin leaning trees: two tall trunks leaning toward each other, joined by a high arch limb
            var lm3 = Item(build.landmarks, "LM3"); var tA = TileW(lm3.r[0] + .5f, lm3.r[1] + .5f); var tB = TileW(lm3.pair[0] + .5f, lm3.pair[1] + .5f);
            { float angAB = Mathf.Atan2(tB.z - tA.z, tB.x - tA.x); PlaceLump("LM3_TreeA", root, tA, 0f, 0.95f, 0.95f, 5.2f, 8300, mats.Bark, 2.0f, true, "lm3", true, angAB);
              PlaceLump("LM3_TreeB", root, tB, 0f, 0.95f, 0.95f, 4.7f, 8301, mats.Bark, 2.0f, true, "lm3", true, angAB + Mathf.PI);
              var arch = new List<Vector3>(); for (int k = 0; k <= 10; k++) { float t = k / 10f; var p = Vector3.Lerp(tA, tB, t); p.y = Mathf.Lerp(tA.y, tB.y, t) + 3.9f + 1.1f * Mathf.Sin(t * Mathf.PI); arch.Add(p); }
              PlaceTube("LM3_Arch", root, arch, 0.24f, 0.19f, 8302, mats.Bark, "lm3-arch", false, false); }
            // LM4 furrow mushroom field: four east-west ridges between three toxic ditches, giant stalked mushrooms along the ridges
            var lm4 = Item(build.landmarks, "LM4"); int mi = 0;
            foreach (float ry in new[] { 58f, 62f, 66f, 70f })
            {
                var c = TileW(161f, ry + .5f); PlaceLump("LM4_Ridge_" + ry, root, c, 0f, 11f * T * .95f, 1.3f * T, 0.55f + 0.1f * ((ry - 58f) / 4f), 8400 + (int)ry, mats.Mass, 2.4f, false, "lm4");
                for (int k = 0; k < 4; k++)
                {
                    float tx = 153f + k * 5.5f + (Hash((int)ry, k) - .5f) * 2f; var b = TileW(tx, ry + .5f); float sh = 2.2f + 1.2f * Hash(k, (int)ry), cr = 0.85f + 0.4f * Hash((int)ry, k + 7);
                    if (PlaceLump("LM4_Stalk_" + mi, root, b, 0f, 0.24f, 0.24f, sh, 8450 + mi, mats.Mass, 1.4f, true, "lm4-stalk")) PlaceLump("LM4_Cap_" + mi, root, b + new Vector3(0, sh - 0.2f, 0), Hash(mi, 3) * 180f, cr, cr * (0.8f + .3f * Hash(mi, 5)), 0.6f, 8470 + mi, mats.Mass, 2.0f, false, "lm4-cap", false);
                    mi++;
                }
            }
            // LM5 hanging tree: tall trunk, three limbs, cocoons hanging from the limb ends on strands
            var lm5 = Item(build.landmarks, "LM5"); var t5 = TileW(lm5.r[0] + .5f, lm5.r[1] + .5f);
            if (PlaceLump("LM5_Trunk", root, t5, 0f, 0.9f, 0.9f, 4.8f, 8500, mats.Bark, 2.0f, true, "lm5"))
                for (int k = 0; k < 3; k++)
                {
                    float ang = (k * 118f + 30f) * Mathf.Deg2Rad; var dir = new Vector3(Mathf.Cos(ang), 0, Mathf.Sin(ang)); var path = new List<Vector3>();
                    for (int q = 0; q <= 8; q++) { float t = q / 8f; var p = t5 + dir * (0.3f + 1.9f * t); p.y = t5.y + 3.3f + 0.9f * t - 0.5f * t * t; path.Add(p); }
                    PlaceTube("LM5_Limb_" + k, root, path, 0.22f, 0.06f, 8510 + k, mats.Bark, "lm5-limb", true, false);
                    var end = path[path.Count - 1]; var strand = new List<Vector3> { end, end + Vector3.down * 0.5f, end + Vector3.down * 1.0f };
                    PlaceTube("LM5_Strand_" + k, root, strand, 0.03f, 0.03f, 8520 + k, mats.Bark, "lm5-strand", false, false);
                    PlaceLumpFree("LM5_Cocoon_" + k, root, end + Vector3.down * 1.9f, 0.26f, 0.26f, 0.9f, 8530 + k, mats.Mass);
                }
            // TX4: a stump in the middle of the web pool island (toxic surface = the rest of the island)
            { var p = TileW(49.5f, 151.5f); p.y = -0.12f; PlaceLump("TX4_Stump", root, p, 0f, 0.3f, 0.3f, 0.9f, 8600, mats.Bark, 1.4f, true, "tx4"); }
        }
        // elevated lump (hanging cocoon): high above the ground, so no wedge cap and no walk-footprint check beyond its projection being on blocked tiles (the strand it hangs from was placed over blocked tiles)
        static void PlaceLumpFree(string name, Transform parent, Vector3 pos, float hw, float hd, float h, int seed, Material mat)
        {
            var lp = new LumpP { hw = hw, hd = hd, h = h, seed = seed, tile = 1.4f, n = 2.4f, lean = .05f, noise = .12f, lobes = 3, lobeAmp = .12f, topBump = .08f, dome = .2f, sink = 0.05f, K = 20, R = 8 };
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.transform.position = pos; go.AddComponent<MeshFilter>().sharedMesh = LumpMesh(lp);
            var r = go.AddComponent<MeshRenderer>(); r.sharedMaterial = mat; r.shadowCastingMode = ShadowCastingMode.On;
        }

        // ---------------------------------------------------------------- generic masses along the walk border (RM-1 rings), never on planned tiles, wedge-capped
        static void BuildMasses(Transform root, Mats mats)
        {
            var rnd = new System.Random(2103); var placed = new List<Vector2>(); int count = 0;
            foreach (var (dmin, dmax, sep, hLo, hHi) in new[] { (2, 3, 6f, 1.5f, 3.0f), (5, 8, 8f, 2.6f, 4.8f) })
            {
                var cand = new List<Vector2>();
                for (int ty = TY0; ty < TY1; ty++) for (int tx = TX0; tx < TX1; tx++)
                    { if (Walk(tx, ty) || Planned(tx, ty, 2)) continue; int d = distWalk[ty, tx]; if (d < dmin || d > dmax) continue; cand.Add(new Vector2(tx + .5f, ty + .5f)); }
                for (int i = cand.Count - 1; i > 0; i--) { int j = rnd.Next(i + 1); (cand[i], cand[j]) = (cand[j], cand[i]); }
                foreach (var c in cand)
                {
                    bool ok = true; foreach (var p in placed) if ((p - c).magnitude < sep) { ok = false; break; }
                    if (!ok) continue; placed.Add(c);
                    float w = Mathf.Lerp(2.0f, 3.6f, (float)rnd.NextDouble()), dp = Mathf.Lerp(1.6f, 3.0f, (float)rnd.NextDouble()), hh = Mathf.Lerp(hLo, hHi, (float)rnd.NextDouble());
                    float yaw = (float)rnd.NextDouble() * 360f; var wp = W(c.x, c.y); float gy = GroundY(wp.x, wp.z);
                    if (PlaceLump("Mass_" + (count).ToString("000"), root, new Vector3(wp.x, gy, wp.z), yaw, w * .5f, dp * .5f, hh, 5000 + count * 13, mats.Mass, 2.4f, false, "mass")) count++; else placed.RemoveAt(placed.Count - 1);
                }
            }
            Debug.Log("[RM2] masses=" + count);
        }

        // ---------------------------------------------------------------- invisible-wall check: every blocked island inside the walk area must be covered by a visible object; leftovers get small fillers on blocked tiles only
        static bool Covered(int tx, int ty)
        {
            if (toxicSet.Contains(Key(tx, ty))) return true;
            float px = (tx + .5f) * T, pz = -(ty + .5f) * T;
            foreach (var f in fps) if (InFP(f, px, pz, 0.6f * T)) return true;
            return false;
        }
        static void CheckIslands(Transform root, Mats mats)
        {
            var items = new List<string>(); int fillers = 0, id = 0, totalTiles = 0, totalUncoveredBefore = 0, totalUncoveredAfter = 0;
            foreach (var isl in islands)
            {
                int x0 = isl.bbox[0], y0 = isl.bbox[1], x1 = isl.bbox[2], y1 = isl.bbox[3]; int tiles = 0, before = 0, after = 0;
                for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++) if (!Walk(tx, ty)) { tiles++; if (!Covered(tx, ty)) before++; }
                for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++)
                    {
                        if (Walk(tx, ty) || Covered(tx, ty)) continue;
                        var wp = TileW(tx + .5f, ty + .5f);
                        if (PlaceLump("IslandFill_" + (fillers).ToString("00"), root, wp, Hash(tx, ty) * 90f, 0.18f, 0.18f, 0.45f, 9000 + fillers * 7, mats.Bark, 1.4f, false, "island-fill")) fillers++;
                    }
                for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++) if (!Walk(tx, ty) && !Covered(tx, ty)) after++;
                items.Add("{\"id\":" + (id++) + ",\"bbox\":[" + x0 + "," + y0 + "," + x1 + "," + y1 + "],\"tiles\":" + tiles + ",\"uncoveredBeforeFill\":" + before + ",\"uncoveredAfterFill\":" + after + "}");
                totalTiles += tiles; totalUncoveredBefore += before; totalUncoveredAfter += after;
            }
            WriteData("rm2_islands.json", "{\"rule\":\"every blocked island inside the walk area (web collision islands: corpse tree, altar, camp, cocoon, pool, boss gate/pillars, the 1-tile mushroom) must be covered by a visible 3D object or toxic surface (tile centre within 0.6 tile of a footprint); leftovers get small fillers on blocked tiles only\",\"islands\":" + islands.Length + ",\"tiles\":" + totalTiles + ",\"uncoveredBeforeFill\":" + totalUncoveredBefore + ",\"uncoveredAfterFill\":" + totalUncoveredAfter + ",\"fillers\":" + fillers + ",\"items\":[" + string.Join(",", items) + "]}");
            Debug.Log("[RM2] islands=" + islands.Length + " uncovered before=" + totalUncoveredBefore + " after=" + totalUncoveredAfter + " fillers=" + fillers);
        }

        // Counts walk tiles whose centre lies inside a 3D footprint; "deep" = centre at least 0.5 tile inside the footprint edge. Toxic surfaces are built from blocked tiles only (counted in BuildToxic).
        static void WalkOverlap()
        {
            int any = 0, deep = 0, walkTiles = 0; var byKind = new Dictionary<string, int>(); var tiles = new List<string>();
            for (int ty = TY0; ty < TY1; ty++) for (int tx = TX0; tx < TX1; tx++)
                {
                    if (!Walk(tx, ty)) continue; walkTiles++; float px = (tx + .5f) * T, pz = -(ty + .5f) * T; string hit = null; bool dp = false;
                    foreach (var f in fps) if (InFP(f, px, pz, 0f)) { hit = f.kind; dp = InFP(f, px, pz, -0.5f * T); break; }
                    if (hit == null) continue; any++; if (dp) deep++; byKind[hit] = byKind.TryGetValue(hit, out var n) ? n + 1 : 1; if (tiles.Count < 400) tiles.Add("[" + tx + "," + ty + ",\"" + hit + "\"]");
                }
            var kinds = new List<string>(); foreach (var kv in byKind) kinds.Add("\"" + kv.Key + "\":" + kv.Value);
            WriteData("rm2_walk_overlap.json", "{\"window\":[" + TX0 + "," + TY0 + "," + TX1 + "," + TY1 + "],\"walkTiles\":" + walkTiles + ",\"footprints\":" + fps.Count + ",\"walkTilesCoveredCentre\":" + any + ",\"walkTilesCoveredDeep05\":" + deep + ",\"byKind\":{" + string.Join(",", kinds) + "},\"tiles\":[" + string.Join(",", tiles) + "]}");
            Debug.Log("[RM2] walk overlap centre=" + any + " deep(>=0.5 tile)=" + deep + " of " + walkTiles);
        }

        // ---------------------------------------------------------------- sight wedge list: every lump above 0.9u that has walkable ground north of it (tall ones with none within 40 tiles are exempt: nothing walkable behind them)
        static void WriteWedge()
        {
            var tall = new List<string>(); int over = 0, exempt = 0, viol = 0; float maxH = 0f;
            foreach (var m in masses)
            {
                if (m.h > 0.9f + 1e-3f) { if (m.nx < 0) { exempt++; continue; } over++; tall.Add("{\"name\":\"" + m.name + "\",\"kind\":\"" + m.kind + "\",\"h\":" + F(m.h) + ",\"cap\":" + F(m.cap) + ",\"dU\":" + F(m.dU) + ",\"tx\":" + m.tx + ",\"ty\":" + m.ty + ",\"nx\":" + m.nx + ",\"ny\":" + m.ny + "}"); }
                else if (m.nx >= 0) maxH = Mathf.Max(maxH, m.h);
                if (m.nx >= 0 && m.h > m.cap + 1e-3f) viol++;
            }
            WriteData("rm2_wedge.json", "{\"rule\":\"h <= 0.9 + tan(pitch 0.85 rad) * D, D = horizontal distance (u) from the mass' north end to the nearest walk tile centre north of it; lumps carry an 8% margin (cap = rule * 0.92)\",\"lumps\":" + masses.Count + ",\"lumpsWithWalkNorth\":" + (masses.Count - exempt - CountNoWalkNorthLow()) + ",\"overOnePointNine\":" + over + ",\"exemptNoWalkNorth\":" + exempt + ",\"capViolations\":" + viol + ",\"maxHeightOfLowLumps\":" + F(maxH) + ",\"tall\":[" + string.Join(",", tall) + "]}");
            Debug.Log("[RM2] wedge lumps=" + masses.Count + " over0.9=" + over + " exempt=" + exempt + " capViolations=" + viol);
        }
        static int CountNoWalkNorthLow() { int n = 0; foreach (var m in masses) if (m.nx < 0 && m.h <= 0.9f + 1e-3f) n++; return n; }

        // Hero light layer: every renderer of this scene must keep the default rendering-layer mask (the Hero layer is added by the character session)
        static void HeroCheck()
        {
            int total = 0, nonDefault = 0;
            foreach (var r in UnityEngine.Object.FindObjectsByType<Renderer>(FindObjectsSortMode.None)) { total++; if ((uint)r.renderingLayerMask != 1u) nonDefault++; }
            WriteData("rm2_hero_layer.json", "{\"renderers\":" + total + ",\"nonDefaultRenderingLayerMask\":" + nonDefault + ",\"rule\":\"map renderers use the default layer only; Hero must stay unused\"}");
            Debug.Log("[RM2] hero layer renderers=" + total + " nonDefault=" + nonDefault);
        }

        // Rendered-object check (RM-3 lesson: footprint / wedge numbers come from the placement data, not from what is drawn; RM-3 passed all numbers while its mushroom meshes piled up at the origin).
        // Every position in this builder is passed as a WORLD value (SetPositionAndRotation, mesh vertices in world space), which is only right while World and Blockout sit at identity, so that is asserted here;
        // then every MeshRenderer's world bounds centre must lie inside the terrain window (+6u for hanging cocoons / lean) and none may sit at the origin.
        static void RenderBoundsCheck(Transform world, Transform blockout)
        {
            bool Ident(Transform t) { return t.position.sqrMagnitude < 1e-8f && Quaternion.Angle(t.rotation, Quaternion.identity) < 1e-3f && (t.lossyScale - Vector3.one).sqrMagnitude < 1e-8f; }
            bool parentsIdentity = Ident(world) && Ident(blockout);
            float x0 = TX0 * T - 6f, x1 = TX1 * T + 6f, zS = -TY1 * T - 6f, zN = -TY0 * T + 6f; int total = 0, outside = 0, atOrigin = 0; var bad = new List<string>();
            foreach (var r in UnityEngine.Object.FindObjectsByType<MeshRenderer>(FindObjectsSortMode.None))
            {
                total++; var c = r.bounds.center; bool origin = Mathf.Abs(c.x) < 0.5f && Mathf.Abs(c.z) < 0.5f; bool outWin = c.x < x0 || c.x > x1 || c.z < zS || c.z > zN;
                if (origin) atOrigin++; if (outWin) outside++; if ((origin || outWin) && bad.Count < 40) bad.Add("\"" + r.gameObject.name + "\"");
            }
            WriteData("rm2_render_bounds.json", "{\"rule\":\"World and Blockout at identity (all builder positions are world values); every MeshRenderer bounds centre inside the terrain window +6u and none at the origin\",\"parentsIdentity\":" + (parentsIdentity ? "true" : "false") + ",\"renderers\":" + total + ",\"outsideWindow\":" + outside + ",\"atOrigin\":" + atOrigin + ",\"offenders\":[" + string.Join(",", bad) + "]}");
            if (!parentsIdentity || outside > 0 || atOrigin > 0) Debug.LogError("[RM2] render bounds FAIL parentsIdentity=" + parentsIdentity + " outside=" + outside + " atOrigin=" + atOrigin); else Debug.Log("[RM2] render bounds ok renderers=" + total);
        }

        // ---------------------------------------------------------------- lighting: weak key, light pools (Lights/Pools/Pool_Hell_NN, Pool_Toxic_NN), hell shafts, low fog (same values as RM-1 / RM0-LIGHT defaults)
        static void BuildLighting(Mats mats)
        {
            var sunGo = new GameObject("Key Light"); var sun = sunGo.AddComponent<Light>(); sun.type = LightType.Directional;
            sun.color = new Color(1f, .80f, .70f); sun.intensity = 0.6f; sun.shadows = LightShadows.Soft; sun.shadowStrength = 0.8f;
            sunGo.transform.rotation = Quaternion.Euler(50f, 135f, 0f);
            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(.19f, .12f, .11f); RenderSettings.ambientEquatorColor = new Color(.12f, .075f, .07f); RenderSettings.ambientGroundColor = new Color(.05f, .03f, .03f);
            RenderSettings.subtractiveShadowColor = ShadowCol;
            RenderSettings.fog = true; RenderSettings.fogMode = FogMode.ExponentialSquared; RenderSettings.fogColor = FogLow; RenderSettings.fogDensity = 0.018f;
            var vol = new GameObject("Global Volume").AddComponent<Volume>(); vol.isGlobal = true;
            vol.sharedProfile = AssetDatabase.LoadAssetAtPath<VolumeProfile>("Assets/Exoduser/Rendering/GlobalVolume_Hell.asset");

            var pools = new GameObject("Lights").transform; var parent = new GameObject("Pools").transform; parent.SetParent(pools, false);
            void PoolLight(string name, float tx, float ty, Color col, float range, float intensity, float h)
            {
                var go = new GameObject(name); go.transform.SetParent(parent, false); go.transform.position = W(tx + .5f, ty + .5f, h);
                var l = go.AddComponent<Light>(); l.type = LightType.Point; l.color = col; l.range = range; l.intensity = intensity; l.shadows = LightShadows.None;
            }
            int n = 1; foreach (var p in build.pools) PoolLight("Pool_Hell_" + (n++).ToString("00"), p.x, p.y, LightHell, 5.6f, 6.5f, 1.3f);
            n = 1; foreach (var t in build.toxic) PoolLight("Pool_Toxic_" + (n++).ToString("00"), t.light[0], t.light[1], LightToxic, t.id == "TX1" ? 4.6f : 3.8f, t.id == "TX1" ? 2.4f : 1.9f, 0.7f);
            var shafts = new GameObject("Shafts").transform; int si = 0;
            foreach (var p in build.pools) if (p.shaft) { si++; MakeShaft(shafts, "Shaft_Hell_" + si.ToString("00"), new Vector2(p.x + .5f, p.y + .5f), si % 2 == 1 ? mats.Shaft1 : mats.Shaft2); }
        }
        static void MakeShaft(Transform parent, string name, Vector2 groundTile, Material mat)
        {
            var ground = W(groundTile.x, groundTile.y, 0f); var top = ground + new Vector3(-3.6f, 10.5f, 3.4f);
            var axis = (top - ground).normalized; var toCam = new Vector3(0f, Mathf.Sin(Pitch), -Mathf.Cos(Pitch)).normalized;
            var right = Vector3.Cross(axis, toCam).normalized * 0.9f;
            var m = new Mesh { name = name };
            m.SetVertices(new[] { top - right, top + right, ground - right, ground + right }); m.SetUVs(0, new[] { new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1) });
            m.SetTriangles(new[] { 0, 1, 2, 2, 1, 3 }, 0); m.RecalculateNormals(); m.RecalculateBounds(); SaveMesh(m, name);
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.AddComponent<MeshFilter>().sharedMesh = m;
            var mr = go.AddComponent<MeshRenderer>(); mr.sharedMaterial = mat; mr.shadowCastingMode = ShadowCastingMode.Off; mr.receiveShadows = false;
        }

        // ---------------------------------------------------------------- camera: LOOK-001 perspective (pitch .85 rad elevation, distance 1400px = 14u, vertical FOV = 2*atan(H/(2*1400)))
        static Transform BuildCamera()
        {
            var camGo = new GameObject("Main Camera") { tag = "MainCamera" }; var cam = camGo.AddComponent<Camera>();
            cam.orthographic = false; cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = Hex("#060403"); cam.nearClipPlane = 0.3f; cam.farClipPlane = 160f;
            float fov = 2f * Mathf.Atan(900f / (2f * 1400f)) * Mathf.Rad2Deg; cam.fieldOfView = fov;
            var offset = new Vector3(0, Mathf.Sin(Pitch), -Mathf.Cos(Pitch)) * DistU; var start = W(100.5f, 185.5f);
            camGo.transform.SetPositionAndRotation(start + offset, Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0));
            camGo.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing = true;
            camGo.AddComponent<CinemachineBrain>().DefaultBlend = new CinemachineBlendDefinition(CinemachineBlendDefinition.Styles.Cut, 0); camGo.AddComponent<AudioListener>();

            var marker = new GameObject("Player Marker"); marker.transform.position = new Vector3(start.x, GroundY(start.x, start.z), start.z);
            var actor = new GameObject("Marker Sprite"); actor.transform.SetParent(marker.transform, false); actor.transform.localPosition = new Vector3(0, 0.75f, 0); actor.transform.rotation = Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0);
            var sp = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Exoduser/Rendering/Sandbox/test_sprite.png");
            if (sp != null) { var sr = actor.AddComponent<SpriteRenderer>(); sr.sprite = sp; sr.sharedMaterial = AssetDatabase.LoadAssetAtPath<Material>("Assets/Exoduser/Rendering/Sandbox/SpriteLit3D.mat"); sr.shadowCastingMode = ShadowCastingMode.On; }

            var vcamGo = new GameObject("CM LOOK-001"); var vcam = vcamGo.AddComponent<CinemachineCamera>();
            vcam.Lens = new LensSettings { FieldOfView = fov, ModeOverride = LensSettings.OverrideModes.Perspective, NearClipPlane = 0.3f, FarClipPlane = 160f };
            vcamGo.transform.SetPositionAndRotation(start + offset, Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0));
            var follow = vcamGo.AddComponent<CinemachineFollow>(); follow.FollowOffset = offset;
            var tr = follow.TrackerSettings; tr.PositionDamping = Vector3.zero; tr.BindingMode = Unity.Cinemachine.TargetTracking.BindingMode.WorldSpace; follow.TrackerSettings = tr;
            vcam.Follow = marker.transform; vcam.Priority.Value = 10;
            return marker.transform;
        }

        // ---------------------------------------------------------------- NavMesh from the Core walk grid; report where it differs from CanMove
        static void BuildNavMesh(Transform parent)
        {
            var root = new GameObject("NavWalk"); root.transform.SetParent(parent, false);
            var vs = new List<Vector3>(); var tris = new List<int>();
            for (int ty = TY0; ty < TY1; ty++) for (int tx = TX0; tx < TX1; tx++)
                {
                    if (!Walk(tx, ty)) continue;   // walkable tiles only: no ring, so nothing outside the Core walk grid can become NavMesh
                    int b = vs.Count; vs.Add(W(tx, ty)); vs.Add(W(tx + 1, ty)); vs.Add(W(tx, ty + 1)); vs.Add(W(tx + 1, ty + 1)); tris.AddRange(new[] { b, b + 1, b + 2, b + 2, b + 1, b + 3 });
                }
            var m = new Mesh { name = "NavWalk", indexFormat = IndexFormat.UInt32 }; m.SetVertices(vs); m.SetTriangles(tris, 0); m.RecalculateNormals(); m.RecalculateBounds(); SaveMesh(m, "NavWalk");
            var go = new GameObject("NavWalkMesh"); go.transform.SetParent(root.transform, false); go.AddComponent<MeshFilter>().sharedMesh = m; go.AddComponent<MeshCollider>().sharedMesh = m;
            var surf = root.AddComponent<NavMeshSurface>(); surf.collectObjects = CollectObjects.Children; surf.useGeometry = NavMeshCollectGeometry.PhysicsColliders;
            // bake straight from the walk-tile mesh with a small clearance radius (0.1u): a tile centre is 0.2u from the nearest blocked edge, so every walk tile survives erosion and no blocked tile is covered
            var st = NavMesh.GetSettingsByID(surf.agentTypeID); st.agentRadius = 0.1f; st.agentHeight = 1.6f; st.overrideVoxelSize = true; st.voxelSize = 0.04f; st.minRegionArea = 0f;
            var src = new List<NavMeshBuildSource> { new NavMeshBuildSource { shape = NavMeshBuildSourceShape.Mesh, sourceObject = m, transform = Matrix4x4.identity, area = 0, component = null } };
            var bnd = new Bounds(new Vector3((TX0 + TX1) * .5f * T, 0f, -(TY0 + TY1) * .5f * T), new Vector3((TX1 - TX0) * T + 4f, 8f, (TY1 - TY0) * T + 4f));
            var data = NavMeshBuilder.BuildNavMeshData(st, src, bnd, Vector3.zero, Quaternion.identity);
            surf.navMeshData = data; surf.AddData();
            AssetDatabase.DeleteAsset(GenDir + "/RM2_NavMesh.asset"); AssetDatabase.CreateAsset(surf.navMeshData, GenDir + "/RM2_NavMesh.asset");
            var navOnly = NavDiff(out var coreOnly, out int tested);
            var cj = new List<string>(); foreach (var (tx, ty) in coreOnly) { bool edge = false; for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) if (!Walk(tx + dx, ty + dy)) edge = true; if (cj.Count < 300) cj.Add("{\"tx\":" + tx + ",\"ty\":" + ty + ",\"boundary\":" + (edge ? "true" : "false") + "}"); }
            var nj = new List<string>(); foreach (var (tx, ty) in navOnly) if (nj.Count < 300) nj.Add("[" + tx + "," + ty + "]");
            WriteData("rm2_navmesh_diff.json", "{\"note\":\"NavMesh baked straight from the walk-tile mesh with agentRadius 0.1u (voxel 0.04u, agentHeight 1.6u); mob spacing is set on the NavMeshAgent. Lists are truncated to 300 entries.\",\"window\":[" + TX0 + "," + TY0 + "," + TX1 + "," + TY1 + "],\"tested\":" + tested + ",\"coreWalkNavNo\":" + coreOnly.Count + ",\"navWalkCoreNo\":" + navOnly.Count + ",\"navOnlyTiles\":[" + string.Join(",", nj) + "],\"coreOnlyTiles\":[" + string.Join(",", cj) + "]}");
            Debug.Log("[RM2] navmesh tested=" + tested + " coreWalkNavNo=" + coreOnly.Count + " navWalkCoreNo=" + navOnly.Count);
        }
        static List<(int, int)> NavDiff(out List<(int, int)> coreOnly, out int tested)
        {
            var navOnly = new List<(int, int)>(); coreOnly = new List<(int, int)>(); tested = 0;
            for (int ty = TY0; ty < TY1; ty++) for (int tx = TX0; tx < TX1; tx++)
                {
                    bool core = Walk(tx, ty); var c = W(tx + .5f, ty + .5f); bool nav = NavMesh.SamplePosition(c, out var nh, 0.5f, NavMesh.AllAreas) && new Vector2(nh.position.x - c.x, nh.position.z - c.z).magnitude < 0.06f;
                    tested++; if (core == nav) continue; if (core) coreOnly.Add((tx, ty)); else navOnly.Add((tx, ty));
                }
            return navOnly;
        }

        // ---------------------------------------------------------------- FPS: same START view, 3D layer (World root) on vs off, 1600x900, 240 frames each
        public static void Fps()
        {
            var args = Environment.GetCommandLineArgs(); string Arg(string k, string d) { int i = Array.IndexOf(args, k); return i >= 0 ? args[i + 1] : d; }
            AudioListener.volume = 0f; var outJson = Arg("-out", "rm2-fps.json"); Load(); EditorSceneManager.OpenScene(ScenePath);
            var marker = GameObject.Find("Player Marker").transform; var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>(); terrain = UnityEngine.Object.FindFirstObjectByType<Terrain>();
            var w0 = W(100.5f, 185.5f); marker.position = new Vector3(w0.x, GroundY(w0.x, w0.z), w0.z); brain.ManualUpdate();
            var world = GameObject.Find("World"); var rt = new RenderTexture(1600, 900, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 }; cam.targetTexture = rt;
            var tex = new Texture2D(4, 4, TextureFormat.RGB24, false); var res = new List<string>();
            foreach (var on in new[] { true, false, true })
            {
                world.SetActive(on); for (int i = 0; i < 20; i++) cam.Render(); RenderTexture.active = rt; tex.ReadPixels(new Rect(0, 0, 4, 4), 0, 0);
                var sw = System.Diagnostics.Stopwatch.StartNew(); const int N = 240; for (int i = 0; i < N; i++) cam.Render(); RenderTexture.active = rt; tex.ReadPixels(new Rect(0, 0, 4, 4), 0, 0); sw.Stop();
                res.Add("{\"world3d\":" + (on ? "true" : "false") + ",\"frames\":" + N + ",\"ms\":" + sw.ElapsedMilliseconds + ",\"fps\":" + (N * 1000.0 / sw.ElapsedMilliseconds).ToString("F1", CultureInfo.InvariantCulture) + "}");
            }
            RenderTexture.active = null; cam.targetTexture = null; Directory.CreateDirectory(Path.GetDirectoryName(outJson) ?? "."); File.WriteAllText(outJson, "{\"gpu\":\"" + SystemInfo.graphicsDeviceName + "\",\"note\":\"batchmode camera.Render loop (editor), no vsync cap; relative on/off comparison\",\"runs\":[" + string.Join(",", res) + "]}");
            Debug.Log("[RM2] fps done " + string.Join(" ", res));
        }

        // ---------------------------------------------------------------- capture
        static GameObject MakeCapsule(Transform marker)
        {   // player-size stand-in (1.6u tall, 0.5u wide); hides the sandbox marker sprite
            var ms = marker.Find("Marker Sprite"); if (ms != null) ms.gameObject.SetActive(false);
            var cap = GameObject.CreatePrimitive(PrimitiveType.Capsule); cap.name = "Capture Capsule"; cap.transform.SetParent(marker, false); cap.transform.localPosition = new Vector3(0, 0.8f, 0); cap.transform.localScale = new Vector3(0.5f, 0.8f, 0.5f);
            UnityEngine.Object.DestroyImmediate(cap.GetComponent<Collider>());
            var cm = new Material(Shader.Find("Universal Render Pipeline/Lit")); cm.SetColor("_BaseColor", new Color(.25f, .85f, .95f)); cap.GetComponent<MeshRenderer>().sharedMaterial = cm; return cap;
        }
        static void RenderTo(Camera cam, int w, int h, string file)
        {
            var rt = new RenderTexture(w, h, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 }; cam.targetTexture = rt; cam.Render();
            RenderTexture.active = rt; var tex = new Texture2D(w, h, TextureFormat.RGB24, false); tex.ReadPixels(new Rect(0, 0, w, h), 0, 0); tex.Apply();
            File.WriteAllBytes(file, tex.EncodeToPNG()); RenderTexture.active = null; cam.targetTexture = null; UnityEngine.Object.DestroyImmediate(tex); rt.Release();
        }
        public static void Capture()
        {
            var args = Environment.GetCommandLineArgs(); string Arg(string k, string d) { int i = Array.IndexOf(args, k); return i >= 0 ? args[i + 1] : d; }
            AudioListener.volume = 0f; var outDir = Arg("-outDir", "rm2-cuts"); Directory.CreateDirectory(outDir);
            var cuts = Arg("-cuts", "start,repa,repb,repc").Split(',');
            Load(); EditorSceneManager.OpenScene(ScenePath);
            var marker = GameObject.Find("Player Marker").transform; var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>(); terrain = UnityEngine.Object.FindFirstObjectByType<Terrain>();
            var focus = new Dictionary<string, Vector2> { { "start", new Vector2(100.5f, 185.5f) } };
            string[] ids = { "repa", "repb", "repc" }; for (int i = 0; i < ids.Length && i + 1 < build.cuts.Length; i++) focus[ids[i]] = new Vector2(build.cuts[i + 1].x + .5f, build.cuts[i + 1].y + .5f);
            if (Arg("-shape", "0") == "1")
            {   // shape check only: neutral flat light so silhouettes can be judged independent of the (dark) hell lighting; the saved scene is untouched
                RenderSettings.ambientMode = AmbientMode.Flat; RenderSettings.ambientLight = new Color(.5f, .48f, .47f); RenderSettings.fog = false;
                foreach (var l in UnityEngine.Object.FindObjectsByType<Light>(FindObjectsSortMode.None)) if (l.type == LightType.Directional) { l.intensity = 1.7f; l.color = Color.white; }
            }
            bool capsule = Arg("-capsule", "0") == "1"; if (capsule) MakeCapsule(marker);
            foreach (var cut in cuts)
            {
                if (cut == "top") { CaptureTop(outDir); continue; }
                if (!focus.TryGetValue(cut, out var f)) continue;
                var w = W(f.x, f.y); marker.position = new Vector3(w.x, GroundY(w.x, w.z), w.z);
                brain.ManualUpdate(); RenderTo(cam, 1600, 900, Path.Combine(outDir, "rm2_" + cut + (capsule ? "_cap" : "") + (Arg("-shape", "0") == "1" ? "_shape" : "") + ".png"));
                Debug.Log("[RM2] captured " + cut);
            }
        }
        // orthographic top view of the whole terrain window with the Core walk tiles overlaid in translucent green
        static void CaptureTop(string outDir)
        {
            var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>(); if (brain != null) brain.enabled = false;
            const int Wpx = 2560; int Hpx = Mathf.RoundToInt(Wpx * (TY1 - TY0) / (float)(TX1 - TX0)); const float x0 = TX0 * T, x1 = TX1 * T; float zN = -TY0 * T, zS = -TY1 * T;
            cam.orthographic = true; cam.orthographicSize = (zN - zS) * .5f; cam.nearClipPlane = 0.1f; cam.farClipPlane = 200f;
            cam.transform.SetPositionAndRotation(new Vector3((x0 + x1) * .5f, 60f, (zN + zS) * .5f), Quaternion.Euler(90f, 0f, 0f));
            var rt = new RenderTexture(Wpx, Hpx, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 }; cam.targetTexture = rt; cam.Render();
            RenderTexture.active = rt; var tex = new Texture2D(Wpx, Hpx, TextureFormat.RGB24, false); tex.ReadPixels(new Rect(0, 0, Wpx, Hpx), 0, 0);
            var px = tex.GetPixels32();
            for (int r = 0; r < Hpx; r++) for (int c = 0; c < Wpx; c++)
                {
                    float wx = x0 + (c + .5f) / Wpx * (x1 - x0), wz = zS + (r + .5f) / Hpx * (zN - zS); int tx = Mathf.FloorToInt(wx / T), ty = Mathf.FloorToInt(-wz / T);
                    if (!Walk(tx, ty)) continue; var p = px[r * Wpx + c]; p.r = (byte)(p.r * .62f + 40 * .38f); p.g = (byte)(p.g * .62f + 255 * .38f); p.b = (byte)(p.b * .62f + 60 * .38f); px[r * Wpx + c] = p;
                }
            tex.SetPixels32(px); tex.Apply();
            File.WriteAllBytes(Path.Combine(outDir, "rm2_top_walk_overlay.png"), tex.EncodeToPNG()); RenderTexture.active = null; cam.targetTexture = null;
            UnityEngine.Object.DestroyImmediate(tex); rt.Release(); Debug.Log("[RM2] captured top");
        }

        // ---------------------------------------------------------------- sight wedge test: for every lump above 0.9u, a 1.6u capsule on the nearest walk tile north of it; head and body must both be visible from the game camera (Linecast against temporary mesh colliders)
        public static void Wedge()
        {
            var args = Environment.GetCommandLineArgs(); string Arg(string k, string d) { int i = Array.IndexOf(args, k); return i >= 0 ? args[i + 1] : d; }
            AudioListener.volume = 0f; var outDir = Arg("-outDir", "rm2-wedge"); Directory.CreateDirectory(outDir);
            Load(); EditorSceneManager.OpenScene(ScenePath);
            var marker = GameObject.Find("Player Marker").transform; var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>(); terrain = UnityEngine.Object.FindFirstObjectByType<Terrain>();
            var wf = JsonUtility.FromJson<WedgeFile>(File.ReadAllText(DataDir + "/rm2_wedge.json"));
            var nav = GameObject.Find("NavWalkMesh"); if (nav != null) nav.SetActive(false);
            foreach (var mf in GameObject.Find("Blockout").GetComponentsInChildren<MeshFilter>()) if (mf.GetComponent<Collider>() == null) mf.gameObject.AddComponent<MeshCollider>().sharedMesh = mf.sharedMesh;
            Physics.SyncTransforms();
            MakeCapsule(marker); var res = new List<string>(); int pass = 0, fail = 0; var sheetTex = new Texture2D(1600, 900, TextureFormat.RGB24, false); int sheetN = 0, inSheet = 0;
            foreach (var e in wf.tall)
            {
                var w = W(e.nx + .5f, e.ny + .5f); marker.position = new Vector3(w.x, GroundY(w.x, w.z), w.z); brain.ManualUpdate(); Physics.SyncTransforms();
                var camPos = cam.transform.position; var headP = marker.position + Vector3.up * 1.6f; var bodyP = marker.position + Vector3.up * 0.8f;
                bool headHit = Physics.Linecast(camPos, headP, out var hh); bool bodyHit = Physics.Linecast(camPos, bodyP, out var hb);
                bool ok = !headHit && !bodyHit; if (ok) pass++; else fail++;
                res.Add("{\"name\":\"" + e.name + "\",\"h\":" + F(e.h) + ",\"cap\":" + F(e.cap) + ",\"dU\":" + F(e.dU) + ",\"walkNorthTile\":[" + e.nx + "," + e.ny + "],\"headVisible\":" + (!headHit ? "true" : "false") + ",\"bodyVisible\":" + (!bodyHit ? "true" : "false") + ",\"headBlockedBy\":\"" + (headHit ? hh.collider.name : "") + "\",\"bodyBlockedBy\":\"" + (bodyHit ? hb.collider.name : "") + "\",\"pass\":" + (ok ? "true" : "false") + "}");
                if (sheetN < 40)
                {   // 2x2 contact sheets of 800x450 renders (first 40 entries)
                    var rt = new RenderTexture(800, 450, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 }; cam.targetTexture = rt; cam.Render(); RenderTexture.active = rt;
                    var t = new Texture2D(800, 450, TextureFormat.RGB24, false); t.ReadPixels(new Rect(0, 0, 800, 450), 0, 0); t.Apply();
                    sheetTex.SetPixels((inSheet % 2) * 800, (1 - inSheet / 2) * 450, 800, 450, t.GetPixels()); UnityEngine.Object.DestroyImmediate(t); RenderTexture.active = null; cam.targetTexture = null; rt.Release();
                    sheetN++; inSheet++; if (inSheet == 4) { sheetTex.Apply(); File.WriteAllBytes(Path.Combine(outDir, "rm2_wedge_sheet_" + ((sheetN - 1) / 4).ToString("00") + ".png"), sheetTex.EncodeToPNG()); inSheet = 0; }
                }
            }
            if (inSheet > 0) { sheetTex.Apply(); File.WriteAllBytes(Path.Combine(outDir, "rm2_wedge_sheet_" + ((sheetN - 1) / 4).ToString("00") + ".png"), sheetTex.EncodeToPNG()); }
            WriteData("rm2_wedge_result.json", "{\"rule\":\"capsule 1.6u on the nearest walk tile north of each lump above 0.9u; head (1.6u) and body (0.8u) must both be visible from the game camera (Linecast, mesh colliders added temporarily)\",\"tested\":" + wf.tall.Length + ",\"pass\":" + pass + ",\"fail\":" + fail + ",\"sheets\":" + ((sheetN + 3) / 4) + ",\"items\":[" + string.Join(",", res) + "]}");
            Debug.Log("[RM2] wedge tested=" + wf.tall.Length + " pass=" + pass + " fail=" + fail);
        }
    }
}
