using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.AI;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Debug = UnityEngine.Debug;

// DT-02 MapLint 핵심. 열려 있는 씬의 실제 Renderer 메시·Collider·NavMesh·Terrain 을 읽어 L1~L7 을 계산한다.
// 좌표: 웹 px -> 월드 x=px/100, z=-py/100, 1타일=0.4u, 타일 (tx,ty) 중심 = ((tx+.5)T, -(ty+.5)T). 북쪽 = z가 큰 쪽(ty가 작은 쪽).
namespace Exoduser.DevTools.MapLint
{
    public static class MapLintCore
    {
        [Serializable] class GridJ { public string[] rows; public string[] walk; }

        // 14u 거리·피치 0.85rad 카메라가 남쪽에서 북쪽을 본다. 아래 시선 쐐기 규칙은 이 가정에 기대어 있다.
        sealed class RInfo { public Renderer r; public Mesh mesh; public Transform t; public string path; public Bounds b; public bool coverIgnored; public bool isMesh; }

        public static string ProjectRoot { get { return Path.GetFullPath(Path.Combine(Application.dataPath, "..")).Replace('\\', '/'); } }

        // ------------------------------------------------------------------ 프로필·격자 읽기
        public static MapLintProfile LoadProfile(string pathOrNull, string sceneHint)
        {
            var p = new MapLintProfile();
            string path = pathOrNull;
            if (string.IsNullOrEmpty(path))
            {
                string dir = "Assets/Exoduser/Editor/DevTools/MapLint/Profiles/";
                string s = (sceneHint ?? "").ToLowerInvariant();
                if (s.Contains("rm3") || s.Contains("ch1_3")) path = dir + "Rm3.maplint.json";
                else if (s.Contains("rm1") || s.Contains("ch1_1")) path = dir + "Rm1.maplint.json";
            }
            if (!string.IsNullOrEmpty(path))
            {
                string abs = AbsPath(path);
                if (File.Exists(abs)) JsonUtility.FromJsonOverwrite(File.ReadAllText(abs), p);
                else Debug.LogWarning("[MapLint] 프로필 없음: " + path + " (기본값 사용)");
            }
            return p;
        }

        public static string AbsPath(string p)
        {
            if (Path.IsPathRooted(p)) return p.Replace('\\', '/');
            return ProjectRoot + "/" + p.Replace('\\', '/');
        }

        public static bool[,] LoadGrid(string gridPath, MapLintProfile p)
        {
            var g = JsonUtility.FromJson<GridJ>(File.ReadAllText(AbsPath(gridPath)));
            string[] rows = (p.gridKey == "walk") ? g.walk : g.rows;
            if (rows == null) rows = g.rows ?? g.walk;
            if (rows == null || rows.Length < p.gridH) throw new InvalidOperationException("격자 행 수가 부족합니다: " + gridPath);
            var w = new bool[p.gridW, p.gridH]; char wc = p.walkChar.Length > 0 ? p.walkChar[0] : '0';
            for (int y = 0; y < p.gridH; y++) for (int x = 0; x < p.gridW; x++) w[x, y] = x < rows[y].Length && rows[y][x] == wc;
            return w;
        }

        public static string HeadSha()
        {
            try
            {
                var psi = new ProcessStartInfo("git", "-C \"" + ProjectRoot + "\" rev-parse HEAD") { RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true };
                using (var pr = Process.Start(psi)) { string o = pr.StandardOutput.ReadToEnd().Trim(); pr.WaitForExit(5000); return o; }
            }
            catch (Exception) { return ""; }
        }

        // ------------------------------------------------------------------ 도우미
        static string PathOf(Transform t)
        {
            if (t == null) return "";
            var stack = new List<string>(); for (var c = t; c != null; c = c.parent) stack.Add(c.name);
            stack.Reverse(); return string.Join("/", stack);
        }
        static bool NameIn(Transform t, string[] names)
        {
            if (names == null || names.Length == 0) return false;
            for (var c = t; c != null; c = c.parent) foreach (var n in names) if (c.name == n) return true;
            return false;
        }
        static Transform RootOf(Transform t) { while (t.parent != null) t = t.parent; return t; }
        static bool InMap(Transform t, MapLintProfile p)
        {
            if (!string.IsNullOrEmpty(p.worldRoot) && RootOf(t).name != p.worldRoot) return false;
            return !NameIn(t, p.ignoreNames);
        }
        static Vector3 TileCentre(MapLintProfile p, int tx, int ty) { return new Vector3((tx + .5f) * p.tileSize, p.walkPlaneY, -(ty + .5f) * p.tileSize); }

        // 지형 표면 월드 y (지형 밖이면 false)
        static bool TerrainY(float x, float z, out float y)
        {
            foreach (var tr in Terrain.activeTerrains)
            {
                var td = tr.terrainData; if (td == null) continue; var pos = tr.transform.position; var size = td.size;
                if (x < pos.x || z < pos.z || x > pos.x + size.x || z > pos.z + size.z) continue;
                y = tr.SampleHeight(new Vector3(x, 0, z)) + pos.y; return true;
            }
            y = 0; return false;
        }

        // ------------------------------------------------------------------ 본체
        public static MapLintResult Run(MapLintProfile p, string gridPath, string scenePath, ShotCanvas canvas)
        {
            var sw = Stopwatch.StartNew();
            var res = new MapLintResult { profile = p, scene = scenePath ?? "", gridFile = gridPath ?? "", headSha = HeadSha() };
            var walk = LoadGrid(gridPath, p);
            int wx0, wy0, wx1, wy1; p.Window(out wx0, out wy0, out wx1, out wy1);
            float T = p.tileSize;

            // 맵 렌더러 수집(활성·켜진 것). 삼각형을 가진 것(MeshRenderer+MeshFilter)과 아닌 것을 구분한다.
            var all = UnityEngine.Object.FindObjectsByType<Renderer>(FindObjectsInactive.Exclude);
            var maps = new List<RInfo>(all.Length);
            foreach (var r in all)
            {
                if (r == null || !r.enabled || !r.gameObject.activeInHierarchy) continue;
                if (!InMap(r.transform, p)) continue;
                var ri = new RInfo { r = r, t = r.transform, b = r.bounds, path = PathOf(r.transform) };
                ri.coverIgnored = NameIn(r.transform, p.coverIgnoreNames);
                var mf = r.GetComponent<MeshFilter>();
                if (r is MeshRenderer && mf != null && mf.sharedMesh != null) { ri.mesh = mf.sharedMesh; ri.isMesh = true; }
                maps.Add(ri);
            }
            maps.Sort((a, b) => string.CompareOrdinal(a.path, b.path));
            DumpHierarchy(res, p);

            // ---- 삼각형 스윕: 걷기 칸 / 막힌 칸의 9점 샘플 덮임 마스크
            int N = p.gridW * p.gridH;
            var solid = new uint[N]; var vis = new uint[N]; var coverY = new float[N]; var coverR = new int[N]; var minY = new float[N]; var minR = new int[N];
            for (int i = 0; i < N; i++) { coverY[i] = float.NegativeInfinity; coverR[i] = -1; minY[i] = float.PositiveInfinity; minR[i] = -1; }
            float rDeep = p.deepTiles * T, rVis = p.visTiles * T, rMax = Mathf.Max(rDeep, rVis);
            var off = new Vector2[17]; off[0] = Vector2.zero;
            for (int k = 0; k < 8; k++) { float a = k * Mathf.PI / 4f; var d = new Vector2(Mathf.Cos(a), Mathf.Sin(a)); off[1 + k] = d * rDeep; off[9 + k] = d * rVis; }
            const uint SolidAll = 0x1FFu;                      // 비트 0..8
            const uint VisBits = 1u | (0xFFu << 9);            // 비트 0, 9..16
            var needSolid = new bool[N]; var needVis = new bool[N];
            for (int y = wy0; y < wy1; y++) for (int x = wx0; x < wx1; x++) { int i = y * p.gridW + x; if (walk[x, y]) needSolid[i] = true; else needVis[i] = true; }
            float tol = p.heightTolerance, plane = p.walkPlaneY;
            var verts = new List<Vector3>(4096);
            long triCount = 0;
            for (int ri = 0; ri < maps.Count; ri++)
            {
                var info = maps[ri]; if (!info.isMesh) continue;
                var mesh = info.mesh; mesh.GetVertices(verts); var idx = mesh.triangles; var m = info.r.localToWorldMatrix;
                var wv = new Vector3[verts.Count]; for (int i = 0; i < wv.Length; i++) wv[i] = m.MultiplyPoint3x4(verts[i]);
                bool doVis = !info.coverIgnored;
                for (int k = 0; k + 2 < idx.Length; k += 3)
                {
                    Vector3 a = wv[idx[k]], b = wv[idx[k + 1]], c = wv[idx[k + 2]]; triCount++;
                    float maxY = Mathf.Max(a.y, Mathf.Max(b.y, c.y));
                    bool solidCand = maxY - plane > tol;
                    if (canvas != null && maxY - plane > tol) canvas.PaintTri(a, b, c);
                    float minX = Mathf.Min(a.x, Mathf.Min(b.x, c.x)), maxX = Mathf.Max(a.x, Mathf.Max(b.x, c.x));
                    float minZ = Mathf.Min(a.z, Mathf.Min(b.z, c.z)), maxZ = Mathf.Max(a.z, Mathf.Max(b.z, c.z));
                    int tx0 = Mathf.Max(wx0, Mathf.FloorToInt((minX - rMax) / T)), tx1 = Mathf.Min(wx1 - 1, Mathf.FloorToInt((maxX + rMax) / T));
                    int ty0 = Mathf.Max(wy0, Mathf.FloorToInt((-maxZ - rMax) / T)), ty1 = Mathf.Min(wy1 - 1, Mathf.FloorToInt((-minZ + rMax) / T));
                    if (tx0 > tx1 || ty0 > ty1) continue;
                    float den = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
                    if (Mathf.Abs(den) < 1e-9f) continue;
                    float inv = 1f / den;
                    for (int ty = ty0; ty <= ty1; ty++) for (int tx = tx0; tx <= tx1; tx++)
                        {
                            int i = ty * p.gridW + tx; bool ns = needSolid[i] && solidCand, nv = needVis[i] && doVis;
                            if (!ns && !nv) continue;
                            float cx = (tx + .5f) * T, cz = -(ty + .5f) * T;
                            for (int s = 0; s < 17; s++)
                            {
                                bool isSolidSample = s <= 8, isVisSample = s == 0 || s >= 9;
                                if (!((ns && isSolidSample) || (nv && isVisSample))) continue;
                                float px = cx + off[s].x, pz = cz + off[s].y;
                                float l1 = ((b.z - c.z) * (px - c.x) + (c.x - b.x) * (pz - c.z)) * inv;
                                float l2 = ((c.z - a.z) * (px - c.x) + (a.x - c.x) * (pz - c.z)) * inv;
                                float l3 = 1f - l1 - l2;
                                if (l1 < -1e-4f || l2 < -1e-4f || l3 < -1e-4f) continue;
                                if (ns && isSolidSample)
                                {
                                    float py = l1 * a.y + l2 * b.y + l3 * c.y;
                                    if (py - plane > tol)
                                    {
                                        solid[i] |= 1u << s;
                                        if (s == 0 && py - plane <= p.agentHeight) solid[i] |= 0x80000000u;   // 에이전트 키 안에서 길을 막는 덮임
                                        if (s == 0 && py > coverY[i]) { coverY[i] = py; coverR[i] = ri; }
                                        if (s == 0 && py < minY[i]) { minY[i] = py; minR[i] = ri; }
                                    }
                                }
                                if (nv && isVisSample) vis[i] |= (s == 0) ? 1u : (1u << s);
                            }
                        }
                }
            }

            // ---- L1 걷기 칸 덮임
            var L1 = new CheckResult("L1", "걷기 칸 덮임(메시 삼각형 기준)");
            int centre = 0, deep = 0, walkTiles = 0, centreLow = 0, fromPile = 0, centreRaw = 0; var overheadTiles = new List<Vector2Int>();
            var clsPile = new List<L1Rec>(); var clsArch = new List<L1Rec>(); var clsOther = new List<L1Rec>(); var clsTerrain = new List<L1Rec>();
            for (int y = wy0; y < wy1; y++) for (int x = wx0; x < wx1; x++)
                {
                    if (!walk[x, y]) continue; walkTiles++; int i = y * p.gridW + x;
                    if ((solid[i] & 1u) == 0) continue;
                    centreRaw++;
                    if (minY[i] - plane >= p.overheadMinH) { overheadTiles.Add(new Vector2Int(x, y)); continue; }   // L1b 로 이관
                    centre++; bool dp = (solid[i] & SolidAll) == SolidAll; if (dp) deep++;
                    if ((solid[i] & 0x80000000u) != 0) centreLow++;
                    {
                        var cov = maps[coverR[i]]; var cc = cov.b.center; bool pile = new Vector2(cc.x, cc.z).magnitude < 2f * p.originRadius; if (pile) fromPile++;
                        var rec = new L1Rec { tx = x, ty = y, h = coverY[i] - plane, deep = dp, path = cov.path };
                        if (pile) clsPile.Add(rec); else if ((solid[i] & 0x80000000u) == 0) clsArch.Add(rec); else clsOther.Add(rec);
                    }
                    res.coveredCentre.Add(new Vector2Int(x, y)); if (dp) res.coveredDeep.Add(new Vector2Int(x, y));
                    if (L1.items.Count < 200)
                    {
                        var ri = maps[coverR[i]]; var c3 = TileCentre(p, x, y);
                        L1.items.Add(new LintItem { t = ri.t, path = ri.path, pos = c3, tx = x, ty = y, v1 = coverY[i] - plane, v2 = dp ? 1 : 0, note = dp ? "deep" : "centre" });
                    }
                }
            int terrAbove = 0; float terrMax = 0, terrMin = 0; int terrTested = 0;
            for (int y = wy0; y < wy1; y++) for (int x = wx0; x < wx1; x++)
                {
                    if (!walk[x, y]) continue; float ty0v;
                    if (!TerrainY((x + .5f) * T, -(y + .5f) * T, out ty0v)) continue;
                    terrTested++; float h = ty0v - plane; if (h > terrMax) terrMax = h; if (h < terrMin) terrMin = h;
                    if (h > tol)
                    {
                        terrAbove++; clsTerrain.Add(new L1Rec { tx = x, ty = y, h = h, deep = false, path = "Terrain" });
                        if (L1.items.Count < 260) L1.items.Add(new LintItem { path = "Terrain", pos = TileCentre(p, x, y), tx = x, ty = y, v1 = h, note = "terrain" });
                    }
                }
            L1.count = centre + terrAbove; L1.pass = L1.count == 0;
            L1.Add("walkTiles", walkTiles); L1.Add("centreRawBeforeL1bSplit", centreRaw); L1.Add("movedToL1b", overheadTiles.Count); L1.Add("overheadMinH", p.overheadMinH); L1.Add("centre", centre); L1.Add("deep05", deep); L1.Add("centreBelowAgentHeight", centreLow); L1.Add("centreFromOriginPile", fromPile); L1.Add("agentHeight", p.agentHeight);
            L1.Add("terrainTested", terrTested); L1.Add("terrainAboveTol", terrAbove); L1.Add("terrainMaxUp", terrMax); L1.Add("terrainMaxDown", terrMin);
            L1.AddRaw("classes", "{" + ClassJson("terrainUndulation", clsTerrain, p, "지형 굴곡: 걷기 칸 지형이 걷기 면보다 허용값 이상 높음(메시와 별개 집계)") + "," + ClassJson("archBelowOverheadMinH", clsArch, p, "낮은 아치: 가장 낮은 표면이 에이전트 키~L1b 기준(2.5u) 사이(L1에 남음)") + "," + ClassJson("originPile", clsPile, p, "원점 쌓임 기인: 덮은 렌더러 bounds 중심이 월드 원점 근처(L6 버그 결과)") + "," + ClassJson("otherMesh", clsOther, p, "그 밖의 메시: 키 안 높이에서 덮음(실제로 길을 막는 후보)") + "}");
            L1.Add("triangles", (int)triCount); L1.Add("meshRenderers", maps.FindAll(q => q.isMesh).Count);
            res.checks.Add(L1);
            res.checks.Add(CheckOverhead(res, p, maps, overheadTiles, minR, minY));

            // ---- L2 NavMesh <-> Core
            var L2 = new CheckResult("L2", "NavMesh와 Core 걷기 차이");
            var navTri = NavMesh.CalculateTriangulation();
            int coreOnly = 0, navOnly = 0, tested = 0;
            for (int y = wy0; y < wy1; y++) for (int x = wx0; x < wx1; x++)
                {
                    var c3 = TileCentre(p, x, y); bool core = walk[x, y]; bool nav = false; NavMeshHit hit;
                    if (NavMesh.SamplePosition(c3, out hit, p.navSampleDist, NavMesh.AllAreas)) { float dx = hit.position.x - c3.x, dz = hit.position.z - c3.z; nav = Mathf.Sqrt(dx * dx + dz * dz) < p.navHorizTol; }
                    tested++; if (core == nav) continue;
                    if (core) { coreOnly++; res.navCoreOnly.Add(new Vector2Int(x, y)); } else { navOnly++; res.navNavOnly.Add(new Vector2Int(x, y)); }
                    if (L2.items.Count < 200) L2.items.Add(new LintItem { path = core ? "coreWalkNavNo" : "navWalkCoreNo", pos = c3, tx = x, ty = y, note = core ? "coreWalkNavNo" : "navWalkCoreNo" });
                }
            L2.count = coreOnly + navOnly; L2.pass = L2.count == 0 && navTri.vertices.Length > 0;
            L2.Add("tested", tested); L2.Add("coreWalkNavNo", coreOnly); L2.Add("navWalkCoreNo", navOnly); L2.Add("navVertices", navTri.vertices.Length);
            if (navTri.vertices.Length == 0) L2.warns.Add("NavMesh 데이터가 비어 있음(씬에 구워진 NavMesh 없음)");
            res.checks.Add(L2);

            // ---- L3 막힌 섬 덮임(보이는 렌더러가 있는가)
            var L3 = new CheckResult("L3", "막힌 섬을 덮는 보이는 렌더러(uncoveredAfterFill)");
            var seen = new bool[N]; int islands = 0, islandsUncovered = 0, uncoveredTilesTotal = 0, skippedBorder = 0, skippedBig = 0;
            var stack = new Stack<int>();
            for (int y = wy0; y < wy1; y++) for (int x = wx0; x < wx1; x++)
                {
                    int i0 = y * p.gridW + x; if (walk[x, y] || seen[i0]) continue;
                    var comp = new List<int>(); bool border = false; seen[i0] = true; stack.Push(i0);
                    while (stack.Count > 0)
                    {
                        int c = stack.Pop(); comp.Add(c); int cx = c % p.gridW, cy = c / p.gridW;
                        if (cx == wx0 || cy == wy0 || cx == wx1 - 1 || cy == wy1 - 1) border = true;
                        for (int d = 0; d < 4; d++)
                        {
                            int nx = cx + (d == 0 ? 1 : d == 1 ? -1 : 0), ny = cy + (d == 2 ? 1 : d == 3 ? -1 : 0);
                            if (nx < wx0 || ny < wy0 || nx >= wx1 || ny >= wy1 || walk[nx, ny]) continue; int ni = ny * p.gridW + nx; if (seen[ni]) continue; seen[ni] = true; stack.Push(ni);
                        }
                    }
                    if (border && !p.FullWindow) { skippedBorder++; continue; }
                    if (p.islandMaxTiles > 0 && comp.Count > p.islandMaxTiles) { skippedBig++; continue; }
                    // 창 가장자리에 닿는 큰 덩어리(격자 밖 외곽 덩어리)는 섬이 아니므로 전체 창일 때도 격자 가장자리에 닿으면 건너뛴다
                    if (p.FullWindow && border) { bool edgeTouch = false; foreach (int c in comp) { int cx = c % p.gridW, cy = c / p.gridW; if (cx == 0 || cy == 0 || cx == p.gridW - 1 || cy == p.gridH - 1) { edgeTouch = true; break; } } if (edgeTouch) { skippedBorder++; continue; } }
                    islands++; int unc = 0; int bx0 = int.MaxValue, by0 = int.MaxValue, bx1 = -1, by1 = -1;
                    foreach (int c in comp)
                    {
                        int cx = c % p.gridW, cy = c / p.gridW; bx0 = Mathf.Min(bx0, cx); by0 = Mathf.Min(by0, cy); bx1 = Mathf.Max(bx1, cx); by1 = Mathf.Max(by1, cy);
                        if ((vis[c] & VisBits) == 0) { unc++; res.uncoveredIslandTiles.Add(new Vector2Int(cx, cy)); }
                    }
                    uncoveredTilesTotal += unc;
                    if (unc > 0)
                    {
                        islandsUncovered++;
                        if (L3.items.Count < 200)
                            L3.items.Add(new LintItem { path = "island bbox[" + bx0 + "," + by0 + "," + bx1 + "," + by1 + "]", pos = TileCentre(p, (bx0 + bx1) / 2, (by0 + by1) / 2), tx = bx0, ty = by0, v1 = comp.Count, v2 = unc, note = "uncovered " + unc + "/" + comp.Count });
                    }
                }
            L3.count = islandsUncovered; L3.pass = islandsUncovered == 0;
            L3.Add("islands", islands); L3.Add("uncoveredAfterFill", islandsUncovered); L3.Add("uncoveredTilesTotal", uncoveredTilesTotal);
            L3.Add("skippedBorder", skippedBorder); L3.Add("skippedBig", skippedBig);
            res.checks.Add(L3);

            // ---- L3b 보이지 않는 벽(렌더러 없는 Collider·NavMeshObstacle 이 걷기 칸을 막음)
            var L3b = new CheckResult("L3b", "보이지 않는 벽(렌더러 없는 Collider/NavMeshObstacle)");
            int collN = 0, invisColl = 0; int blockedTiles = 0;
            Physics.SyncTransforms();
            var hits = new Collider[16];
            foreach (var col in UnityEngine.Object.FindObjectsByType<Collider>(FindObjectsInactive.Exclude))
            {
                if (col == null || !col.enabled || col.isTrigger || col is TerrainCollider || !InMap(col.transform, p) || NameIn(col.transform, p.colliderIgnoreNames)) continue;
                collN++; if (HasVisible(col.gameObject)) continue; invisColl++;
                var cb = col.bounds; int cx0 = Mathf.Max(wx0, Mathf.FloorToInt(cb.min.x / T)), cx1 = Mathf.Min(wx1 - 1, Mathf.FloorToInt(cb.max.x / T)), cy0 = Mathf.Max(wy0, Mathf.FloorToInt(-cb.max.z / T)), cy1 = Mathf.Min(wy1 - 1, Mathf.FloorToInt(-cb.min.z / T));
                int mine = 0;
                for (int y = cy0; y <= cy1; y++) for (int x = cx0; x <= cx1; x++)
                    {
                        if (!walk[x, y]) continue; var c3 = TileCentre(p, x, y);
                        int n = Physics.OverlapBoxNonAlloc(c3 + Vector3.up * 0.9f, new Vector3(T * .47f, 0.8f, T * .47f), hits, Quaternion.identity, ~0, QueryTriggerInteraction.Ignore);
                        for (int h = 0; h < n; h++) if (hits[h] == col) { mine++; res.invisPts.Add(c3); break; }
                    }
                if (mine > 0) { blockedTiles += mine; if (L3b.items.Count < 100) L3b.items.Add(new LintItem { t = col.transform, path = PathOf(col.transform), pos = cb.center, v1 = mine, note = "collider " + col.GetType().Name + " blocks " + mine + " walk tiles" }); }
            }
            int obsN = 0, invisObs = 0;
            foreach (var ob in UnityEngine.Object.FindObjectsByType<NavMeshObstacle>(FindObjectsInactive.Exclude))
            {
                if (ob == null || !ob.enabled || !InMap(ob.transform, p)) continue; obsN++; if (HasVisible(ob.gameObject)) continue; invisObs++;
                var tr = ob.transform; var ctr = tr.TransformPoint(ob.center); var sz = ob.shape == NavMeshObstacleShape.Box ? ob.size : new Vector3(ob.radius * 2, ob.height, ob.radius * 2);
                var ls = tr.lossyScale; var ext = new Vector3(Mathf.Abs(sz.x * ls.x), Mathf.Abs(sz.y * ls.y), Mathf.Abs(sz.z * ls.z)) * 0.5f; float er = Mathf.Max(ext.x, ext.z);
                int mine = 0;
                for (int y = Mathf.Max(wy0, Mathf.FloorToInt(-(ctr.z + er) / T)); y <= Mathf.Min(wy1 - 1, Mathf.FloorToInt(-(ctr.z - er) / T)); y++)
                    for (int x = Mathf.Max(wx0, Mathf.FloorToInt((ctr.x - er) / T)); x <= Mathf.Min(wx1 - 1, Mathf.FloorToInt((ctr.x + er) / T)); x++)
                        if (walk[x, y]) { mine++; res.invisPts.Add(TileCentre(p, x, y)); }
                if (mine > 0) { blockedTiles += mine; if (L3b.items.Count < 100) L3b.items.Add(new LintItem { t = tr, path = PathOf(tr), pos = ctr, v1 = mine, note = "NavMeshObstacle blocks ~" + mine + " walk tiles" }); }
            }
            L3b.count = L3b.items.Count; L3b.pass = L3b.items.Count == 0;
            L3b.Add("colliders", collN); L3b.Add("collidersWithoutRenderer", invisColl); L3b.Add("obstacles", obsN); L3b.Add("obstaclesWithoutRenderer", invisObs); L3b.Add("blockedWalkTiles", blockedTiles);
            res.checks.Add(L3b);

            // ---- L4 시선 쐐기
            res.checks.Add(CheckWedge(res, p, walk, maps));

            // ---- L5 Hero 렌더링 레이어 누수(씬의 모든 활성 렌더러)
            var L5 = new CheckResult("L5", "Hero 레이어 누수");
            int heroLayerId = string.IsNullOrEmpty(p.heroLayerName) ? -1 : LayerMask.NameToLayer(p.heroLayerName);
            int nonDefault = 0, onHeroLayer = 0, totalR = 0;
            foreach (var r in all)
            {
                if (r == null || !r.gameObject.activeInHierarchy) continue; totalR++;
                bool nd = r.renderingLayerMask != p.defaultRenderingLayerMask, hl = heroLayerId >= 0 && r.gameObject.layer == heroLayerId;
                if (nd) nonDefault++; if (hl) onHeroLayer++;
                if ((nd || hl) && L5.items.Count < 100) L5.items.Add(new LintItem { t = r.transform, path = PathOf(r.transform), pos = r.bounds.center, v1 = r.renderingLayerMask, note = (nd ? "renderingLayerMask=" + r.renderingLayerMask + " " : "") + (hl ? "layer=" + p.heroLayerName : "") });
            }
            L5.count = nonDefault + onHeroLayer; L5.pass = L5.count == 0;
            L5.Add("renderers", totalR); L5.Add("nonDefaultRenderingLayerMask", nonDefault); L5.Add("onHeroLayer", onHeroLayer); L5.Add("heroLayerExists", heroLayerId >= 0);
            res.checks.Add(L5);

            // ---- L6 원점 쌓임·위치 불일치
            res.checks.Add(CheckOrigin(res, p, maps));

            // ---- L7 렌더 상태(경고만)
            res.checks.Add(CheckRenderState(res, p, scenePath, terrAbove));

            res.durMs = sw.ElapsedMilliseconds;
            return res;
        }

        // L1b 머리 위 덮개: 걷기 칸 위 메시의 가장 낮은 점이 overheadMinH 이상. 캡슐 중심(지면+capsuleCentreY)에서 카메라 LOOK-001 위치로 선을 쏴 그 메시 삼각형에 맞으면 위반.
        static CheckResult CheckOverhead(MapLintResult res, MapLintProfile p, List<RInfo> maps, List<Vector2Int> tiles, int[] minR, float[] minY)
        {
            var L1b = new CheckResult("L1b", "머리 위 덮개 가림(캡슐→카메라 선, 최저점>=" + p.overheadMinH.ToString("0.#") + "u)");
            var used = new HashSet<int>(); foreach (var t in tiles) { int r = minR[t.y * p.gridW + t.x]; if (r >= 0) used.Add(r); }
            var geo = new Dictionary<int, Vector3[]>(); var idxs = new Dictionary<int, int[]>(); var verts = new List<Vector3>();
            foreach (int r in used)
            {
                var info = maps[r]; info.mesh.GetVertices(verts); var m = info.r.localToWorldMatrix; var wv = new Vector3[verts.Count];
                for (int i = 0; i < wv.Length; i++) wv[i] = m.MultiplyPoint3x4(verts[i]); geo[r] = wv; idxs[r] = info.mesh.triangles;
            }
            var offset = new Vector3(0f, p.camOffsetY, p.camOffsetZ); var perMesh = new Dictionary<int, int>(); int violating = 0;
            foreach (var t in tiles)
            {
                var cap = TileCentre(p, t.x, t.y) + Vector3.up * p.capsuleCentreY; var cam = cap + offset; var dir = cam - cap; float len = dir.magnitude; dir /= len;
                var ray = new Ray(cap, dir); int hitMesh = -1;
                foreach (int r in used)
                {
                    float dist; var bb = maps[r].b; bb.Expand(0.02f); if (!bb.IntersectRay(ray, out dist) || dist > len) { if (!bb.Contains(cap)) continue; }
                    var wv = geo[r]; var ix = idxs[r]; bool hit = false;
                    for (int k = 0; k + 2 < ix.Length && !hit; k += 3) hit = RayTri(cap, dir, len, wv[ix[k]], wv[ix[k + 1]], wv[ix[k + 2]]);
                    if (hit) { hitMesh = r; break; }
                }
                if (hitMesh < 0) continue; violating++; res.overheadViolations.Add(t); int c; perMesh.TryGetValue(hitMesh, out c); perMesh[hitMesh] = c + 1;
            }
            foreach (var t in tiles) res.overheadTiles.Add(t);
            var list = new List<KeyValuePair<int, int>>(perMesh); list.Sort((a, b) => b.Value.CompareTo(a.Value));
            for (int k = 0; k < Mathf.Min(20, list.Count); k++) { var ri = maps[list[k].Key]; L1b.items.Add(new LintItem { t = ri.t, path = ri.path, pos = ri.b.center, v1 = list[k].Value, v2 = ri.b.min.y - p.walkPlaneY, note = list[k].Value + " 칸 위반, 메시 최저점 " + (ri.b.min.y - p.walkPlaneY).ToString("0.0") + "u" }); }
            L1b.count = violating; L1b.pass = violating == 0;
            L1b.Add("overheadTiles", tiles.Count); L1b.Add("violatingTiles", violating); L1b.Add("overheadMeshes", used.Count); L1b.Add("violatingMeshes", perMesh.Count);
            L1b.Add("cameraOffsetY", p.camOffsetY); L1b.Add("cameraOffsetZ", p.camOffsetZ); L1b.Add("capsuleCentreY", p.capsuleCentreY);
            var sb = new System.Text.StringBuilder("["); int n = Mathf.Min(5, tiles.Count);
            for (int k = 0; k < n; k++) { var t = tiles[n == 1 ? 0 : (int)((long)k * (tiles.Count - 1) / (n - 1))]; if (k > 0) sb.Append(','); sb.Append("{\"tile\":[").Append(t.x).Append(',').Append(t.y).Append("],\"minSurfaceH\":").Append(Jw.F(minY[t.y * p.gridW + t.x] - p.walkPlaneY)).Append(",\"path\":").Append(Jw.S(maps[minR[t.y * p.gridW + t.x]].path)).Append('}'); }
            sb.Append(']'); L1b.AddRaw("sampleTiles", sb.ToString());
            return L1b;
        }

        static bool RayTri(Vector3 o, Vector3 d, float maxT, Vector3 a, Vector3 b, Vector3 c)
        {
            Vector3 e1 = b - a, e2 = c - a, pv = Vector3.Cross(d, e2); float det = Vector3.Dot(e1, pv); if (Mathf.Abs(det) < 1e-9f) return false;
            float inv = 1f / det; Vector3 tv = o - a; float u = Vector3.Dot(tv, pv) * inv; if (u < 0f || u > 1f) return false;
            Vector3 qv = Vector3.Cross(tv, e1); float v = Vector3.Dot(d, qv) * inv; if (v < 0f || u + v > 1f) return false;
            float t = Vector3.Dot(e2, qv) * inv; return t > 0.01f && t < maxT;
        }

        sealed class L1Rec { public int tx, ty; public float h; public bool deep; public string path; }
        // 종류별 개수·깊이·높이 범위와 대표 좌표 5개(위치순으로 고르게 뽑음)
        static string ClassJson(string key, List<L1Rec> l, MapLintProfile p, string desc)
        {
            l.Sort((a, b) => a.ty != b.ty ? a.ty.CompareTo(b.ty) : a.tx.CompareTo(b.tx));
            int deep = 0; float maxH = 0, minH = float.MaxValue; foreach (var r in l) { if (r.deep) deep++; if (r.h > maxH) maxH = r.h; if (r.h < minH) minH = r.h; }
            if (l.Count == 0) minH = 0;
            var sb = new System.Text.StringBuilder(); sb.Append(Jw.S(key)).Append(":{\"desc\":").Append(Jw.S(desc)).Append(",\"count\":").Append(l.Count).Append(",\"deep05\":").Append(deep).Append(",\"minH\":").Append(Jw.F(minH)).Append(",\"maxH\":").Append(Jw.F(maxH)).Append(",\"samples\":[");
            int n = Mathf.Min(5, l.Count);
            for (int k = 0; k < n; k++)
            {
                var r = l[n == 1 ? 0 : (int)((long)k * (l.Count - 1) / (n - 1))]; if (k > 0) sb.Append(',');
                sb.Append("{\"tile\":[").Append(r.tx).Append(',').Append(r.ty).Append("],\"world\":[").Append(Jw.F((r.tx + .5f) * p.tileSize)).Append(',').Append(Jw.F(-(r.ty + .5f) * p.tileSize)).Append("],\"h\":").Append(Jw.F(r.h)).Append(",\"deep\":").Append(r.deep ? "true" : "false").Append(",\"path\":").Append(Jw.S(r.path)).Append('}');
            }
            sb.Append("],\"byGroup\":{");
            var grp = new Dictionary<string, int>();
            foreach (var r in l)
            {
                var seg = r.path.Split('/'); string gk = seg.Length > 1 ? seg[1] : seg[0];
                if (gk == "Blockout" && seg.Length > 2) gk += "/" + System.Text.RegularExpressions.Regex.Replace(seg[2], "[_0-9]+$", "");
                int c; grp.TryGetValue(gk, out c); grp[gk] = c + 1;
            }
            var gl = new List<KeyValuePair<string, int>>(grp); gl.Sort((a, b) => b.Value.CompareTo(a.Value)); int gi = 0;
            foreach (var kv in gl) { if (gi >= 10) break; if (gi++ > 0) sb.Append(','); sb.Append(Jw.S(kv.Key)).Append(':').Append(kv.Value); }
            sb.Append("}}"); return sb.ToString();
        }

        static bool HasVisible(GameObject go)
        {
            foreach (var r in go.GetComponentsInChildren<Renderer>(false)) if (r.enabled) return true;
            return false;
        }

        static void DumpHierarchy(MapLintResult res, MapLintProfile p)
        {
            // 진단용: 루트와 맵 루트 바로 아래 자식 이름·렌더러 수
            var sc = UnityEditor.SceneManagement.EditorSceneManager.GetActiveScene();
            foreach (var root in sc.GetRootGameObjects())
            {
                int rc = root.GetComponentsInChildren<Renderer>(true).Length;
                res.hierarchyDump.Add(root.name + " (renderers " + rc + ", children " + root.transform.childCount + ")");
                if (root.name == p.worldRoot)
                    foreach (Transform c in root.transform) res.hierarchyDump.Add("  " + c.name + " (renderers " + c.GetComponentsInChildren<Renderer>(true).Length + ", children " + c.childCount + ")");
            }
        }

        // ------------------------------------------------------------------ L4

        // 덩어리(x 범위, 북쪽 끝 z)에서 북쪽으로 가장 가까운 걷기 칸 중심까지 수평 거리(없으면 99)
        static float NorthD(MapLintProfile p, bool[,] walk, float minX, float maxX, float maxZ)
        {
            float T = p.tileSize, D = 99f;
            int row = Mathf.Min(p.gridH - 1, Mathf.FloorToInt(-maxZ / T - 0.5f));
            int cx0 = Mathf.Max(0, Mathf.FloorToInt((minX - p.wedgeXMargin) / T)), cx1 = Mathf.Min(p.gridW - 1, Mathf.FloorToInt((maxX + p.wedgeXMargin) / T));
            for (int y = row; y >= 0; y--)
            {
                float cz = -(y + .5f) * T, dz = cz - maxZ; if (dz > D) break;
                for (int x = cx0; x <= cx1; x++)
                {
                    if (!walk[x, y]) continue; float cxw = (x + .5f) * T; float dx = cxw < minX ? minX - cxw : (cxw > maxX ? cxw - maxX : 0f);
                    float d = Mathf.Sqrt(dx * dx + dz * dz); if (d < D) D = d;
                }
            }
            return D;
        }

        // 지형 자체가 솟아 시선을 가리는 곳(걷기 아닌 칸의 지형 높이). 8방 이웃으로 묶어 덩어리 단위로 보고한다.
        static void TerrainWedge(MapLintResult res, MapLintProfile p, bool[,] walk, CheckResult L4, List<WedgeRec> recs, out int overMin, out int failClusters, out float maxTop)
        {
            overMin = 0; failClusters = 0; maxTop = 0; float T = p.tileSize, slope = p.Slope;
            int x0, y0, x1, y1; p.Window(out x0, out y0, out x1, out y1);
            int W = p.gridW; var bad = new bool[p.gridW * p.gridH]; var tileH = new float[p.gridW * p.gridH]; var tileLim = new float[p.gridW * p.gridH];
            for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++)
                {
                    if (walk[x, y]) continue; float ty;
                    if (!TerrainY((x + .5f) * T, -(y + .5f) * T, out ty)) continue; float h = ty - p.walkPlaneY; if (h <= p.wedgeMinH) continue; overMin++;
                    float cxw = (x + .5f) * T, czn = -(y + .5f) * T + T * 0.5f; float D = NorthD(p, walk, cxw - T * 0.5f, cxw + T * 0.5f, czn); float lim = p.wedgeBase + slope * D;
                    int i = y * W + x; tileH[i] = h; tileLim[i] = lim; if (h > lim) bad[i] = true;
                    if (D < 99f) maxTop = Mathf.Max(maxTop, h);
                }
            var seen = new bool[bad.Length]; var st = new Stack<int>();
            for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++)
                {
                    int i0 = y * W + x; if (!bad[i0] || seen[i0]) continue; seen[i0] = true; st.Push(i0);
                    int n = 0, bx0 = x, bx1 = x, by0 = y, by1 = y, worst = i0; float worstOver = 0;
                    while (st.Count > 0)
                    {
                        int c = st.Pop(); int cx = c % W, cy = c / W; n++; bx0 = Mathf.Min(bx0, cx); bx1 = Mathf.Max(bx1, cx); by0 = Mathf.Min(by0, cy); by1 = Mathf.Max(by1, cy);
                        if (tileH[c] - tileLim[c] > worstOver) { worstOver = tileH[c] - tileLim[c]; worst = c; }
                        for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
                            {
                                int nx = cx + dx, ny = cy + dy; if (nx < x0 || ny < y0 || nx >= x1 || ny >= y1) continue; int ni = ny * W + nx; if (!bad[ni] || seen[ni]) continue; seen[ni] = true; st.Push(ni);
                            }
                    }
                    failClusters++;
                    var bb = new Bounds(); bb.SetMinMax(new Vector3(bx0 * T, p.walkPlaneY, -(by1 + 1) * T), new Vector3((bx1 + 1) * T, p.walkPlaneY + tileH[worst], -by0 * T));
                    recs.Add(new WedgeRec { path = "Terrain cluster bbox[" + bx0 + "," + by0 + "," + bx1 + "," + by1 + "] tiles=" + n, t = null, b = bb, h = tileH[worst], terrainH = tileH[worst], objH = 0f, D = (tileLim[worst] - p.wedgeBase) / slope, limit = tileLim[worst], pass = false, members = n });
                }
        }
        static CheckResult CheckWedge(MapLintResult res, MapLintProfile p, bool[,] walk, List<RInfo> maps)
        {
            var L4 = new CheckResult("L4", "시선 쐐기 h<=" + p.wedgeBase.ToString("0.#") + "+" + p.Slope.ToString("0.00") + "*D (지형 높이 포함)");
            float T = p.tileSize, slope = p.Slope;
            var groups = new Dictionary<Transform, List<RInfo>>();
            foreach (var ri in maps)
            {
                var key = ri.t.parent != null ? ri.t.parent : ri.t;
                List<RInfo> l; if (!groups.TryGetValue(key, out l)) groups[key] = l = new List<RInfo>(); l.Add(ri);
            }
            var clusters = new List<List<RInfo>>();
            foreach (var kv in groups)
            {
                var b = kv.Value[0].b; foreach (var ri in kv.Value) b.Encapsulate(ri.b);
                if (Mathf.Max(b.size.x, b.size.z) <= p.groupMaxExtent) clusters.Add(kv.Value);
                else foreach (var ri in kv.Value) clusters.Add(new List<RInfo> { ri });
            }
            int cand = 0, fails = 0, over2 = 0, onlyTerrain = 0; float maxTerr = 0, maxH = 0;
            var recs = new List<WedgeRec>();
            foreach (var cl in clusters)
            {
                var b = cl[0].b; RInfo top = cl[0]; foreach (var ri in cl) { b.Encapsulate(ri.b); if (ri.b.max.y > top.b.max.y) top = ri; }
                float h = b.max.y - p.walkPlaneY; if (h <= p.wedgeMinH) continue; cand++;
                float ty; float terrainH = 0; if (TerrainY(top.b.center.x, top.b.center.z, out ty)) terrainH = Mathf.Max(0f, ty - p.walkPlaneY);
                float objH = h - terrainH;
                // D: 덩어리 북쪽 끝에서 북쪽 가장 가까운 걷기 칸 중심까지 수평 거리
                float D = NorthD(p, walk, b.min.x, b.max.x, b.max.z);
                float limit = p.wedgeBase + slope * D; bool pass = h <= limit;
                if (!pass) { fails++; if (objH <= limit) onlyTerrain++; }
                if (h > p.tallReportH && D < 99f) over2++;
                maxTerr = Mathf.Max(maxTerr, terrainH); if (D < 99f) maxH = Mathf.Max(maxH, h);
                var parent = top.t.parent != null ? top.t.parent : top.t;
                recs.Add(new WedgeRec { path = cl.Count > 1 ? PathOf(parent) + " (x" + cl.Count + ")" : top.path, t = cl.Count > 1 ? parent : top.t, b = b, h = h, terrainH = terrainH, objH = objH, D = D, limit = limit, pass = pass, members = cl.Count });
            }
            int terrOver, terrClusters; float terrTop; var terrRecs = new List<WedgeRec>();
            TerrainWedge(res, p, walk, L4, terrRecs, out terrOver, out terrClusters, out terrTop); recs.AddRange(terrRecs); fails += terrClusters;
            recs.Sort((x, y) => (y.h - y.limit).CompareTo(x.h - x.limit));
            foreach (var r in recs)
            {
                res.wedges.Add(r);
                if (L4.items.Count < 300) L4.items.Add(new LintItem { t = r.t, path = r.path, pos = r.b.center, bounds = r.b, hasBounds = true, v1 = r.h, v2 = r.terrainH, v3 = r.D, v4 = r.limit, note = (r.pass ? "pass" : "FAIL") + " h=" + r.h.ToString("0.00") + " terrainH=" + r.terrainH.ToString("0.00") + " D=" + r.D.ToString("0.00") + " limit=" + r.limit.ToString("0.00") });
            }
            L4.count = fails; L4.pass = fails == 0;
            L4.Add("candidates", cand); L4.Add("fails", fails); L4.Add("overTallReportH", over2); L4.Add("failsOnlyBecauseTerrain", onlyTerrain);
            L4.Add("terrainOnlyTilesOverMinH", terrOver); L4.Add("terrainOnlyFailClusters", terrClusters); L4.Add("terrainOnlyMaxHWithWalkNorth", terrTop);
            L4.Add("maxTerrainH", maxTerr); L4.Add("maxHWithWalkNorth", maxH); L4.Add("slope", slope); L4.Add("itemColumns", "path,pos,v=[h,terrainH,D,limit]");
            return L4;
        }

        // ------------------------------------------------------------------ L6
        static CheckResult CheckOrigin(MapLintResult res, MapLintProfile p, List<RInfo> maps)
        {
            var L6 = new CheckResult("L6", "원점 쌓임·위치 불일치");
            float R = p.originRadius;
            // (a) 렌더러 bounds 중심이 월드 원점 반경 안
            var a = new List<RInfo>();
            foreach (var ri in maps) { var c = ri.b.center; if (new Vector2(c.x, c.z).magnitude < R) a.Add(ri); }
            // (b) 부모는 원점이 아닌데 자식 월드 위치가 원점. 자식 localPosition ≈ -부모 worldPosition 패턴
            var bList = new List<KeyValuePair<float, RInfo>>(); var bParents = new HashSet<Transform>(); int negPattern = 0;
            foreach (var ri in maps)
            {
                var par = ri.t.parent; if (par == null) continue;
                var pp = new Vector2(par.position.x, par.position.z); var cp = new Vector2(ri.t.position.x, ri.t.position.z);
                if (pp.magnitude > 2f * R && cp.magnitude < R)
                {
                    bList.Add(new KeyValuePair<float, RInfo>(pp.magnitude, ri)); bParents.Add(par);
                    var lp = ri.t.localPosition; if ((new Vector2(lp.x, lp.z) + pp).magnitude < 0.5f) negPattern++;
                }
            }
            // (c) 직접 렌더러를 가진 그룹(부모)의 위치와 그 렌더러 bounds 중심 거리가 그룹 크기보다 훨씬 큼
            var byParent = new Dictionary<Transform, List<RInfo>>();
            foreach (var ri in maps) { var par = ri.t.parent; if (par == null) continue; List<RInfo> l; if (!byParent.TryGetValue(par, out l)) byParent[par] = l = new List<RInfo>(); l.Add(ri); }
            var cList = new List<KeyValuePair<float, Transform>>(); int pivotAtOrigin = 0;
            foreach (var kv in byParent)
            {
                var b = kv.Value[0].b; foreach (var ri in kv.Value) b.Encapsulate(ri.b);
                float size = Mathf.Max(b.size.x, b.size.z); var gp = new Vector2(kv.Key.position.x, kv.Key.position.z); var bc = new Vector2(b.center.x, b.center.z);
                float dist = (gp - bc).magnitude; if (dist <= 2f * size + 2f) continue;
                if (gp.magnitude <= R) { pivotAtOrigin++; continue; }   // 피벗이 원점인 월드 좌표 메시: 참고만
                cList.Add(new KeyValuePair<float, Transform>(dist, kv.Key));
            }
            bList.Sort((x, y) => y.Key.CompareTo(x.Key)); cList.Sort((x, y) => y.Key.CompareTo(x.Key));
            a.Sort((x, y) => string.CompareOrdinal(x.path, y.path));
            for (int i = 0; i < Mathf.Min(20, a.Count); i++) L6.items.Add(new LintItem { t = a[i].t, path = a[i].path, pos = a[i].b.center, note = "(a) bounds 중심이 원점 반경 " + R.ToString("0.#") + "u 안" });
            for (int i = 0; i < Mathf.Min(20, bList.Count); i++) { var ri = bList[i].Value; L6.items.Add(new LintItem { t = ri.t, path = ri.path, pos = ri.t.position, v1 = bList[i].Key, v2 = ri.t.localPosition.x, v3 = ri.t.localPosition.z, note = "(b) 부모 월드 xz=" + bList[i].Key.ToString("0.0") + "u 인데 자식 월드 위치는 원점" }); }
            for (int i = 0; i < Mathf.Min(20, cList.Count); i++) { var t = cList[i].Value; L6.items.Add(new LintItem { t = t, path = PathOf(t), pos = t.position, v1 = cList[i].Key, note = "(c) 그룹 위치와 렌더러 bounds 중심이 " + cList[i].Key.ToString("0.0") + "u 어긋남" }); }
            res.originPileCount = Mathf.Max(a.Count, bList.Count);
            foreach (var par in bParents) { if (res.intendedPts.Count >= 2000) break; res.intendedPts.Add(par.position); }
            { // 쌓임 부모 대표 목록: Heart 등 이름 우선 + 경로순 고르게 60개
                var ps = new List<Transform>(bParents); ps.Sort((x, y) => string.CompareOrdinal(PathOf(x), PathOf(y))); var pick = new List<Transform>();
                foreach (var t in ps) if (t.name.StartsWith("Heart") && pick.Count < 12) pick.Add(t);
                for (int k = 0; k < ps.Count && pick.Count < 60; k += Mathf.Max(1, ps.Count / 48)) if (!pick.Contains(ps[k])) pick.Add(ps[k]);
                var sb2 = new System.Text.StringBuilder("["); for (int k = 0; k < pick.Count; k++) { if (k > 0) sb2.Append(','); var t = pick[k]; sb2.Append("{\"path\":").Append(Jw.S(PathOf(t))).Append(",\"parentWorld\":[").Append(Jw.F(t.position.x)).Append(',').Append(Jw.F(t.position.y)).Append(',').Append(Jw.F(t.position.z)).Append("],\"children\":").Append(t.childCount).Append('}'); }
                sb2.Append(']'); L6.AddRaw("pileParentsSample", sb2.ToString());
            }
            L6.Add("originPileCount", res.originPileCount);
            int shown = 0; foreach (var ri in a) { if (shown++ >= 400) break; res.originPts.Add(ri.b.center); }
            foreach (var kv in bList) { if (res.originPts.Count > 800) break; res.originPts.Add(kv.Value.t.position); }
            L6.Add("originRadius", R);
            L6.Add("a_boundsNearOrigin", a.Count); L6.Add("b_childAtOriginParentFar", bList.Count); L6.Add("b_distinctParents", bParents.Count); L6.Add("b_localNegatesParent", negPattern);
            L6.Add("c_groupBoundsMismatch", cList.Count); L6.Add("c_pivotAtOriginInfo", pivotAtOrigin);
            L6.count = a.Count + bList.Count + cList.Count;
            L6.pass = bList.Count == 0 && cList.Count == 0 && a.Count < p.originMaxCount;
            return L6;
        }

        // ------------------------------------------------------------------ L7 (판정 아님, WARN)
        static CheckResult CheckRenderState(MapLintResult res, MapLintProfile p, string scenePath, int terrainAbove)
        {
            var L7 = new CheckResult("L7", "렌더 상태(경고만)");
            string cs = PlayerSettings.colorSpace.ToString(); L7.Add("colorSpace", cs);
            if (!string.IsNullOrEmpty(p.expectedColorSpace) && cs != p.expectedColorSpace) L7.warns.Add("색공간 " + cs + " (기준 " + p.expectedColorSpace + ")");
            var rp = GraphicsSettings.currentRenderPipeline; int perObj = p.maxAdditionalLights;
            L7.Add("urpAsset", rp != null ? rp.name : "(none)");
            if (rp == null) L7.warns.Add("현재 렌더 파이프라인 에셋 없음(Built-in)");
            else
            {
                var so = new SerializedObject(rp);
                var lim = so.FindProperty("m_AdditionalLightsPerObjectLimit"); if (lim != null) perObj = lim.intValue;
                var list = so.FindProperty("m_RendererDataList"); int withPost = 0, rendererCount = 0;
                if (list != null) for (int i = 0; i < list.arraySize; i++)
                    {
                        var rd = list.GetArrayElementAtIndex(i).objectReferenceValue; if (rd == null) continue; rendererCount++;
                        var rso = new SerializedObject(rd); var pd = rso.FindProperty("postProcessData"); if (pd != null && pd.objectReferenceValue != null) withPost++;
                    }
                L7.Add("rendererDataCount", rendererCount); L7.Add("rendererDataWithPostProcessData", withPost);
                if (p.expectPostProcessing && rendererCount > 0 && withPost == 0) L7.warns.Add("URP 렌더러에 postProcessData 없음(포스트 프로세싱 꺼짐 의심)");
            }
            L7.Add("additionalLightsPerObjectLimit", perObj);
            // Volume postExposure
            var vols = UnityEngine.Object.FindObjectsByType<Volume>(FindObjectsInactive.Exclude); var sb = new System.Text.StringBuilder("["); int vi = 0;
            foreach (var v in vols)
            {
                var prof = v.sharedProfile; ColorAdjustments ca = null; bool has = prof != null && prof.TryGet(out ca);
                float pe = has ? ca.postExposure.value : float.NaN;
                if (vi++ > 0) sb.Append(','); sb.Append("{\"name\":").Append(Jw.S(v.name)).Append(",\"profile\":").Append(Jw.S(prof != null ? prof.name : "")).Append(",\"postExposure\":").Append(Jw.F(pe)).Append('}');
                if (has && Mathf.Abs(pe - p.expectedPostExposure) > 0.001f) L7.warns.Add("Volume '" + v.name + "' postExposure " + pe.ToString("0.00") + " (기준 " + p.expectedPostExposure.ToString("0.00") + ")");
                if (prof == null) L7.warns.Add("Volume '" + v.name + "' 프로필 없음");
            }
            sb.Append(']'); L7.AddRaw("volumes", sb.ToString());
            if (vols.Length == 0) L7.warns.Add("씬에 Volume 없음");
            // 씬 파일 크기
            double mb = 0; if (!string.IsNullOrEmpty(scenePath) && File.Exists(AbsPath(scenePath))) mb = new FileInfo(AbsPath(scenePath)).Length / 1048576.0;
            L7.Add("sceneFileMB", (float)mb); if (mb > p.sceneWarnMB) L7.warns.Add("씬 파일 " + mb.ToString("0.0") + "MB (> " + p.sceneWarnMB.ToString("0") + "MB)");
            // 지형에 영향을 주는 실시간 광원 수
            int rt = 0, near = 0; var terrBounds = new List<Bounds>();
            foreach (var tr in Terrain.activeTerrains) { var td = tr.terrainData; if (td != null) terrBounds.Add(new Bounds(tr.transform.position + td.size * 0.5f, td.size)); }
            foreach (var l in UnityEngine.Object.FindObjectsByType<Light>(FindObjectsInactive.Exclude))
            {
                if (!l.enabled || l.type == LightType.Directional || l.lightmapBakeType == LightmapBakeType.Baked) continue; rt++;
                foreach (var tb in terrBounds) if (tb.SqrDistance(l.transform.position) <= l.range * l.range) { near++; break; }
            }
            // 카메라 근처 광원만 켜는 컬러(이름에 LightCull/LightStream 포함, 또는 Light 를 참조하는 MonoBehaviour)
            var cull = new System.Text.StringBuilder("["); int cn = 0;
            foreach (var mono in UnityEngine.Object.FindObjectsByType<MonoBehaviour>(FindObjectsInactive.Exclude))
            {
                if (mono == null) continue; var ty = mono.GetType(); string tn = ty.Name; string ns = ty.Namespace ?? "";
                if (ns.StartsWith("UnityEngine") || ns.StartsWith("Unity.") || ns.StartsWith("Cinemachine") || ns.StartsWith("UnityEditor")) continue;
                bool hit = tn.Contains("LightCull") || tn.Contains("LightStream");
                if (!hit) { var so2 = new SerializedObject(mono); var it = so2.GetIterator(); bool en = true; while (it.Next(en)) { en = true; if (it.propertyType == SerializedPropertyType.ObjectReference && it.objectReferenceValue is Light) { hit = true; break; } } }
                if (!hit) continue; if (cn++ > 0) cull.Append(','); cull.Append("{\"type\":").Append(Jw.S(tn)).Append(",\"path\":").Append(Jw.S(PathOf(mono.transform))).Append('}');
            }
            cull.Append(']'); L7.AddRaw("lightCullers", cull.ToString()); L7.Add("lightCullerPresent", cn > 0);
            L7.Add("realtimeAdditionalLights", rt); L7.Add("lightsReachingTerrain", near);
            if (near > perObj) L7.warns.Add("지형에 닿는 실시간 추가광 " + near + "개 > URP 오브젝트당 한도 " + perObj + (cn > 0 ? " (광원 컬러 있음: " + cn + "개)" : " (광원 컬러 없음)"));
            L7.count = L7.warns.Count; L7.pass = true;   // 판정하지 않는다
            return L7;
        }
    }
}
