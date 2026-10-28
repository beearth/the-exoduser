using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

// 메뉴 Exoduser/DevTools/Map Lint. 열려 있는 씬을 검사하고, 항목을 누르면 오브젝트를 선택·SceneView 로 이동한다.
// 기즈모: L1 덮임 빨강 사각형, L2 NavMesh 차이 노랑, L4 쐐기 실패 주황 기둥(h/limit), L6 원점 쌓임 보라 표시, L3 안 보이는 섬 하늘색.
namespace Exoduser.DevTools.MapLint
{
    public class MapLintWindow : EditorWindow
    {
        const string ProfileDir = "Assets/Exoduser/Editor/DevTools/MapLint/Profiles";
        string[] profileFiles = new string[0]; int profileIdx;
        string gridPath = "";
        bool autoRecheck; double dirtyAt = -1;
        MapLintResult result; MapLintProfile profile;
        Vector2 scroll; string openCheck = "";
        bool gizmos = true;
        string status = "";

        [MenuItem("Exoduser/DevTools/Map Lint")]
        public static void Open() { var w = GetWindow<MapLintWindow>("Map Lint"); w.minSize = new Vector2(420, 360); w.RefreshProfiles(); w.Show(); }

        void OnEnable()
        {
            RefreshProfiles(); SceneView.duringSceneGui += OnScene; EditorApplication.update += Tick; EditorApplication.hierarchyChanged += MarkDirty;
            ObjectChangeEvents.changesPublished += OnChanges;
        }
        void OnDisable()
        {
            SceneView.duringSceneGui -= OnScene; EditorApplication.update -= Tick; EditorApplication.hierarchyChanged -= MarkDirty;
            ObjectChangeEvents.changesPublished -= OnChanges;
        }
        void OnChanges(ref ObjectChangeEventStream stream) { MarkDirty(); }
        void MarkDirty() { if (autoRecheck) dirtyAt = EditorApplication.timeSinceStartup; }
        void Tick()
        {
            if (!autoRecheck || dirtyAt < 0) return;
            if (EditorApplication.timeSinceStartup - dirtyAt < 1.0) return;   // 1초 디바운스
            dirtyAt = -1; RunCheck();
        }

        void RefreshProfiles()
        {
            var list = new List<string>();
            if (Directory.Exists(MapLintCore.AbsPath(ProfileDir))) foreach (var f in Directory.GetFiles(MapLintCore.AbsPath(ProfileDir), "*.maplint.json")) list.Add(Path.GetFileName(f));
            list.Sort(); profileFiles = list.ToArray(); if (profileIdx >= profileFiles.Length) profileIdx = 0;
        }

        void RunCheck()
        {
            try
            {
                var sc = UnityEditor.SceneManagement.EditorSceneManager.GetActiveScene();
                string profPath = profileFiles.Length > 0 ? ProfileDir + "/" + profileFiles[profileIdx] : null;
                profile = MapLintCore.LoadProfile(profPath, sc.path);
                string grid = string.IsNullOrEmpty(gridPath) ? profile.defaultGrid : gridPath;
                if (string.IsNullOrEmpty(grid)) { status = "걷기 격자 json 경로를 입력하세요"; return; }
                result = MapLintCore.Run(profile, grid, sc.path, null);
                status = sc.name + " 검사 " + result.durMs + " ms";
                SceneView.RepaintAll(); Repaint();
            }
            catch (Exception e) { status = "오류: " + e.Message; Debug.LogException(e); }
        }

        void OnGUI()
        {
            EditorGUILayout.BeginHorizontal();
            if (profileFiles.Length > 0) profileIdx = EditorGUILayout.Popup("프로필", profileIdx, profileFiles);
            if (GUILayout.Button("새로고침", GUILayout.Width(70))) RefreshProfiles();
            EditorGUILayout.EndHorizontal();
            gridPath = EditorGUILayout.TextField("걷기 격자 json", gridPath);
            if (string.IsNullOrEmpty(gridPath)) EditorGUILayout.HelpBox("비워 두면 프로필의 defaultGrid 를 씁니다.", MessageType.None);
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("현재 씬 검사", GUILayout.Height(26))) RunCheck();
            bool ar = GUILayout.Toggle(autoRecheck, "자동 재검사(1초)", GUILayout.Width(130)); if (ar != autoRecheck) { autoRecheck = ar; dirtyAt = -1; }
            bool gz = GUILayout.Toggle(gizmos, "기즈모", GUILayout.Width(60)); if (gz != gizmos) { gizmos = gz; SceneView.RepaintAll(); }
            EditorGUILayout.EndHorizontal();
            if (!string.IsNullOrEmpty(status)) EditorGUILayout.LabelField(status, EditorStyles.miniLabel);
            if (result == null) return;
            if (result.originPileCount > 0) EditorGUILayout.HelpBox("원점 쌓임 감지: 렌더러 " + result.originPileCount + "개가 월드 원점에 쌓여 있음(L6). 의도 위치는 보라 X 표시.", MessageType.Error);

            scroll = EditorGUILayout.BeginScrollView(scroll);
            foreach (var c in result.checks)
            {
                var old = GUI.color; GUI.color = c.id == "L7" ? (c.count > 0 ? new Color(1f, .85f, .4f) : Color.white) : (c.pass ? new Color(.6f, 1f, .65f) : new Color(1f, .5f, .45f));
                EditorGUILayout.BeginHorizontal(EditorStyles.helpBox);
                bool open = openCheck == c.id;
                if (GUILayout.Button((open ? "▼ " : "▶ ") + c.id + "  " + (c.id == "L7" ? "WARN " + c.count : (c.pass ? "PASS" : "FAIL " + c.count)) + "   " + c.title, EditorStyles.label)) openCheck = open ? "" : c.id;
                EditorGUILayout.EndHorizontal(); GUI.color = old;
                if (openCheck != c.id) continue;
                EditorGUI.indentLevel++;
                var sb = new System.Text.StringBuilder(); foreach (var kv in c.extra) sb.Append(kv.Key).Append('=').Append(kv.Value.Length > 60 ? kv.Value.Substring(0, 60) + "…" : kv.Value).Append("   ");
                if (sb.Length > 0) EditorGUILayout.LabelField(sb.ToString(), EditorStyles.wordWrappedMiniLabel);
                foreach (var w in c.warns) EditorGUILayout.HelpBox(w, MessageType.Warning);
                int shown = 0;
                foreach (var it in c.items)
                {
                    if (shown++ >= 60) { EditorGUILayout.LabelField("… " + (c.items.Count - 60) + "건 더(결과 json 참고)"); break; }
                    string label = (it.path.Length > 0 ? it.path : "(위치)") + (it.note.Length > 0 ? "   " + it.note : "");
                    if (GUILayout.Button(label, EditorStyles.miniButtonLeft)) Focus(it);
                }
                EditorGUI.indentLevel--;
            }
            EditorGUILayout.EndScrollView();
        }

        void Focus(LintItem it)
        {
            Vector3 pos = it.hasBounds ? it.bounds.center : it.pos;
            if (it.t != null) { Selection.activeTransform = it.t; EditorGUIUtility.PingObject(it.t); }
            var sv = SceneView.lastActiveSceneView;
            if (sv != null) { sv.Frame(it.hasBounds ? it.bounds : new Bounds(pos, Vector3.one * 2f), false); sv.Repaint(); }
        }

        void OnScene(SceneView sv)
        {
            if (!gizmos || result == null || profile == null) return;
            float T = profile.tileSize; float y = profile.walkPlaneY + 0.02f;
            Handles.zTest = UnityEngine.Rendering.CompareFunction.Always;
            Vector3[] quad = new Vector3[4];
            Action<Vector2Int, Color, Color> tile = (t, fill, line) =>
            {
                float x0 = t.x * T, x1 = (t.x + 1) * T, z0 = -(t.y + 1) * T, z1 = -t.y * T;
                quad[0] = new Vector3(x0, y, z0); quad[1] = new Vector3(x1, y, z0); quad[2] = new Vector3(x1, y, z1); quad[3] = new Vector3(x0, y, z1);
                Handles.DrawSolidRectangleWithOutline(quad, fill, line);
            };
            int budget = 4000;
            foreach (var t in result.coveredCentre) { if (budget-- <= 0) break; tile(t, new Color(1, .1f, .1f, .55f), new Color(1, 0, 0, 1)); }
            foreach (var t in result.navCoreOnly) { if (budget-- <= 0) break; tile(t, new Color(1, .9f, .1f, .35f), new Color(1, .9f, .1f, 1)); }
            foreach (var t in result.navNavOnly) { if (budget-- <= 0) break; tile(t, new Color(1, .9f, .1f, .35f), new Color(1, .9f, .1f, 1)); }
            foreach (var t in result.uncoveredIslandTiles) { if (budget-- <= 0) break; tile(t, new Color(.2f, .85f, 1f, .4f), new Color(.2f, .85f, 1f, 1)); }
            foreach (var w in result.wedges)
            {
                if (w.pass) continue;
                Handles.color = new Color(1f, .6f, .1f, 1f);
                var c = w.b.center; var top = new Vector3(c.x, w.b.max.y, c.z); var bot = new Vector3(c.x, profile.walkPlaneY, c.z);
                Handles.DrawLine(bot, top, 3f); Handles.DrawWireCube(w.b.center, w.b.size);
                Handles.DrawWireDisc(new Vector3(c.x, profile.walkPlaneY + w.limit, c.z), Vector3.up, Mathf.Max(0.3f, Mathf.Max(w.b.extents.x, w.b.extents.z)));
                Handles.Label(top + Vector3.up * 0.2f, "h " + w.h.ToString("0.00") + " / limit " + w.limit.ToString("0.00") + "  D " + w.D.ToString("0.0") + "  terrain " + w.terrainH.ToString("0.00"));
            }
            var purple = new Color(.78f, .35f, 1f, 1f); var bright = new Color(.92f, .63f, 1f, 1f);
            int pile = result.originPileCount; var org = new Vector3(0, y, 0);
            if (pile > 0)
            {
                // 큰 보라 원(쌓인 개수에 비례) + 화살표 + 문구, 의도 위치(부모)마다 보라 X
                float rad = 1.5f + 0.12f * Mathf.Sqrt(pile);
                Handles.color = new Color(.78f, .35f, 1f, .35f); Handles.DrawSolidDisc(org, Vector3.up, rad);
                Handles.color = purple; Handles.DrawWireDisc(org, Vector3.up, rad, 4f);
                Vector3 tail = org + new Vector3(rad * 2.6f, 0, -rad * 2.6f), head = org + new Vector3(rad * 0.75f, 0, -rad * 0.75f);
                Handles.color = bright; Handles.DrawAAPolyLine(8f, tail, head);
                Handles.DrawAAPolyLine(8f, head, head + new Vector3(rad * 0.5f, 0, 0)); Handles.DrawAAPolyLine(8f, head, head + new Vector3(0, 0, -rad * 0.5f));
                var st = new GUIStyle(EditorStyles.boldLabel) { fontSize = 20 }; st.normal.textColor = bright;
                Handles.Label(tail + new Vector3(0.3f, 0, -0.3f), "원점 쌓임 " + pile + "개", st);
                Handles.color = bright;
                foreach (var o in result.intendedPts) { if (budget-- <= 0) break; Handles.DrawLine(o + new Vector3(-.4f, y, -.4f), o + new Vector3(.4f, y, .4f), 3f); Handles.DrawLine(o + new Vector3(-.4f, y, .4f), o + new Vector3(.4f, y, -.4f), 3f); }
            }
            else
            {
                Handles.color = purple;
                foreach (var o in result.originPts) { if (budget-- <= 0) break; Handles.DrawWireDisc(o, Vector3.up, 0.25f); }
            }
            Handles.color = purple; Handles.DrawWireDisc(org, Vector3.up, profile.originRadius);
            Handles.Label(org + Vector3.up * 0.3f, "world origin");
        }
    }
}
