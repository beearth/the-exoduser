using System;
using System.Collections.Generic;
using System.IO;
using Unity.AI.Navigation;
using Unity.Cinemachine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.AI;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

// RM-3 (chapter 1, stage 1-3 = web si2) structure blockout builder (idempotent).
//   Unity -batchmode -executeMethod Exoduser.Rm3SliceBuilder.Run      builds Remodel/CH1_3/RM3_Slice.unity
//   ... .Capture -outDir <dir> [-cuts start,heart,cave,front,river,top] [-capsule 1]
//   ... .Fps -out <json>
//   ... .All -outDir <dir> -fpsOut <json>   Run + Capture + Fps in one editor session (one process)
// Source of truth for the walk grid is the web oracle dump Data/ch1_3_walk.json (rows[ty], '0' = walkable, 200x200, grid edge is walkable).
// Everything outside the grid is blocked: outer masses, toxic rivers and the tall mushroom wall stand there (>= 0.5 tile from any walkable tile).
// Coordinates: web px -> world x = px/100, z = -py/100 (1 tile = 40px = 0.4u). Core (Runtime/Core) is not touched; the 3D layer is render only.
// RM-1 assets (CH1_1 materials/shaders) are referenced read-only; the lump/tube mesh generators below are copies of the RM-1 ones.
namespace Exoduser
{
    public static class Rm3SliceBuilder
    {
        const string Root = "Assets/Exoduser/Remodel/CH1_3";
        const string R1 = "Assets/Exoduser/Remodel/CH1_1";
        const string ScenePath = Root + "/RM3_Slice.unity";
        const string GenDir = Root + "/Generated";
        const string DataDir = Root + "/Data";
        const int GN = 200;
        const int TX0 = -20, TX1 = 220, TY0 = -20, TY1 = 220;   // padded terrain window (tiles): outer masses, rivers and background live here
        const float T = 0.4f, TerrainH = 4f, BaseY = -0.5f, Pitch = 0.85f, DistU = 14f, CamSideMax = 0.9f;
        const int HRes = 1025, ARes = 512;

        [Serializable] class WalkJ { public string[] rows; }
        [Serializable] class IObj { public string type; public float[] tile; }
        [Serializable] class Isl { public int id, size, camSide; public int[] bbox; public float[] center; public string source; public IObj[] objs; }
        [Serializable] class IslJ { public Isl[] islands; }

        static string[] walkRows; static Isl[] islands; static int[,] dw; static Terrain terrain;
        static readonly Color LightHell = Hex("#b0281c"), LightToxic = Hex("#b7b54a"), ShadowCol = Hex("#120c0a"), FogLow = Hex("#2a1a16");
        static Color Hex(string h) { ColorUtility.TryParseHtmlString(h, out var c); return c; }
        static bool Walk(int x, int y) { return x >= 0 && y >= 0 && x < GN && y < GN && walkRows[y][x] == '0'; }
        static float Hash(int x, int y) { unchecked { uint h = (uint)(x * 374761393 + y * 668265263); h = (h ^ (h >> 13)) * 1274126177u; return ((h ^ (h >> 16)) & 0xffff) / 65535f; } }
        static Vector3 W(float tx, float ty, float y = 0f) { return new Vector3(tx * T, y, -ty * T); }
        static float Smooth(float a, float b, float x) { x = Mathf.Clamp01((x - a) / (b - a)); return x * x * (3 - 2 * x); }
        static int DW(int tx, int ty) { return dw[ty - TY0, tx - TX0]; }

        // ---------------------------------------------------------------- footprints (proof that no 3D mass / river covers a Core walk tile)
        struct FP { public string kind; public float cx, cz, hw, hd, yaw; public bool circle; }
        static readonly List<FP> fps = new List<FP>();
        static readonly List<Vector2[]> ribbonQuads = new List<Vector2[]>();
        static readonly List<(Vector2 c, float r)> flatCover = new List<(Vector2, float)>();   // pool discs / spore pits, tile coords
        class MassRec { public string name, kind; public float cx, cz, top; public bool inGrid, south; }
        static readonly List<MassRec> massRecs = new List<MassRec>();
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
            int x0 = Mathf.Max(0, Mathf.FloorToInt((f.cx - r) / T) - 1), x1 = Mathf.Min(GN - 1, Mathf.CeilToInt((f.cx + r) / T) + 1), y0 = Mathf.Max(0, Mathf.FloorToInt((-f.cz - r) / T) - 1), y1 = Mathf.Min(GN - 1, Mathf.CeilToInt((-f.cz + r) / T) + 1);
            for (int ty = y0; ty <= y1; ty++) for (int tx = x0; tx <= x1; tx++)
                    if (Walk(tx, ty) && InFP(f, (tx + .5f) * T, -(ty + .5f) * T, 0.04f)) return true;
            return false;
        }
        static bool InTri(Vector2 p, Vector2 a, Vector2 b, Vector2 c)
        {
            float d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y), d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y), d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
            bool neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0; return !(neg && pos);
        }
        static bool InRibbon(float px, float pz)
        {
            var p = new Vector2(px, pz); foreach (var q in ribbonQuads) if (InTri(p, q[0], q[1], q[2]) || InTri(p, q[0], q[2], q[3])) return true; return false;
        }
        static bool InFlat(int tx, int ty) { foreach (var (c, r) in flatCover) if ((new Vector2(tx + .5f, ty + .5f) - c).magnitude < r) return true; return false; }
        static bool Covered(int tx, int ty, float margin)
        {
            float px = (tx + .5f) * T, pz = -(ty + .5f) * T;
            foreach (var f in fps) if (InFP(f, px, pz, margin)) return true;
            return InFlat(tx, ty) || InRibbon(px, pz);
        }
        static bool Unplaceable(FP f, float minSep)   // overlaps an already placed footprint too much
        {
            foreach (var o in fps) { if (!o.circle) continue; float d = Mathf.Sqrt((o.cx - f.cx) * (o.cx - f.cx) + (o.cz - f.cz) * (o.cz - f.cz)); if (d < minSep * (o.hw + f.hw)) return true; }
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
        static void Shuffle<TT>(List<TT> l, System.Random r) { for (int i = l.Count - 1; i > 0; i--) { int j = r.Next(i + 1); (l[i], l[j]) = (l[j], l[i]); } }
        static float Rf(System.Random r, float a, float b) { return Mathf.Lerp(a, b, (float)r.NextDouble()); }

        // ---------------------------------------------------------------- data
        static void Load()
        {
            walkRows = JsonUtility.FromJson<WalkJ>(File.ReadAllText(DataDir + "/ch1_3_walk.json")).rows;
            if (walkRows == null || walkRows.Length != GN || walkRows[0].Length != GN) throw new InvalidOperationException("ch1_3_walk.json rows must be 200x200");
            islands = JsonUtility.FromJson<IslJ>(File.ReadAllText(DataDir + "/ch1_3_blocked_islands.json")).islands;
            // chebyshev distance (8-neighbour BFS) to the nearest walkable tile over the padded window; out-of-grid counts as blocked
            int P = TX1 - TX0; dw = new int[P, P]; var q = new Queue<(int, int)>();
            for (int y = TY0; y < TY1; y++) for (int x = TX0; x < TX1; x++) { bool w = Walk(x, y); dw[y - TY0, x - TX0] = w ? 0 : -1; if (w) q.Enqueue((x, y)); }
            while (q.Count > 0) { var (x, y) = q.Dequeue(); for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) { int nx = x + dx, ny = y + dy; if (nx < TX0 || ny < TY0 || nx >= TX1 || ny >= TY1 || dw[ny - TY0, nx - TX0] >= 0) continue; dw[ny - TY0, nx - TX0] = dw[y - TY0, x - TX0] + 1; q.Enqueue((nx, ny)); } }
        }
        static List<(int, int)> IslandTiles(Isl s)
        {
            var seen = new HashSet<(int, int)>(); var list = new List<(int, int)>();
            // the island json carries bbox only; flood the bbox for blocked tiles connected to its first blocked tile (islands are 4-connected components)
            for (int y = s.bbox[1]; y <= s.bbox[3]; y++) for (int x = s.bbox[0]; x <= s.bbox[2]; x++)
                {
                    if (Walk(x, y) || seen.Contains((x, y))) continue; var comp = new List<(int, int)>(); var qq = new Queue<(int, int)>(); qq.Enqueue((x, y)); seen.Add((x, y));
                    while (qq.Count > 0) { var c = qq.Dequeue(); comp.Add(c); foreach (var (dx, dy) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) }) { var n = (c.Item1 + dx, c.Item2 + dy); if (n.Item1 < 0 || n.Item2 < 0 || n.Item1 >= GN || n.Item2 >= GN || Walk(n.Item1, n.Item2) || seen.Contains(n)) continue; seen.Add(n); qq.Enqueue(n); } }
                    if (comp.Count > list.Count) list = comp;   // the bbox of one island is not shared with another 4-connected component; keep the biggest to be safe
                }
            return list;
        }

        // ---------------------------------------------------------------- plan constants (tools/rm3/plan_rm3.json, tile coords)
        static readonly (Vector2 at, float rPx)[] HellPools = {
            (new Vector2(100, 176), 280), (new Vector2(86, 150), 260), (new Vector2(112, 130), 300), (new Vector2(82, 96), 260), (new Vector2(58, 62), 300),
            (new Vector2(122, 58), 260), (new Vector2(100, 30), 300), (new Vector2(158, 112), 240), (new Vector2(40, 118), 240), (new Vector2(176, 52), 240) };
        static readonly (Vector2 at, float rPx)[] ToxicPools = { (new Vector2(70.5f, 37.5f), 160), (new Vector2(144.5f, 76.5f), 160), (new Vector2(-3f, 96f), 180), (new Vector2(203f, 150f), 180) };
        static readonly Vector2[] ShaftAt = { new Vector2(101, 124), new Vector2(57, 68), new Vector2(100, 26) };
        static readonly Vector2[] PoolDisc = { new Vector2(70.5f, 37.5f), new Vector2(144.5f, 76.5f) };   // toxic pools on islands 7 and 4
        static readonly Vector2[] DryPit = { new Vector2(4.5f, 156.5f), new Vector2(8.5f, 180.5f) };       // spore pits on islands 12 and 13
        static readonly Vector2[] DragPath = { new Vector2(100, 150), new Vector2(80, 110), new Vector2(66, 80), new Vector2(58, 74) };

        // ---------------------------------------------------------------- rivers (outside the grid, flow south -> north)
        static List<Vector2> RiverPts(bool west)
        {
            var l = new List<Vector2>(); int yEnd = west ? 22 : 42;
            for (int ty = 218; ty >= yEnd; ty -= 6) l.Add(new Vector2(west ? -4.6f + 0.9f * Mathf.Sin(ty * 0.045f) : 203.6f + 0.9f * Mathf.Sin(ty * 0.05f + 1.3f), ty));
            return l;
        }
        static List<(Vector2 a, Vector2 b)> RiverSegs()
        {
            var segs = new List<(Vector2, Vector2)>();
            foreach (var arr in new[] { RiverPts(true), RiverPts(false) }) for (int i = 0; i + 1 < arr.Count; i++) segs.Add((arr[i], arr[i + 1]));
            return segs;
        }
        static float DistToSegs(List<(Vector2 a, Vector2 b)> segs, float X, float Y)
        {
            float best = 1e9f; var p = new Vector2(X, Y);
            foreach (var (a, b) in segs) { var ab = b - a; float t = Mathf.Clamp01(Vector2.Dot(p - a, ab) / Mathf.Max(1e-5f, ab.sqrMagnitude)); float d = (p - (a + ab * t)).sqrMagnitude; if (d < best) best = d; }
            return Mathf.Sqrt(best);
        }

        // ---------------------------------------------------------------- entry points
        public static void Run()
        {
            Directory.CreateDirectory(GenDir); Directory.CreateDirectory(Root + "/Materials"); AssetDatabase.Refresh();
            Load(); fps.Clear(); ribbonQuads.Clear(); flatCover.Clear(); massRecs.Clear(); nestInfo = "{}"; outerCounts = ""; islandStyleReport = "";
            foreach (var c in PoolDisc) flatCover.Add((c, 2.2f)); foreach (var c in DryPit) flatCover.Add((c, 1.5f));
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
            BuildLighting(mats);
            BuildCamera(mats);
            BuildNavMesh(world.transform);
            WriteStructureReports();
            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            Debug.Log("[RM3] slice built: " + ScenePath);
        }
        public static void All()
        {
            Run(); Capture(); Fps();
            Debug.Log("[RM3] all done " + Arg("-outDir", "?"));
        }

        // ---------------------------------------------------------------- materials (RM-1 assets are loaded, never modified)
        class Mats { public Material Toxic, Mass, Bark, FgRoots, BgTree, Shaft1, Shaft2, CapWarm, CapDark, Stem, EyeBone, EyePupil, VoidDark; public Dictionary<string, Material> Decal = new Dictionary<string, Material>(); }
        static Material Own(string name, Action<Material> init)
        {
            var path = Root + "/Materials/" + name + ".mat"; var m = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (m == null) { m = new Material(Shader.Find("Universal Render Pipeline/Lit")); AssetDatabase.CreateAsset(m, path); }
            init(m); EditorUtility.SetDirty(m); return m;
        }
        static Material Ref(string name)
        {
            var m = AssetDatabase.LoadAssetAtPath<Material>(R1 + "/Materials/" + name + ".mat");
            if (m == null) throw new InvalidOperationException("missing RM-1 material " + name);
            return m;
        }
        static Mats MakeMaterials()
        {
            var mats = new Mats();
            mats.Toxic = Ref("M_ToxicFlow"); mats.Mass = Ref("M_RottenWoodMembrane"); mats.Bark = Ref("M_CursedBark"); mats.FgRoots = Ref("M_FgRoots"); mats.BgTree = Ref("M_BgTree"); mats.Shaft1 = Ref("M_Shaft_Hell_1"); mats.Shaft2 = Ref("M_Shaft_Hell_2");
            foreach (var n in new[] { "blood", "blood_cracked", "blood_drag", "blood_drops", "root", "root_branch", "root_tangle", "bone", "bone_ribs", "bone_skull" }) mats.Decal[n] = Ref("M_Decal_" + n);
            // mushroom materials reuse the confirmed hand-painted mass_v01 (+ its normal map) from RM-1; only the tint differs. No generated art.
            var massTex = AssetDatabase.LoadAssetAtPath<Texture2D>(R1 + "/Materials/Mass/mass_v01.png"); var nrmTex = AssetDatabase.LoadAssetAtPath<Texture2D>(R1 + "/Materials/Mass/mass_v01_normal.png");
            Action<Material, Color, float> massInit = (m, tint, smooth) => { m.SetTexture("_BaseMap", massTex); m.SetColor("_BaseColor", tint); m.SetTexture("_BumpMap", nrmTex); m.SetFloat("_BumpScale", 1f); m.EnableKeyword("_NORMALMAP"); m.SetFloat("_Smoothness", smooth); m.SetFloat("_Metallic", 0f); };
            mats.CapWarm = Own("M_MushCapWarm", m => massInit(m, new Color(.62f, .42f, .38f), .14f));
            mats.CapDark = Own("M_MushCapDark", m => massInit(m, new Color(.40f, .30f, .32f), .10f));
            mats.Stem = Own("M_MushStem", m => massInit(m, new Color(.55f, .48f, .42f), .06f));
            mats.EyeBone = Own("M_EyeBone", m => { m.SetColor("_BaseColor", new Color(.72f, .66f, .54f)); m.SetFloat("_Smoothness", .35f); });
            mats.EyePupil = Own("M_EyePupil", m => { m.SetColor("_BaseColor", new Color(.16f, .04f, .035f)); m.SetFloat("_Smoothness", .5f); });
            mats.VoidDark = Own("M_VoidDark", m => { m.SetColor("_BaseColor", new Color(.03f, .02f, .018f)); m.SetFloat("_Smoothness", 0f); });
            return mats;
        }

        // ---------------------------------------------------------------- terrain
        static void TexSettings(string path, bool clamp, int max)
        {
            var imp = AssetImporter.GetAtPath(path) as TextureImporter; if (imp == null) return; bool dirty = false;
            if (clamp && imp.wrapMode != TextureWrapMode.Clamp) { imp.wrapMode = TextureWrapMode.Clamp; dirty = true; }
            if (imp.maxTextureSize != max) { imp.maxTextureSize = max; dirty = true; }
            if (dirty) imp.SaveAndReimport();
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
            // P1 is structure only: the three PAINTGROUND detail floors, macro-blended by noise (the hand-painted si2 colour map is a P2 tone item, W1)
            layers.Add(TL("Floor1", R1 + "/Materials/Ground/floor_v01b.png", new Vector2(3.2f, 3.2f)));
            layers.Add(TL("Floor2", R1 + "/Materials/Ground/floor_v02b.png", new Vector2(2.6f, 2.6f)));
            layers.Add(TL("Floor3", R1 + "/Materials/Ground/floor_v03b.png", new Vector2(3.6f, 3.6f)));
            float sx = (TX1 - TX0) * T, sz = (TY1 - TY0) * T;
            var path2 = GenDir + "/RM3_Terrain.asset"; AssetDatabase.DeleteAsset(path2);
            var td = new TerrainData { heightmapResolution = HRes, alphamapResolution = ARes, baseMapResolution = 512 };
            td.size = new Vector3(sx, TerrainH, sz);
            AssetDatabase.CreateAsset(td, path2);
            td.terrainLayers = layers.ToArray();
            td.SetHeights(0, 0, ComputeHeights());
            td.SetAlphamaps(0, 0, ComputeAlpha());
            return td;
        }
        static Dictionary<(int, int), float> PoolTileH()
        {
            var o = new Dictionary<(int, int), float>();
            foreach (var c in PoolDisc) for (int ty = Mathf.FloorToInt(c.y - 3); ty <= Mathf.CeilToInt(c.y + 3); ty++) for (int tx = Mathf.FloorToInt(c.x - 3); tx <= Mathf.CeilToInt(c.x + 3); tx++)
                        if ((new Vector2(tx + .5f, ty + .5f) - c).magnitude < 2.2f) o[(tx, ty)] = -0.28f;
            foreach (var c in DryPit) for (int ty = Mathf.FloorToInt(c.y - 2); ty <= Mathf.CeilToInt(c.y + 2); ty++) for (int tx = Mathf.FloorToInt(c.x - 2); tx <= Mathf.CeilToInt(c.x + 2); tx++)
                        if (!Walk(tx, ty) && (new Vector2(tx + .5f, ty + .5f) - c).magnitude < 1.5f) o[(tx, ty)] = -0.08f;
            return o;
        }
        static float TileH(int tx, int ty, Dictionary<(int, int), float> pool)
        {
            if (pool.TryGetValue((tx, ty), out var ph)) return ph;
            if (Walk(tx, ty)) return 0f;
            int d = (tx < TX0 || ty < TY0 || tx >= TX1 || ty >= TY1) ? 8 : DW(tx, ty);
            return Mathf.Min(1.5f, 0.28f * (d - 0.2f)) * (0.75f + 0.5f * Hash(tx, ty));
        }
        static float[,] ComputeHeights()
        {
            var pool = PoolTileH(); var h = new float[HRes, HRes]; var segs = RiverSegs();
            for (int i = 0; i < HRes; i++) for (int j = 0; j < HRes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(HRes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(HRes - 1));
                    float fx = X - .5f, fy = Y - .5f; int x0 = Mathf.FloorToInt(fx), y0 = Mathf.FloorToInt(fy); float ax = fx - x0, ay = fy - y0;
                    h[i, j] = Mathf.Lerp(Mathf.Lerp(TileH(x0, y0, pool), TileH(x0 + 1, y0, pool), ax), Mathf.Lerp(TileH(x0, y0 + 1, pool), TileH(x0 + 1, y0 + 1, pool), ax), ay);
                }
            for (int pass = 0; pass < 2; pass++) { BoxBlur(h, 4, true); BoxBlur(h, 4, false); }
            for (int i = 0; i < HRes; i++) for (int j = 0; j < HRes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(HRes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(HRes - 1));
                    float v = h[i, j] + 0.014f * (Mathf.PerlinNoise(X * .33f, Y * .33f) - .5f) * 2f;
                    if (X < 4f || X > 196f)   // only the rivers outside the grid dig a trench (their centre lines are >= 2 tiles away from the grid edge)
                    {
                        float d = DistToSegs(segs, X, Y);
                        if (d < 3.4f) { float w = Smooth(2.9f, 1.3f, d); v = Mathf.Lerp(v, -0.42f, w); v += 0.05f * Smooth(1.9f, 2.7f, d) * Smooth(3.4f, 2.8f, d); }
                    }
                    h[i, j] = Mathf.Clamp01((v - BaseY) / TerrainH);
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
            var a = new float[ARes, ARes, 3]; var segs = RiverSegs();
            for (int i = 0; i < ARes; i++) for (int j = 0; j < ARes; j++)
                {
                    float X = TX0 + (TX1 - TX0) * (j / (float)(ARes - 1)), Y = TY1 - (TY1 - TY0) * (i / (float)(ARes - 1));
                    float wet = (X < 8f || X > 192f) ? Smooth(6f, 2f, DistToSegs(segs, X, Y)) : 0f;
                    foreach (var c in PoolDisc) wet = Mathf.Max(wet, Smooth(4.5f, 2f, (new Vector2(X, Y) - c).magnitude));
                    float n1 = Mathf.PerlinNoise(X * .045f + 5f, Y * .045f + 9f), n2 = Mathf.PerlinNoise(X * .07f + 40f, Y * .07f + 17f), n3 = Mathf.PerlinNoise(X * .31f, Y * .31f);
                    float w0 = 1f, w1 = Mathf.Clamp01((n1 - .35f) * 2.2f) * .9f * (0.7f + 0.3f * n3), w2 = Mathf.Clamp01((n2 - .45f) * 2.2f) * .8f + wet * 1.3f;
                    float s = w0 + w1 + w2; a[i, j, 0] = w0 / s; a[i, j, 1] = w1 / s; a[i, j, 2] = w2 / s;
                }
            return a;
        }
        static float GroundY(float wx, float wz) { return terrain.SampleHeight(new Vector3(wx, 0, wz)) + terrain.transform.position.y; }

        // ---------------------------------------------------------------- toxic rivers (outside the grid) + two toxic pools on mushroom-ring islands
        static Mesh SaveMesh(Mesh m, string name) { var p = GenDir + "/" + name + ".asset"; AssetDatabase.DeleteAsset(p); AssetDatabase.CreateAsset(m, p); return m; }
        static void BuildToxic(Transform parent, Mats mats)
        {
            var root = new GameObject("Toxic"); root.transform.SetParent(parent, false);
            foreach (var side in new[] { ("W", true), ("E", false) })
            {
                var cl = Chaikin(RiverPts(side.Item2), 2);
                var vs = new List<Vector3>(); var uvs = new List<Vector2>(); var tris = new List<int>(); float along = 0f; const float halfMax = 2.3f, level = -0.21f;
                int N = cl.Count; var nms = new Vector2[N]; var hreq = new float[N];
                for (int i = 0; i < N; i++) { var tg = (cl[Mathf.Min(i + 1, N - 1)] - cl[Mathf.Max(i - 1, 0)]).normalized; nms[i] = new Vector2(-tg.y, tg.x); }
                for (int i = 0; i < N; i++)
                {
                    float half = halfMax; var c = cl[i];
                    for (int it = 0; it < 10; it++)
                    {
                        var l = c + nms[i] * half; var r = c - nms[i] * half;
                        bool bad = WalkNear(l) || WalkNear(r);
                        if (!bad && i > 0) { var sc = c - cl[i - 1]; float thr = 0.15f * sc.sqrMagnitude; var lp = cl[i - 1] + nms[i - 1] * half; var rp = cl[i - 1] - nms[i - 1] * half; if (Vector2.Dot(l - lp, sc) <= thr || Vector2.Dot(r - rp, sc) <= thr) bad = true; }
                        if (!bad) break; half *= 0.75f;
                    }
                    hreq[i] = half;
                }
                var hmin = new float[N]; var hs = new float[N];
                for (int i = 0; i < N; i++) { float mn = 9f; for (int k = Mathf.Max(0, i - 8); k <= Mathf.Min(N - 1, i + 8); k++) mn = Mathf.Min(mn, hreq[k]); hmin[i] = mn; }
                for (int i = 0; i < N; i++) { float sum = 0; int cnt = 0; for (int k = Mathf.Max(0, i - 4); k <= Mathf.Min(N - 1, i + 4); k++) { sum += hmin[k]; cnt++; } hs[i] = sum / cnt; }
                var prevW = new Vector2[2];
                for (int i = 0; i < N; i++)
                {
                    var c = cl[i]; float taper = Mathf.Min(Smooth(0f, 5f, i), Smooth(0f, 5f, N - 1 - i)) * .65f + .35f; float half = hs[i] * taper; var l = c + nms[i] * half; var r = c - nms[i] * half;
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
            // toxic pools (islands 7 and 4) and spore pits (islands 12 and 13): flat discs inside the mushroom rings
            int pi = 0;
            foreach (var c in PoolDisc) { MakeDisc("Pool_" + (++pi), root.transform, c, 0.8f, -0.12f, mats.Toxic, true); }
            pi = 0; foreach (var c in DryPit) { MakeDisc("SporePit_" + (++pi), root.transform, c, 0.5f, -0.05f, mats.VoidDark, false); }
        }
        static bool WalkNear(Vector2 p) { return Walk(Mathf.FloorToInt(p.x), Mathf.FloorToInt(p.y)); }
        static void MakeDisc(string name, Transform parent, Vector2 tileCenter, float radiusU, float y, Material mat, bool flow)
        {
            var wp = W(tileCenter.x, tileCenter.y, y); var vs = new List<Vector3> { wp }; var uvs = new List<Vector2> { new Vector2(wp.x, wp.z) * .9f }; var tris = new List<int>(); const int S = 28;
            for (int k = 0; k < S; k++) { float a = k / (float)S * 6.2831853f; float rr = radiusU * (1f + .08f * Mathf.Sin(a * 3f + tileCenter.x)); var p = wp + new Vector3(Mathf.Cos(a) * rr, 0, Mathf.Sin(a) * rr); vs.Add(p); uvs.Add(new Vector2(p.x, p.z) * .9f); }
            for (int k = 0; k < S; k++) tris.AddRange(new[] { 0, 1 + (k + 1) % S, 1 + k });
            var m = new Mesh { name = name }; m.SetVertices(vs); m.SetUVs(0, uvs); m.SetTriangles(tris, 0); m.RecalculateNormals(); m.RecalculateBounds(); SaveMesh(m, name);
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.AddComponent<MeshFilter>().sharedMesh = m; var mr = go.AddComponent<MeshRenderer>(); mr.sharedMaterial = mat; mr.shadowCastingMode = ShadowCastingMode.Off;
            if (!flow) mr.receiveShadows = false;
        }

        // ---------------------------------------------------------------- procedural masses (copies of the RM-1 LumpMesh / TubeMesh generators)
        class LumpP { public float dome = 0f, hw, hd, h, n = 2.8f, body = .82f, top = .7f, flareT = .3f, lobeAmp = .18f, lobeDecay = .4f, noise = .12f, lean = .12f, jag = 0f, topBump = .12f, tile = 2.4f, sink = .25f; public int K = 28, R = 10, lobes = 5, seed; }
        static GameObject MakeLump(string name, Transform parent, Vector3 pos, float yaw, float hw, float hd, float h, int seed, Material mat, float tile, bool trunk, Action<LumpP> tweak = null)
        {
            var rnd = new System.Random(seed); var lp = new LumpP { hw = hw, hd = hd, h = h, seed = seed, tile = tile };
            if (trunk) { lp.n = 2f; lp.K = 22; lp.R = 14; lp.body = .52f; lp.top = .82f; lp.flareT = .26f; lp.lobes = 3 + rnd.Next(3); lp.lobeAmp = .34f; lp.lobeDecay = .38f; lp.noise = .16f; lp.lean = .10f; lp.jag = .55f; lp.topBump = .06f; }
            else { lp.n = Mathf.Lerp(2.1f, 3.4f, (float)rnd.NextDouble()); lp.body = Mathf.Lerp(.68f, .9f, (float)rnd.NextDouble()); lp.top = Mathf.Lerp(.45f, .8f, (float)rnd.NextDouble()); lp.flareT = Mathf.Lerp(.2f, .4f, (float)rnd.NextDouble()); lp.lobes = 3 + rnd.Next(4); lp.lobeAmp = Mathf.Lerp(.14f, .28f, (float)rnd.NextDouble()); lp.lobeDecay = Mathf.Lerp(.3f, .5f, (float)rnd.NextDouble()); lp.noise = Mathf.Lerp(.10f, .22f, (float)rnd.NextDouble()); lp.lean = Mathf.Lerp(.05f, .26f, (float)rnd.NextDouble()); lp.topBump = Mathf.Lerp(.12f, .26f, (float)rnd.NextDouble()); lp.jag = 0f; lp.dome = Mathf.Lerp(.16f, .34f, (float)rnd.NextDouble()); lp.top = Mathf.Min(lp.top, .66f); }
            if (tweak != null) tweak(lp);
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.transform.SetPositionAndRotation(pos, Quaternion.Euler(0, yaw, 0));
            go.AddComponent<MeshFilter>().sharedMesh = LumpMesh(lp); var r = go.AddComponent<MeshRenderer>(); r.sharedMaterial = mat; r.shadowCastingMode = ShadowCastingMode.On;
            return go;
        }
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
            { var va = verts[sideTris[0]]; var vb = verts[sideTris[1]]; var vc = verts[sideTris[2]]; if (Vector3.Dot(Vector3.Cross(vb - va, vc - va), new Vector3(va.x, 0, va.z)) < 0f) for (int i = 0; i < sideTris.Count; i += 3) { int tmp = sideTris[i + 1]; sideTris[i + 1] = sideTris[i + 2]; sideTris[i + 2] = tmp; } }
            tris.AddRange(sideTris);
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
            for (int i = 0; i < capTris.Count; i += 3) { var va = verts[capTris[i]]; var vb = verts[capTris[i + 1]]; var vc = verts[capTris[i + 2]]; if (Vector3.Cross(vb - va, vc - va).y < 0f) { int tmp = capTris[i + 1]; capTris[i + 1] = capTris[i + 2]; capTris[i + 2] = tmp; } }
            tris.AddRange(capTris);
            var m = new Mesh { name = "Lump", indexFormat = IndexFormat.UInt32 }; m.SetVertices(verts); m.SetUVs(0, uvs); m.SetTriangles(tris, 0); m.RecalculateNormals();
            var nrm = m.normals; for (int j = 0; j <= R; j++) { var n = (nrm[j * stride] + nrm[j * stride + K]).normalized; nrm[j * stride] = n; nrm[j * stride + K] = n; } m.normals = nrm;
            m.RecalculateBounds(); m.RecalculateTangents(); return m;
        }
        static Mesh TubeMesh(List<Vector3> path, float r0, float r1, int sides, int seed, float tile, bool capEnd, float irregular)
        {
            var rnd = new System.Random(seed); int M = path.Count; var verts = new List<Vector3>(); var uvs = new List<Vector2>(); var tris = new List<int>(); float along = 0f;
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
        static GameObject AddMeshObj(string name, Transform parent, Mesh m, Material mat)
        {
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.AddComponent<MeshFilter>().sharedMesh = m; var r = go.AddComponent<MeshRenderer>(); r.sharedMaterial = mat; r.shadowCastingMode = ShadowCastingMode.On; return go;
        }

        // ---------------------------------------------------------------- mushrooms (stem + wide low cap) and the per-island placement
        struct Mush { public float capR, stemR, stemH, capH; public Material cap, stem; public int seed; }
        // returns the real top above ground (m); an in-grid mushroom is squashed to at most maxTop so it can never stand taller than the camera-side limit
        static float MakeMushroom(string name, Transform parent, float wx, float wz, Mush s, float maxTop, string kind, bool inGrid, bool south, out GameObject go)
        {
            float gy = GroundY(wx, wz);
            go = new GameObject(name); go.transform.SetParent(parent, false); go.transform.position = new Vector3(wx, gy, wz);
            MakeLump("Stem", go.transform, Vector3.zero, 0f, s.stemR, s.stemR, s.stemH + 0.12f, s.seed + 1, s.stem, 1.6f, true);
            float yaw = (s.seed % 360);
            var cap = MakeLump("Cap", go.transform, new Vector3(0f, s.stemH - 0.04f, 0f), yaw, s.capR, s.capR * (0.86f + 0.14f * Hash(s.seed, 3)), s.capH, s.seed + 2, s.cap, 2.4f, false, lp => { lp.n = 2f; lp.sink = 0.02f; lp.body = .92f; lp.top = .6f; lp.lobeAmp = .10f; lp.noise = .10f; lp.lean = .05f; lp.dome = .34f; lp.topBump = .10f; });
            float top = 0f; foreach (var r in go.GetComponentsInChildren<Renderer>()) top = Mathf.Max(top, r.bounds.max.y - gy);
            if (maxTop > 0f && top > maxTop) { go.transform.localScale = new Vector3(1f, maxTop / top, 1f); top = maxTop; }
            massRecs.Add(new MassRec { name = name, kind = kind, cx = wx, cz = wz, top = top, inGrid = inGrid, south = south });
            return top;
        }
        // greedy cover of an island's tiles: big caps first, then smaller ones, until every tile centre lies inside a footprint (radius 0.3u always fits a blocked tile centre)
        static int GreedyFill(Transform parent, Mats mats, List<(int, int)> tiles, float[] radii, int seedBase, System.Random rnd, string prefix, bool dark, out GameObject biggest)
        {
            int made = 0; biggest = null; float bigR = 0f;
            foreach (float r0 in radii)
            {
                var order = new List<(int, int)>(tiles); Shuffle(order, rnd);
                foreach (var (tx, ty) in order)
                {
                    if (Covered(tx, ty, 0f)) continue;
                    var wp = W(tx + .5f, ty + .5f); float r = r0; var fp = new FP { kind = "mushroom", cx = wp.x, cz = wp.z, hw = r, circle = true }; int sh = 0;
                    while ((FpHitsWalk(fp) || Unplaceable(fp, 0.55f)) && sh++ < 6) { r *= .86f; fp.hw = r; }
                    if (FpHitsWalk(fp) || r < 0.28f) continue;
                    float stemR = Mathf.Min(Rf(rnd, .14f, .24f), r * .42f), stemH = Rf(rnd, .16f, .34f), capH = Rf(rnd, .24f, .40f) * Mathf.Clamp(r / .8f, .6f, 1.2f);
                    var ms = new Mush { capR = r, stemR = stemR, stemH = stemH, capH = capH, cap = (rnd.NextDouble() < (dark ? .6 : .35)) ? mats.CapDark : mats.CapWarm, stem = mats.Stem, seed = seedBase + made * 7 };
                    MakeMushroom(prefix + "_" + (made).ToString("00"), parent, wp.x, wp.z, ms, CamSideMax - 0.02f, "mushroom", true, false, out var go);
                    fps.Add(fp); if (r > bigR) { bigR = r; biggest = go; } made++;
                }
            }
            return made;
        }
        static void Eye(GameObject mush, Mats mats)
        {
            var cap = mush.transform.Find("Cap"); if (cap == null) return;
            float capTop = 0f; foreach (var r in mush.GetComponentsInChildren<Renderer>()) capTop = Mathf.Max(capTop, r.bounds.max.y);
            var cb = cap.GetComponent<Renderer>().bounds; float ex = cb.center.x, ez = cb.min.z + 0.05f, ey = cb.min.y + (cb.size.y * 0.55f), er = Mathf.Min(0.22f, cb.size.x * .22f);
            var eye = GameObject.CreatePrimitive(PrimitiveType.Sphere); eye.name = "Eye"; UnityEngine.Object.DestroyImmediate(eye.GetComponent<Collider>()); eye.transform.SetParent(mush.transform, true);
            eye.transform.position = new Vector3(ex, ey, ez); eye.transform.localScale = Vector3.one * er * 2f; eye.GetComponent<MeshRenderer>().sharedMaterial = mats.EyeBone;
            var pu = GameObject.CreatePrimitive(PrimitiveType.Sphere); pu.name = "Pupil"; UnityEngine.Object.DestroyImmediate(pu.GetComponent<Collider>()); pu.transform.SetParent(mush.transform, true);
            pu.transform.position = new Vector3(ex, ey - er * .05f, ez - er * .72f); pu.transform.localScale = Vector3.one * er * .85f; pu.GetComponent<MeshRenderer>().sharedMaterial = mats.EyePupil;
        }
        static void AddRoots(Transform parent, Vector3 wp, float gy, float trunkR, int count, int seed, Material mat, string name)
        {
            var rr = new System.Random(seed);
            for (int k = 0; k < count; k++)
            {
                float ang = k * (360f / count) + 14f + (float)rr.NextDouble() * 18f; var dir = Quaternion.Euler(0, ang, 0) * Vector3.right; float len = 1.6f; FP rfp = default; bool ok = false;
                for (int it = 0; it < 8 && len > 0.5f; it++)
                {
                    rfp = new FP { kind = "root", cx = wp.x + dir.x * (trunkR * .8f + len * .5f), cz = wp.z + dir.z * (trunkR * .8f + len * .5f), hw = len * .5f, hd = 0.3f, yaw = ang };
                    if (!FpHitsWalk(rfp)) { ok = true; break; } len *= .85f;
                }
                if (!ok) continue;
                var path = new List<Vector3>(); var side = new Vector3(-dir.z, 0, dir.x); float wob = (float)rr.NextDouble() * 6.28f;
                for (int q = 0; q <= 8; q++) { float t = q / 8f; var pp = new Vector3(wp.x, gy, wp.z) + dir * (trunkR * .45f + (len + trunkR * .35f) * t) + side * (Mathf.Sin(wob + t * 4f) * 0.10f * t); pp.y = GroundY(pp.x, pp.z) + 0.30f * (1f - t) * (1f - t * .5f) + 0.04f - 0.05f * t; path.Add(pp); }
                AddMeshObj(name + "_Root_" + k, parent, TubeMesh(path, 0.22f, 0.06f, 7, seed + 40 + k, 1.4f, false, 1.0f), mat); fps.Add(rfp);
            }
        }
        static GameObject Stump(string name, Transform parent, float wx, float wz, float r, float h, int seed, Material mat)
        {
            float gy = GroundY(wx, wz);
            var fp = new FP { kind = "trunk", cx = wx, cz = wz, hw = r, circle = true }; int sh = 0; while (FpHitsWalk(fp) && sh++ < 8) { r *= .85f; fp.hw = r; }
            var go = MakeLump(name, parent, new Vector3(wx, gy, wz), 0f, r, r, h, seed, mat, 2.0f, true);
            float top = go.GetComponent<Renderer>().bounds.max.y - gy; if (top > CamSideMax - 0.02f) { go.transform.localScale = new Vector3(1f, (CamSideMax - 0.02f) / top, 1f); top = CamSideMax - 0.02f; }
            massRecs.Add(new MassRec { name = name, kind = "stump", cx = wx, cz = wz, top = top, inGrid = true, south = false }); fps.Add(fp);
            AddRoots(parent, new Vector3(wx, gy, wz), gy, r, 3 + (seed % 3), seed, mat, name);
            return go;
        }

        enum Style { Cave, Heart, PoolRing, DryRing, Eye, BigStump, SkullAltar, FleshBall, Maw, Stump, BoneStake }
        static Style StyleFor(Isl s)
        {
            switch (s.id)
            {
                case 0: return Style.Cave;
                case 1: return Style.Heart;
                case 4: case 7: return Style.PoolRing;
                case 12: case 13: return Style.DryRing;
                case 5: case 8: case 9: case 10: case 11: return Style.Eye;
                case 2: case 3: case 6: return Style.BigStump;
                case 14: return Style.SkullAltar;
                case 15: case 16: case 17: case 18: case 19: return Style.FleshBall;
                case 21: case 33: case 49: return Style.Maw;
                case 24: case 25: case 27: case 28: return Style.BoneStake;
                default: return Style.Stump;
            }
        }
        static void BuildBlockout(Transform parent, Mats mats)
        {
            var root = new GameObject("Blockout"); root.transform.SetParent(parent, false); var rnd = new System.Random(3303); int count = 0;
            var report = new List<string>();
            foreach (var isl in islands)
            {
                var tiles = IslandTiles(isl); var st = StyleFor(isl); var isRoot = new GameObject("Island_" + isl.id.ToString("00") + "_" + st).transform; isRoot.SetParent(root.transform, false);
                float mx = 0, mz = 0; foreach (var (tx, ty) in tiles) { mx += (tx + .5f) * T; mz += -(ty + .5f) * T; } mx /= Mathf.Max(1, tiles.Count); mz /= Mathf.Max(1, tiles.Count);
                int seed = 6000 + isl.id * 97; GameObject big = null; int made = 0;
                switch (st)
                {
                    case Style.Cave: made = BuildCave(isRoot, mats, isl, tiles, rnd, seed, out big); break;
                    case Style.Heart: made = GreedyFill(isRoot, mats, tiles, new[] { 1.4f, 1.1f, .85f, .6f, .3f }, seed, rnd, "Heart", false, out big); break;
                    case Style.PoolRing: made = GreedyFill(isRoot, mats, tiles, new[] { .62f, .46f, .3f }, seed, rnd, "Ring", true, out big); break;
                    case Style.DryRing: made = GreedyFill(isRoot, mats, tiles, new[] { .62f, .46f, .3f }, seed, rnd, "Ring", true, out big); break;
                    case Style.Eye: made = GreedyFill(isRoot, mats, tiles, new[] { .9f, .6f, .3f }, seed, rnd, "EyeMush", false, out big); if (big != null) Eye(big, mats); break;
                    case Style.BigStump: Stump("Trunk", isRoot, mx, mz, 0.95f, 0.9f, seed, mats.Bark); made = 1 + GreedyFill(isRoot, mats, tiles, new[] { .5f, .3f }, seed, rnd, "Under", true, out big); break;
                    case Style.SkullAltar: made = GreedyFill(isRoot, mats, tiles, new[] { .75f, .48f, .3f }, seed, rnd, "Altar", true, out big); AddStakes(isRoot, mats, mx, mz, 3, 0.8f, seed); break;
                    case Style.FleshBall: made = FleshBall(isRoot, mats, isl, tiles, mx, mz, rnd, seed); break;
                    case Style.Maw: made = Maw(isRoot, mats, tiles, mx, mz, rnd, seed); break;
                    case Style.BoneStake: AddStakes(isRoot, mats, mx, mz, 1, 0.85f, seed); made = 1 + GreedyFill(isRoot, mats, tiles, new[] { .3f }, seed, rnd, "Under", true, out big); break;
                    default: Stump("Stump", isRoot, mx, mz, isl.size > 20 ? 0.6f : 0.45f, 0.85f, seed, mats.Bark); made = 1 + GreedyFill(isRoot, mats, tiles, new[] { .3f }, seed, rnd, "Under", true, out big); break;
                }
                if (isl.id == 2 || isl.id == 3 || isl.id == 18 || isl.id == 19) AddStakes(isRoot, mats, mx, mz, 3, 0.8f, seed + 5);   // W8 hunt trophies on the east trees / flesh bulbs
                count += made;
                report.Add("{\"id\":" + isl.id + ",\"style\":\"" + st + "\",\"tiles\":" + tiles.Count + ",\"objects\":" + isRoot.childCount + "}");
            }
            BuildOuter(root.transform, mats);
            Debug.Log("[RM3] blockout islands=" + islands.Length + " mushrooms/pieces=" + count + " footprints=" + fps.Count);
            islandStyleReport = string.Join(",", report);
        }
        static string islandStyleReport = "";
        static int BuildCave(Transform isRoot, Mats mats, Isl isl, List<(int, int)> tiles, System.Random rnd, int seed, out GameObject big)
        {
            // mouth faces south (camera side) so it reads from the game view: find the south-most blocked tile in the middle third of the island
            int bx0 = isl.bbox[0], bx1 = isl.bbox[2]; int mx0 = bx0 + (bx1 - bx0) / 3, mx1 = bx1 - (bx1 - bx0) / 3; int mouthTx = (bx0 + bx1) / 2, mouthTy = -1;
            foreach (var (tx, ty) in tiles) if (tx >= mx0 && tx <= mx1 && ty > mouthTy) { mouthTy = ty; mouthTx = tx; }
            // empty nest (W8): a root ring just inside the mouth, no bones (STY-D17). Reserved first so the mushrooms keep clear of it.
            var nestW = W(mouthTx + .5f, mouthTy - 3f); float gy = GroundY(nestW.x, nestW.z); var nestFp = new FP { kind = "nest", cx = nestW.x, cz = nestW.z, hw = 0.5f, circle = true };
            if (!FpHitsWalk(nestFp))
            {
                var path = new List<Vector3>(); for (int k = 0; k <= 16; k++) { float a = k / 16f * 6.2831853f; path.Add(new Vector3(nestW.x + Mathf.Cos(a) * .34f, gy + 0.10f + 0.04f * Mathf.Sin(a * 3f), nestW.z + Mathf.Sin(a) * .34f)); }
                AddMeshObj("EmptyNest", isRoot, TubeMesh(path, 0.07f, 0.07f, 6, seed + 11, 1.2f, false, 1.4f), mats.Bark); fps.Add(nestFp);
                nestInfo = $"{{\"tile\":[{mouthTx},{mouthTy - 3}],\"bonesInside\":0}}";
            }
            // tusk arch over the mouth: one curved bone tube from the west side over to the east side, 0.8u high
            var mw = W(mouthTx + .5f, mouthTy - 1f); float mgy = GroundY(mw.x, mw.z); var arch = new FP { kind = "arch", cx = mw.x, cz = mw.z, hw = 0.8f, hd = 0.14f, yaw = 0f };
            int sh = 0; while (FpHitsWalk(arch) && sh++ < 6) arch.hw *= .85f;
            if (!FpHitsWalk(arch))
            {
                var path = new List<Vector3>(); for (int k = 0; k <= 12; k++) { float t = k / 12f; float a = Mathf.Lerp(Mathf.PI, 0f, t); path.Add(new Vector3(mw.x + Mathf.Cos(a) * arch.hw, mgy - 0.02f + Mathf.Sin(a) * 0.8f, mw.z)); }
                AddMeshObj("TuskArch", isRoot, TubeMesh(path, 0.11f, 0.07f, 7, seed + 21, 1.2f, true, 1.0f), mats.Bark); fps.Add(arch);
                var v = GameObject.CreatePrimitive(PrimitiveType.Sphere); v.name = "MouthVoid"; UnityEngine.Object.DestroyImmediate(v.GetComponent<Collider>()); v.transform.SetParent(isRoot, false);
                v.transform.position = new Vector3(mw.x, mgy + 0.28f, mw.z + 0.1f); v.transform.localScale = new Vector3(arch.hw * 1.5f, 0.56f, 0.3f); v.GetComponent<MeshRenderer>().sharedMaterial = mats.VoidDark; v.GetComponent<MeshRenderer>().shadowCastingMode = ShadowCastingMode.Off;
                fps.Add(new FP { kind = "void", cx = mw.x, cz = mw.z + .1f, hw = arch.hw * .75f, hd = 0.15f, yaw = 0f });
            }
            return GreedyFill(isRoot, mats, tiles, new[] { 1.3f, 1.0f, .75f, .5f, .3f }, seed, rnd, "Cave", true, out big) + 2;
        }
        static string nestInfo = "{}";
        static int FleshBall(Transform isRoot, Mats mats, Isl isl, List<(int, int)> tiles, float mx, float mz, System.Random rnd, int seed)
        {
            float gy = GroundY(mx, mz); float r = 0.62f; var fp = new FP { kind = "fleshball", cx = mx, cz = mz, hw = r, circle = true }; int sh = 0; while (FpHitsWalk(fp) && sh++ < 8) { r *= .86f; fp.hw = r; }
            var go = MakeLump("Bulb", isRoot, new Vector3(mx, gy, mz), (float)rnd.NextDouble() * 360f, r, r * .9f, 0.8f, seed, mats.Mass, 2.4f, false, lp => { lp.n = 2f; lp.dome = .3f; });
            float top = go.GetComponent<Renderer>().bounds.max.y - gy; if (top > CamSideMax - 0.02f) { go.transform.localScale = new Vector3(1f, (CamSideMax - 0.02f) / top, 1f); top = CamSideMax - 0.02f; }
            massRecs.Add(new MassRec { name = go.name, kind = "bulb", cx = mx, cz = mz, top = top, inGrid = true, south = false }); fps.Add(fp);
            return 1 + GreedyFill(isRoot, mats, tiles, new[] { .4f, .3f }, seed, rnd, "Tumor", false, out var _b);
        }
        static int Maw(Transform isRoot, Mats mats, List<(int, int)> tiles, float mx, float mz, System.Random rnd, int seed)
        {
            float gy = GroundY(mx, mz); float r = 0.5f; var fp = new FP { kind = "maw", cx = mx, cz = mz, hw = r, circle = true }; int sh = 0; while (FpHitsWalk(fp) && sh++ < 8) { r *= .86f; fp.hw = r; }
            var go = MakeLump("Maw", isRoot, new Vector3(mx, gy, mz), 0f, r, r, 0.7f, seed, mats.Mass, 2.4f, false, lp => { lp.n = 2f; lp.dome = .2f; });
            float top = go.GetComponent<Renderer>().bounds.max.y - gy; if (top > CamSideMax - 0.02f) { go.transform.localScale = new Vector3(1f, (CamSideMax - 0.02f) / top, 1f); top = CamSideMax - 0.02f; }
            massRecs.Add(new MassRec { name = "Maw", kind = "maw", cx = mx, cz = mz, top = top, inGrid = true, south = false }); fps.Add(fp);
            var v = GameObject.CreatePrimitive(PrimitiveType.Sphere); v.name = "MawVoid"; UnityEngine.Object.DestroyImmediate(v.GetComponent<Collider>()); v.transform.SetParent(isRoot, false);
            v.transform.position = new Vector3(mx, gy + 0.22f, mz - r * .55f); v.transform.localScale = new Vector3(r * 1.0f, 0.22f, 0.25f); v.GetComponent<MeshRenderer>().sharedMaterial = mats.VoidDark; v.GetComponent<MeshRenderer>().shadowCastingMode = ShadowCastingMode.Off;
            return 1 + GreedyFill(isRoot, mats, tiles, new[] { .3f }, seed, rnd, "Under", false, out var _b);
        }
        static void AddStakes(Transform parent, Mats mats, float mx, float mz, int n, float h, int seed)
        {
            var rr = new System.Random(seed);
            for (int k = 0; k < n; k++)
            {
                float a = k * (6.2831853f / Mathf.Max(1, n)) + (float)rr.NextDouble(); float rad = n == 1 ? 0f : 0.42f; var p = new Vector3(mx + Mathf.Cos(a) * rad, 0, mz + Mathf.Sin(a) * rad);
                var fp = new FP { kind = "stake", cx = p.x, cz = p.z, hw = 0.14f, circle = true }; if (FpHitsWalk(fp)) continue; float gy = GroundY(p.x, p.z);
                var path = new List<Vector3>(); for (int q = 0; q <= 6; q++) { float t = q / 6f; path.Add(new Vector3(p.x + 0.06f * Mathf.Sin(t * 3f + k), gy - 0.02f + h * t, p.z)); }
                var go = AddMeshObj("Stake_" + k, parent, TubeMesh(path, 0.07f, 0.035f, 6, seed + k, 1.2f, true, 1.0f), mats.Bark); fps.Add(fp);
                float top = go.GetComponent<Renderer>().bounds.max.y - gy; massRecs.Add(new MassRec { name = go.name, kind = "stake", cx = p.x, cz = p.z, top = top, inGrid = true, south = false });
                if (n > 1) { var hang = MakeLump("Hide_" + k, parent, new Vector3(p.x + .02f, gy + h - 0.2f, p.z - .03f), 0f, .1f, .07f, .2f, seed + 50 + k, mats.Mass, 1.2f, false, lp => { lp.n = 2f; lp.dome = .1f; lp.sink = .02f; }); }
            }
        }
        // tall mushroom wall outside the grid (north / west / east: free height) and a low band on the south side (camera side: <= 0.9u). Every footprint is kept off the walk grid and off the rivers.
        static void BuildOuter(Transform parent, Mats mats)
        {
            var root = new GameObject("Outer").transform; root.SetParent(parent, false); var rnd = new System.Random(1301); var segs = RiverSegs(); int n = 0;
            foreach (var (label, x0, x1, y0, y1, tall, want) in new[] { ("N", -18, 218, -18, -4, true, 46), ("W", -19, -10, 2, 198, true, 26), ("E", 208, 219, 2, 198, true, 26), ("S", -18, 218, 204, 218, false, 40) })
            {
                int placed = 0;
                for (int att = 0; att < want * 60 && placed < want; att++)
                {
                    float tx = Rf(rnd, x0, x1), ty = Rf(rnd, y0, y1); var wp = W(tx, ty);
                    float capR = tall ? Rf(rnd, 1.1f, 2.4f) : Rf(rnd, .8f, 1.5f);
                    if (DistToSegs(segs, tx, ty) < 3.4f + capR / T) continue;
                    var fp = new FP { kind = "outer", cx = wp.x, cz = wp.z, hw = capR, circle = true }; int sh = 0;
                    while ((FpHitsWalk(fp) || Unplaceable(fp, 0.7f)) && sh++ < 4) { capR *= .86f; fp.hw = capR; }
                    if (FpHitsWalk(fp) || Unplaceable(fp, 0.7f) || capR < 0.7f) continue;
                    bool south = !tall;
                    var ms = new Mush { capR = capR, stemR = tall ? Rf(rnd, .24f, .42f) : Rf(rnd, .16f, .24f), stemH = tall ? Rf(rnd, 2.2f, 5.0f) : Rf(rnd, .2f, .34f), capH = tall ? Rf(rnd, .7f, 1.2f) : Rf(rnd, .26f, .4f), cap = rnd.NextDouble() < .5 ? mats.CapDark : mats.CapWarm, stem = mats.Stem, seed = 9000 + n * 13 };
                    MakeMushroom("Outer" + label + "_" + (n++).ToString("000"), root, wp.x, wp.z, ms, tall ? 0f : CamSideMax - 0.02f, tall ? "outerTall" : "outerSouth", false, south, out var go);
                    fps.Add(fp); placed++;
                }
                outerCounts += label + "=" + placed + " ";
            }
        }
        static string outerCounts = "";

        // ---------------------------------------------------------------- far layer: dead-tree silhouette cards outside the tall wall (never south of the grid)
        static void BuildBgCards(Transform parent, Mats mats)
        {
            var root = new GameObject("Background Cards").transform; root.SetParent(parent, false); var rnd = new System.Random(1306); var placed = new List<Vector2>(); int n = 0;
            for (int guard = 0; guard < 4000 && n < 20; guard++)
            {
                float tx, ty; int side = rnd.Next(3);
                if (side == 0) { tx = Rf(rnd, -10, 210); ty = Rf(rnd, -19, -14); } else if (side == 1) { tx = Rf(rnd, -19.5f, -15); ty = Rf(rnd, 10, 190); } else { tx = Rf(rnd, 215, 219.5f); ty = Rf(rnd, 10, 190); }
                var c = new Vector2(tx, ty); bool ok = true; foreach (var p in placed) if ((p - c).magnitude < 9f) { ok = false; break; } if (!ok) continue; placed.Add(c);
                var q = GameObject.CreatePrimitive(PrimitiveType.Quad); q.name = "BG_Tree_" + (n++).ToString("00"); UnityEngine.Object.DestroyImmediate(q.GetComponent<Collider>()); q.transform.SetParent(root, false);
                float h = Rf(rnd, 7f, 11f), w = h * 0.8f; var wp = W(tx, ty); float gy = GroundY(wp.x, wp.z);
                q.transform.SetPositionAndRotation(new Vector3(wp.x, gy + h * .5f - .3f, wp.z), Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0)); q.transform.localScale = new Vector3(w * (rnd.NextDouble() < .5 ? 1f : -1f), h, 1f);
                var qr = q.GetComponent<MeshRenderer>(); qr.sharedMaterial = mats.BgTree; qr.shadowCastingMode = ShadowCastingMode.Off; qr.receiveShadows = false;
            }
            Debug.Log("[RM3] bg cards=" + n);
        }

        // ---------------------------------------------------------------- decals (quad meshes on the ground, visual only)
        static void BuildDecals(Transform parent, Mats mats)
        {
            var root = new GameObject("Decals"); root.transform.SetParent(parent, false); var rnd = new System.Random(1304);
            var buckets = new Dictionary<string, (List<Vector3> v, List<Vector2> uv, List<Color> c, List<int> t)>();
            void Add(string kind, Vector3 c, float size, float rot, Color col, bool flip = false)
            {
                if (!buckets.TryGetValue(kind, out var b)) { b = (new List<Vector3>(), new List<Vector2>(), new List<Color>(), new List<int>()); buckets[kind] = b; }
                float h = size * .5f; var q = Quaternion.Euler(0, rot, 0); int i0 = b.v.Count;
                foreach (var (dx, dz, u, v) in new[] { (-h, -h, 0f, 0f), (h, -h, 1f, 0f), (-h, h, 0f, 1f), (h, h, 1f, 1f) }) { var p = c + q * new Vector3(dx, 0, dz); p.y = GroundY(p.x, p.z) + 0.014f; b.v.Add(p); b.uv.Add(new Vector2(flip ? 1f - u : u, v)); b.c.Add(col); }
                if (flip) b.t.AddRange(new[] { i0, i0 + 1, i0 + 2, i0 + 2, i0 + 1, i0 + 3 }); else b.t.AddRange(new[] { i0, i0 + 2, i0 + 1, i0 + 1, i0 + 2, i0 + 3 });
            }
            var nestWorld = nestInfo.Contains("tile") ? ParseNest() : Vector3.zero; bool hasNest = nestInfo.Contains("tile");
            var bones = new List<Vector3>();
            bool BoneOk(Vector3 p) { if (hasNest && (new Vector2(nestWorld.x - p.x, nestWorld.z - p.z)).magnitude < 5f) return false; foreach (var o in bones) if ((new Vector2(o.x - p.x, o.z - p.z)).magnitude < 3.2f) return false; return true; }
            void AddBone(Vector3 p, float lo, float hi, float a) { if (!BoneOk(p)) return; bones.Add(p); double bk = rnd.NextDouble(); Add(bk < .4 ? "bone" : bk < .7 ? "bone_ribs" : "bone_skull", p, Mathf.Lerp(lo, hi, (float)rnd.NextDouble()), (float)rnd.NextDouble() * 360f, new Color(.9f, .9f, .9f, a), rnd.NextDouble() < .5); }
            string[] kinds = { "blood", "blood", "blood_drag", "blood_drops", "blood_drops", "root", "root", "root_branch", "root_tangle", "bone", "blood_cracked" };
            int n = 0; int guard = 0;
            while (n < 300 && guard++ < 20000)
            {
                int tx = rnd.Next(1, GN - 1), ty = rnd.Next(1, GN - 1); if (!Walk(tx, ty)) continue; var wp = W(tx + (float)rnd.NextDouble(), ty + (float)rnd.NextDouble());
                float k = 0.75f + 0.25f * (float)rnd.NextDouble(); string kind = kinds[rnd.Next(kinds.Length)];
                if (kind == "bone") AddBone(wp, 1.4f, 2.4f, 0.5f + 0.35f * (float)rnd.NextDouble());
                else Add(kind, wp, Mathf.Lerp(1.4f, 3.0f, (float)rnd.NextDouble()), (float)rnd.NextDouble() * 360f, new Color(k, k, k, 0.5f + 0.35f * (float)rnd.NextDouble()), rnd.NextDouble() < .5);
                n++;
            }
            // W8 hunting ground: drag marks from the main route to the beast den, a second shorter line from the west, and the mouth threshold (root tangle, no bones)
            for (int s = 0; s + 1 < DragPath.Length; s++)
            {
                var a = W(DragPath[s].x, DragPath[s].y); var b = W(DragPath[s + 1].x, DragPath[s + 1].y); float len = (b - a).magnitude; int steps = Mathf.Max(1, Mathf.CeilToInt(len / 2.0f));
                float rot = Mathf.Atan2(b.x - a.x, b.z - a.z) * Mathf.Rad2Deg;
                for (int k = 0; k < steps; k++) { var p = Vector3.Lerp(a, b, (k + .5f) / steps); if (!Walk(Mathf.FloorToInt(p.x / T), Mathf.FloorToInt(-p.z / T))) continue; Add("blood_drag", p, 2.4f, rot + 90f, new Color(1, 1, 1, .85f), (k % 2) == 0); }
            }
            var w0 = W(30f, 112f); var w1 = W(50f, 90f); for (int k = 0; k < 6; k++) { var p = Vector3.Lerp(w0, w1, k / 5f); if (Walk(Mathf.FloorToInt(p.x / T), Mathf.FloorToInt(-p.z / T))) Add("blood_drag", p, 2.2f, 35f, new Color(1, 1, 1, .75f), k % 2 == 0); }
            if (hasNest) { var th = nestWorld + new Vector3(0, 0, -1.4f); if (Walk(Mathf.FloorToInt(th.x / T), Mathf.FloorToInt(-th.z / T))) Add("root_tangle", th, 2.2f, 0f, new Color(1, 1, 1, .8f)); }
            foreach (var kv in buckets)
            {
                var m = new Mesh { name = "Decals_" + kv.Key, indexFormat = IndexFormat.UInt32 }; m.SetVertices(kv.Value.v); m.SetUVs(0, kv.Value.uv); m.SetColors(kv.Value.c); m.SetTriangles(kv.Value.t, 0); m.RecalculateBounds(); m.RecalculateNormals();
                SaveMesh(m, "Decals_" + kv.Key);
                var go = new GameObject("Decals_" + kv.Key); go.transform.SetParent(root.transform, false);
                go.AddComponent<MeshFilter>().sharedMesh = m; var mr = go.AddComponent<MeshRenderer>(); mr.sharedMaterial = mats.Decal[kv.Key]; mr.shadowCastingMode = ShadowCastingMode.Off; mr.receiveShadows = false;
            }
        }
        static Vector3 ParseNest()
        {
            int a = nestInfo.IndexOf('['), b = nestInfo.IndexOf(']'); var p = nestInfo.Substring(a + 1, b - a - 1).Split(','); return W(float.Parse(p[0]) + .5f, float.Parse(p[1]) + .5f);
        }

        // ---------------------------------------------------------------- lighting: weak key, light pools under Lights/Pools (Pool_Hell_NN / Pool_Toxic_NN), hell shafts, low fog
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
            void PoolLight(string name, Vector2 tile, Color col, float range, float intensity, float h)
            {
                var go = new GameObject(name); go.transform.SetParent(parent, false); go.transform.position = W(tile.x, tile.y, h);
                var l = go.AddComponent<Light>(); l.type = LightType.Point; l.color = col; l.range = range; l.intensity = intensity; l.shadows = LightShadows.None;
            }
            for (int i = 0; i < HellPools.Length; i++) PoolLight("Pool_Hell_" + (i + 1).ToString("00"), HellPools[i].at, LightHell, HellPools[i].rPx / 100f * 2f, 6.5f, 1.3f);
            for (int i = 0; i < ToxicPools.Length; i++) PoolLight("Pool_Toxic_" + (i + 1).ToString("00"), ToxicPools[i].at, LightToxic, ToxicPools[i].rPx / 100f * 2f, 2.2f, 0.7f);
            var shafts = new GameObject("Shafts").transform;
            for (int i = 0; i < ShaftAt.Length; i++) MakeShaft(shafts, "Shaft_Hell_" + (i + 1).ToString("00"), ShaftAt[i], i % 2 == 0 ? mats.Shaft1 : mats.Shaft2);
        }
        static void MakeShaft(Transform parent, string name, Vector2 groundTile, Material mat)
        {
            var ground = W(groundTile.x, groundTile.y, 0f); var top = ground + new Vector3(-3.6f, 10.5f, 3.4f);
            var axis = (top - ground).normalized; var toCam = new Vector3(0f, Mathf.Sin(Pitch), -Mathf.Cos(Pitch)).normalized;
            var right = Vector3.Cross(axis, toCam).normalized * 0.9f;
            var m = new Mesh { name = name };
            m.SetVertices(new[] { top - right, top + right, ground - right, ground + right }); m.SetUVs(0, new[] { new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1), new Vector2(1, 1) });
            m.SetTriangles(new[] { 0, 1, 2, 2, 1, 3 }, 0); m.RecalculateNormals(); m.RecalculateBounds(); SaveMesh(m, "R3_" + name);
            var go = new GameObject(name); go.transform.SetParent(parent, false); go.AddComponent<MeshFilter>().sharedMesh = m;
            var mr = go.AddComponent<MeshRenderer>(); mr.sharedMaterial = mat; mr.shadowCastingMode = ShadowCastingMode.Off; mr.receiveShadows = false;
        }

        // ---------------------------------------------------------------- camera: LOOK-001 perspective (pitch .85 rad, distance 1400px = 14u, vertical FOV = 2*atan(H/(2*1400)))
        static void BuildCamera(Mats mats)
        {
            var camGo = new GameObject("Main Camera") { tag = "MainCamera" }; var cam = camGo.AddComponent<Camera>();
            cam.orthographic = false; cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = Hex("#060403"); cam.nearClipPlane = 0.3f; cam.farClipPlane = 200f;
            float fov = 2f * Mathf.Atan(900f / (2f * 1400f)) * Mathf.Rad2Deg; cam.fieldOfView = fov;
            var offset = new Vector3(0, Mathf.Sin(Pitch), -Mathf.Cos(Pitch)) * DistU; var start = W(100f, 185f);
            camGo.transform.SetPositionAndRotation(start + offset, Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0));
            camGo.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing = true;
            float fz = 6.5f; var fgRoot = new GameObject("Foreground Cards"); fgRoot.transform.SetParent(camGo.transform, false);
            foreach (var (nm, lx, ly, sc) in new[] { ("FG_Roots_L", -3.15f, -1.72f, 1.5f), ("FG_Roots_R", 3.2f, -1.78f, 1.3f) })
            {
                var q = GameObject.CreatePrimitive(PrimitiveType.Quad); q.name = nm; UnityEngine.Object.DestroyImmediate(q.GetComponent<Collider>()); q.transform.SetParent(fgRoot.transform, false);
                q.transform.localPosition = new Vector3(lx, ly, fz); q.transform.localScale = new Vector3(sc * (lx < 0 ? 1f : -1f), sc * .85f, 1f);
                var qr = q.GetComponent<MeshRenderer>(); qr.sharedMaterial = mats.FgRoots; qr.shadowCastingMode = ShadowCastingMode.Off; qr.receiveShadows = false;
            }
            camGo.AddComponent<CinemachineBrain>().DefaultBlend = new CinemachineBlendDefinition(CinemachineBlendDefinition.Styles.Cut, 0); camGo.AddComponent<AudioListener>();
            var marker = new GameObject("Player Marker"); marker.transform.position = new Vector3(start.x, GroundY(start.x, start.z), start.z);
            var actor = new GameObject("Marker Sprite"); actor.transform.SetParent(marker.transform, false); actor.transform.localPosition = new Vector3(0, 0.75f, 0); actor.transform.rotation = Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0);
            var sp = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Exoduser/Rendering/Sandbox/test_sprite.png");
            if (sp != null) { var sr = actor.AddComponent<SpriteRenderer>(); sr.sprite = sp; sr.sharedMaterial = AssetDatabase.LoadAssetAtPath<Material>("Assets/Exoduser/Rendering/Sandbox/SpriteLit3D.mat"); sr.shadowCastingMode = ShadowCastingMode.On; }
            var vcamGo = new GameObject("CM LOOK-001"); var vcam = vcamGo.AddComponent<CinemachineCamera>();
            vcam.Lens = new LensSettings { FieldOfView = fov, ModeOverride = LensSettings.OverrideModes.Perspective, NearClipPlane = 0.3f, FarClipPlane = 200f };
            vcamGo.transform.SetPositionAndRotation(start + offset, Quaternion.Euler(Pitch * Mathf.Rad2Deg, 0, 0));
            var follow = vcamGo.AddComponent<CinemachineFollow>(); follow.FollowOffset = offset;
            var tr = follow.TrackerSettings; tr.PositionDamping = Vector3.zero; tr.BindingMode = Unity.Cinemachine.TargetTracking.BindingMode.WorldSpace; follow.TrackerSettings = tr;
            vcam.Follow = marker.transform; vcam.Priority.Value = 10;
        }

        // ---------------------------------------------------------------- NavMesh from the Core walk grid; report where it differs from CanMove
        static void BuildNavMesh(Transform parent)
        {
            var root = new GameObject("NavWalk"); root.transform.SetParent(parent, false);
            var vs = new List<Vector3>(); var tris = new List<int>();
            for (int ty = 0; ty < GN; ty++) for (int tx = 0; tx < GN; tx++)
                {
                    if (!Walk(tx, ty)) continue;
                    int b = vs.Count; vs.Add(W(tx, ty)); vs.Add(W(tx + 1, ty)); vs.Add(W(tx, ty + 1)); vs.Add(W(tx + 1, ty + 1)); tris.AddRange(new[] { b, b + 1, b + 2, b + 2, b + 1, b + 3 });
                }
            var m = new Mesh { name = "NavWalk", indexFormat = IndexFormat.UInt32 }; m.SetVertices(vs); m.SetTriangles(tris, 0); m.RecalculateNormals(); m.RecalculateBounds(); SaveMesh(m, "NavWalk");
            var go = new GameObject("NavWalkMesh"); go.transform.SetParent(root.transform, false); go.AddComponent<MeshFilter>().sharedMesh = m;
            var surf = root.AddComponent<NavMeshSurface>(); surf.collectObjects = CollectObjects.Children; surf.useGeometry = NavMeshCollectGeometry.PhysicsColliders;
            // baked straight from the walk-tile mesh with agentRadius 0.1u: a tile centre is 0.2u from the nearest blocked edge, so every walk tile survives and no blocked tile is covered. Mob spacing goes on the NavMeshAgent radius.
            var st = NavMesh.GetSettingsByID(surf.agentTypeID); st.agentRadius = 0.1f; st.agentHeight = 1.6f; st.overrideVoxelSize = true; st.voxelSize = 0.05f; st.minRegionArea = 0f;
            var src = new List<NavMeshBuildSource> { new NavMeshBuildSource { shape = NavMeshBuildSourceShape.Mesh, sourceObject = m, transform = Matrix4x4.identity, area = 0, component = null } };
            var bnd = new Bounds(new Vector3(40f, 0f, -40f), new Vector3(84f, 8f, 84f));   // min corner on a tile edge so the 0.05u voxel grid lines up with the 0.4u tiles
            var data = NavMeshBuilder.BuildNavMeshData(st, src, bnd, Vector3.zero, Quaternion.identity);
            surf.navMeshData = data; surf.AddData();
            AssetDatabase.DeleteAsset(GenDir + "/RM3_NavMesh.asset"); AssetDatabase.CreateAsset(surf.navMeshData, GenDir + "/RM3_NavMesh.asset");
            var tri = NavMesh.CalculateTriangulation(); Debug.Log("[RM3] navmesh verts=" + tri.vertices.Length + " tris=" + tri.indices.Length / 3);
            var navOnly = new List<(int, int)>(); var coreOnly = new List<(int, int)>(); int tested = 0;
            for (int ty = 0; ty < GN; ty++) for (int tx = 0; tx < GN; tx++)
                {
                    bool core = Walk(tx, ty); var c = W(tx + .5f, ty + .5f); bool nav = NavMesh.SamplePosition(c, out var nh, 0.5f, NavMesh.AllAreas) && new Vector2(nh.position.x - c.x, nh.position.z - c.z).magnitude < 0.08f;
                    tested++; if (core == nav) continue; if (core) coreOnly.Add((tx, ty)); else navOnly.Add((tx, ty));
                }
            var cj = new List<string>(); foreach (var (tx, ty) in coreOnly) { bool edge = false; for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) if (!Walk(tx + dx, ty + dy)) edge = true; cj.Add($"{{\"tx\":{tx},\"ty\":{ty},\"boundary\":{(edge ? "true" : "false")}}}"); }
            var nj = new List<string>(); foreach (var (tx, ty) in navOnly) nj.Add($"[{tx},{ty}]");
            File.WriteAllText(DataDir + "/rm3_navmesh_diff.json", "{\"note\":\"NavMesh baked from the walk-tile mesh, agentRadius 0.1u, voxel 0.05u, agentHeight 1.6u. coreOnlyTiles entries carry boundary=true when the tile touches a blocked tile.\",\"grid\":[0,0,200,200],\"tested\":" + tested + ",\"coreWalkNavNo\":" + coreOnly.Count + ",\"navWalkCoreNo\":" + navOnly.Count + ",\"navOnlyTiles\":[" + string.Join(",", nj) + "],\"coreOnlyTiles\":[" + string.Join(",", cj) + "]}");
            Debug.Log($"[RM3] navmesh tested={tested} coreWalkNavNo={coreOnly.Count} navWalkCoreNo={navOnly.Count}");
        }

        // ---------------------------------------------------------------- structure reports (judgement numbers 1, 3, 4, 5)
        static void WriteStructureReports()
        {
            // 1) walk tiles covered by a 3D footprint / river ribbon: centre inside, and "deep" = centre at least 0.5 tile inside the footprint edge
            int any = 0, deep = 0; var byKind = new Dictionary<string, int>(); var tiles = new List<string>();
            for (int ty = 0; ty < GN; ty++) for (int tx = 0; tx < GN; tx++)
                {
                    if (!Walk(tx, ty)) continue; float px = (tx + .5f) * T, pz = -(ty + .5f) * T; string hit = null; bool dp = false;
                    foreach (var f in fps) if (InFP(f, px, pz, 0f)) { hit = f.kind; dp = InFP(f, px, pz, -0.5f * T); break; }
                    if (hit == null && InRibbon(px, pz)) { hit = "river"; dp = true; }
                    if (hit == null) continue; any++; if (dp) deep++; byKind[hit] = byKind.TryGetValue(hit, out var n) ? n + 1 : 1; if (tiles.Count < 200) tiles.Add($"[{tx},{ty},\"{hit}\"]");
                }
            var kinds = new List<string>(); foreach (var kv in byKind) kinds.Add($"\"{kv.Key}\":{kv.Value}");
            File.WriteAllText(DataDir + "/rm3_walk_overlap.json", "{\"grid\":[0,0,200,200],\"footprints\":" + fps.Count + ",\"ribbonQuads\":" + ribbonQuads.Count + ",\"walkTilesCoveredCentre\":" + any + ",\"walkTilesCoveredDeep05\":" + deep + ",\"byKind\":{" + string.Join(",", kinds) + "},\"tiles\":[" + string.Join(",", tiles) + "]}");
            Debug.Log($"[RM3] walk overlap centre={any} deep(>=0.5 tile)={deep}");
            // 3) every blocked island must show a 3D object: count its tiles (centre) that lie inside or within 0.6 tile of a footprint / pool / ribbon
            var items = new List<string>(); int islandsUncovered = 0, tilesUncoveredTotal = 0;
            foreach (var isl in islands)
            {
                var tl = IslandTiles(isl); int unc = 0; var covBy = new Dictionary<string, int>();
                foreach (var (tx, ty) in tl)
                {
                    float px = (tx + .5f) * T, pz = -(ty + .5f) * T; string k = null;
                    foreach (var f in fps) if (InFP(f, px, pz, 0.6f * T)) { k = f.kind; break; }
                    if (k == null && InFlat(tx, ty)) k = "pool"; if (k == null && InRibbon(px, pz)) k = "river";
                    if (k == null) unc++; else covBy[k] = covBy.TryGetValue(k, out var c) ? c + 1 : 1;
                }
                if (unc > 0) islandsUncovered++; tilesUncoveredTotal += unc;
                var cb = new List<string>(); foreach (var kv in covBy) cb.Add($"\"{kv.Key}\":{kv.Value}");
                items.Add("{\"id\":" + isl.id + ",\"tiles\":" + tl.Count + ",\"coveredBy\":{" + string.Join(",", cb) + "},\"uncoveredTiles\":" + unc + "}");
            }
            File.WriteAllText(DataDir + "/rm3_islands.json", "{\"rule\":\"every blocked island of the web grid (4-connected, x0..199 y0..199) must show a 3D object: each island tile centre lies within 0.6 tile of a footprint, pool or ribbon\",\"islands\":" + islands.Length + ",\"islandsWithUncoveredTiles\":" + islandsUncovered + ",\"uncoveredTilesTotal\":" + tilesUncoveredTotal + ",\"styles\":[" + islandStyleReport + "],\"nest\":" + nestInfo + ",\"outer\":\"" + outerCounts.Trim() + "\",\"items\":[" + string.Join(",", items) + "]}");
            Debug.Log($"[RM3] islands={islands.Length} uncoveredIslands={islandsUncovered} uncoveredTiles={tilesUncoveredTotal}");
            // 4) camera side: every in-grid mass and every south-band mass must stay <= 0.9u above ground
            int over = 0; float maxIn = 0f, maxSouth = 0f, maxOuterTall = 0f; var tall = new List<MassRec>();
            foreach (var r in massRecs)
            {
                if (r.inGrid) { maxIn = Mathf.Max(maxIn, r.top); if (r.top > CamSideMax + 1e-3f) over++; }
                else if (r.south) { maxSouth = Mathf.Max(maxSouth, r.top); if (r.top > CamSideMax + 1e-3f) over++; }
                else maxOuterTall = Mathf.Max(maxOuterTall, r.top);
            }
            int nIn = 0, nSouth = 0, nTall = 0; foreach (var r in massRecs) { if (r.inGrid) nIn++; else if (r.south) nSouth++; else nTall++; }
            File.WriteAllText(DataDir + "/rm3_camera_occlusion.json", "{\"rule\":\"masses on the camera side (inside the grid, and the south band) are <= 0.9u above ground; only the north/west/east outer wall may be taller\",\"limit\":0.9,\"inGridMasses\":" + nIn + ",\"inGridMaxTop\":" + maxIn.ToString("F3") + ",\"southBandMasses\":" + nSouth + ",\"southBandMaxTop\":" + maxSouth.ToString("F3") + ",\"overLimit\":" + over + ",\"outerTallMasses\":" + nTall + ",\"outerTallMaxTop\":" + maxOuterTall.ToString("F3") + "}");
            Debug.Log($"[RM3] occlusion inGridMax={maxIn:F3} southMax={maxSouth:F3} over={over}");
            // 5) rendering layers: nothing in the scene may use a non-default rendering layer (Hero)
            int nonDefault = 0, total = 0; foreach (var r in UnityEngine.Object.FindObjectsByType<Renderer>(FindObjectsSortMode.None)) { total++; if (r.renderingLayerMask != 1u) nonDefault++; }
            File.WriteAllText(DataDir + "/rm3_hero_layer.json", "{\"renderers\":" + total + ",\"nonDefaultRenderingLayerMask\":" + nonDefault + "}");
            Debug.Log($"[RM3] hero layer: renderers={total} nonDefault={nonDefault}");
        }

        // ---------------------------------------------------------------- capture / fps
        static string[] Args() { return Exoduser.DevTools.ExoArgs.Get(); }
        static string Arg(string k, string d) { var a = Args(); int i = Array.IndexOf(a, k); return i >= 0 && i + 1 < a.Length ? a[i + 1] : d; }
        public static void Fps()
        {
            var outJson = Arg("-fpsOut", Arg("-out", "rm3-fps.json")); Load(); EditorSceneManager.OpenScene(ScenePath);
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
            RenderTexture.active = null; cam.targetTexture = null; Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(outJson)) ?? "."); File.WriteAllText(outJson, "{\"gpu\":\"" + SystemInfo.graphicsDeviceName + "\",\"note\":\"batchmode camera.Render loop (editor), START view, no vsync cap; relative on/off comparison\",\"runs\":[" + string.Join(",", res) + "]}");
            Debug.Log("[RM3] fps done " + string.Join(" ", res));
        }
        public static void Capture()
        {
            var outDir = Arg("-outDir", "rm3-cuts"); Directory.CreateDirectory(outDir); var cuts = Arg("-cuts", "start,heart,cave,front,river,top").Split(',');
            Load(); EditorSceneManager.OpenScene(ScenePath);
            var marker = GameObject.Find("Player Marker").transform; var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>();
            terrain = UnityEngine.Object.FindFirstObjectByType<Terrain>();
            // the player stands NORTH of the mass so the mass lies between player and camera (occlusion check): heart island x95..105 y119..129 -> player y117; cave island x48..65 y65..75 -> player y63
            var focus = new Dictionary<string, Vector2> { { "start", new Vector2(100f, 185f) }, { "heart", new Vector2(100f, 117f) }, { "cave", new Vector2(57f, 63f) }, { "front", new Vector2(57f, 82f) }, { "river", new Vector2(8f, 150f) }, { "north", new Vector2(100f, 14f) } };
            bool capsule = Arg("-capsule", "1") == "1"; GameObject cap = null;
            if (capsule)
            {
                var ms = marker.Find("Marker Sprite"); if (ms != null) ms.gameObject.SetActive(false);
                cap = GameObject.CreatePrimitive(PrimitiveType.Capsule); cap.name = "Capture Capsule"; cap.transform.SetParent(marker, false); cap.transform.localPosition = new Vector3(0, 0.8f, 0); cap.transform.localScale = new Vector3(0.5f, 0.8f, 0.5f);
                UnityEngine.Object.DestroyImmediate(cap.GetComponent<Collider>());
                var cm = new Material(Shader.Find("Universal Render Pipeline/Lit")); cm.SetColor("_BaseColor", new Color(.25f, .85f, .95f)); cap.GetComponent<MeshRenderer>().sharedMaterial = cm;
            }
            foreach (var cut in cuts)
            {
                if (cut == "top") { CaptureTop(outDir); continue; }
                if (!focus.TryGetValue(cut, out var f)) continue;
                var w = W(f.x, f.y); marker.position = new Vector3(w.x, GroundY(w.x, w.z), w.z);
                var rt = new RenderTexture(1600, 900, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 }; cam.targetTexture = rt;
                brain.ManualUpdate(); cam.Render();
                RenderTexture.active = rt; var tex = new Texture2D(1600, 900, TextureFormat.RGB24, false); tex.ReadPixels(new Rect(0, 0, 1600, 900), 0, 0); tex.Apply();
                File.WriteAllBytes(Path.Combine(outDir, "rm3_" + cut + (capsule ? "_cap" : "") + ".png"), tex.EncodeToPNG()); RenderTexture.active = null; cam.targetTexture = null;
                UnityEngine.Object.DestroyImmediate(tex); rt.Release();
                Debug.Log("[RM3] captured " + cut);
            }
        }
        // orthographic top view of the whole grid (x0..200, y0..200 tiles) with the Core walk tiles overlaid in translucent green
        static void CaptureTop(string outDir)
        {
            var cam = Camera.main; var brain = UnityEngine.Object.FindFirstObjectByType<CinemachineBrain>(); if (brain != null) brain.enabled = false;
            var fgc = GameObject.Find("Foreground Cards"); if (fgc != null) fgc.SetActive(false);
            const int S = 3200; const float x0 = 0f, x1 = 200 * T, zN = 0f, zS = -200 * T;
            cam.orthographic = true; cam.orthographicSize = (zN - zS) * .5f; cam.nearClipPlane = 0.1f; cam.farClipPlane = 200f;
            cam.transform.SetPositionAndRotation(new Vector3((x0 + x1) * .5f, 60f, (zN + zS) * .5f), Quaternion.Euler(90f, 0f, 0f));
            var rt = new RenderTexture(S, S, 24, RenderTextureFormat.ARGB32) { antiAliasing = 2 }; cam.targetTexture = rt; cam.Render();
            RenderTexture.active = rt; var tex = new Texture2D(S, S, TextureFormat.RGB24, false); tex.ReadPixels(new Rect(0, 0, S, S), 0, 0);
            var px = tex.GetPixels32();
            for (int r = 0; r < S; r++) for (int c = 0; c < S; c++)
                {
                    float wx = x0 + (c + .5f) / S * (x1 - x0), wz = zS + (r + .5f) / S * (zN - zS); int tx = Mathf.FloorToInt(wx / T), ty = Mathf.FloorToInt(-wz / T);
                    if (!Walk(tx, ty)) continue; var p = px[r * S + c]; p.r = (byte)(p.r * .62f + 40 * .38f); p.g = (byte)(p.g * .62f + 255 * .38f); p.b = (byte)(p.b * .62f + 60 * .38f); px[r * S + c] = p;
                }
            tex.SetPixels32(px); tex.Apply();
            File.WriteAllBytes(Path.Combine(outDir, "rm3_top_walk_overlay.png"), tex.EncodeToPNG()); RenderTexture.active = null; cam.targetTexture = null;
            UnityEngine.Object.DestroyImmediate(tex); rt.Release(); Debug.Log("[RM3] captured top");
        }
    }
}
