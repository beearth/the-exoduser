using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using Unity.Cinemachine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // RM-INT stage 1: the remodel 3D presentation of the 1-1 field behind the `--remodel3d` switch (design: docs/engine/UNITY_RM_INT_RUNTIME_HOOK_20261028.md).
    // Presentation only. The Core tick, the 2D logic camera (`view`: camera clamp, FieldEnemyCanShoot, boss zoom) and every oracle stay as they are; Off = no code of this file runs
    // (NativeRemodel3D.Active stays false, Point() is the old 2D mapping). On: the RM-1 scene (RM1_Slice, additive) draws the ground; the 2D ground chunks and props are hidden;
    // the existing sprites become billboards standing on the terrain; the scene's LOOK-001 rig (Main Camera + CinemachineBrain + CM LOOK-001, follow target "Player Marker") renders.
    // In the boss arena (`Stage.InArena`) the 3D layer steps back and the 2D arena view is shown as before (A1 / RM-3 / RM-2 / RM-4 hook in here later).
    public sealed partial class NativeGame
    {
        const string R3SceneName = "RM1_Slice";
        sealed class R3Late : MonoBehaviour { public System.Action Late; void LateUpdate() { if (Late != null) Late(); } }
        bool r3Loaded, r3Loading, r3Failed; Scene r3Scene; GameObject[] r3Roots;
        Camera r3Cam; Transform r3Marker; CinemachineCamera r3Vcam; R3Late r3Late;
        public bool Remodel3DReady { get { return r3Loaded; } }
        public Camera Remodel3DCamera { get { return r3Cam; } }

        // base state of each billboarded sprite: the position / rotation the 2D code wrote last (so the lift and the tilt are re-derived every frame, never accumulated)
        struct R3Base { public Vector3 localPosition; public Quaternion localRotation; }
        readonly Dictionary<SpriteRenderer, R3Base> r3Base = new Dictionary<SpriteRenderer, R3Base>();
        readonly List<SpriteRenderer> r3Projected = new List<SpriteRenderer>();

        // Camera that shows the world: the scene's LOOK-001 camera while the 3D field is on, the 2D camera otherwise (HUD anchors, level-up burst).
        Camera HudCamera { get { return NativeRemodel3D.Active && r3Cam != null && r3Cam.enabled ? r3Cam : view; } }

        // Called from StageFlowSyncViews every UpdateViews.
        void Remodel3DSync()
        {
            if (!NativeRemodel3D.Requested || Simulation == null) return;
            if (r3Late == null) { r3Late = gameObject.AddComponent<R3Late>(); r3Late.Late = Remodel3DLate; }
            bool field = !Simulation.Stage.InArena;
            if (field && !r3Loaded && !r3Loading && !r3Failed) StartCoroutine(Remodel3DLoad());
            bool want = field && r3Loaded;
            if (want != NativeRemodel3D.Active) Remodel3DSetActive(want);
        }

        IEnumerator Remodel3DLoad()
        {
            r3Loading = true;
            if (!Application.CanStreamedLevelBeLoaded(R3SceneName)) { Debug.LogWarning("[RM-INT] scene " + R3SceneName + " is not in the build: staying 2D"); r3Failed = true; r3Loading = false; yield break; }
            var op = SceneManager.LoadSceneAsync(R3SceneName, LoadSceneMode.Additive);
            while (op != null && !op.isDone) yield return null;
            r3Scene = SceneManager.GetSceneByName(R3SceneName);
            r3Roots = r3Scene.GetRootGameObjects();
            Transform camT = R3Find("Main Camera"), markerT = R3Find("Player Marker"), vcamT = R3Find("CM LOOK-001"), terrT = R3Find("Terrain");
            if (camT == null || markerT == null || terrT == null || terrT.GetComponent<Terrain>() == null) { Debug.LogWarning("[RM-INT] RM-1 scene rig / terrain not found: staying 2D"); r3Failed = true; r3Loading = false; yield break; }
            r3Cam = camT.GetComponent<Camera>(); r3Marker = markerT; r3Vcam = vcamT != null ? vcamT.GetComponent<CinemachineCamera>() : null;
            NativeRemodel3D.Ground = terrT.GetComponent<Terrain>();
            var listener = camT.GetComponent<AudioListener>(); if (listener != null) listener.enabled = false;   // the game's own camera keeps the listener
            var markerSprite = markerT.Find("Marker Sprite"); if (markerSprite != null) markerSprite.gameObject.SetActive(false);   // the slice's stand-in sprite: the game's player sprite replaces it
            r3Cam.depth = view.depth + 10;
            Remodel3DViewport();
            // 원본 피부 결을 지우던 +1.3 EV 노출과 붉은 색조를 이 필드의 프로필 사본에서만 조정한다.
            foreach (var root in r3Roots) foreach (var volume in root.GetComponentsInChildren<Volume>(true))
                if (volume.profile != null && volume.profile.TryGet<ColorAdjustments>(out var tone))
                { tone.postExposure.Override(1f); tone.saturation.Override(-18f); tone.colorFilter.Override(new Color(.82f,.9f,1f)); }
            r3Loaded = true; r3Loading = false;
            Remodel3DSetActive(!Simulation.Stage.InArena);
        }

        // by name through the loaded scene: the baked scene has the rig loose at the root; the rebuilt one wraps it in RM1_CameraRig
        Transform R3Find(string name)
        {
            foreach (var root in r3Roots) { var t = R3FindIn(root.transform, name); if (t != null) return t; }
            return null;
        }
        static Transform R3FindIn(Transform t, string name)
        {
            if (t.name == name) return t;
            for (int i = 0; i < t.childCount; i++) { var f = R3FindIn(t.GetChild(i), name); if (f != null) return f; }
            return null;
        }

        void Remodel3DSetActive(bool on)
        {
            Remodel3DRestoreBillboards();
            NativeRemodel3D.Active = on;
            if (r3Roots != null) foreach (var root in r3Roots) if (root != null) root.SetActive(on);
            if (!on) { r3Base.Clear(); view.cullingMask = worldMask; }   // back to the 2D camera: Update() re-applies the lobby / world mask next frame
        }

        // LateUpdate: after every 2D view wrote its transforms for this frame.
        void Remodel3DLate()
        {
            if (!NativeRemodel3D.Active || r3Cam == null || Simulation == null) return;
            bool hidden = view.cullingMask == 0;   // the lobby / startup hides the world through the 2D camera mask: mirror it
            view.cullingMask = 0;                  // the 2D camera only clears the frame while the 3D one draws
            r3Cam.enabled = !hidden;
            Remodel3DViewport();
            var p = Simulation.Player; r3Marker.position = NativeRemodel3D.Point(p.X, p.Y) + NativeRemodelCamera.TargetOffset;   // CM LOOK-001 follows the marker (offset 0, 10.52, -9.24, no damping)
            r3Marker.position += ImpactCameraOffset();
            foreach (var r in props) if (r != null) r.enabled = false;
            foreach (var c in chunks.Values) if (c.renderer != null) c.renderer.enabled = false;
            Remodel3DBillboards();
        }

        void Remodel3DViewport()
        {
            // 웹의 월드 1px : 화면 1px 기준. 논리 카메라와 전투 판정은 그대로 유지한다.
            if (r3Vcam == null) return;
            var lens = r3Vcam.Lens;
            float fov = NativeRemodelCamera.FieldOfView;
            r3Vcam.transform.rotation = NativeRemodelCamera.Rotation;
            var follow = r3Vcam.GetComponent<CinemachineFollow>();
            if (follow != null) follow.FollowOffset = NativeRemodelCamera.FollowOffset;
            if (Mathf.Abs(lens.FieldOfView - fov) > .01f) { lens.FieldOfView = fov; r3Vcam.Lens = lens; }
        }

        // 캐릭터 스프라이트는 LOOK-001 카메라를 향해 세우고 발을 지면에 둔다.
        // 명시적 중심형 스킬(악의구·강타 wave/flash)은 같은 tilt를 쓰되 Core 중심에 pivot을 유지한다.
        // The 2D code still places sprites by their pivot at the Core point; here the sprite's lower edge is moved onto that point (along the sprite's own up axis).
        // 표현 보정은 다음 writer 실행 전에 원래 로컬 자세로 되돌린다.
        // 부모만 이동하는 악의구·얼음 파편도 이전 프레임의 lift를 다시 더하지 않는다.
        void Remodel3DRestoreBillboards()
        {
            foreach (var sr in r3Projected)
                if (sr != null && r3Base.TryGetValue(sr, out var pose))
                { sr.transform.localPosition = pose.localPosition; sr.transform.localRotation = pose.localRotation; }
            r3Projected.Clear();
        }

        void Remodel3DBillboards()
        {
            // 로비/일시정지 등 writer가 돌지 않은 프레임에도 한 번만 적용한다.
            if (r3Projected.Count != 0) return;
            float pitch = NativeRemodel3D.Pitch, cos = Mathf.Cos(pitch), sin = Mathf.Sin(pitch);
            var tilt = Quaternion.Euler(pitch * Mathf.Rad2Deg, 0, 0);
            foreach (var sr in FindObjectsByType<SpriteRenderer>(FindObjectsSortMode.None))
            {
                if (sr == null || !sr.enabled || sr.sprite == null || sr.gameObject.scene == r3Scene) continue;
                var tr = sr.transform;
                r3Base[sr] = new R3Base { localPosition = tr.localPosition, localRotation = tr.localRotation };
                float roll = tr.rotation.eulerAngles.z;
                float below = NativeSkillView.IsCenteredSkillSprite(sr) ? 0 : (sr == playerView ? NativeRemodelCamera.HeroFootLift(sr.sprite) : sr.sprite.pivot.y / sr.sprite.pixelsPerUnit) * Mathf.Abs(tr.lossyScale.y);
                tr.SetPositionAndRotation(tr.position + new Vector3(0, below * cos, below * sin), tilt * Quaternion.Euler(0, 0, roll));
                r3Projected.Add(sr);
            }
            if (r3Base.Count > 4096) { var dead = new List<SpriteRenderer>(); foreach (var k in r3Base.Keys) if (k == null) dead.Add(k); foreach (var k in dead) r3Base.Remove(k); }
        }

        // Mouse aim in world units of the old 2D mapping (x, -py / 100): through the ground plane of the player when the 3D camera draws.
        Vector3 AimWorld()
        {
            if (NativeRemodel3D.Active && r3Cam != null && r3Cam.enabled && r3Marker != null)
            {
                var ray = r3Cam.ScreenPointToRay(ExoInput.MousePosition); var plane = new Plane(Vector3.up, r3Marker.position); float d;
                if (plane.Raycast(ray, out d)) { var h = ray.GetPoint(d); return new Vector3(h.x, h.z, 0); }
            }
            return view.ScreenToWorldPoint(ExoInput.MousePosition);
        }
    }
}
