using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

// DT-03 기본 프리셋. 에셋(Presets/*.asset)은 없을 때만 만든다(이미 있으면 덮어쓰지 않는다 = 사람이 고친 값 보존).
// 값 출처:
//   RM_Sandbox  — Rm0EngineSetup.Capture 와 같은 카메라(탑다운 정사영 5.4, 카메라 y=11 = 배우 y 1 + FollowOffset 10), 패치는 measure_L.py 의 3패치(0.70/0.72, 0.12/0.10, 0.72/0.12, 120x90),
//                 기준값은 docs/engine/UNITY_RM0_ENGINE_20261027.md RM0-LIGHT-L 표의 postExposure 1.85 행 (origin/claude/unity-rm0-engine-20261027).
//   RM1_Start   — Rm1SliceBuilder.Capture 의 start 컷 자세: 타일 (100,185) → 월드 (40,-74), 피치 0.85rad, 거리 14u, 세로 FOV 2*atan(H/2800). 캡슐 y=0(런타임 높이).
//   RM1_Top     — Rm1SliceBuilder.CaptureTop 과 같은 자세: 중심 (40,-66), 높이 60, 정사영 세로 반 10.8 (슬라이스 창 x60~140 y138~192 타일).
namespace Exoduser.DevTools.LookDev
{
    public static class LookDevPresets
    {
        public const string Dir = "Assets/Exoduser/Editor/DevTools/LookDev/Presets";
        const string SandboxRef = "E:/exoduser-wt/_out/rm0-light/sandbox_B.png";   // Gamma B안 기준 캡처 (1600x900)

        static List<LookDevPatchDef> SandboxPatches()
        {
            return new List<LookDevPatchDef>
            {
                new LookDevPatchDef { name = "right_bottom", fx = .70, fy = .72, w = 120, h = 90 },
                new LookDevPatchDef { name = "left_top", fx = .12, fy = .10, w = 120, h = 90 },
                new LookDevPatchDef { name = "right_top", fx = .72, fy = .12, w = 120, h = 90 },
            };
        }

        static List<LookDevPatchDef> GenericPatches()
        {
            return new List<LookDevPatchDef>
            {
                new LookDevPatchDef { name = "center", fx = .45, fy = .45, w = 120, h = 90 },
                new LookDevPatchDef { name = "bottom_left", fx = .10, fy = .75, w = 120, h = 90 },
                new LookDevPatchDef { name = "top_right", fx = .75, fy = .10, w = 120, h = 90 },
            };
        }

        static List<LookDevNamedPoint> Rm1Points()
        {
            // 월드 = (타일*0.4, -타일*0.4). heart / gate / ridge 등 구역 지점은 맵 총괄이 좌표를 주면 여기 또는 에셋에 한 줄 추가.
            return new List<LookDevNamedPoint>
            {
                new LookDevNamedPoint { name = "start", x = 100f * 0.4f, z = -185f * 0.4f },
                new LookDevNamedPoint { name = "r2", x = 112f * 0.4f, z = -152f * 0.4f },
            };
        }

        public static List<LookDevShot> Build()
        {
            var list = new List<LookDevShot>();

            var sb = ScriptableObject.CreateInstance<LookDevShot>();
            sb.name = "RM_Sandbox"; sb.shotName = "RM_Sandbox"; sb.scenePath = "Assets/Exoduser/Scenes/RM_Sandbox.unity";
            sb.cameraMode = LookDevCameraMode.TopOrtho; sb.orthoCenterXZ = Vector2.zero; sb.orthoHeight = 11f; sb.orthoSize = 5.4f; sb.nearClip = 0.3f; sb.farClip = 100f;
            sb.resolution = new Vector2Int(1600, 900); sb.msaa = 1; sb.patches = SandboxPatches(); sb.darkMedianThreshold = 12f;
            sb.expectColorSpace = "Linear"; sb.expectCameraPostProcessing = true; sb.expectRendererPostProcessData = true; sb.checkPostExposure = true; sb.expectPostExposure = 1.85f; sb.expectTonemapping = "ACES";
            sb.baselines = new List<LookDevBaseline>
            {
                new LookDevBaseline { metric = "screen_median", value = 25.8f, tolerance = 1f, note = "RM0-LIGHT-L 표 postExposure 1.85: 화면 중앙값 25.8" },
                new LookDevBaseline { metric = "sandbox_floor_luma_median", value = 23.8f, tolerance = 1f, note = "RM0-LIGHT-L 표: 샌드박스 바닥 23.8" },
                new LookDevBaseline { metric = "sandbox_floor_RG[0]", value = 1.60f, tolerance = 0.1f, note = "right_bottom 바닥 R/G" },
                new LookDevBaseline { metric = "sandbox_floor_RG[1]", value = 1.60f, tolerance = 0.1f, note = "left_top 바닥 R/G" },
                new LookDevBaseline { metric = "sandbox_floor_RG[2]", value = 1.57f, tolerance = 0.1f, note = "right_top 바닥 R/G" },
            };
            sb.referenceImage = SandboxRef; sb.cropA = new LookDevCrop(480, 420, 480, 270); sb.cropB = new LookDevCrop(950, 250, 480, 270);
            list.Add(sb);

            var st = ScriptableObject.CreateInstance<LookDevShot>();
            st.name = "RM1_Start"; st.shotName = "RM1_Start"; st.scenePath = "Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity";
            st.cameraMode = LookDevCameraMode.GameLook001; st.cameraGround = LookDevGround.TerrainSurface; st.points = Rm1Points(); st.targetPoint = "start";
            st.capsule = true; st.capsuleGround = LookDevGround.RuntimeZero;
            st.resolution = new Vector2Int(1600, 900); st.msaa = 4; st.patches = GenericPatches(); st.darkMedianThreshold = 12f;
            st.expectColorSpace = "Linear"; st.expectCameraPostProcessing = true; st.expectRendererPostProcessData = true; st.checkPostExposure = true; st.expectPostExposure = 1.85f;
            list.Add(st);

            var tp = ScriptableObject.CreateInstance<LookDevShot>();
            tp.name = "RM1_Top"; tp.shotName = "RM1_Top"; tp.scenePath = "Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity";
            tp.cameraMode = LookDevCameraMode.TopOrtho; tp.orthoCenterXZ = new Vector2(40f, -66f); tp.orthoHeight = 60f; tp.orthoSize = 10.8f; tp.nearClip = 0.1f; tp.farClip = 200f;
            tp.resolution = new Vector2Int(1600, 900); tp.msaa = 4; tp.patches = GenericPatches(); tp.darkMedianThreshold = 12f;
            tp.expectColorSpace = "Linear"; tp.expectCameraPostProcessing = true; tp.expectRendererPostProcessData = true; tp.checkPostExposure = true; tp.expectPostExposure = 1.85f;
            list.Add(tp);

            var orb = ScriptableObject.CreateInstance<LookDevShot>();
            orb.name = "RM1_Capsule3Way"; orb.shotName = "RM1_Capsule3Way"; orb.scenePath = "Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity";
            orb.cameraMode = LookDevCameraMode.TargetOrbit3; orb.cameraGround = LookDevGround.TerrainSurface; orb.points = Rm1Points(); orb.targetPoint = "start";
            orb.capsule = true; orb.capsuleGround = LookDevGround.TerrainSurface;
            orb.orbitDistance = 5f; orb.orbitPitchDeg = 20f; orb.orbitFov = 35f; orb.orbitTargetHeight = 0.8f;
            orb.resolution = new Vector2Int(1600, 900); orb.msaa = 4; orb.patches = GenericPatches(); orb.darkMedianThreshold = 12f;
            orb.expectColorSpace = "Linear"; orb.expectCameraPostProcessing = true; orb.expectRendererPostProcessData = true; orb.checkPostExposure = true; orb.expectPostExposure = 1.85f;
            list.Add(orb);
            return list;
        }

        /// <summary>Presets 폴더에 없는 기본 프리셋만 에셋으로 만든다 (있는 것은 덮어쓰지 않는다).</summary>
        [MenuItem("Exoduser/DevTools/LookDev Create Default Presets")]
        public static void EnsureAssets()
        {
            Directory.CreateDirectory(Dir); AssetDatabase.Refresh();
            foreach (var s in Build())
            {
                string path = Dir + "/" + s.shotName + ".asset";
                if (AssetDatabase.LoadAssetAtPath<LookDevShot>(path) == null) AssetDatabase.CreateAsset(s, path); else Object.DestroyImmediate(s);
            }
            AssetDatabase.SaveAssets();
        }
    }
}
