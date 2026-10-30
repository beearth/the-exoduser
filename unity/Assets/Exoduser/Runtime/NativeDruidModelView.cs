using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // 55도 실제 스키닝 렌더를 투명 RT로 합성한다. 아레나의 2D 좌표·정렬·카메라는 그대로다.
    // 승인된 런타임 프리팹이 있고 검수 옵션이 명시됐을 때만 켠다. 기본 플레이/원본 시트는 보존한다.
    internal sealed class NativeDruidModelView
    {
        public const string PrefabResource = "Art/boss/dark_druid_3d/DarkDruid_Runtime";
        const string ModelResource = "Art/boss/dark_druid_3d/DarkDruid";
        const int ModelLayer = 30, Resolution = 768;
        static readonly Vector3 StageOrigin = new Vector3(-20000, -20000, 0);
        static readonly string[] RequiredClips = { "Idle", "Walk", "CastThorn", "CastPoison", "CastRoot", "Slam", "Hit", "Death" };
        static readonly HashSet<string> warnings = new HashSet<string>();
        readonly NativeDruidMotionClock clock = new NativeDruidMotionClock();
        readonly Dictionary<string, int> indices = new Dictionary<string, int>();
        readonly List<AnimationClipPlayable> playables = new List<AnimationClipPlayable>();
        readonly List<AnimationClip> clips = new List<AnimationClip>();
        GameObject stage, model, composite;
        Camera camera;
        MeshRenderer renderer;
        SpriteRenderer shadow;
        RenderTexture texture;
        Material material;
        Mesh quad;
        Renderer[] modelRenderers;
        PlayableGraph graph;
        AnimationMixerPlayable mixer;
        Vector2 foot;
        int stamp = -1;
        bool ready;
        public bool Ready { get { return ready; } }
        public bool Visible { get { return renderer != null && renderer.enabled; } }
        public Bounds Bounds
        {
            get
            {
                if (!Ready || renderer == null) return new Bounds();
                Vector2 low = Vector2.one, high = Vector2.zero;
                foreach (var r in modelRenderers)
                {
                    var b = r.bounds;
                    for (int i = 0; i < 8; i++)
                    {
                        var p = camera.WorldToViewportPoint(new Vector3((i & 1) == 0 ? b.min.x : b.max.x, (i & 2) == 0 ? b.min.y : b.max.y, (i & 4) == 0 ? b.min.z : b.max.z));
                        low = Vector2.Min(low, p); high = Vector2.Max(high, p);
                    }
                }
                float size = composite.transform.localScale.y;
                var center = composite.transform.position;
                var result = new Bounds();
                result.SetMinMax(center + new Vector3((low.x - .5f) * size, (low.y - .5f) * size, 0), center + new Vector3((high.x - .5f) * size, (high.y - .5f) * size, 0));
                return result;
            }
        }
        public int Stamp { get { return stamp; } }

        public NativeDruidModelView(Transform parent, Sprite shadowSprite)
        {
            if (!NativeReviewArgs.Druid3D) return;
            var prefab = Resources.Load<GameObject>(PrefabResource);
            var shader = Resources.Load<Shader>("Shaders/DruidModelComposite");
            if (prefab == null || shader == null) { WarnOnce("검수 프리팹/합성 셰이더가 없어 기존 표현을 사용합니다."); return; }
            Animator sourceAnimator; string invalidRig;
            if (!ValidatePrefab(prefab, out sourceAnimator, out invalidRig)) { WarnOnce("리그 검사 실패: " + invalidRig + ". 기존 표현을 사용합니다."); return; }
            var available = new List<AnimationClip>(Resources.LoadAll<AnimationClip>(ModelResource));
            if (sourceAnimator != null && sourceAnimator.runtimeAnimatorController != null) available.AddRange(sourceAnimator.runtimeAnimatorController.animationClips);
            foreach (string name in RequiredClips)
            {
                var clip = available.Find(c => c != null && (c.name == name || c.name.EndsWith("|" + name, StringComparison.Ordinal)));
                if (clip == null || clip.length <= 0 || clip.legacy || clip.humanMotion || clip.empty) { WarnOnce("유효 Generic 필수 동작 " + name + "이 없어 기존 표현을 사용합니다."); return; }
                indices[name] = clips.Count; clips.Add(clip);
            }
            stage = new GameObject("드루이드3D 검수 렌더 무대"); stage.transform.SetParent(parent, false); stage.transform.position = StageOrigin;
            model = UnityEngine.Object.Instantiate(prefab, stage.transform); model.transform.localPosition = Vector3.zero; model.transform.localRotation = Quaternion.identity;
            modelRenderers = model.GetComponentsInChildren<Renderer>(true);
            foreach (var t in model.GetComponentsInChildren<Transform>(true)) t.gameObject.layer = ModelLayer;
            foreach (var listener in model.GetComponentsInChildren<AudioListener>(true)) listener.enabled = false;
            foreach (var source in model.GetComponentsInChildren<AudioSource>(true)) { source.Stop(); source.enabled = false; }
            var animator = model.GetComponentInChildren<Animator>(true);
            if (animator == null || animator.avatar == null || !animator.avatar.isValid || animator.avatar.isHuman)
            { WarnOnce("복제된 Generic Animator가 유효하지 않아 기존 표현을 사용합니다."); Dispose(); return; }
            animator.enabled = true; animator.applyRootMotion = false; animator.cullingMode = AnimatorCullingMode.AlwaysAnimate;
            graph = PlayableGraph.Create("드루이드 Core 프레임 표현"); graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);
            mixer = AnimationMixerPlayable.Create(graph, clips.Count);
            for (int i = 0; i < clips.Count; i++)
            {
                var p = AnimationClipPlayable.Create(graph, clips[i]); p.SetApplyFootIK(false); p.SetApplyPlayableIK(false); p.SetSpeed(0);
                graph.Connect(p, 0, mixer, i); playables.Add(p);
            }
            var output = AnimationPlayableOutput.Create(graph, "드루이드 스키닝", animator); output.SetSourcePlayable(mixer); graph.Play();
            texture = new RenderTexture(Resolution, Resolution, 24, RenderTextureFormat.ARGB32) { name = "드루이드55도 RT", antiAliasing = 2, filterMode = FilterMode.Bilinear, wrapMode = TextureWrapMode.Clamp };
            texture.Create();
            var cameraObject = new GameObject("드루이드55도 카메라"); cameraObject.transform.SetParent(stage.transform, false); camera = cameraObject.AddComponent<Camera>();
            camera.orthographic = true; camera.orthographicSize = 1.6f; camera.aspect = 1; camera.nearClipPlane = .1f; camera.farClipPlane = 20;
            camera.clearFlags = CameraClearFlags.SolidColor; camera.backgroundColor = Color.clear; camera.cullingMask = 1 << ModelLayer;
            camera.targetTexture = texture; camera.depth = -100; camera.allowHDR = false; camera.allowMSAA = true; camera.useOcclusionCulling = false;
            Vector3 target = StageOrigin + Vector3.up * 1.25f;
            float elevation = 55 * Mathf.Deg2Rad;
            camera.transform.position = target + new Vector3(0, Mathf.Sin(elevation), -Mathf.Cos(elevation)) * 6;
            camera.transform.LookAt(target); var viewportFoot = camera.WorldToViewportPoint(StageOrigin); foot = new Vector2(viewportFoot.x, viewportFoot.y);
            Light("드루이드 차가운 주광", new Vector3(35, -35, 0), new Color(.78f, .86f, 1), 1.25f);
            Light("드루이드 약한 재질 보조광", new Vector3(25, 140, 0), new Color(.67f, .72f, .58f), .48f);
            composite = new GameObject("드루이드3D 합성"); composite.transform.SetParent(parent, false);
            quad = new Mesh { name = "드루이드 정렬 쿼드" };
            quad.vertices = new[] { new Vector3(-.5f, -.5f, 0), new Vector3(.5f, -.5f, 0), new Vector3(-.5f, .5f, 0), new Vector3(.5f, .5f, 0) };
            quad.uv = new[] { Vector2.zero, Vector2.right, Vector2.up, Vector2.one }; quad.triangles = new[] { 0, 2, 1, 2, 3, 1 }; quad.RecalculateBounds();
            composite.AddComponent<MeshFilter>().sharedMesh = quad; renderer = composite.AddComponent<MeshRenderer>();
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = false;
            material = new Material(shader) { mainTexture = texture }; renderer.sharedMaterial = material;
            var shadowObject = new GameObject("드루이드 접지 그림자"); shadowObject.transform.SetParent(parent, false); shadow = shadowObject.AddComponent<SpriteRenderer>(); shadow.sprite = shadowSprite;
            ready = true;
            Hide();
        }

        // Unity 6 Avatar.isValid는 Generic/Humanoid를 모두 포함하므로 isHuman=false를 함께 검사한다.
        // Generic AvatarBuilder는 루트 모션 뼈를 빈 이름으로 허용한다. 고정 본 이름/이동 루트는 강제하지 않는다.
        static bool ValidatePrefab(GameObject prefab, out Animator animator, out string reason)
        {
            animator = prefab.GetComponentInChildren<Animator>(true);
            var source = prefab.GetComponentsInChildren<SkinnedMeshRenderer>(true);
            var skins = new NativeDruidRigContract.Skin[source.Length];
            try
            {
                for (int i = 0; i < source.Length; i++)
                {
                    var skin = source[i]; var mesh = skin.sharedMesh;
                    var matrices = mesh != null ? mesh.bindposes ?? new Matrix4x4[0] : new Matrix4x4[0];
                    var bones = skin.bones ?? new Transform[0]; var paths = new string[bones.Length];
                    for (int j = 0; j < bones.Length; j++) paths[j] = animator != null ? BonePath(animator.transform, bones[j]) : null;
                    bool matricesValid = true;
                    foreach (var matrix in matrices)
                    {
                        for (int j = 0; j < 16; j++) if (float.IsNaN(matrix[j]) || float.IsInfinity(matrix[j])) matricesValid = false;
                        float determinant = matrix.determinant;
                        if (float.IsNaN(determinant) || float.IsInfinity(determinant) || determinant == 0) matricesValid = false;
                    }
                    long indexCount = 0;
                    if (mesh != null) for (int sub = 0; sub < mesh.subMeshCount; sub++) indexCount += mesh.GetIndexCount(sub);
                    skins[i] = new NativeDruidRigContract.Skin { Vertices = mesh != null ? mesh.vertexCount : 0, Indices = (int)Math.Min(int.MaxValue, indexCount), BindPoses = matrices.Length, BonePaths = paths, MatricesValid = matricesValid, Visible = skin.enabled && ActivePath(skin.transform, prefab.transform) };
                }
                var avatar = animator != null ? animator.avatar : null;
                return NativeDruidRigContract.Validate(animator != null && ActivePath(animator.transform, prefab.transform), avatar != null && avatar.isValid, avatar != null && avatar.isHuman, skins, out reason);
            }
            catch (UnityException e) { reason = "리그 메타데이터를 읽을 수 없음: " + e.Message; return false; }
        }

        static bool ActivePath(Transform node, Transform root)
        {
            for (var t = node; t != null; t = t.parent)
            {
                if (!t.gameObject.activeSelf) return false;
                if (t == root) return true;
            }
            return false;
        }

        static string BonePath(Transform root, Transform bone)
        {
            if (bone == null || (bone != root && !bone.IsChildOf(root))) return null;
            string path = "";
            for (var t = bone; t != root; t = t.parent) path = t.name + (path.Length > 0 ? "/" + path : "");
            return path;
        }

        static void WarnOnce(string message) { if (warnings.Add(message)) Debug.LogWarning("[드루이드3D] " + message); }

        void Light(string name, Vector3 angles, Color color, float intensity)
        {
            var go = new GameObject(name); go.transform.SetParent(stage.transform, false); go.transform.rotation = Quaternion.Euler(angles);
            var light = go.AddComponent<Light>(); light.type = LightType.Directional; light.color = color; light.intensity = intensity; light.cullingMask = 1 << ModelLayer; light.shadows = LightShadows.None;
        }

        void Pose(NativeDruidMotionClock.Pose pose)
        {
            int selected = indices[pose.Clip];
            for (int i = 0; i < playables.Count; i++) mixer.SetInputWeight(i, i == selected ? 1 : 0);
            playables[selected].SetTime(pose.Time * clips[selected].length); graph.Evaluate(0);
        }

        void Place(EnemyState e, float alpha, float sink)
        {
            stage.SetActive(true); camera.enabled = true; renderer.enabled = true;
            float height = e.Radius * 14.1f / 100f;
            var anchor = NativeRemodel3D.Point2D(e.X, e.Y - 24);
            composite.transform.position = anchor + new Vector3((.5f - foot.x) * height, (.5f - foot.y - sink) * height, 0);
            composite.transform.localScale = new Vector3(height, height, 1); renderer.sortingOrder = (int)e.Y;
            material.SetFloat("_Opacity", alpha); material.SetFloat("_Cut", sink > 0 ? foot.y + sink : 0);
            shadow.enabled = alpha > 0; shadow.sortingOrder = (int)e.Y - 1; shadow.transform.position = NativeRemodel3D.Point2D(e.X, e.Y);
            float width = e.Radius * 2.6f / 128; shadow.transform.localScale = new Vector3(width, width * .28f, 1); shadow.color = new Color(.02f, .025f, .018f, alpha * .45f);
            stamp = Time.frameCount;
        }

        public bool Draw(EnemyState e, DruidData data, int tick, bool moving)
        {
            if (!Ready || NativeRemodel3D.Active || data.S == "bossDruidUnder") { Hide(); return false; }
            Pose(clock.Sample(tick, data.S, data.RmMoveId ?? data.CurMove, data.St2, data.RmTeleTotal, moving, e.Stunned > 0 || data.S == "eHit" || data.S == "eStagger", e.Hp <= 0));
            model.transform.localRotation = Quaternion.Euler(0, (float)NativeDruidMotionClock.FacingYawDegrees(data.Facing), 0);
            Place(e, 1, 0); return true;
        }

        public bool DrawSink(EnemyState e, int tick, int t, int bodyTicks, int holdTicks, int fadeTicks)
        {
            if (!Ready || NativeRemodel3D.Active) return false;
            Pose(clock.Sample(tick, "eDeath", "", 0, 0, false, false, true));
            float fade = Mathf.Clamp01((t - bodyTicks - holdTicks) / (float)fadeTicks);
            float sink = Mathf.Clamp01(t / (float)Mathf.Max(1, bodyTicks)) * .45f;
            Place(e, 1 - fade, sink); return true;
        }

        public void Hide()
        {
            if (renderer != null) renderer.enabled = false;
            if (shadow != null) shadow.enabled = false;
            if (stage != null) stage.SetActive(false);
        }

        public void Dispose()
        {
            ready = false;
            Hide();
            if (graph.IsValid()) graph.Destroy();
            graph = default(PlayableGraph); mixer = default(AnimationMixerPlayable);
            playables.Clear(); clips.Clear(); indices.Clear();
            if (camera != null) camera.targetTexture = null;
            camera = null;
            if (texture != null) { texture.Release(); UnityEngine.Object.Destroy(texture); texture = null; }
            if (stage != null) { UnityEngine.Object.Destroy(stage); stage = null; }
            model = null; modelRenderers = null;
            if (composite != null) { UnityEngine.Object.Destroy(composite); composite = null; }
            renderer = null;
            if (shadow != null) { UnityEngine.Object.Destroy(shadow.gameObject); shadow = null; }
            if (quad != null) { UnityEngine.Object.Destroy(quad); quad = null; }
            if (material != null) { UnityEngine.Object.Destroy(material); material = null; }
            stamp = -1;
        }
    }
}
