using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using UnityEditor;
using UnityEngine;

// DT-03 LookDev 창. 메뉴: Exoduser/DevTools/LookDev
// 프리셋을 고르고 [미리보기]로 게임 카메라를 렌더(RenderTexture)해 실시간 지표와 렌더 상태 배지(Linear / PP / postExposure / DARK)를 본다.
// [캡처 저장]은 batch 와 같은 경로(LookDevCapture.CaptureShot)로 PNG+json(+비교판)을 쓴다. 씬은 저장하지 않는다.
namespace Exoduser.DevTools.LookDev
{
    public sealed class LookDevWindow : EditorWindow
    {
        LookDevShot shot;
        bool useOverride; float overridePostExposure = 1.85f;
        bool showReference; bool live; double nextLive;
        string outDir = "I:/EXODUSER-Storage/devtools/dt03/window";
        Texture2D unityTex, refTex; LookDevResult last; string status = "";
        Vector2 scroll;

        [MenuItem("Exoduser/DevTools/LookDev")]
        public static void Open() { var w = GetWindow<LookDevWindow>("LookDev"); w.minSize = new Vector2(520, 560); w.Show(); }

        void OnEnable() { EditorApplication.update += Tick; }
        void OnDisable() { EditorApplication.update -= Tick; if (unityTex) DestroyImmediate(unityTex); if (refTex) DestroyImmediate(refTex); }

        void Tick()
        {
            if (!live || shot == null || EditorApplication.timeSinceStartup < nextLive || EditorApplication.isCompiling) return;
            nextLive = EditorApplication.timeSinceStartup + 1.0; Preview(); Repaint();
        }

        LookDevOverrides CurrentOverrides()
        {
            var o = new LookDevOverrides(); if (useOverride) o.PostExposure = overridePostExposure; return o;
        }

        void Preview()
        {
            try
            {
                var rs = LookDevCapture.CaptureShot(shot, CurrentOverrides(), null, null, false);
                if (rs.Count == 0) return; last = rs[0];
                if (unityTex) DestroyImmediate(unityTex);
                unityTex = new Texture2D(last.Raw.Width, last.Raw.Height, TextureFormat.RGB24, false) { hideFlags = HideFlags.HideAndDontSave };
                var px = new Color32[last.Raw.Width * last.Raw.Height];
                for (int y = 0; y < last.Raw.Height; y++) for (int x = 0; x < last.Raw.Width; x++) { int o = (y * last.Raw.Width + x) * 3; px[(last.Raw.Height - 1 - y) * last.Raw.Width + x] = new Color32(last.Raw.Rgb[o], last.Raw.Rgb[o + 1], last.Raw.Rgb[o + 2], 255); }
                unityTex.SetPixels32(px); unityTex.Apply();
                status = "미리보기 " + DateTime.Now.ToString("HH:mm:ss");
            }
            catch (Exception e) { status = "오류: " + e.Message; Debug.LogException(e); }
        }

        void LoadReference()
        {
            if (refTex) { DestroyImmediate(refTex); refTex = null; }
            if (shot == null || string.IsNullOrEmpty(shot.referenceImage) || !File.Exists(shot.referenceImage)) return;
            refTex = new Texture2D(2, 2, TextureFormat.RGB24, false) { hideFlags = HideFlags.HideAndDontSave };
            refTex.LoadImage(File.ReadAllBytes(shot.referenceImage));
        }

        static void Badge(string text, Color c)
        {
            var st = new GUIStyle(EditorStyles.miniButton) { fontStyle = FontStyle.Bold, normal = { textColor = Color.white } };
            var prev = GUI.backgroundColor; GUI.backgroundColor = c; GUILayout.Label(text, st, GUILayout.Height(20)); GUI.backgroundColor = prev;
        }

        void OnGUI()
        {
            scroll = EditorGUILayout.BeginScrollView(scroll);
            EditorGUI.BeginChangeCheck();
            shot = (LookDevShot)EditorGUILayout.ObjectField("프리셋 (LookDevShot)", shot, typeof(LookDevShot), false);
            if (EditorGUI.EndChangeCheck()) { LoadReference(); last = null; }
            if (shot == null)
            {
                EditorGUILayout.HelpBox("프리셋 에셋을 고르세요. 없으면 아래 버튼으로 기본 프리셋(RM_Sandbox / RM1_Start / RM1_Top / RM1_Capsule3Way)을 만듭니다.", MessageType.Info);
                if (GUILayout.Button("기본 프리셋 만들기")) { LookDevPresets.EnsureAssets(); shot = AssetDatabase.LoadAssetAtPath<LookDevShot>(LookDevPresets.Dir + "/RM_Sandbox.asset"); LoadReference(); }
                EditorGUILayout.EndScrollView(); return;
            }
            EditorGUILayout.LabelField("씬", shot.scenePath);
            EditorGUILayout.BeginHorizontal();
            useOverride = EditorGUILayout.ToggleLeft("postExposure 덮어쓰기(메모리만)", useOverride, GUILayout.Width(230));
            using (new EditorGUI.DisabledScope(!useOverride)) overridePostExposure = EditorGUILayout.FloatField(overridePostExposure, GUILayout.Width(60));
            EditorGUILayout.EndHorizontal();
            outDir = EditorGUILayout.TextField("저장 폴더", outDir);
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("미리보기", GUILayout.Height(26))) Preview();
            if (GUILayout.Button("캡처 저장", GUILayout.Height(26)))
            {
                try
                {
                    var rs = LookDevCapture.CaptureShot(shot, CurrentOverrides(), outDir, null, true);
                    status = "저장: " + (rs.Count > 0 ? rs[0].PngPath : "-"); if (rs.Count > 0) last = rs[0];
                }
                catch (Exception e) { status = "오류: " + e.Message; Debug.LogException(e); }
            }
            live = GUILayout.Toggle(live, "실시간(1초)", "Button", GUILayout.Width(90), GUILayout.Height(26));
            showReference = GUILayout.Toggle(showReference, "기준 나란히", "Button", GUILayout.Width(90), GUILayout.Height(26));
            EditorGUILayout.EndHorizontal();
            if (!string.IsNullOrEmpty(status)) EditorGUILayout.LabelField(status, EditorStyles.miniLabel);

            if (last != null && last.State != null)
            {
                var s = last.State; EditorGUILayout.Space(4); EditorGUILayout.BeginHorizontal();
                bool lin = s.ColorSpace == "Linear";
                Badge(s.ColorSpace.ToUpperInvariant(), lin ? new Color(.2f, .5f, .3f) : new Color(.7f, .2f, .15f));
                Badge(s.CameraPostProcessing ? "PP ON" : "PP OFF", s.CameraPostProcessing ? new Color(.2f, .5f, .3f) : new Color(.7f, .2f, .15f));
                Badge("PP DATA " + s.RendererHasPostProcessData, s.RendererHasPostProcessData == "true" ? new Color(.2f, .5f, .3f) : new Color(.7f, .2f, .15f));
                Badge("EXPOSURE " + (double.IsNaN(s.PostExposure) ? "-" : s.PostExposure.ToString("0.##", CultureInfo.InvariantCulture)) + " (" + s.PostExposureSource + ")",
                    (!shot.checkPostExposure || Math.Abs(s.PostExposure - shot.expectPostExposure) < 0.001) ? new Color(.2f, .5f, .3f) : new Color(.8f, .5f, .1f));
                Badge("TONE " + s.Tonemapping, new Color(.3f, .3f, .35f));
                if (last.Dark) Badge("DARK", new Color(.8f, .1f, .1f));
                EditorGUILayout.EndHorizontal();

                double med; last.Metrics.TryGetValue("screen_median", out med); double fl; last.Metrics.TryGetValue("sandbox_floor_luma_median", out fl);
                EditorGUILayout.LabelField("화면 중앙값(luma255)", med.ToString("0.00", CultureInfo.InvariantCulture) + (last.Dark ? "   < " + shot.darkMedianThreshold + " (DARK)" : ""));
                if (last.Metrics.ContainsKey("sandbox_floor_luma_median")) EditorGUILayout.LabelField("패치 luma 중앙값", fl.ToString("0.00", CultureInfo.InvariantCulture));
                for (int i = 0; i < shot.patches.Count; i++)
                {
                    double rg, pl; last.Metrics.TryGetValue("sandbox_floor_RG[" + i + "]", out rg); last.Metrics.TryGetValue("sandbox_floor_luma[" + i + "]", out pl);
                    EditorGUILayout.LabelField("  패치 " + shot.patches[i].name, "luma " + pl.ToString("0.0", CultureInfo.InvariantCulture) + "   R/G " + rg.ToString("0.000", CultureInfo.InvariantCulture));
                }
                foreach (var b in shot.baselines)
                {
                    double v; if (!last.Metrics.TryGetValue(b.metric, out v)) continue; double d = v - b.value;
                    EditorGUILayout.LabelField("  기준 " + b.metric, v.ToString("0.00", CultureInfo.InvariantCulture) + " / " + b.value.ToString("0.00", CultureInfo.InvariantCulture) + "  (차 " + d.ToString("+0.00;-0.00", CultureInfo.InvariantCulture) + (Math.Abs(d) > b.tolerance ? "  !" : "") + ")");
                }
                foreach (var w in last.Warn) EditorGUILayout.HelpBox(w, w.StartsWith("DARK") ? MessageType.Error : MessageType.Warning);
                EditorGUILayout.LabelField("HEAD " + s.HeadSha, EditorStyles.miniLabel);
            }

            if (unityTex != null)
            {
                float avail = position.width - 24; int cols = showReference && refTex != null ? 2 : 1; float w1 = avail / cols; float h1 = w1 * unityTex.height / unityTex.width;
                var r = GUILayoutUtility.GetRect(avail, h1);
                if (cols == 2)
                {
                    GUI.DrawTexture(new Rect(r.x, r.y, w1 - 2, h1), refTex, ScaleMode.ScaleToFit);
                    GUI.DrawTexture(new Rect(r.x + w1 + 2, r.y, w1 - 2, h1), unityTex, ScaleMode.ScaleToFit);
                }
                else GUI.DrawTexture(r, unityTex, ScaleMode.ScaleToFit);
            }
            EditorGUILayout.EndScrollView();
        }
    }
}
