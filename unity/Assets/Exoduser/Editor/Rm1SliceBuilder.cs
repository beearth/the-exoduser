using System;
using System.Collections.Generic;
using System.IO;
using Unity.AI.Navigation;
using Unity.Cinemachine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.AI;
using UnityEngine.ProBuilder;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

// RM-1 slice builder (idempotent). `Unity -batchmode -executeMethod Exoduser.Rm1SliceBuilder.Run -quit` builds Remodel/CH1_1/RM1_Slice.unity: Terrain from the web hand-painted colour map,
// river/pool depressions + M_ToxicFlow, ProBuilder blockout masses, hell/toxic light pools, light shafts, ground decals, Cinemachine LOOK-001 rig, NavMesh baked from the Core walk grid.
// `-executeMethod Exoduser.Rm1SliceBuilder.Capture -outDir <dir> [-cuts start,r2,river]` renders 1600x900 cuts through the game camera.
// Coordinates: web px -> Unity world x = px/100, z = -px_y/100 (1 tile = 40px = 0.4u). Core (Runtime/Core) is not touched; the 3D layer is render only.
namespace Exoduser
{
    public static class Rm1SliceBuilder
    {
        const string Root = "Assets/Exoduser/Remodel/CH1_1";
        const string ScenePath = Root + "/RM1_Slice.unity";
        const string GenDir = Root + "/Generated";
        // Padded window (tiles): the colour map covers x48..152 y126..200 so the perspective view never sees past the terrain edge.
        const int TX0 = 48, TY0 = 126, TX1 = 152, TY1 = 200;
        const float T = 0.4f, TerrainH = 4f, BaseY = -0.5f;
        const float Pitch = 0.85f, DistU = 14f;
        const int HRes = 1025, ARes = 512;

        [Serializable] class WalkDump { public string[] walk; public int[] start; }
        [Serializable] class RPt { public float tx, ty; }
        [Serializable] class Rivers { public RPt[] L, R; }
        [Serializable] class PTile { public int tx, ty; public string role; }
        [Serializable] class Pool { public string name, kind; public PTile[] tiles; public float[] trunkTileCenter; }
        [Serializable] class RiverData { public Rivers rivers; public Pool[] pools; }
        [Serializable] class BPt { public float x, y; public int tx, ty; public string surface; public float size, period, phase; }
        [Serializable] class BData { public BPt[] points; }

        static string[] walkRows; static int[,] distWalk, distBlock; static RiverData river; static Terrain terrain;
        static readonly Color LightHell = Hex("#b0281c"), LightToxic = Hex("#b7b54a"), ShadowCol = Hex("#120c0a"), FogLow = Hex("#2a1a16");
        static Color Hex(string h) { ColorUtility.TryParseHtmlString(h, out var c); return c; }
        static bool Walk(int x, int y) { return x >= 0 && y >= 0 && x < 200 && y < 200 && walkRows[y][x] == '0'; }
        static float Hash(int x, int y) { unchecked { uint h = (uint)(x * 374761393 + y * 668265263); h = (h ^ (h >> 13)) * 1274126177u; return ((h ^ (h >> 16)) & 0xffff) / 65535f; } }
        static Vector3 W(float tx, float ty, float y = 0f) { return new Vector3(tx * T, y, -ty * T); }
        static float Smooth(float a, float b, float x) { x = Mathf.Clamp01((x - a) / (b - a)); return x * x * (3 - 2 * x); }

        // ---- footprints of 3D masses (XZ world), used to prove no wall/trunk/river covers a Core walk tile
        struct FP { public string kind; public float cx, cz, hw, hd, yaw; public bool circle; }
        static readonly List<FP> fps = new List<FP>();
        static readonly List<Vector2[]> ribbonQuads = new List<Vector2[]>();
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
        static bool InTri(Vector2 p, Vector2 a, Vector2 b, Vector2 c)
        {
            float d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y), d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y), d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
            bool neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0; return !(neg && pos);
        }
        static bool SouthOfWalk(int tx, int ty)   // a walkable tile lies north of this one within the camera's view => camera-side mass
        {
            for (int y = ty - 16; y < ty; y++) for (int x = tx - 5; x <= tx + 5; x++) if (Walk(x, y)) return true;
            return false;
        }
        static List<Vector2> Chaikin(List<Vector2> p, int it)
        {
            for (int n = 0; n < it; n++)
            {
                var o = new List<Vector2> { p[0] };
                for (int i = 0; i + 1 < p.Count; i++) { o.Add(.75f * p[i] + .25f * p[i + 1]); o.Add(.25f * p[i] + .75f * p[i + 1]); }
                o.Add(p[p.Count - 1]); p = o;
            }
            return p;
        }
        // Counts walk tiles (slice window x60..140 y138..192) whose centre lies inside a 3D footprint; "deep" = centre at least 0.5 tile inside the footprint edge.
        static void WalkOverlap()
        {
            int any = 0, deep = 0; var byKind = new Dictionary<string, int>(); var tiles = new List<string>();
            for (int ty = 138; ty < 192; ty++) for (int tx = 60; tx < 140; tx++)
                {
                    if (!Walk(tx, ty)) continue; float px = (tx + .5f) * T, pz = -(ty + .5f) * T; string hit = null; bool dp = false;
                    foreach (var f in fps) if (InFP(f, px, pz, 0f)) { hit = f.kind; dp = InFP(f, px, pz, -0.5f * T); break; }
                    if (hit == null) { var p = new Vector2(px, pz); foreach (var q in ribbonQuads) if (InTri(p, q[0], q[1], q[2]) || InTri(p, q[0], q[2], q[3])) { hit = "river"; dp = true; break; } }
                    if (hit == null) continue; any++; if (dp) deep++; byKind[hit] = byKind.TryGetValue(hit, out var n) ? n + 1 : 1; tiles.Add($"[{tx},{ty},\"{hit}\"]");
                }
            Directory.CreateDirectory("../../_out/rm1");
            var kinds = new List<string>(); foreach (var kv in byKind) kinds.Add($"\"{kv.Key}\":{kv.Value}");
            File.WriteAllText("../../_out/rm1/walk_overlap.json", "{\"window\":[60,138,140,192],\"footprints\":" + fps.Count + ",\"ribbonQuads\":" + ribbonQuads.Count + ",\"walkTilesCoveredCentre\":" + any + ",\"walkTilesCoveredDeep05\":" + deep + ",\"byKind\":{" + string.Join(",", kinds) + "},\"tiles\":[" + string.Join(",", tiles) + "]}");
            Debug.Log($"[RM1] walk overlap centre={any} deep(>=0.5 tile)={deep}");
        }

        static void Load()
        {
            var dump = JsonUtility.FromJson<WalkDump>(File.ReadAllText(Root + "/Data/unity_1_1_walk_dump.json"));
            walkRows = dump.walk;
            river = JsonUtility.FromJson<RiverData>(File.ReadAllText(Root + "/Data/toxic_river_path.json"));
            distWalk = Bfs(true); distBlock = Bfs(false);
        }
        // chebyshev distance (8-neighbour BFS) to the nearest walkable (toWalk) or blocked tile; out-of-grid counts as blocked
        static int[,] Bfs(bool toWalk)
        {
            var d = new int[200, 200]; var q = new Queue<(int, int)>();
            for (int y = 0; y < 200; y++) for (int x = 0; x < 200; x++) { bool src = toWalk ? Walk(x, y) : !Walk(x, y); d[y, x] = src ? 0 : -1; if (src) q.Enqueue((x, y)); }
            while (q.Count > 0) { var (x, y) = q.Dequeue(); for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) { int nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= 200 || ny >= 200 || d[ny, nx] >= 0) continue; d[ny, nx] = d[y, x] + 1; q.Enqueue((nx, ny)); } }
            return d;
        }

        public static void Run()
        {
            Directory.CreateDirectory(GenDir); AssetDatabase.Refresh();
            Load(); fps.Clear(); ribbonQuads.Clear();
            var mats = MakeMaterials();
            var td = BuildTerrainData();
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var world = new GameObject("World");
            var tgo = Terrain.CreateTerrainGameObject(td); tgo.name = "Terrain"; tgo.transform.SetParent(world.transform, false);
            tgo.transform.position = new Vector3(TX0 * T, BaseY, -TY1 * T);
            terrain = tgo.GetComponent<Terrain>(); terrain.drawInstanced = true; terrain.heightmapPixelError = 3f; terrain.basemapDistance = 400f;

            BuildToxic(world.transform, mats);
            BuildBlockout(world.transform, mats);
            BuildBgCards(world.transform, mats);
            BuildDecals(world.transform, mats);
            FgMat = mats.FgRoots;
            BuildLighting(mats);
            WalkOverlap();
            var marker = BuildCamera();
            BuildNavMesh(world.transform);
            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            Debug.Log("[RM1] slice built: " + ScenePath);
        }

        // ---------------------------------------------------------------- materials
        class Mats { public Material Toxic, Blockout, Mass, Bark, FgRoots, BgTree, Shaft1, Shaft2; public Dictionary<string, Material> Decal = new Dictionary<string, Material>(); }
        static Material Mat(string path, Shader sh, Action<Material> init)
        {
            var m = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (m == null) { m = new Material(sh); AssetDatabase.CreateAsset(m, path); }
            m.shader = sh; init(m); EditorUtility.SetDirty(m); return m;
        }
        static void TexSettings(string path, bool clamp, int max, bool alpha)
        {
            var imp = AssetImporter.GetAtPath(path) as TextureImporter; if (imp == null) return;
            bool dirty = false;
            if (clamp && imp.wrapMode != TextureWrapMode.Clamp) { imp.wrapMode = TextureWrapMode.Clamp; dirty = true; }
            if (imp.maxTextureSize != max) { imp.maxTextureSize = max; dirty = true; }
            if (alpha && !imp.alphaIsTransparency) { imp.alphaIsTransparency = true; dirty = true; }
            if (imp.textureCompression == TextureImporterCompression.CompressedHQ) { imp.textureCompression = TextureImporterCompression.Compressed; dirty = true; }
            if (dirty) imp.SaveAndReimport();
        }
        static Mats MakeMaterials()
        {
            var mats = new Mats(); var lit = Shader.Find("Universal Render Pipeline/Lit");
            mats.Toxic = Mat(Root + "/Materials/M_ToxicFlow.mat", Shader.Find("EXODUSER/ToxicFlow"), m => { });
            mats.Blockout = Mat(Root + "/Materials/M_Blockout_Grey.mat", lit, m => { m.SetColor("_BaseColor", new Color(.42f, .42f, .42f)); m.SetFloat("_Smoothness", 0.05f); });
            // D2 rotten wood + flesh membrane: the confirmed hand-painted mass_v01 (bark plates, sinew webbing, red veins) + its normal map, no generated art
            var massPath = Root + "/Materials/Mass/mass_v01.png"; var nrmPath = Root + "/Materials/Mass/mass_v01_normal.png"; TexSettings(massPath, false, 1024, false);
            var ni = AssetImporter.GetAtPath(nrmPath) as TextureImporter; if (ni != null && ni.textureType != TextureImporterType.NormalMap) { ni.textureType = TextureImporterType.NormalMap; ni.maxTextureSize = 1024; ni.SaveAndReimport(); }
            var massTex = AssetDatabase.LoadAssetAtPath<Texture2D>(massPath); var nrmTex = AssetDatabase.LoadAssetAtPath<Texture2D>(nrmPath);
            Action<Material, Color, float> massInit = (m, tint, smooth) => { m.SetTexture("_BaseMap", massTex); m.SetColor("_BaseColor", tint); m.SetTexture("_BumpMap", nrmTex); m.SetFloat("_BumpScale", 1f); m.EnableKeyword("_NORMALMAP"); m.SetFloat("_Smoothness", smooth); m.SetFloat("_Metallic", 0f); };
            mats.Mass = Mat(Root + "/Materials/M_RottenWoodMembrane.mat", lit, m => massInit(m, new Color(.62f, .56f, .54f), .10f));
            mats.Bark = Mat(Root + "/Materials/M_CursedBark.mat", lit, m => massInit(m, new Color(.40f, .34f, .33f), .06f));
            var cardSh = Shader.Find("EXODUSER/FgCard");
            var fgTex = ProcCard(GenDir + "/card_fg_roots.png", 11, true); var bgTex = ProcCard(GenDir + "/card_bg_tree.png", 23, false);
            mats.FgRoots = Mat(Root + "/Materials/M_FgRoots.mat", cardSh, m => { m.SetTexture("_MainTex", fgTex); m.SetColor("_Color", new Color(.045f, .028f, .022f, .80f)); });
            mats.BgTree = Mat(Root + "/Materials/M_BgTree.mat", cardSh, m => { m.SetTexture("_MainTex", bgTex); m.SetColor("_Color", new Color(.20f, .17f, .19f, .55f)); });   // FOG_FAR-tinted, so far silhouettes sink into the haze
            var shaft = Shader.Find("EXODUSER/LightShaft");
            mats.Shaft1 = Mat(Root + "/Materials/M_Shaft_Hell_1.mat", shaft, m => { m.SetColor("_Color", LightHell); m.SetFloat("_Intensity", 0.42f); m.SetFloat("_Phase", 0.4f); });
            mats.Shaft2 = Mat(Root + "/Materials/M_Shaft_Hell_2.mat", shaft, m => { m.SetColor("_Color", LightHell); m.SetFloat("_Intensity", 0.34f); m.SetFloat("_Phase", 2.1f); });
            EnsureWetTexture();
            var decal = Shader.Find("EXODUSER/GroundDecal");
            foreach (var n in new[] { "blood", "blood_cracked", "blood_drag", "blood_drops", "root", "root_branch", "root_tangle", "bone", "bone_ribs", "bone_skull", "wet" })
            {
                var p = Root + "/Materials/Decals/decal_" + n + ".png"; TexSettings(p, true, 1024, true);
                var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(p);
                mats.Decal[n] = Mat(Root + "/Materials/M_Decal_" + n + ".mat", decal, m => { m.SetTexture("_MainTex", tex); m.SetColor("_Tint", Color.white); m.SetFloat("_Alpha", 0.9f); });
            }
            return mats;
        }
        // soft irregular wet blob (alpha mask) for banks and pool rims — procedural, no generated art
        static void EnsureWetTexture()
        {
            var p = Root + "/Materials/Decals/decal_wet.png";   // regenerated every run (deterministic); alpha is forced to 0 well before the quad edge so no straight cut line shows
            const int S = 256; var t = new Texture2D(S, S, TextureFormat.RGBA32, false);
            for (int y = 0; y < S; y++) for (int x = 0; x < S; x++)
            {
                float u = (x - S / 2f) / (S / 2f), v = (y - S / 2f) / (S / 2f), r = Mathf.Sqrt(u * u + v * v);
                float n = Mathf.PerlinNoise(x * .035f + 3.1f, y * .035f + 9.4f) * .55f + Mathf.PerlinNoise(x * .09f, y * .09f) * .25f;
                float a = Mathf.Clamp01((0.95f - r + (n - .4f) * .8f) * 1.7f); a *= a; a *= Smooth(0.92f, 0.62f, r) * (1f - Smooth(0.86f, 1f, Mathf.Max(Mathf.Abs(u), Mathf.Abs(v))));
                t.SetPixel(x, y, new Color(1, 1, 1, a));
            }
            File.WriteAllBytes(p, t.EncodeToPNG()); UnityEngine.Object.DestroyImmediate(t); AssetDatabase.ImportAsset(p);
        }

        // ---------------------------------------------------------------- terrain
        static TerrainData BuildTerrainData()
        {
            var cm = Root + "/Materials/Ground/ch1_1_r1r2_colormap_wide.png"; TexSettings(cm, true, 8192, false);
            var layers = new List<TerrainLayer>();
            TerrainLayer TL(string name, string tex, Vector2 size)
            {
                var path = GenDir + "/TL_" + name + ".terrainlayer"; var l = AssetDatabase.LoadAssetAtPath<TerrainLayer>(path);
                if (l == null) { l = new TerrainLayer(); AssetDatabase.CreateAsset(l, path); }
                l.diffuseTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(tex); l.tileSize = size; l.tileOffset = Vector2.zero; l.smoothness = 0f; l.metallic = 0f; EditorUtility.SetDirty(l); return l;
            }
            float sx = (TX1 - TX0) * T, sz = (TY1 - TY0) * T;
            layers.Add(TL("Colormap", cm, new Vector2(sx, sz)));
            layers.Add(TL("Floor1", Root + "/Materials/Ground/floor_v01b.png", new Vector2(3.2f, 3.2f)));
            layers.Add(TL("Floor2", Root + "/Materials/Ground/floor_v02b.png", new Vector2(2.6f, 2.6f)));
            layers.Add(TL("Floor3", Root + "/Materials/Ground/floor_v03b.png", new Vector2(3.6f, 3.6f)));

            var path2 = GenDir + "/RM1_Terrain.asset"; AssetDatabase.DeleteAsset(path2);
            var td = new TerrainData { heightmapResolution = HRes, alphamapResolution = ARes, baseMapResolution = 512 };
            td.size = new Vector3(sx, TerrainH, sz);
            AssetDatabase.CreateAsset(td, path2);
            td.terrainLayers = layers.ToArray();
            td.SetHeights(0, 0, ComputeHeights());
            td.SetAlphamaps(0, 0, ComputeAlpha());
            AddGrass(td);
            return td;
        }

        static List<(Vector2 a, Vector2 b)> RiverSegs()
        {
            var segs = new List<(Vector2, Vector2)>();
            foreach (var arr in new[] { river.rivers.L, river.rivers.R })
                for (int i = 0; i + 1 < arr.Length; i++) segs.Add((new Vector2(arr[i].tx, arr[i].ty + .5f), new Vector2(arr[i + 1].tx, arr[i + 1].ty + .5f)));
            return segs;
        }
        static float DistToSegs(List<(Vector2 a, Vector2 b)> segs, float X, float Y)
        {
            float best = 1e9f; var p = new Vector2(X, Y);
            foreach (var (a, b) in segs)
            {
                var ab = b - a; float t = Mathf.Clamp01(Vector2.Dot(p - a, ab) / Mathf.Max(1e-5f, ab.sqrMagnitude)); float d = (p - (a + ab * t)).sqrMagnitude; if (d < best) best = d;
            }
            return Mathf.Sqrt(best);
        }
        static Dictionary<(int, int), float> PoolTileH()
        {
            var o = new Dictionary<(int, int), float>();
            foreach (var pl in river.pools) foreach (var t in pl.tiles)
                {
                    float h = t.role == "trunk" ? 0.30f : t.role == "shore" ? 0.03f : pl.kind == "toxic" ? -0.28f : -0.10f;
                    o[(t.tx, t.ty)] = h;
                }
            return o;
        }
        static float TileH(int tx, int ty, Dictionary<(int, int), float> pool)
        {
            if (pool.TryGetValue((tx, ty), out var ph)) return ph;
            if (Walk(tx, ty)) return 0f;
            int d = (tx < 0 || ty < 0 || tx >= 200 || ty >= 200) ? 6 : distWalk[ty, tx];
            return Mathf.Min(1.5f, 0.28f * (d - 0.2f)) * (0.75f + 0.5f * Hash(tx, ty));
        }
        static float[,] ComputeHeights()
        {
            var pool = PoolTileH(); var h = new float[HRes, HRes]; var segs = RiverSegs();
            for (int i = 0; i < HRes; i++) for (int j = 0; j < HRes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(HRes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(HRes - 1));
                    float fx = X - .5f, fy = Y - .5f; int x0 = Mathf.FloorToInt(fx), y0 = Mathf.FloorToInt(fy); float ax = fx - x0, ay = fy - y0;
                    float v = Mathf.Lerp(Mathf.Lerp(TileH(x0, y0, pool), TileH(x0 + 1, y0, pool), ax), Mathf.Lerp(TileH(x0, y0 + 1, pool), TileH(x0 + 1, y0 + 1, pool), ax), ay);
                    h[i, j] = v;
                }
            for (int pass = 0; pass < 2; pass++) { BoxBlur(h, 6, true); BoxBlur(h, 6, false); }
            for (int i = 0; i < HRes; i++) for (int j = 0; j < HRes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(HRes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(HRes - 1));
                    float v = h[i, j] + 0.014f * (Mathf.PerlinNoise(X * .33f, Y * .33f) - .5f) * 2f;
                    float d = DistToSegs(segs, X, Y);
                    if (d < 3.4f)
                    {
                        float w = Smooth(2.9f, 1.3f, d);
                        v = Mathf.Lerp(v, -0.42f, w);
                        v += 0.05f * Smooth(1.9f, 2.7f, d) * Smooth(3.4f, 2.8f, d);   // bank lip
                    }
                    h[i, j] = Mathf.Clamp01((v - BaseY) / TerrainH) ;
                }
            // BaseY is the world y of normalised 0; walkable (v=0) sits at world y = 0 because the terrain object is placed at BaseY
            for (int i = 0; i < HRes; i++) for (int j = 0; j < HRes; j++) h[i, j] = Mathf.Clamp01(h[i, j]);
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
            var a = new float[ARes, ARes, 4]; var segs = RiverSegs();
            for (int i = 0; i < ARes; i++) for (int j = 0; j < ARes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(ARes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(ARes - 1));
                    float d = DistToSegs(segs, X, Y); float wet = Smooth(6f, 2f, d);
                    float n1 = Mathf.PerlinNoise(X * .17f, Y * .17f), n2 = Mathf.PerlinNoise(X * .29f + 40f, Y * .29f + 17f);
                    float detail = 0.17f;                                   // W1: detail layers stay a low share on top of the one hand-painted colour map
                    float w1 = detail * n1 * (1 - wet * .5f), w2 = detail * n2 * (1 - wet * .5f), w3 = detail * (0.25f + wet * 1.2f);
                    float w0 = 1f;
                    float s = w0 + w1 + w2 + w3; a[i, j, 0] = w0 / s; a[i, j, 1] = w1 / s; a[i, j, 2] = w2 / s; a[i, j, 3] = w3 / s;
                }
            return a;
        }
        static float GroundY(float wx, float wz) { return terrain.SampleHeight(new Vector3(wx, 0, wz)) + terrain.transform.position.y; }

        // ---------------------------------------------------------------- toxic river + pool surfaces
        static Mesh SaveMesh(Mesh m, string name) { var p = GenDir + "/" + name + ".asset"; AssetDatabase.DeleteAsset(p); AssetDatabase.CreateAsset(m, p); return m; }
        static void BuildToxic(Transform parent, Mats mats)
        {
            var root = new GameObject("Toxic"); root.transform.SetParent(parent, false);
            foreach (var side in new[] { ("L", river.rivers.L), ("R", river.rivers.R) })
            {
                // one continuous strip per bank: smoothed centre line, width shrunk wherever the strip would fold over itself or reach a Core walk tile
                var raw = new List<Vector2>(); foreach (var p in side.Item2) if (p.tx >= TX0 && p.tx <= TX1 && p.ty >= TY0 && p.ty <= TY1) raw.Add(new Vector2(p.tx, p.ty + .5f));
                if (raw.Count < 2) continue;
                var cl = Chaikin(raw, 2);
                var vs = new List<Vector3>(); var uvs = new List<Vector2>(); var tris = new List<int>(); float along = 0f; const float halfMax = 2.3f, level = -0.21f;
                int N = cl.Count; var nms = new Vector2[N]; var hreq = new float[N];
                for (int i = 0; i < N; i++) { var tg = (cl[Mathf.Min(i + 1, N - 1)] - cl[Mathf.Max(i - 1, 0)]).normalized; nms[i] = new Vector2(-tg.y, tg.x); }
                for (int i = 0; i < N; i++)
                {
                    float half = halfMax; var c = cl[i];
                    for (int it = 0; it < 10; it++)
                    {
                        var l = c + nms[i] * half; var r = c - nms[i] * half;
                        bool bad = Walk(Mathf.FloorToInt(l.x), Mathf.FloorToInt(l.y)) || Walk(Mathf.FloorToInt(r.x), Mathf.FloorToInt(r.y));
                        if (!bad && i > 0) { var sc = c - cl[i - 1]; float thr = 0.15f * sc.sqrMagnitude; var lp = cl[i - 1] + nms[i - 1] * half; var rp = cl[i - 1] - nms[i - 1] * half; if (Vector2.Dot(l - lp, sc) <= thr || Vector2.Dot(r - rp, sc) <= thr) bad = true; }
                        if (!bad) break; half *= 0.75f;
                    }
                    hreq[i] = half;
                }
                // smooth the width: min-filter (+-8) then box blur (+-4) can only narrow it, so the fold / walk-tile guarantees stay while the banks stop zig-zagging
                var hmin = new float[N]; var hs = new float[N];
                for (int i = 0; i < N; i++) { float mn = 9f; for (int k = Mathf.Max(0, i - 8); k <= Mathf.Min(N - 1, i + 8); k++) mn = Mathf.Min(mn, hreq[k]); hmin[i] = mn; }
                for (int i = 0; i < N; i++) { float sum = 0; int cnt = 0; for (int k = Mathf.Max(0, i - 4); k <= Mathf.Min(N - 1, i + 4); k++) { sum += hmin[k]; cnt++; } hs[i] = sum / cnt; }
                var prevW = new Vector2[2];
                for (int i = 0; i < N; i++)
                {
                    var c = cl[i]; float half = hs[i]; var l = c + nms[i] * half; var r = c - nms[i] * half;
                    if (i > 0) along += (c - cl[i - 1]).magnitude * T;
                    vs.Add(W(l.x, l.y, level)); vs.Add(W(r.x, r.y, level)); uvs.Add(new Vector2(-half * T, along)); uvs.Add(new Vector2(half * T, along));
                    if (i > 0) { int b = (i - 1) * 2; tris.AddRange(new[] { b, b + 2, b + 1, b + 1, b + 2, b + 3 });
                        ribbonQuads.Add(new[] { prevW[0], prevW[1], new Vector2(r.x * T, -r.y * T), new Vector2(l.x * T, -l.y * T) }); }
                    prevW[0] = new Vector2(l.x * T, -l.y * T); prevW[1] = new Vector2(r.x * T, -r.y * T);
                }
                var m = new Mesh { name = "River_" + side.Item1 }; m.SetVertices(vs); m.SetUVs(0, uvs); m.SetTriangles(tris, 0); m.RecalculateNormals(); m.RecalculateBounds();
                SaveMesh(m, "River_" + side.Item1);
                var go = new GameObject("River_" + side.Item1); go.transform.SetParent(root.transform, false);
                go.AddComponent<MeshFilter>().sharedMesh = m; var mr = go.AddComponent<MeshRenderer>(); mr.sharedMaterial = mats.Toxic; mr.shadowCastingMode = ShadowCastingMode.Off;
            }
            // east toxic root pool: body tiles only (shore tiles stay terrain/wet decal, trunk tile stays raised)
            foreach (var pl in river.pools)
            {
                if (pl.kind != "toxic") continue;
                var vs = new List<Vector3>(); var uvs = new List<Vector2>(); var tris = new List<int>();
                foreach (var t in pl.tiles) { if (t.role != "body") continue; int b = vs.Count; float y = -0.12f;
                    vs.Add(W(t.tx, t.ty, y)); vs.Add(W(t.tx + 1, t.ty, y)); vs.Add(W(t.tx, t.ty + 1, y)); vs.Add(W(t.tx + 1, t.ty + 1, y));
                    foreach (var v in new[] { vs[b], vs[b + 1], vs[b + 2], vs[b + 3] }) uvs.Add(new Vector2(v.x, v.z) * 0.9f);
                    tris.AddRange(new[] { b, b + 1, b + 2, b + 2, b + 1, b + 3 }); }
                var m = new Mesh { name = "Pool_" + pl.name }; m.SetVertices(vs); m.SetUVs(0, uvs); m.SetTriangles(tris, 0); m.RecalculateNormals(); m.RecalculateBounds();
                SaveMesh(m, "Pool_" + pl.name);
                var go = new GameObject("Pool_" + pl.name); go.transform.SetParent(root.transform, false);
                go.AddComponent<MeshFilter>().sharedMesh = m; var mr = go.AddComponent<MeshRenderer>(); mr.sharedMaterial = mats.Toxic; mr.shadowCastingMode = ShadowCastingMode.Off;
            }
        }

        // ---------------------------------------------------------------- ProBuilder blockout (grey masses, then textured after the shape judgement)
        static void BuildBlockout(Transform parent, Mats mats)
        {
            var root = new GameObject("Blockout"); root.transform.SetParent(parent, false);
            var segs = RiverSegs(); var rnd = new System.Random(1103); var placed = new List<Vector2>(); int count = 0;
            var poolTiles = new HashSet<(int, int)>(); foreach (var pl in river.pools) foreach (var t in pl.tiles) poolTiles.Add((t.tx, t.ty));
            foreach (var (dmin, dmax, sep, hLo, hHi) in new[] { (2, 3, 6f, 1.5f, 3.0f), (5, 8, 8f, 2.6f, 4.8f) })
            {
                var cand = new List<Vector2>();
                for (int ty = TY0; ty < TY1; ty++) for (int tx = TX0; tx < TX1; tx++)
                    { if (Walk(tx, ty) || poolTiles.Contains((tx, ty))) continue; int d = distWalk[ty, tx]; if (d < dmin || d > dmax) continue; if (DistToSegs(segs, tx + .5f, ty + .5f) < 5.5f) continue; cand.Add(new Vector2(tx + .5f, ty + .5f)); }
                for (int i = cand.Count - 1; i > 0; i--) { int j = rnd.Next(i + 1); (cand[i], cand[j]) = (cand[j], cand[i]); }
                foreach (var c in cand)
                {
                    bool ok = true; foreach (var p in placed) if ((p - c).magnitude < sep) { ok = false; break; }
                    if (!ok) continue; placed.Add(c);
                    float w = Mathf.Lerp(2.0f, 3.6f, (float)rnd.NextDouble()), dp = Mathf.Lerp(1.6f, 3.0f, (float)rnd.NextDouble()), hh = Mathf.Lerp(hLo, hHi, (float)rnd.NextDouble());
                    float yaw = (float)rnd.NextDouble() * 360f; var wp = W(c.x, c.y); float gy = GroundY(wp.x, wp.z);
                    // never cover a Core walk tile: shrink the footprint until it clears every walkable tile centre, else skip this candidate
                    var fp = new FP { kind = "mass", cx = wp.x, cz = wp.z, hw = w * .5f, hd = dp * .5f, yaw = yaw }; int shrink = 0;
                    while (FpHitsWalk(fp) && shrink++ < 8) { w *= .85f; dp *= .85f; fp.hw = w * .5f; fp.hd = dp * .5f; }
                    if (FpHitsWalk(fp) || w < 1.0f) { placed.RemoveAt(placed.Count - 1); continue; }
                    // camera-side masses (a walkable tile lies north of them) are cut down so they never cover more than ~15% of the screen height
                    if (SouthOfWalk(Mathf.FloorToInt(c.x), Mathf.FloorToInt(c.y))) hh = Mathf.Min(hh, 0.9f);
                    MakeLump("Mass_" + (count++).ToString("00"), root.transform, new Vector3(wp.x, gy, wp.z), yaw, fp.hw, fp.hd, hh, 5000 + count * 13, mats.Mass, 2.4f, false);
                    fps.Add(fp);
                }
            }
            foreach (var pl in river.pools)
            {
                if (pl.trunkTileCenter == null || pl.trunkTileCenter.Length < 2 || pl.kind == "w8props") continue;
                var wp = W(pl.trunkTileCenter[0], pl.trunkTileCenter[1]); float gy = GroundY(wp.x, wp.z);
                var tfp = new FP { kind = "trunk", cx = wp.x, cz = wp.z, hw = 0.95f, circle = true }; int ts = 0;
                while (FpHitsWalk(tfp) && ts++ < 8) tfp.hw *= .85f;                  // trunk radius shrinks until it stays on blocked tiles
                // cursed tree: tapering irregular trunk, 3-5 buttress lobes spreading into the ground, broken (jagged) top
                int seedT = 9000 + count * 31; MakeLump("Trunk_" + pl.name, root.transform, new Vector3(wp.x, gy, wp.z), 0f, tfp.hw, tfp.hw, 4.6f, seedT, mats.Bark, 2.0f, true);
                fps.Add(tfp); count++;
                // two broken limbs on the camera side (south = -z), bent up and out so they read from the game view
                for (int lb = 0; lb < 2; lb++)
                {
                    float sgn = lb == 0 ? -1f : 1f; var dirL = new Vector3(sgn * .55f, 0, -.83f).normalized; var path = new List<Vector3>();
                    for (int k = 0; k <= 8; k++) { float t = k / 8f; path.Add(new Vector3(wp.x, gy + 2.9f + lb * .5f, wp.z) + dirL * (0.15f + 1.55f * t) + Vector3.up * (0.9f * t - 0.35f * t * t) + new Vector3(0, 0, 0)); }
                    var lm = TubeMesh(path, 0.22f, 0.07f, 7, seedT + 7 + lb, 1.6f, true, 1.0f); AddMeshObj("TrunkLimb_" + pl.name + "_" + lb, root.transform, lm, mats.Bark);
                }
                var rr = new System.Random(seedT + 3); int roots = 3 + rr.Next(3);
                for (int k = 0; k < roots; k++)
                {
                    float ang = k * (360f / roots) + 14f + (float)rr.NextDouble() * 18f; var dir = Quaternion.Euler(0, ang, 0) * Vector3.right; float len = 2.4f; FP rfp = default; bool ok = false;
                    for (int it = 0; it < 8 && len > 0.7f; it++)
                    {
                        rfp = new FP { kind = "root", cx = wp.x + dir.x * (tfp.hw * .8f + len * .5f), cz = wp.z + dir.z * (tfp.hw * .8f + len * .5f), hw = len * .5f, hd = 0.4f, yaw = ang };
                        if (!FpHitsWalk(rfp)) { ok = true; break; } len *= .85f;
                    }
                    if (!ok) continue;
                    var path = new List<Vector3>(); var side = new Vector3(-dir.z, 0, dir.x); float wob = (float)rr.NextDouble() * 6.28f;
                    for (int q = 0; q <= 8; q++) { float t = q / 8f; var pp = new Vector3(wp.x, gy, wp.z) + dir * (tfp.hw * .45f + (len + tfp.hw * .35f) * t) + side * (Mathf.Sin(wob + t * 4f) * 0.12f * t); pp.y = GroundY(pp.x, pp.z) + 0.46f * (1f - t) * (1f - t * .5f) + 0.05f - 0.06f * t; path.Add(pp); }
                    AddMeshObj("Root_" + pl.name + "_" + k, root.transform, TubeMesh(path, 0.30f, 0.07f, 7, seedT + 40 + k, 1.4f, false, 1.0f), mats.Bark); fps.Add(rfp);
                }
            }
            FillIslands(root.transform, mats, poolTiles, ref count);
            Debug.Log("[RM1] blockout masses=" + count);
        }

        static void AddMeshObj(string name, Transform parent, Mesh m, Material mat)
        {
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.AddComponent<MeshFilter>().sharedMesh = m; var r = go.AddComponent<MeshRenderer>(); r.sharedMaterial = mat; r.shadowCastingMode = ShadowCastingMode.On;
        }
        static void MakeLump(string name, Transform parent, Vector3 pos, float yaw, float hw, float hd, float h, int seed, Material mat, float tile, bool trunk)
        {
            var rnd = new System.Random(seed); var lp = new LumpP { hw = hw, hd = hd, h = h, seed = seed, tile = tile };
            if (trunk) { lp.n = 2f; lp.K = 26; lp.R = 20; lp.body = .52f; lp.top = .82f; lp.flareT = .26f; lp.lobes = 3 + rnd.Next(3); lp.lobeAmp = .34f; lp.lobeDecay = .38f; lp.noise = .16f; lp.lean = .10f; lp.jag = .55f; lp.topBump = .06f; }
            else { lp.n = Mathf.Lerp(2.1f, 3.4f, (float)rnd.NextDouble()); lp.body = Mathf.Lerp(.68f, .9f, (float)rnd.NextDouble()); lp.top = Mathf.Lerp(.45f, .8f, (float)rnd.NextDouble()); lp.flareT = Mathf.Lerp(.2f, .4f, (float)rnd.NextDouble()); lp.lobes = 3 + rnd.Next(4); lp.lobeAmp = Mathf.Lerp(.14f, .28f, (float)rnd.NextDouble()); lp.lobeDecay = Mathf.Lerp(.3f, .5f, (float)rnd.NextDouble()); lp.noise = Mathf.Lerp(.10f, .22f, (float)rnd.NextDouble()); lp.lean = Mathf.Lerp(.05f, .26f, (float)rnd.NextDouble()); lp.topBump = Mathf.Lerp(.12f, .26f, (float)rnd.NextDouble()); lp.jag = 0f; lp.dome = Mathf.Lerp(.16f, .34f, (float)rnd.NextDouble()); lp.top = Mathf.Min(lp.top, .66f); }
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.transform.SetPositionAndRotation(pos, Quaternion.Euler(0, yaw, 0));
            go.AddComponent<MeshFilter>().sharedMesh = LumpMesh(lp); var r = go.AddComponent<MeshRenderer>(); r.sharedMaterial = mat; r.shadowCastingMode = ShadowCastingMode.On;
        }
        class LumpP { public float dome = 0f, hw, hd, h, n = 2.8f, body = .82f, top = .7f, flareT = .3f, lobeAmp = .18f, lobeDecay = .4f, noise = .12f, lean = .12f, jag = 0f, topBump = .12f, tile = 2.4f, sink = .25f; public int K = 28, R = 10, lobes = 5, seed; }
        // Organic mass: stacked rings (superellipse footprint, never larger than hw x hd), base lobes spreading like roots, taper, lean, noise-rough sides, bumpy / jagged top. Local space, base at y=0 (ring 0 is sunk below ground).
        static Mesh LumpMesh(LumpP p)
        {
            var rnd = new System.Random(p.seed); float ph = (float)rnd.NextDouble() * 6.283f, nx = (float)rnd.NextDouble() * 80f, nz0 = (float)rnd.NextDouble() * 80f, la = (float)rnd.NextDouble() * 6.283f;
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
        // irregular tube along a path (roots / limbs); the end is a flat broken cap when capEnd is set
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

        // world-space auto UVs (tile = metres per texture repeat) so scaled cubes keep one texel density
        static void WorldUv(ProBuilderMesh pb, float tile)
        {
            foreach (var f in pb.faces) { var u = f.uv; u.useWorldSpace = true; u.scale = new Vector2(tile, tile); f.uv = u; }
            pb.ToMesh(); pb.Refresh();
        }
        // every blocked component inside the slice window is either an island (<=100 tiles) or part of a bigger mass whose thin protrusions stick into the walk area; each one must show a 3D object.
        static void FillIslands(Transform root, Mats mats, HashSet<(int, int)> poolTiles, ref int count)
        {
            const int WX0 = 60, WX1 = 140, WY0 = 138, WY1 = 192;
            var seen = new bool[200, 200]; var comps = new List<List<(int, int)>>();
            for (int y = WY0; y < WY1; y++) for (int x = WX0; x < WX1; x++)
                {
                    if (Walk(x, y) || seen[y, x]) continue; var q = new Queue<(int, int)>(); var list = new List<(int, int)>(); q.Enqueue((x, y)); seen[y, x] = true;
                    while (q.Count > 0) { var (cx, cy) = q.Dequeue(); list.Add((cx, cy)); foreach (var (dx, dy) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) }) { int nx = cx + dx, ny = cy + dy; if (nx < WX0 || ny < WY0 || nx >= WX1 || ny >= WY1 || Walk(nx, ny) || seen[ny, nx]) continue; seen[ny, nx] = true; q.Enqueue((nx, ny)); } }
                    comps.Add(list);
                }
            var poolCover = new HashSet<(int, int)>(); foreach (var pl in river.pools) if (pl.kind != "w8props") foreach (var t in pl.tiles) poolCover.Add((t.tx, t.ty));   // the R1 w8props pool has no tree, so it does not count as a visible object
            string CoverKind(int tx, int ty)
            {
                float px = (tx + .5f) * T, pz = -(ty + .5f) * T;
                foreach (var f in fps) if (InFP(f, px, pz, 0.6f * T)) return f.kind;
                if (poolCover.Contains((tx, ty))) return "pool";
                var p = new Vector2(px, pz); foreach (var qd in ribbonQuads) if (InTri(p, qd[0], qd[1], qd[2]) || InTri(p, qd[0], qd[2], qd[3])) return "river";
                return null;
            }
            int Sparse(int tx, int ty) { int n = 0; for (int y = ty - 4; y <= ty + 4; y++) for (int x = tx - 4; x <= tx + 4; x++) if (!Walk(x, y)) n++; return n; }
            var rnd = new System.Random(1105); var report = new List<string>(); int id = 0, filled = 0;
            foreach (var comp in comps)
            {
                bool island = comp.Count <= 100; var cand = new List<(int, int)>();
                foreach (var (tx, ty) in comp) { if (island || (distWalk[ty, tx] <= 3 && Sparse(tx, ty) <= 36)) cand.Add((tx, ty)); }
                if (cand.Count == 0) continue;
                var covered = new Dictionary<string, int>(); var open = new List<(int, int)>();
                foreach (var (tx, ty) in cand) { var k = CoverKind(tx, ty); if (k == null) open.Add((tx, ty)); else covered[k] = covered.TryGetValue(k, out var n) ? n + 1 : 1; }
                int bx0 = 999, by0 = 999, bx1 = -1, by1 = -1; foreach (var (tx, ty) in comp) { bx0 = Mathf.Min(bx0, tx); by0 = Mathf.Min(by0, ty); bx1 = Mathf.Max(bx1, tx); by1 = Mathf.Max(by1, ty); }
                var made = new List<string>(); var openSet = new HashSet<(int, int)>(open); var done = new HashSet<(int, int)>();
                foreach (var t0 in open)
                {
                    if (done.Contains(t0)) continue; var cl = new List<(int, int)>(); var qq = new Queue<(int, int)>(); qq.Enqueue(t0); done.Add(t0);
                    while (qq.Count > 0) { var cur = qq.Dequeue(); cl.Add(cur); for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) { var nb = (cur.Item1 + dx, cur.Item2 + dy); if (openSet.Contains(nb) && !done.Contains(nb)) { done.Add(nb); qq.Enqueue(nb); } } }
                    if (cl.Count < 2 && !island) continue;                                              // single stray tiles of a big mass edge stay terrain mound
                    float mx = 0, mz = 0; int cx0 = 999, cy0 = 999, cx1 = -1, cy1 = -1; foreach (var (tx, ty) in cl) { mx += (tx + .5f) * T; mz += -(ty + .5f) * T; cx0 = Mathf.Min(cx0, tx); cy0 = Mathf.Min(cy0, ty); cx1 = Mathf.Max(cx1, tx); cy1 = Mathf.Max(cy1, ty); }
                    mx /= cl.Count; mz /= cl.Count; float gy = GroundY(mx, mz); bool w8 = cx0 == 83 && cy0 == 183 && cx1 == 85 && cy1 == 185;
                    if (w8)
                    {   // R1 fall site: broken planks + a splintered stump on the 5-tile cross (W8 story prop)
                        for (int k = 0; k < 4; k++)
                        {
                            float ang = 20f + k * 47f, len = k == 3 ? 0.55f : 0.95f; var fp = new FP { kind = "w8prop", cx = mx + Mathf.Cos(k * 1.7f) * 0.12f, cz = mz + Mathf.Sin(k * 1.7f) * 0.12f, hw = len * .5f, hd = 0.09f, yaw = ang }; int sh = 0;
                            while (FpHitsWalk(fp) && sh++ < 8) { len *= .85f; fp.hw = len * .5f; }
                            if (FpHitsWalk(fp)) continue;
                            var pb = ShapeGenerator.CreateShape(k == 3 ? ShapeType.Cylinder : ShapeType.Cube, PivotLocation.Center); pb.name = "W8_" + (count++).ToString("00"); pb.transform.SetParent(root, false);
                            if (k == 3) { pb.transform.localScale = new Vector3(0.36f, 0.55f, 0.36f); pb.transform.position = new Vector3(mx, gy + 0.2f, mz); fp.circle = true; fp.hw = 0.18f; }
                            else { pb.transform.localScale = new Vector3(len, 0.07f, 0.2f); pb.transform.SetPositionAndRotation(new Vector3(fp.cx, gy + 0.12f + k * 0.05f, fp.cz), Quaternion.Euler(0, ang, (k % 2 == 0 ? 9f : -13f))); }
                            pb.GetComponent<MeshRenderer>().sharedMaterial = mats.Bark; WorldUv(pb, 1.2f); fps.Add(fp); made.Add(pb.name);
                        }
                    }
                    else
                    {
                        float w = Mathf.Max(0.5f, (cx1 - cx0 + 1) * T * .9f), d = Mathf.Max(0.5f, (cy1 - cy0 + 1) * T * .9f); float yaw = (float)(rnd.NextDouble() - .5) * 30f;
                        var fp = new FP { kind = island ? "island-fill" : "tip-fill", cx = mx, cz = mz, hw = w * .5f, hd = d * .5f, yaw = yaw }; int sh = 0;
                        while (FpHitsWalk(fp) && sh++ < 10) { w *= .85f; d *= .85f; fp.hw = w * .5f; fp.hd = d * .5f; }
                        if (FpHitsWalk(fp) || w < 0.3f) { made.Add("skipped(no room)"); continue; }
                        float hh = Mathf.Min(0.5f + 0.1f * Mathf.Sqrt(cl.Count), SouthOfWalk(Mathf.FloorToInt(mx / T), Mathf.FloorToInt(-mz / T)) ? 0.9f : 1.5f);
                        string fname = "Fill_" + (count++).ToString("00"); MakeLump(fname, root, new Vector3(mx, gy, mz), yaw, fp.hw, fp.hd, hh, 7000 + count * 17, mats.Mass, 2.4f, false); fps.Add(fp); made.Add(fname);
                    }
                    filled++;
                }
                var cov = new List<string>(); foreach (var kv in covered) cov.Add("\"" + kv.Key + "\":" + kv.Value);
                var madeJ = new List<string>(); foreach (var x in made) madeJ.Add("\"" + x + "\"");
                report.Add("{\"id\":" + (id++) + ",\"kind\":\"" + (island ? "island" : "protrusion") + "\",\"bbox\":[" + bx0 + "," + by0 + "," + bx1 + "," + by1 + "],\"componentTiles\":" + comp.Count + ",\"checkedTiles\":" + cand.Count + ",\"coveredBy\":{" + string.Join(",", cov) + "},\"uncoveredTiles\":" + open.Count + ",\"filledBy\":[" + string.Join(",", madeJ) + "]}");
            }
            File.WriteAllText(Root + "/Data/rm1_islands.json", "{\"rule\":\"every blocked island (<=100 tiles) and every thin protrusion of a larger mass (distWalk<=3 and <=36 of 81 blocked tiles within 4 tiles) must be covered by a 3D object; uncovered clusters get a filler placed only on blocked tiles\",\"window\":[60,138,140,192],\"items\":[" + string.Join(",", report) + "]}");
            Debug.Log("[RM1] islands/protrusions checked=" + report.Count + " filled clusters=" + filled);
        }


        // ---------------------------------------------------------------- W5/W4: grass (LIFE1 colours, clustered, darker than the floor) + procedural alpha cards
        static Color32 Lerp32(Color a, Color b, float t) { return (Color32)Color.Lerp(a, b, t); }
        static void AddGrass(TerrainData td)
        {
            var path = GenDir + "/grass_blade_proc.png"; const int S = 128; var px = new Color32[S * S];
            Color baseC = new Color(.06f, .04f, .035f), tipC = new Color(.25f, .135f, .105f);   // LIFE1 baseColor / tipColor
            var rnd = new System.Random(77);
            for (int b = 0; b < 7; b++)
            {
                float x0 = 24 + b * 13f + (float)rnd.NextDouble() * 6f, dx = ((float)rnd.NextDouble() - .5f) * 46f, tip = 70f + (float)rnd.NextDouble() * 48f, w0 = 4.2f + (float)rnd.NextDouble() * 2f;
                for (int k = 0; k <= 80; k++)
                {
                    float t = k / 80f; float cx = x0 + dx * Mathf.Pow(t, 1.6f), cy = tip * t, r = Mathf.Max(0.6f, w0 * Mathf.Pow(1f - t, .8f));
                    var col = Lerp32(baseC, tipC, Mathf.Clamp01(t * 1.15f));
                    for (int yy = -6; yy <= 6; yy++) for (int xx = -6; xx <= 6; xx++)
                        {
                            int X = Mathf.RoundToInt(cx) + xx, Y = Mathf.RoundToInt(cy) + yy; if (X < 0 || Y < 0 || X >= S || Y >= S) continue;
                            float d = Mathf.Sqrt(xx * xx + yy * yy); if (d > r) continue; float a = Mathf.Clamp01((r - d) * 1.5f);
                            var o = px[Y * S + X]; if (a * 255f > o.a) { col.a = (byte)(a * 255f); px[Y * S + X] = col; }
                        }
                }
            }
            for (int x = 0; x < S; x++) for (int y = 0; y < 14; y++) { var o = px[y * S + x]; if (o.a == 0) continue; float ao = Mathf.Lerp(.55f, 1f, y / 14f); px[y * S + x] = new Color32((byte)(o.r * ao), (byte)(o.g * ao), (byte)(o.b * ao), o.a); }   // base AO
            var tex = new Texture2D(S, S, TextureFormat.RGBA32, false); tex.SetPixels32(px); File.WriteAllBytes(path, tex.EncodeToPNG()); UnityEngine.Object.DestroyImmediate(tex); AssetDatabase.ImportAsset(path);
            var ti = AssetImporter.GetAtPath(path) as TextureImporter; if (ti != null) { ti.alphaIsTransparency = true; ti.wrapMode = TextureWrapMode.Clamp; ti.mipmapEnabled = false; ti.SaveAndReimport(); }
            var dp = new DetailPrototype { prototypeTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(path), usePrototypeMesh = false, renderMode = DetailRenderMode.GrassBillboard, minWidth = .30f, maxWidth = .52f, minHeight = .32f, maxHeight = .55f, noiseSpread = .35f,
                healthyColor = new Color(1f, .94f, .90f), dryColor = new Color(.82f, .84f, .68f) };   // tintFleshy / tintOlive
            td.detailPrototypes = new[] { dp }; td.SetDetailResolution(256, 16);
            var map = new int[256, 256]; var segs = RiverSegs(); int used = 0;
            for (int i = 0; i < 256; i++) for (int j = 0; j < 256; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / 255f), Y = TY1 - (TY1 - TY0) * (i / 255f);
                    if (!Walk(Mathf.FloorToInt(X), Mathf.FloorToInt(Y)) || DistToSegs(segs, X, Y) < 3.4f) continue;
                    float n = Mathf.PerlinNoise(X * .11f + 5f, Y * .11f + 9f) * .65f + Mathf.PerlinNoise(X * .37f, Y * .37f) * .35f;   // clustered: only inside high-noise patches
                    if (n > .76f && Hash(i, j) < .15f) { map[i, j] = 1 + (Hash(j, i) < .4f ? 1 : 0); used++; }
                }
            td.SetDetailLayer(0, 0, 0, map); td.wavingGrassStrength = .35f; td.wavingGrassAmount = .3f; td.wavingGrassSpeed = .5f;
            Debug.Log("[RM1] grass clumps=" + used);
        }
        // procedural alpha card (blurred): fg = hanging/rising root tangles, bg = dead-tree silhouettes fading into haze
        static Texture2D ProcCard(string path, int seed, bool fg)
        {
            const int S = 256; var a = new float[S * S]; var rnd = new System.Random(seed);
            void Stamp(float cx, float cy, float r, float v) { int ri = Mathf.CeilToInt(r) + 1; for (int yy = -ri; yy <= ri; yy++) for (int xx = -ri; xx <= ri; xx++) { int X = Mathf.RoundToInt(cx) + xx, Y = Mathf.RoundToInt(cy) + yy; if (X < 0 || Y < 0 || X >= S || Y >= S) continue; float d = Mathf.Sqrt(xx * xx + yy * yy); if (d > r) continue; int ix = Y * S + X; a[ix] = Mathf.Max(a[ix], v * Mathf.Clamp01((r - d) * 1.2f)); } }
            void Branch(Vector2 p, float ang, float len, float w, int depth)
            {
                int steps = Mathf.Max(6, (int)len); for (int k = 0; k < steps; k++) { float t = k / (float)steps; p += new Vector2(Mathf.Cos(ang), Mathf.Sin(ang)); ang += ((float)rnd.NextDouble() - .5f) * (fg ? .5f : .22f); Stamp(p.x, p.y, Mathf.Max(1.3f, w * (1f - t * .8f)), 1f); if (depth > 0 && rnd.NextDouble() < (fg ? .035 : .05)) Branch(p, ang + ((float)rnd.NextDouble() - .5f) * 1.7f, len * .55f, w * .6f, depth - 1); }
            }
            if (fg) { for (int r = 0; r < 6; r++) Branch(new Vector2(30 + r * 38 + (float)rnd.NextDouble() * 20, 0), 1.45f + ((float)rnd.NextDouble() - .5f) * .9f, 120 + (float)rnd.NextDouble() * 80, 9 + (float)rnd.NextDouble() * 6, 3); }
            else { Branch(new Vector2(S * .5f, 0), 1.5708f + ((float)rnd.NextDouble() - .5f) * .08f, 150, 11, 4); Branch(new Vector2(S * .5f + 4, 60), 1.0f, 70, 5, 2); Branch(new Vector2(S * .5f - 4, 85), 2.15f, 70, 5, 2); }
            for (int pass = 0; pass < 2; pass++)   // two box blurs (radius 3) = out-of-focus layer
            {
                var t = new float[S * S];
                for (int y = 0; y < S; y++) for (int x = 0; x < S; x++) { float sum = 0; int n = 0; for (int k = -3; k <= 3; k++) { int X = Mathf.Clamp(x + k, 0, S - 1); sum += a[y * S + X]; n++; } t[y * S + x] = sum / n; }
                for (int y = 0; y < S; y++) for (int x = 0; x < S; x++) { float sum = 0; int n = 0; for (int k = -3; k <= 3; k++) { int Y = Mathf.Clamp(y + k, 0, S - 1); sum += t[Y * S + x]; n++; } a[y * S + x] = sum / n; }
            }
            var px = new Color32[S * S];
            for (int y = 0; y < S; y++) for (int x = 0; x < S; x++) { float v = a[y * S + x] * (fg ? 1f : Mathf.Lerp(.35f, 1f, y / (float)S)); float edge = Mathf.Clamp01(Mathf.Min(Mathf.Min(x, S - 1 - x), S - 1 - y) / 10f); px[y * S + x] = new Color32(255, 255, 255, (byte)(Mathf.Clamp01(v) * edge * 255f)); }
            var tex = new Texture2D(S, S, TextureFormat.RGBA32, false); tex.SetPixels32(px); File.WriteAllBytes(path, tex.EncodeToPNG()); UnityEngine.Object.DestroyImmediate(tex); AssetDatabase.ImportAsset(path);
            var ti = AssetImporter.GetAtPath(path) as TextureImporter; if (ti != null) { ti.alphaIsTransparency = true; ti.wrapMode = TextureWrapMode.Clamp; ti.mipmapEnabled = false; ti.SaveAndReimport(); }
            return AssetDatabase.LoadAssetAtPath<Texture2D>(path);
        }
        // far layer: dead-tree silhouette cards beyond the outer masses, never south of the walk area (they must not block the camera view of the combat floor)
        static void BuildBgCards(Transform parent, Mats mats)
        {
            var root = new GameObject("Background Cards").transform; root.SetParent(parent, false); var rnd = new System.Random(1106); var placed = new List<Vector2>(); int n = 0;
            for (int guard = 0; guard < 4000 && n < 16; guard++)
            {
                int tx = rnd.Next(TX0 + 2, TX1 - 2), ty = rnd.Next(TY0 + 2, TY1 - 2); if (Walk(tx, ty) || distWalk[ty, tx] < 6 || distWalk[ty, tx] > 14 || SouthOfWalk(tx, ty)) continue;
                var c = new Vector2(tx, ty); bool ok = true; foreach (var p in placed) if ((p - c).magnitude < 9f) { ok = false; break; } if (!ok) continue; placed.Add(c);
                var q = GameObject.CreatePrimitive(PrimitiveType.Quad); q.name = "BG_Tree_" + (n++).ToString("00"); UnityEngine.Object.DestroyImmediate(q.GetComponent<Collider>()); q.transform.SetParent(root, false);
                float h = Mathf.Lerp(5.5f, 9f, (float)rnd.NextDouble()), w = h * 0.8f; var wp = W(tx + .5f, ty + .5f); float gy = GroundY(wp.x, wp.z);
                q.transform.SetPositionAndRotation(new Vector3(wp.x, gy + h * .5f - .3f, wp.z), Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0)); q.transform.localScale = new Vector3(w * (rnd.NextDouble() < .5 ? 1f : -1f), h, 1f);
                var qr = q.GetComponent<MeshRenderer>(); qr.sharedMaterial = mats.BgTree; qr.shadowCastingMode = ShadowCastingMode.Off; qr.receiveShadows = false;
            }
            Debug.Log("[RM1] bg cards=" + n);
        }

        // ---------------------------------------------------------------- FPS: same START view, 3D layer (World root) on vs off, 1600x900, 240 frames each
        public static void Fps()
        {
            var args = Exoduser.DevTools.ExoArgs.Get(); string Arg(string k, string d) { int i = Array.IndexOf(args, k); return i >= 0 ? args[i + 1] : d; }
            var outJson = Arg("-out", "rm1-fps.json"); Load(); EditorSceneManager.OpenScene(ScenePath);
            var marker = GameObject.Find("Player Marker").transform; var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>(); terrain = UnityEngine.Object.FindFirstObjectByType<Terrain>();
            var w0 = W(100f, 185f); marker.position = new Vector3(w0.x, GroundY(w0.x, w0.z), w0.z); brain.ManualUpdate();
            var world = GameObject.Find("World"); var rt = new RenderTexture(1600, 900, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 }; cam.targetTexture = rt;
            var tex = new Texture2D(4, 4, TextureFormat.RGB24, false); var res = new List<string>();
            foreach (var on in new[] { true, false, true })
            {
                world.SetActive(on); for (int i = 0; i < 20; i++) cam.Render(); RenderTexture.active = rt; tex.ReadPixels(new Rect(0, 0, 4, 4), 0, 0);
                var sw = System.Diagnostics.Stopwatch.StartNew(); const int N = 240; for (int i = 0; i < N; i++) cam.Render(); RenderTexture.active = rt; tex.ReadPixels(new Rect(0, 0, 4, 4), 0, 0); sw.Stop();
                res.Add("{\"world3d\":" + (on ? "true" : "false") + ",\"frames\":" + N + ",\"ms\":" + sw.ElapsedMilliseconds + ",\"fps\":" + (N * 1000.0 / sw.ElapsedMilliseconds).ToString("F1") + "}");
            }
            RenderTexture.active = null; cam.targetTexture = null; Directory.CreateDirectory(Path.GetDirectoryName(outJson) ?? "."); File.WriteAllText(outJson, "{\"gpu\":\"" + SystemInfo.graphicsDeviceName + "\",\"note\":\"batchmode camera.Render loop (editor), no vsync cap; relative on/off comparison\",\"runs\":[" + string.Join(",", res) + "]}");
            Debug.Log("[RM1] fps done " + string.Join(" ", res));
        }

        // ---------------------------------------------------------------- decals (quad decals until the URP Decal feature lands)
        static void BuildDecals(Transform parent, Mats mats)
        {
            var root = new GameObject("Decals"); root.transform.SetParent(parent, false);
            var rnd = new System.Random(1104); var segs = RiverSegs();
            var buckets = new Dictionary<string, (List<Vector3> v, List<Vector2> uv, List<Color> c, List<int> t)>();
            void Add(string kind, Vector3 c, float size, float rot, Color col, bool flip = false)
            {
                if (!buckets.TryGetValue(kind, out var b)) { b = (new List<Vector3>(), new List<Vector2>(), new List<Color>(), new List<int>()); buckets[kind] = b; }
                float h = size * .5f; var q = Quaternion.Euler(0, rot, 0); int i0 = b.v.Count;
                foreach (var (dx, dz, u, v) in new[] { (-h, -h, 0f, 0f), (h, -h, 1f, 0f), (-h, h, 0f, 1f), (h, h, 1f, 1f) }) { var p = c + q * new Vector3(dx, 0, dz); p.y = GroundY(p.x, p.z) + 0.014f; b.v.Add(p); b.uv.Add(new Vector2(flip ? 1f - u : u, v)); b.c.Add(col); }
                if (flip) b.t.AddRange(new[] { i0, i0 + 1, i0 + 2, i0 + 2, i0 + 1, i0 + 3 }); else b.t.AddRange(new[] { i0, i0 + 2, i0 + 1, i0 + 1, i0 + 2, i0 + 3 });
            }
            var bones = new List<Vector3>();   // bone piles never sit next to each other: >= 3.2u apart, mirrored/rotated/scaled differently each time
            bool BoneOk(Vector3 p) { foreach (var o in bones) if ((new Vector2(o.x - p.x, o.z - p.z)).magnitude < 3.2f) return false; return true; }
            void AddBone(Vector3 p, float lo, float hi, float a) { if (!BoneOk(p)) return; bones.Add(p); double bk = rnd.NextDouble(); Add(bk < .4 ? "bone" : bk < .7 ? "bone_ribs" : "bone_skull", p, Mathf.Lerp(lo, hi, (float)rnd.NextDouble()), (float)rnd.NextDouble() * 360f, new Color(.9f, .9f, .9f, a), rnd.NextDouble() < .5); }
            string[] kinds = { "blood", "blood", "blood", "blood_drag", "blood_drops", "blood_drops", "root", "root", "root_branch", "root_tangle", "bone", "blood_cracked" };
            int n = 0;
            while (n < 70)
            {
                int tx = rnd.Next(62, 140), ty = rnd.Next(140, 192); if (!Walk(tx, ty)) continue; var wp = W(tx + (float)rnd.NextDouble(), ty + (float)rnd.NextDouble());
                float k = 0.75f + 0.25f * (float)rnd.NextDouble(); string kind = kinds[rnd.Next(kinds.Length)];
                if (kind == "bone") AddBone(wp, 1.4f, 2.4f, 0.5f + 0.35f * (float)rnd.NextDouble());
                else Add(kind, wp, Mathf.Lerp(1.4f, 3.0f, (float)rnd.NextDouble()), (float)rnd.NextDouble() * 360f, new Color(k, k, k, 0.5f + 0.35f * (float)rnd.NextDouble()), rnd.NextDouble() < .5);
                n++;
            }
            // wet banks: small soft blobs just outside the river body, spaced so they never stack into translucent overlaps
            var wetPlaced = new List<Vector2>();
            foreach (var arr in new[] { river.rivers.L, river.rivers.R })
                for (int i = 0; i + 1 < arr.Length; i += 2)
                {
                    var p = arr[i]; if (p.tx < TX0 + 2 || p.tx > TX1 - 2 || p.ty < TY0 || p.ty > TY1) continue; var q = arr[i + 1];
                    var tg = new Vector2(q.tx - p.tx, q.ty - p.ty).normalized; var nm = new Vector2(-tg.y, tg.x);
                    foreach (int s in new[] { -1, 1 })
                    {
                        var c = new Vector2(p.tx, p.ty + .5f) + nm * s * 4.4f; float sz = Mathf.Lerp(0.9f, 1.3f, (float)rnd.NextDouble());
                        if (DistToSegs(segs, c.x, c.y) < 2.3f + sz * .5f / T + 0.4f) continue;
                        var cw = new Vector2(c.x * T, -c.y * T); bool clash = false; foreach (var o in wetPlaced) if ((o - cw).magnitude < 1.7f) { clash = true; break; }
                        if (clash) continue; wetPlaced.Add(cw);
                        Add("wet", W(c.x, c.y), sz, (float)rnd.NextDouble() * 360f, new Color(1, 1, 1, 0.55f), rnd.NextDouble() < .5);
                    }
                }
            foreach (var pl in river.pools) foreach (var t in pl.tiles) if (t.role == "shore") Add("wet", W(t.tx + .5f, t.ty + .5f), 1.3f, (float)rnd.NextDouble() * 360f, new Color(1, 1, 1, 0.6f));
            // W8: R1 fall site (island x83..85 y183..185) = drag marks + scattered bones; R2 = first-fight remains near the outer masses
            var fall = W(84.5f, 184.5f);
            Add("blood_drag", fall + new Vector3(1.2f, 0, -0.9f), 2.6f, 20f, new Color(1, 1, 1, 0.9f)); Add("blood_drag", fall + new Vector3(2.0f, 0, -1.7f), 2.2f, 35f, new Color(1, 1, 1, 0.8f));
            AddBone(fall + new Vector3(0.2f, 0, -0.4f), 1.0f, 1.3f, 1f); AddBone(fall + new Vector3(3.6f, 0, -2.6f), 1.5f, 1.9f, 1f);
            for (int cl = 0; cl < 4; cl++)
            {
                int tx, ty, guard = 0; do { tx = rnd.Next(76, 130); ty = rnd.Next(141, 168); } while ((!Walk(tx, ty) || distBlock[ty, tx] < 3 || distBlock[ty, tx] > 6) && guard++ < 3000);
                var cw = W(tx + .5f, ty + .5f);
                for (int k = 0; k < 5; k++)
                {
                    var pp = cw + new Vector3((float)(rnd.NextDouble() * 3 - 1.5), 0, (float)(rnd.NextDouble() * 3 - 1.5)); float sz = Mathf.Lerp(1.1f, 2.2f, (float)rnd.NextDouble());
                    if (k == 0) AddBone(pp, 1.3f, 2.2f, .85f);                                   // one bone pile per remains cluster; the rest are different kinds
                    else Add(k == 1 ? "blood_drag" : k == 2 ? "blood_drops" : k == 3 ? "root_branch" : "blood", pp, sz, (float)rnd.NextDouble() * 360f, new Color(.9f, .9f, .9f, .85f), rnd.NextDouble() < .5);
                }
            }
            foreach (var kv in buckets)
            {
                var m = new Mesh { name = "Decals_" + kv.Key, indexFormat = IndexFormat.UInt32 }; m.SetVertices(kv.Value.v); m.SetUVs(0, kv.Value.uv); m.SetColors(kv.Value.c); m.SetTriangles(kv.Value.t, 0); m.RecalculateBounds(); m.RecalculateNormals();
                SaveMesh(m, "Decals_" + kv.Key);
                var go = new GameObject("Decals_" + kv.Key); go.transform.SetParent(root.transform, false);
                go.AddComponent<MeshFilter>().sharedMesh = m; var mr = go.AddComponent<MeshRenderer>(); mr.sharedMaterial = mats.Decal[kv.Key]; mr.shadowCastingMode = ShadowCastingMode.Off; mr.receiveShadows = false;
                if (kv.Key == "wet") { mats.Decal["wet"].SetColor("_Tint", Hex("#5a5020")); }
            }
        }

        // ---------------------------------------------------------------- lighting: weak key, light pools (Lights/Pools/Pool_Hell_NN, Pool_Toxic_NN), hell shafts, low fog
        static void BuildLighting(Mats mats)
        {
            var sunGo = new GameObject("Key Light"); var sun = sunGo.AddComponent<Light>(); sun.type = LightType.Directional;
            sun.color = new Color(1f, .80f, .70f); sun.intensity = 0.6f; sun.shadows = LightShadows.Soft; sun.shadowStrength = 0.8f;
            sunGo.transform.rotation = Quaternion.Euler(50f, 135f, 0f);                       // north-west world light
            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(.19f, .12f, .11f); RenderSettings.ambientEquatorColor = new Color(.12f, .075f, .07f); RenderSettings.ambientGroundColor = new Color(.05f, .03f, .03f);
            RenderSettings.subtractiveShadowColor = ShadowCol;
            RenderSettings.fog = true; RenderSettings.fogMode = FogMode.ExponentialSquared; RenderSettings.fogColor = FogLow; RenderSettings.fogDensity = 0.018f;
            var vol = new GameObject("Global Volume").AddComponent<Volume>(); vol.isGlobal = true;
            vol.sharedProfile = AssetDatabase.LoadAssetAtPath<VolumeProfile>("Assets/Exoduser/Rendering/GlobalVolume_Hell.asset");

            var pools = new GameObject("Lights").transform; var parent = new GameObject("Pools").transform; parent.SetParent(pools.transform, false);
            void PoolLight(string name, Vector2 tile, Color col, float range, float intensity, float h)
            {
                var go = new GameObject(name); go.transform.SetParent(parent, false); go.transform.position = W(tile.x, tile.y, h);
                var l = go.AddComponent<Light>(); l.type = LightType.Point; l.color = col; l.range = range; l.intensity = intensity; l.shadows = LightShadows.None;
            }
            PoolLight("Pool_Hell_01", new Vector2(95f, 183f), LightHell, 5.8f, 7f, 1.3f);
            PoolLight("Pool_Hell_02", new Vector2(109f, 174f), LightHell, 5.2f, 6f, 1.3f);
            PoolLight("Pool_Hell_03", new Vector2(100f, 156f), LightHell, 6.0f, 7.5f, 1.3f);
            PoolLight("Pool_Hell_04", new Vector2(112f, 142f), LightHell, 5.2f, 6f, 1.3f);
            PoolLight("Pool_Hell_05", new Vector2(80.5f, 152.5f), LightHell, 3.6f, 5f, 1.0f);   // west crimson pool
            PoolLight("Pool_Toxic_01", new Vector2(124.5f, 149.5f), LightToxic, 4.4f, 2.4f, 0.7f);
            RPt near = null; foreach (var p in river.rivers.R) if (p.ty == 184) near = p;
            if (near != null) PoolLight("Pool_Toxic_02", new Vector2(near.tx, 184.5f), LightToxic, 3.8f, 1.8f, 0.7f);

            var shafts = new GameObject("Shafts").transform;
            MakeShaft(shafts, "Shaft_Hell_01", new Vector2(100f, 156f), mats.Shaft1);
            MakeShaft(shafts, "Shaft_Hell_02", new Vector2(95f, 183f), mats.Shaft2);
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
        static Material FgMat;
        static Transform BuildCamera()
        {
            var camGo = new GameObject("Main Camera") { tag = "MainCamera" }; var cam = camGo.AddComponent<Camera>();
            cam.orthographic = false; cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = Hex("#060403"); cam.nearClipPlane = 0.3f; cam.farClipPlane = 160f;
            float fov = 2f * Mathf.Atan(900f / (2f * 1400f)) * Mathf.Rad2Deg; cam.fieldOfView = fov;
            var offset = new Vector3(0, Mathf.Sin(Pitch), -Mathf.Cos(Pitch)) * DistU; var start = W(100f, 185f);
            camGo.transform.SetPositionAndRotation(start + offset, Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0));
            camGo.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing = true;
            // W4 foreground layer: two blurred root cards in the lower screen corners, parented to the camera (they follow the view)
            float fz = 6.5f; var fgRoot = new GameObject("Foreground Cards"); fgRoot.transform.SetParent(camGo.transform, false);
            foreach (var (nm, lx, ly, sc) in new[] { ("FG_Roots_L", -3.15f, -1.72f, 1.5f), ("FG_Roots_R", 3.2f, -1.78f, 1.3f) })
            {
                var q = GameObject.CreatePrimitive(PrimitiveType.Quad); q.name = nm; UnityEngine.Object.DestroyImmediate(q.GetComponent<Collider>()); q.transform.SetParent(fgRoot.transform, false);
                q.transform.localPosition = new Vector3(lx, ly, fz); q.transform.localScale = new Vector3(sc * (lx < 0 ? 1f : -1f), sc * .85f, 1f);
                var qr = q.GetComponent<MeshRenderer>(); qr.sharedMaterial = FgMat; qr.shadowCastingMode = ShadowCastingMode.Off; qr.receiveShadows = false;
            }
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
            // bake straight from the walk-tile mesh with a small clearance radius (0.1u): a tile centre is 0.2u from the nearest blocked edge, so every walk tile survives erosion and no blocked tile is ever covered
            var st = NavMesh.GetSettingsByID(surf.agentTypeID); st.agentRadius = 0.1f; st.agentHeight = 1.6f; st.overrideVoxelSize = true; st.voxelSize = 0.04f; st.minRegionArea = 0f;
            var src = new List<NavMeshBuildSource> { new NavMeshBuildSource { shape = NavMeshBuildSourceShape.Mesh, sourceObject = m, transform = Matrix4x4.identity, area = 0, component = null } };
            var bnd = new Bounds(new Vector3((TX0 + TX1) * .5f * T, 0f, -(TY0 + TY1) * .5f * T), new Vector3((TX1 - TX0) * T + 4f, 8f, (TY1 - TY0) * T + 4f));
            var data = NavMeshBuilder.BuildNavMeshData(st, src, bnd, Vector3.zero, Quaternion.identity);
            surf.navMeshData = data; surf.AddData();
            int pass1Nav = 0, pass1Core = 0; var navOnly1 = new List<(int, int)>();
            AssetDatabase.DeleteAsset(GenDir + "/RM1_NavMesh.asset"); AssetDatabase.CreateAsset(surf.navMeshData, GenDir + "/RM1_NavMesh.asset");
            var tri = NavMesh.CalculateTriangulation(); Debug.Log("[RM1] navmesh verts=" + tri.vertices.Length + " tris=" + tri.indices.Length / 3);
            var navOnly = NavDiff(out var coreOnly, out int tested);
            var cj = new List<string>(); foreach (var (tx, ty) in coreOnly) { bool edge = false; for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) if (!Walk(tx + dx, ty + dy)) edge = true; cj.Add($"{{\"tx\":{tx},\"ty\":{ty},\"boundary\":{(edge ? "true" : "false")}}}"); }
            var nj = new List<string>(); foreach (var (tx, ty) in navOnly) nj.Add($"[{tx},{ty}]");
            Directory.CreateDirectory("../../_out/rm1");
            File.WriteAllText("../../_out/rm1/navmesh_diff.json", "{\"note\":\"NavMesh baked straight from the walk-tile mesh with agentRadius 0.1u (voxel 0.04u, agentHeight 1.6u) so it matches the Core walk grid; mob spacing and body clearance must be set on the NavMeshAgent (radius), not by eroding the mesh. coreOnlyTiles entries carry boundary=true when the tile touches a blocked tile.\",\"window\":[60,138,140,192],\"tested\":" + tested + ",\"pass1\":{\"coreWalkNavNo\":" + pass1Core + ",\"navWalkCoreNo\":" + pass1Nav + "},\"coreWalkNavNo\":" + coreOnly.Count + ",\"navWalkCoreNo\":" + navOnly.Count + ",\"carvedVolumes\":" + navOnly1.Count + ",\"navOnlyTiles\":[" + string.Join(",", nj) + "],\"coreOnlyTiles\":[" + string.Join(",", cj) + "]}");
            Debug.Log($"[RM1] navmesh tested={tested} pass1 coreOnly={pass1Core} navOnly={pass1Nav} -> final coreWalkNavNo={coreOnly.Count} navWalkCoreNo={navOnly.Count}");
        }
        // walk-grid vs baked NavMesh over the slice window; the baked surface sits ~0.1u above the mesh, so height is tolerated and the horizontal distance decides
        static List<(int, int)> NavDiff(out List<(int, int)> coreOnly, out int tested)
        {
            var navOnly = new List<(int, int)>(); coreOnly = new List<(int, int)>(); tested = 0;
            for (int ty = 138; ty < 192; ty++) for (int tx = 60; tx < 140; tx++)
                {
                    bool core = Walk(tx, ty); var c = W(tx + .5f, ty + .5f); bool nav = NavMesh.SamplePosition(c, out var nh, 0.5f, NavMesh.AllAreas) && new Vector2(nh.position.x - c.x, nh.position.z - c.z).magnitude < 0.06f;
                    tested++; if (core == nav) continue; if (core) coreOnly.Add((tx, ty)); else navOnly.Add((tx, ty));
                }
            return navOnly;
        }

        // ---------------------------------------------------------------- capture
        public static void Capture()
        {
            var args = Exoduser.DevTools.ExoArgs.Get(); string Arg(string k, string d) { int i = Array.IndexOf(args, k); return i >= 0 ? args[i + 1] : d; }
            var outDir = Arg("-outDir", "rm1-cuts"); Directory.CreateDirectory(outDir);
            var cuts = Arg("-cuts", "start,r2,river").Split(',');
            Load(); EditorSceneManager.OpenScene(ScenePath);
            var marker = GameObject.Find("Player Marker").transform; var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>();
            terrain = UnityEngine.Object.FindFirstObjectByType<Terrain>();
            RPt rp = null; foreach (var p in river.rivers.R) if (p.ty == 182) rp = p;
            var focus = new Dictionary<string, Vector2> { { "start", new Vector2(100f, 185f) }, { "r2", new Vector2(112f, 152f) }, { "river", new Vector2((rp != null ? rp.tx : 124f) - 8f, 181f) } };
            if (Arg("-shape", "0") == "1")
            {   // shape check only: neutral flat light so silhouettes can be judged independent of the (dark) hell lighting; the saved scene is untouched
                RenderSettings.ambientMode = AmbientMode.Flat; RenderSettings.ambientLight = new Color(.5f, .48f, .47f); RenderSettings.fog = false;
                foreach (var l in UnityEngine.Object.FindObjectsByType<Light>(FindObjectsSortMode.None)) if (l.type == LightType.Directional) { l.intensity = 1.7f; l.color = Color.white; }
            }
            bool capsule = Arg("-capsule", "0") == "1";
            GameObject cap = null;
            if (capsule)
            {   // player-size stand-in (1.6u tall, 0.5u wide) to judge occlusion; hides the sandbox marker sprite
                var ms = marker.Find("Marker Sprite"); if (ms != null) ms.gameObject.SetActive(false);
                cap = GameObject.CreatePrimitive(PrimitiveType.Capsule); cap.name = "Capture Capsule"; cap.transform.SetParent(marker, false); cap.transform.localPosition = new Vector3(0, 0.8f, 0); cap.transform.localScale = new Vector3(0.5f, 0.8f, 0.5f);
                UnityEngine.Object.DestroyImmediate(cap.GetComponent<Collider>());
                var cm = new Material(Shader.Find("Universal Render Pipeline/Lit")); cm.SetColor("_BaseColor", new Color(.25f, .85f, .95f)); cap.GetComponent<MeshRenderer>().sharedMaterial = cm;
            }
            foreach (var cut in cuts)
            {
                if (cut == "top") { CaptureTop(outDir); continue; }
                if (cut == "close" || cut == "trunk")
                {   // close-up: the Mass_* nearest to START (close) or the first Trunk_* (trunk) centred on the marker
                    Transform best = null; float bd = 1e9f; var s0 = W(112f, 152f);
                    foreach (Transform ch in GameObject.Find("Blockout").transform)
                    {
                        bool isM = cut == "close" && ch.name.StartsWith("Mass_"); bool isT = cut == "trunk" && ch.name.StartsWith("Trunk_") && !ch.name.Contains("Limb");
                        if (!isM && !isT) continue; float d = new Vector2(ch.position.x - s0.x, ch.position.z - s0.z).magnitude; if (cut == "close" && d < 3f) continue; if (isM && d < bd || isT && best == null) { bd = d; best = ch; }
                    }
                    if (best == null) continue; marker.position = best.position + new Vector3(0, 0.2f, -2.2f);
                }
                else
                {
                    if (!focus.TryGetValue(cut, out var f)) continue;
                    var w = W(f.x, f.y); marker.position = new Vector3(w.x, GroundY(w.x, w.z), w.z);
                }
                var rt = new RenderTexture(1600, 900, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 }; cam.targetTexture = rt;
                brain.ManualUpdate(); cam.Render();
                RenderTexture.active = rt; var tex = new Texture2D(1600, 900, TextureFormat.RGB24, false); tex.ReadPixels(new Rect(0, 0, 1600, 900), 0, 0); tex.Apply();
                File.WriteAllBytes(Path.Combine(outDir, "rm1_" + cut + (capsule ? "_cap" : "") + (Arg("-shape", "0") == "1" ? "_shape" : "") + ".png"), tex.EncodeToPNG()); RenderTexture.active = null; cam.targetTexture = null;
                UnityEngine.Object.DestroyImmediate(tex); rt.Release();
                Debug.Log("[RM1] captured " + cut);
            }
        }
        // orthographic top view of the slice window (x60..140 y138..192) with the Core walk tiles overlaid in translucent green
        static void CaptureTop(string outDir)
        {
            var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>(); if (brain != null) brain.enabled = false;
            const int Wpx = 3200, Hpx = 2160; const float x0 = 60 * T, x1 = 140 * T, zN = -138 * T, zS = -192 * T;
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
            File.WriteAllBytes(Path.Combine(outDir, "rm1_top_walk_overlay.png"), tex.EncodeToPNG()); RenderTexture.active = null; cam.targetTexture = null;
            UnityEngine.Object.DestroyImmediate(tex); rt.Release(); Debug.Log("[RM1] captured top");
        }
    }
}
