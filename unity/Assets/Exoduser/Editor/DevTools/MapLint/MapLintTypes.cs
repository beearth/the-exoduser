using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using UnityEngine;

// DT-02 MapLint: 설정 프로필과 결과 자료형. 씬의 실제 오브젝트를 읽는 검사이며 빌더 내부 데이터는 쓰지 않는다.
namespace Exoduser.DevTools.MapLint
{
    /// <summary>검사 설정. Profiles/*.maplint.json 으로 저장한다(JsonUtility). 배열이 비어 있으면 기본값.</summary>
    [Serializable]
    public class MapLintProfile
    {
        public string name = "default";
        public string defaultGrid = "";          // 창에서 쓰는 기본 걷기 격자 json(Assets/...)
        public string gridKey = "rows";          // 걷기 격자 json 안의 문자열 배열 필드 이름(RM-3 "rows", RM-1 덤프 "walk")
        public string walkChar = "0";            // 걷기 칸을 뜻하는 글자
        public int gridW = 200, gridH = 200;
        public float tileSize = 0.4f;            // 1타일 = 0.4u. 타일 (tx,ty) 중심 = ((tx+.5)*T, -(ty+.5)*T)
        public float heightTolerance = 0.04f;    // 걷기 면 위로 이 값을 넘으면 덮임
        public float walkPlaneY = 0f;            // 걷기 면 월드 y
        public float agentHeight = 1.6f;         // 이 높이 안의 덮임은 길을 막는 것으로 따로 센다(centreBelowAgentHeight)
        public float overheadMinH = 2.5f;        // 걷기 칸 위 메시의 가장 낮은 점이 이 높이 이상이면 L1 에서 빼고 L1b(머리 위 덮개)로 센다
        public float capsuleCentreY = 1f;        // L1b 선의 시작점: 걷기 면 + 이 높이
        public float camOffsetY = 10.52f, camOffsetZ = -9.24f;   // 카메라 LOOK-001 오프셋(피치 48.70도, 거리 14u): 카메라 위치 = 캡슐 + 오프셋
        public float deepTiles = 0.5f;           // 덮임 "깊이" 기준(칸). 중심에서 이 거리 둘레 8점까지 모두 덮이면 deep
        public float visTiles = 0.6f;            // 섬 타일이 보인다고 인정하는 반경(칸)
        public string worldRoot = "World";       // 이 이름의 루트 아래만 맵으로 본다(비우면 전부)
        public string[] ignoreNames = new string[0];       // 이 이름을 조상으로 가진 것은 맵 검사에서 제외
        public string[] coverIgnoreNames = new string[] { "Decals" };   // 막힌 섬 덮임(L3) 계산에서 제외(바닥 데칼)
        public string[] colliderIgnoreNames = new string[] { "NavWalkMesh" };
        public string heroLayerName = "Hero";    // 레이어 이름(없으면 무시). 렌더링 레이어는 Default 이외 전부 Hero 취급
        public uint defaultRenderingLayerMask = 1;
        public int[] window = new int[0];        // 검사 창 [x0,y0,x1,y1) 타일. 비면 격자 전체
        public float navSampleDist = 0.2f;       // NavMesh.SamplePosition 반경(u)
        public float navHorizTol = 0.08f;        // 샘플 위치가 칸 중심에서 이만큼(수평) 안이어야 NavMesh가 있다고 본다
        public int islandMaxTiles = 0;           // 0=제한 없음. RM-1은 100
        public float wedgeBase = 0.9f, wedgeMinH = 0.9f, pitchRad = 0.85f;
        public float wedgeSlope = 0f;            // 0이면 tan(pitchRad)=1.14
        public float wedgeXMargin = 0.8f;        // 덩어리 좌우로 이만큼 넓혀 북쪽 걷기 칸을 찾는다
        public float groupMaxExtent = 2.5f;      // 부모 단위 묶음의 XZ 크기가 이를 넘으면 렌더러 단위로 쪼갠다
        public float tallReportH = 2.0f;
        public float originRadius = 1.0f;
        public int originMaxCount = 3;
        public string expectedColorSpace = "Linear";
        public float expectedPostExposure = -0.15f;
        public bool expectPostProcessing = true;
        public float sceneWarnMB = 50f;
        public int maxAdditionalLights = 8;
        public int shotMaxW = 3200, shotMaxH = 2160;

        public float Slope { get { return wedgeSlope > 0f ? wedgeSlope : Mathf.Tan(pitchRad); } }
        public void Window(out int x0, out int y0, out int x1, out int y1)
        {
            if (window != null && window.Length == 4) { x0 = Mathf.Max(0, window[0]); y0 = Mathf.Max(0, window[1]); x1 = Mathf.Min(gridW, window[2]); y1 = Mathf.Min(gridH, window[3]); }
            else { x0 = 0; y0 = 0; x1 = gridW; y1 = gridH; }
        }
        public bool FullWindow { get { return window == null || window.Length != 4 || (window[0] <= 0 && window[1] <= 0 && window[2] >= gridW && window[3] >= gridH); } }
    }

    /// <summary>위반 한 건. t(오브젝트)나 pos(월드 위치)로 에디터에서 찾아갈 수 있다.</summary>
    public class LintItem
    {
        public Transform t;
        public string path = "";
        public Vector3 pos;
        public string note = "";
        public float v1, v2, v3, v4;
        public int tx = -1, ty = -1;
        public Bounds bounds;
        public bool hasBounds;
    }

    public class CheckResult
    {
        public string id, title;
        public bool pass = true;
        public int count;
        public List<LintItem> items = new List<LintItem>();
        public List<KeyValuePair<string, string>> extra = new List<KeyValuePair<string, string>>();   // 값은 원시 JSON
        public List<string> warns = new List<string>();
        public CheckResult(string id, string title) { this.id = id; this.title = title; }
        public void Add(string key, int v) { extra.Add(new KeyValuePair<string, string>(key, v.ToString(CultureInfo.InvariantCulture))); }
        public void Add(string key, float v) { extra.Add(new KeyValuePair<string, string>(key, Jw.F(v))); }
        public void Add(string key, bool v) { extra.Add(new KeyValuePair<string, string>(key, v ? "true" : "false")); }
        public void Add(string key, string v) { extra.Add(new KeyValuePair<string, string>(key, Jw.S(v))); }
        public void AddRaw(string key, string raw) { extra.Add(new KeyValuePair<string, string>(key, raw)); }
    }

    public struct WedgeRec { public string path; public Transform t; public Bounds b; public float h, terrainH, objH, D, limit; public bool pass; public int members; }

    /// <summary>한 번의 검사 결과와 기즈모/스크린샷용 좌표.</summary>
    public class MapLintResult
    {
        public string scene = "", gridFile = "", headSha = "";
        public long durMs;
        public MapLintProfile profile;
        public List<CheckResult> checks = new List<CheckResult>();
        public List<string> hierarchyDump = new List<string>();
        // 화면 표시용
        public List<Vector2Int> coveredCentre = new List<Vector2Int>(), coveredDeep = new List<Vector2Int>();
        public List<Vector2Int> navCoreOnly = new List<Vector2Int>(), navNavOnly = new List<Vector2Int>();
        public List<WedgeRec> wedges = new List<WedgeRec>();
        public List<Vector3> originPts = new List<Vector3>();
        public List<Vector3> invisPts = new List<Vector3>();
        public List<Vector2Int> uncoveredIslandTiles = new List<Vector2Int>();
        public List<Vector2Int> overheadTiles = new List<Vector2Int>(), overheadViolations = new List<Vector2Int>();
        public int originPileCount;                                   // 월드 원점에 쌓인 렌더러 수(L6)
        public List<Vector3> intendedPts = new List<Vector3>();       // 쌓인 자식들의 부모(의도 위치) 월드 좌표
        public CheckResult Get(string id) { foreach (var c in checks) if (c.id == id) return c; return null; }

        public string ToJson()
        {
            var sb = new StringBuilder(1 << 16);
            sb.Append("{\"scene\":").Append(Jw.S(scene)).Append(",\"gridFile\":").Append(Jw.S(gridFile)).Append(",\"headSha\":").Append(Jw.S(headSha)).Append(",\"durMs\":").Append(durMs);
            sb.Append(",\"profile\":").Append(Jw.S(profile != null ? profile.name : ""));
            sb.Append(",\"checks\":{");
            for (int i = 0; i < checks.Count; i++)
            {
                var c = checks[i]; if (i > 0) sb.Append(',');
                sb.Append(Jw.S(c.id)).Append(":{\"title\":").Append(Jw.S(c.title)).Append(",\"pass\":").Append(c.pass ? "true" : "false").Append(",\"count\":").Append(c.count);
                foreach (var kv in c.extra) sb.Append(',').Append(Jw.S(kv.Key)).Append(':').Append(kv.Value);
                if (c.warns.Count > 0) { sb.Append(",\"warns\":["); for (int k = 0; k < c.warns.Count; k++) { if (k > 0) sb.Append(','); sb.Append(Jw.S(c.warns[k])); } sb.Append(']'); }
                sb.Append(",\"items\":[");
                for (int k = 0; k < c.items.Count; k++)
                {
                    var it = c.items[k]; if (k > 0) sb.Append(',');
                    sb.Append("{\"path\":").Append(Jw.S(it.path)).Append(",\"pos\":[").Append(Jw.F(it.pos.x)).Append(',').Append(Jw.F(it.pos.y)).Append(',').Append(Jw.F(it.pos.z)).Append(']');
                    if (it.tx >= 0) sb.Append(",\"tile\":[").Append(it.tx).Append(',').Append(it.ty).Append(']');
                    if (it.note.Length > 0) sb.Append(",\"note\":").Append(Jw.S(it.note));
                    sb.Append(",\"v\":[").Append(Jw.F(it.v1)).Append(',').Append(Jw.F(it.v2)).Append(',').Append(Jw.F(it.v3)).Append(',').Append(Jw.F(it.v4)).Append("]}");
                }
                sb.Append("]}");
            }
            sb.Append("},\"hierarchy\":[");
            for (int i = 0; i < hierarchyDump.Count; i++) { if (i > 0) sb.Append(','); sb.Append(Jw.S(hierarchyDump[i])); }
            sb.Append("]}");
            return sb.ToString();
        }
    }

    /// <summary>작은 JSON 문자열 도우미.</summary>
    public static class Jw
    {
        public static string F(float v) { if (float.IsNaN(v) || float.IsInfinity(v)) return "null"; return v.ToString("0.###", CultureInfo.InvariantCulture); }
        public static string S(string s)
        {
            if (s == null) return "null";
            var sb = new StringBuilder(s.Length + 2); sb.Append('"');
            foreach (char ch in s)
            {
                switch (ch)
                {
                    case '"': sb.Append("\\\""); break;
                    case '\\': sb.Append("\\\\"); break;
                    case '\n': sb.Append("\\n"); break;
                    case '\r': break;
                    case '\t': sb.Append(' '); break;
                    default: if (ch < 32) sb.Append(' '); else sb.Append(ch); break;
                }
            }
            sb.Append('"'); return sb.ToString();
        }
    }
}
