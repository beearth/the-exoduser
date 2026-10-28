using System;
using System.Collections.Generic;
using UnityEngine;

// DT-03 LookDev 샷 프리셋 (ScriptableObject). 컷 하나 = 에셋 하나. 기본 프리셋은 LookDevPresets 가 만든다.
namespace Exoduser.DevTools.LookDev
{
    public enum LookDevCameraMode
    {
        GameLook001,   // 게임 카메라: 피치 0.85rad(48.70도), 거리 14u, 오프셋 (0,10.52,-9.24), 세로 FOV = 2*atan(H/2800)  (H=900 → 35.65도, 1080 → 42.17도)
        TopOrtho,      // 위에서 수직 정사영 (orthoCenterXZ, orthoHeight, orthoSize)
        ExplicitPose,  // position / euler / fov(또는 정사영) 직접 지정
        TargetOrbit3,  // 대상 기준 3방향(front / side / back) 공전 카메라 — 캐릭터·소품 확인용 (DT-09 확장 기반)
    }

    public enum LookDevGround
    {
        RuntimeZero,     // 런타임 코어와 같은 y = 0
        TerrainSurface,  // 지형 위 높이: Terrain.SampleHeight + terrain.transform.position.y (발 묻힘 판정용)
    }

    /// <summary>구역별 이름 붙은 지점 (월드 xz, 단위 u). RM1 은 월드 x = 타일*0.4, z = -타일*0.4.</summary>
    [Serializable] public class LookDevNamedPoint { public string name; public float x, z; }

    /// <summary>패치: 원점 = ((int)(W*fx), (int)(H*fy)), 크기 w x h 픽셀. measure_L.py 의 patches 와 같은 정의.</summary>
    [Serializable] public class LookDevPatchDef { public string name; public double fx, fy; public int w = 120, h = 90; }

    /// <summary>프리셋에 적은 기준값. 측정값과의 차이(delta)를 json 에 넣고, tolerance 를 넘으면 BASELINE 경고.</summary>
    [Serializable] public class LookDevBaseline { public string metric; public float value; public float tolerance = 1f; public string note; }


    [CreateAssetMenu(menuName = "Exoduser/DevTools/LookDev Shot", fileName = "LookDevShot")]
    public class LookDevShot : ScriptableObject
    {
        [Header("기본")]
        public string shotName = "shot";
        public string scenePath = "";
        public Vector2Int resolution = new Vector2Int(1600, 900);
        [Tooltip("RenderTexture.antiAliasing (1, 2, 4, 8). RM0-LIGHT-L 샌드박스 캡처는 1")]
        public int msaa = 1;
        [Tooltip("실제 캡처 전에 버리는 렌더 횟수 (0 = 기존 캡처와 같음)")]
        public int warmupRenders = 0;

        [Header("카메라")]
        public LookDevCameraMode cameraMode = LookDevCameraMode.GameLook001;
        [Tooltip("카메라가 따라가는 지점의 높이. 게임 카메라는 보통 TerrainSurface")]
        public LookDevGround cameraGround = LookDevGround.TerrainSurface;
        public float nearClip = 0f, farClip = 0f;  // 0 = 씬 카메라 값 유지

        [Header("대상 (우선순위: 씬 오브젝트 이름 > 이름 붙은 지점 > targetPos)")]
        public string targetObject = "";
        public string targetPoint = "";
        public List<LookDevNamedPoint> points = new List<LookDevNamedPoint>();
        public Vector3 targetPos = Vector3.zero;

        [Header("캡슐 (플레이어 크기 대역: 높이 1.6u, 지름 0.5u)")]
        public bool capsule = false;
        public LookDevGround capsuleGround = LookDevGround.RuntimeZero;

        [Header("GameLook001")]
        public float pitchRad = 0.85f;
        public float distanceU = 14f;
        public float viewDistancePx = 1400f;

        [Header("TopOrtho")]
        public Vector2 orthoCenterXZ = Vector2.zero;
        public float orthoHeight = 60f;
        public float orthoSize = 5.4f;

        [Header("ExplicitPose")]
        public Vector3 position = new Vector3(0, 10, -10);
        public Vector3 euler = new Vector3(45, 0, 0);
        public bool explicitOrthographic = false;
        public float explicitFov = 35.65f;
        public float explicitOrthoSize = 5.4f;

        [Header("TargetOrbit3")]
        public float orbitDistance = 6f;
        public float orbitPitchDeg = 15f;
        public float orbitFov = 30f;
        public float orbitTargetHeight = 0.9f;
        public float[] orbitYawsDeg = new float[] { 0f, 90f, 180f };

        [Header("계측")]
        public List<LookDevPatchDef> patches = new List<LookDevPatchDef>();
        [Tooltip("화면 중앙값(luma255)이 이 값보다 작으면 DARK 경고")]
        public float darkMedianThreshold = 12f;
        public List<LookDevBaseline> baselines = new List<LookDevBaseline>();

        [Header("기준 이미지 (웹 캡처 등, 선택)")]
        public string referenceImage = "";
        public LookDevCrop cropA = new LookDevCrop(560, 300, 480, 270);
        public LookDevCrop cropB = new LookDevCrop(120, 520, 480, 270);

        [Header("기대 렌더 상태 (다르면 STATE 경고)")]
        public string expectColorSpace = "Linear";      // "" 이면 검사 안 함
        public bool expectCameraPostProcessing = true;
        public bool expectRendererPostProcessData = true;
        public bool checkPostExposure = false;
        public float expectPostExposure = 0f;
        public string expectTonemapping = "";           // "ACES" / "Neutral" / "None", "" 이면 검사 안 함

        public bool TryGetPoint(string pointName, out Vector2 xz)
        {
            xz = Vector2.zero; if (points == null || string.IsNullOrEmpty(pointName)) return false;
            foreach (var p in points) if (p != null && string.Equals(p.name, pointName, StringComparison.OrdinalIgnoreCase)) { xz = new Vector2(p.x, p.z); return true; }
            return false;
        }
    }
}
